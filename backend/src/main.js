import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { GridFSBucket } from 'mongodb';
import multer from 'multer';
import { Readable } from 'stream';

// Modelos
import users from './models/users.js';
import restaurants from './models/restaurants.js';
import orders from './models/orders.js';
import reviews from './models/reviews.js';

const app = express();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Variables para GridFS
let bucket;

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Headers de seguridad — CWE-598 fix
// Referrer-Policy: evita que las URLs (con IDs, tokens, etc.) se filtren en el header Referer
// Cache-Control: evita que respuestas sensibles se almacenen en caché del navegador o proxies
app.use((req, res, next) => {
  res.set('Referrer-Policy', 'no-referrer');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  next();
});

const getUserOrders = async (userId) => {
  try {
    const orders = await mongoose.model('orders').aggregate([
      // Filtrar por user_id específico
      {
        $match: {
          user_id: userId
        }
      },
      // Lookup para obtener información del restaurante
      {
        $lookup: {
          from: 'restaurants',
          localField: 'restaurant_id',
          foreignField: '_id',
          as: 'restaurant'
        }
      },
      // Descomponer el array de detalles para procesarlos individualmente
      {
        $unwind: '$detail'
      },
      // Lookup para obtener información del producto
      {
        $lookup: {
          from: 'products', // O el nombre de tu colección de productos
          localField: 'detail.product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      // Reformatear los resultados
      {
        $project: {
          _id: 1,
          total: 1,
          restaurant_name: { $arrayElemAt: ['$restaurant.name', 0] },
          product_name: { $arrayElemAt: ['$product.name', 0] },
          product_id: '$detail.product_id',
          quantity: '$detail.quantity',
          created_at: '$createdAt'
        }
      },
      // Reagrupar por orden para mantener los detalles juntos
      {
        $group: {
          _id: '$_id',
          total: { $first: '$total' },
          restaurant_name: { $first: '$restaurant_name' },
          created_at: { $first: '$created_at' },
          details: {
            $push: {
              product_name: '$product_name',
              product_id: '$product_id',
              quantity: '$quantity'
            }
          }
        }
      },
      // Ordenar por fecha de creación (más reciente primero)
      {
        $sort: { created_at: -1 }
      }
    ]);
    
    return orders;
  } catch (error) {
    console.error('Error al obtener las órdenes del usuario:', error);
    throw error;
  }
};

// Conexión a MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/proyecto2';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado a MongoDB');
    
    // Inicializar GridFS después de conectar a MongoDB
    const db = mongoose.connection.db;
    bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });
    console.log('GridFS inicializado correctamente');
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));
// Map de colecciones
const models = { users, restaurants, orders, reviews };

// Función de parseo seguro de JSON
function safeParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

// Un ValidationError/CastError de Mongoose significa que el cliente mandó datos
// inválidos: eso es un 400, no un 500. Evita reportar como "error de servidor"
// algo que en realidad es input mal formado (ZAP: Application Error Disclosure).
function isClientInputError(error) {
  return error?.name === 'ValidationError' || error?.name === 'CastError';
}

function sendServerError(res, error, context) {
  console.error(`Error en ${context}:`, error);
  if (isClientInputError(error)) {
    return res.status(400).json({ error: 'Datos de entrada inválidos' });
  }
  return res.status(500).json({ error: 'Error interno del servidor' });
}

// *** RUTAS DE GRIDFS ***

// Subir un archivo
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se ha proporcionado ningún archivo' });
  }

  try {
    // Obtener detalles del archivo
    const { originalname, mimetype, buffer } = req.file;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    
    // Crear un stream legible desde el buffer
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    
    // Crear un stream de escritura a GridFS
    const uploadStream = bucket.openUploadStream(originalname, {
      metadata: {
        ...metadata,
        contentType: mimetype,
        uploadDate: new Date()
      }
    });
    
    // Obtener el ID del archivo
    const fileId = uploadStream.id;
    
    // Pipe del stream de lectura al de escritura
    readableStream.pipe(uploadStream);
    
    // Manejar la finalización de la carga
    uploadStream.on('finish', () => {
      res.status(201).json({
        success: true,
        fileId: fileId,
        filename: originalname,
        message: 'Archivo subido correctamente'
      });
    });
    
    // Manejar errores
    uploadStream.on('error', (error) => {
      console.error('Error al subir el archivo:', error);
      res.status(500).json({ success: false, message: 'Error al subir el archivo' });
    });
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ success: false, message: 'Error al procesar el archivo' });
  }
});

