import express from 'express';
import mongoose from 'mongoose';
import users from './models/users.js';
import restaurants from './models/restaurants.js';
import cors from 'cors' 

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const uri = 'mongodb+srv://gaga:hola123@cluster0.phogu.mongodb.net/proyecto2?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
});

// Ruta de ejemplo usando el modelo User
app.get('/users', async (req, res) => {
    try {
      const allusers = await users.find(); // ← Aquí se consulta todo
      res.json(allusers);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
  });

//Ruta para o

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
