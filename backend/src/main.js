import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Modelos
import users from './models/users.js';
import restaurants from './models/restaurants.js';
import orders from './models/orders.js';
import reviews from './models/reviews.js';

const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Conexión a MongoDB
const uri = 'mongodb+srv://gaga:hola123@cluster0.phogu.mongodb.net/proyecto2?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
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

// 		*** AGREGACIONES ***

// simples
// Contar todas las ordenes
app.get('/stats/orders/count', async (req, res) => {
  const total = await orders.countDocuments();
  res.json({ totalOrders: total });
});

// lista de ciudades únicas donde hay restaurantes
app.get('/stats/restaurants/cities', async (req, res) => {
  const cities = await restaurants.distinct('city');
  res.json({ cities });
});

// Top 5 restaurantes por calificación promedio
app.get('/stats/restaurants/top-rated', async (req, res) => {
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
});

// Platos más vendidos 
app.get('/stats/orders/top-dishes', async (req, res) => {
  const pipeline = [
    { $unwind: '$detail' },
    { $group: {
        _id: '$detail.product_id',
        totalSold: { $sum: '$detail.quantity' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    { $project: {
        _id: 0,
        product_id: '$_id',
        totalSold: 1
      }
    }
  ];
  const topDishes = await orders.aggregate(pipeline);
  res.json(topDishes);
});

// Arrays

// agregar un nuevo platillo al menú
app.post('/restaurants/:id/menu/add', async (req, res) => {
  const { name, price, description } = req.body;
  const updated = await restaurants.findByIdAndUpdate(
    req.params.id,
    { $push: { menu: { name, price, description } } },
    { new: true }
  );
  res.json(updated);
});

// eliminar un platillo por su _id
app.delete('/restaurants/:id/menu/remove/:itemId', async (req, res) => {
  const updated = await restaurants.findByIdAndUpdate(
    req.params.id,
    { $pull: { menu: { _id: req.params.itemId } } },
    { new: true }
  );
  res.json(updated);
});

// añadir un tag 
app.patch('/restaurants/:id/tags', async (req, res) => {
  const { tag } = req.body;
  const updated = await restaurants.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { tags: tag } },
    { new: true }
  );
  res.json(updated);
});

// Embebidos
// filtrar menú embebido en pipeline
app.get('/reports/restaurants/:id/expensive-dishes', async (req, res) => {
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
});

// actualizar un campo dentro de un documento embebido 
app.patch('/restaurants/:id/menu/:itemId/price', async (req, res) => {
  const { newPrice } = req.body;
  const updated = await restaurants.findOneAndUpdate(
    { _id: req.params.id, 'menu._id': req.params.itemId },
    { $set: { 'menu.$.price': newPrice } },
    { new: true }
  );
  res.json(updated);
});


// Rutas CRUD 
// Consulta con filtros, proyección, sort, skip, limit
app.get('/:col', async (req, res) => {
  const Model = models[req.params.col];
  if (!Model) return res.status(404).json({ error: 'Colección no existe' });

  const { filter, projection, sort, skip, limit } = req.query;
  const docs = await Model.find(
    safeParse(filter, {}),
    safeParse(projection, null)
  )
    .sort(safeParse(sort, {}))
    .skip(Number(skip) || 0)
    .limit(Number(limit) || 0);
  res.json(docs);
});

// Crear un documento
app.post('/:col', async (req, res) => {
  const Model = models[req.params.col];
  if (!Model) return res.status(404).json({ error: 'Colección no existe' });

  const doc = new Model(req.body);
  await doc.save();
  res.json(doc);
});

// Crear varios documentos (bulk)
app.post('/:col/bulk', async (req, res) => {
  const Model = models[req.params.col];
  if (!Model) return res.status(404).json({ error: 'Colección no existe' });

  const docs = await Model.insertMany(req.body);
  res.json(docs);
});

// Actualizar un documento por ID
app.patch('/:col/:id', async (req, res) => {
  const Model = models[req.params.col];
  if (!Model) return res.status(404).json({ error: 'Colección no existe' });

  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(doc);
});

// Actualizar varios documentos
app.patch('/:col', async (req, res) => {
  const Model = models[req.params.col];
  if (!Model) return res.status(404).json({ error: 'Colección no existe' });

  const { filter, patch } = req.body;
  const result = await Model.updateMany(filter, patch);
  res.json(result);
});

// Eliminar un documento por ID
app.delete('/:col/:id', async (req, res) => {
  const Model = models[req.params.col];
  if (!Model) return res.status(404).json({ error: 'Colección no existe' });

  const doc = await Model.findByIdAndDelete(req.params.id);
  res.json(doc);
});

// Eliminar varios documentos
app.delete('/:col', async (req, res) => {
  const Model = models[req.params.col];
  if (!Model) return res.status(404).json({ error: 'Colección no existe' });

  const { filter } = req.body;
  const result = await Model.deleteMany(filter);
  res.json(result);
});

// Arranque del servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