// Descargar un archivo por ID
app.get('/files/:fileId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
      return res.status(400).json({ success: false, message: 'ID de archivo inválido' });
    }
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    // Verificar si el archivo existe
    const files = await bucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    
    const file = files[0];
    
    // Configurar los headers de la respuesta
    res.set('Content-Type', file.metadata.contentType);
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
    
    // Abrir el stream de descarga
    const downloadStream = bucket.openDownloadStream(fileId);
    
    // Pipe del stream al response
    downloadStream.pipe(res);
    
    // Manejar errores
    downloadStream.on('error', (error) => {
      console.error('Error al descargar el archivo:', error);
      res.status(500).json({ success: false, message: 'Error al descargar el archivo' });
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al procesar la solicitud' });
  }
});

// Obtener información de archivos (sin contenido)
app.get('/files', async (req, res) => {
  try {
    const files = await bucket.find({}).toArray();
    
    // Transformar la respuesta para incluir solo la información relevante
    const fileInfos = files.map(file => ({
      id: file._id,
      filename: file.filename,
      size: file.length,
      uploadDate: file.uploadDate,
      metadata: file.metadata
    }));
    
    res.json({ success: true, files: fileInfos });
  } catch (error) {
    console.error('Error al obtener la lista de archivos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la lista de archivos' });
  }
});

// Eliminar un archivo
app.delete('/files/:fileId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
      return res.status(400).json({ success: false, message: 'ID de archivo inválido' });
    }
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    // Verificar si el archivo existe
    const files = await bucket.find({ _id: fileId }).toArray();
    
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    
    // Eliminar el archivo
    await bucket.delete(fileId);
    
    res.json({ success: true, message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el archivo' });
  }
});

// 		*** AGREGACIONES ***

// simples
// Contar todas las ordenes
app.get('/stats/orders/count', async (req, res) => {
  try {
    const total = await orders.countDocuments();
    res.json({ totalOrders: total });
  } catch (error) {
    return sendServerError(res, error, '/stats/orders/count');
  }
});

//login
app.post('/login', async (req, res) => {
  try {
    const user = await users.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({ succes: false, error: 'Usuario no encontrado' });
    }
    if (user.password !== req.body.password) {
      return res.status(401).json({ succes: false, error: 'Contraseña incorrecta' });
    }
    res.json({ succes: true, username: user.username, userID: user._id});
  } catch (error) {
    return sendServerError(res, error, '/login');
  }
});

app.post('/register', async (req, res) => {
  try {
    const { username, password, city, birthdate } = req.body;
    const existingUser = await users.findOne({ username });
    const id = uuidv4();
    if (existingUser) {
      return res.status(400).json({ succes: false, error: 'El usuario ya existe' });
    }
    const newUser = new users({ _id: id, username, password, city, birthdate });
    await newUser.save();
    res.status(201).json({ succes: true, message: 'Usuario creado con éxito' });
  } catch (error) {
    return sendServerError(res, error, '/register');
  }
});

// lista de ciudades únicas donde hay restaurantes
app.get('/stats/restaurants/cities', async (req, res) => {
  try {
    const cities = await restaurants.distinct('city');
    res.json({ cities });
  } catch (error) {
    return sendServerError(res, error, '/stats/restaurants/cities');
  }
});

app.post('/userOrder', async (req, res) => {
  try {
    const { userId, orderId } = req.body;
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    user.orders.push(orderId);
    await user.save();
    res.json({ message: 'Orden agregada al usuario' });
  } catch (error) {
    return sendServerError(res, error, '/userOrder');
  }
});

app.get('/userOrders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await users.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const orders = await getUserOrders(userId);
    res.json(orders);
  } catch (error) {
    return sendServerError(res, error, '/userOrders');
  }
});

// Top 5 restaurantes por calificación promedio
app.get('/stats/restaurants/top-rated', async (req, res) => {
  try {
    const pipeline = [
      { $group: {
          _id: '$restaurant_id',
          avgRating: { $avg: '$rating' },
          count:     { $sum: 1 }
        }
      },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          as: 'info'
        }
      },
      { $unwind: '$info' },
      { $project: {
          _id: 0,
          restaurant: '$info.name',
          avgRating: 1,
          reviews: '$count'
        }
      }
    ];
    const top = await reviews.aggregate(pipeline);
    res.json(top);
  } catch (error) {
    return sendServerError(res, error, '/stats/restaurants/top-rated');
  }
});

// Platos más vendidos 
app.get('/stats/orders/top-dishes', async (req,res) => {
  try {
    const pipeline = [
      { $unwind: '$detail' },
      { $group: {
          _id: '$detail.product_id',
          totalSold: { $sum: '$detail.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      // Buscar el nombre del platillo dentro de su restaurante
      { $lookup: {
          from: 'restaurants',
          let: { pid: '$_id' },
          pipeline: [
            { $unwind: '$menu' },
            { $match: { $expr: { $eq: ['$menu._id', '$$pid'] } } },
            { $project: { _id: 0, name: '$menu.name' } }
          ],
          as: 'itemInfo'
        }
      },
      { $unwind: '$itemInfo' },
      { $project: {
          _id: 0,
          product_id: '$_id',
          name: '$itemInfo.name',
          totalSold: 1
        }
      }
    ];
    const top = await orders.aggregate(pipeline);
    res.json(top);
  } catch (error) {
    return sendServerError(res, error, '/stats/orders/top-dishes');
  }
});


// Arrays

// agregar un nuevo platillo al menú
app.post('/restaurants/:id/menu/add', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (typeof name !== 'string' || !name.trim() ||
        typeof description !== 'string' || !description.trim() ||
        typeof price !== 'number' || !Number.isFinite(price)) {
      return res.status(400).json({ error: 'Datos de platillo inválidos' });
    }
    const updated = await restaurants.findByIdAndUpdate(
      req.params.id,
      { $push: { menu: { name, price, description } } },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    return sendServerError(res, error, '/restaurants/:id/menu/add');
  }
});

// eliminar un platillo por su _id
app.delete('/restaurants/:id/menu/remove/:itemId', async (req, res) => {
  try {
    const updated = await restaurants.findByIdAndUpdate(
      req.params.id,
      { $pull: { menu: { _id: req.params.itemId } } },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    return sendServerError(res, error, '/restaurants/:id/menu/remove');
  }
});

// añadir un tag 
app.patch('/restaurants/:id/tags', async (req, res) => {
  try {
    const { tag } = req.body;
    const updated = await restaurants.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { tags: tag } },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    return sendServerError(res, error, '/restaurants/:id/tags');
  }
});

// Embebidos
// filtrar menú embebido en pipeline
app.get('/reports/restaurants/:id/expensive-dishes', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de restaurante inválido' });
    }
    const priceThreshold = Number(req.query.minPrice) || 20;
    const pipeline = [
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      { $unwind: '$menu' },
      { $match: { 'menu.price': { $gte: priceThreshold } } },
      { $project: {
          _id: 0,
          dish: '$menu.name',
          price: '$menu.price'
        }
      }
    ];
    const dishes = await restaurants.aggregate(pipeline);
    res.json(dishes);
  } catch (error) {
    return sendServerError(res, error, '/reports/restaurants/:id/expensive-dishes');
  }
});

// actualizar un campo dentro de un documento embebido 
app.patch('/restaurants/:id/menu/:itemId/price', async (req, res) => {
  try {
    const { newPrice } = req.body;
    const updated = await restaurants.findOneAndUpdate(
      { _id: req.params.id, 'menu._id': req.params.itemId },
      { $set: { 'menu.$.price': newPrice } },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    return sendServerError(res, error, '/restaurants/:id/menu/:itemId/price');
  }
});


// Rutas CRUD 
// Consulta segura con filtros en el body (POST) — CWE-598 fix
app.post('/:col/query', async (req, res) => {
  try {
    const col = req.params.col;
    const Model = models[col];
    if (!Model) return res.status(404).json({ error: 'Colección no existe' });

    const { filter, projection, sort } = req.body;
    const skip = req.body.skip !== undefined ? Number(req.body.skip) : 0;
    const limit = req.body.limit !== undefined ? Number(req.body.limit) : 0;
    if (!Number.isInteger(skip) || skip < 0 || !Number.isInteger(limit) || limit < 0) {
      return res.status(400).json({ error: 'Parámetros skip/limit inválidos' });
    }

    const docs = await Model.find(filter || {}, projection || null)
      .sort(sort || {})
      .skip(skip)
      .limit(limit);

    // No exponer contraseñas en texto plano al consultar usuarios
    if (col === 'users') {
      docs.forEach(doc => { doc.password = undefined; });
    }

    res.json(docs);
  } catch (error) {
    return sendServerError(res, error, 'POST /:col/query');
  }
});

// Consulta simple por GET (solo skip y limit, sin filtros sensibles en URL)
app.get('/:col', async (req, res) => {
  try {
    const col = req.params.col;
    const Model = models[col];
    if (!Model) return res.status(404).json({ error: 'Colección no existe' });

    const skip = req.query.skip !== undefined ? Number(req.query.skip) : 0;
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : 0;
    if (!Number.isInteger(skip) || skip < 0 || !Number.isInteger(limit) || limit < 0) {
      return res.status(400).json({ error: 'Parámetros skip/limit inválidos' });
    }

    // No exponer contraseñas en texto plano al listar usuarios
    const projection = col === 'users' ? { password: 0 } : null;

    const docs = await Model.find({}, projection)
      .skip(skip)
      .limit(limit);
    res.json(docs);
  } catch (error) {
    return sendServerError(res, error, 'GET /:col');
  }
});

// Crear un documento
app.post('/:col', async (req, res) => {
  try {
    const col = req.params.col;
    const Model = models[col];
    if (!Model) return res.status(404).json({ error: 'Colección no existe' });

    const body = structuredClone(req.body);
    body._id = uuidv4();

    // Solo si la colección es "restaurant"
    if (col === 'restaurants' && Array.isArray(body.menu)) {
      body.menu = body.menu.map(item => ({ _id: uuidv4(), ...item }));
    }

    const doc = new Model(body);
    await doc.save();
    res.json(doc);
  } catch (error) {
    return sendServerError(res, error, 'POST /:col');
  }
});

// Crear varios documentos (bulk)
app.post('/:col/bulk', async (req, res) => {
  try {
    const Model = models[req.params.col];
    if (!Model) return res.status(404).json({ error: 'Colección no existe' });

    const docs = await Model.insertMany(req.body);
    res.json(docs);
  } catch (error) {
    return sendServerError(res, error, 'POST /:col/bulk');
  }
});

// Actualizar un documento por ID
app.patch('/:col/:id', async (req, res) => {
  try {
    const Model = models[req.params.col];
    if (!Model) return res.status(404).json({ error: 'Colección no existe' });

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doc);
  } catch (error) {
    return sendServerError(res, error, 'PATCH /:col/:id');
  }
});

// Actualizar varios documentos
app.patch('/:col', async (req, res) => {
  try {
    const Model = models[req.params.col];
    if (!Model) return res.status(404).json({ error: 'Colección no existe' });

    const { filter, patch } = req.body;
    const result = await Model.updateMany(filter, patch);
    res.json(result);
  } catch (error) {
    return sendServerError(res, error, 'PATCH /:col');
  }
});

// Eliminar un documento por ID
app.delete('/:col/:id', async (req, res) => {
  try {
    const Model = models[req.params.col];
    if (!Model) return res.status(404).json({ error: 'Colección no existe' });

    const doc = await Model.findByIdAndDelete(req.params.id);
    res.json(doc);
  } catch (error) {
    return sendServerError(res, error, 'DELETE /:col/:id');
  }
});

// Eliminar varios documentos
app.delete('/:col', async (req, res) => {
  try {
    const Model = models[req.params.col];
    if (!Model) return res.status(404).json({ error: 'Colección no existe' });

    const { filter } = req.body;
    const result = await Model.deleteMany(filter);
    res.json(result);
  } catch (error) {
    return sendServerError(res, error, 'DELETE /:col');
  }
});

// Middleware global de manejo de errores — CWE-200 fix
// Captura cualquier excepción no controlada y devuelve un mensaje genérico
app.use((err, req, res, _next) => {
  console.error('Error no controlado:', err);
  // JSON malformado en el body (express.json()) es culpa del cliente, no del servidor
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'JSON inválido en el cuerpo de la solicitud' });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Arranque del servidor
const PORT = 5555;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

