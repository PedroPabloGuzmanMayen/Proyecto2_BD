// Importamos fs y ObjectId usando la sintaxis de ES modules
import fs from 'fs';
import { ObjectId } from 'mongodb';

// Número de documentos a generar
const NUM_USERS = 100;
const NUM_RESTAURANTS = 50;
const NUM_REVIEWS = 200;
const NUM_ORDERS = 300;

// Arrays para almacenar IDs generados (para referencias)
const userIds = [];
const restaurantIds = [];
const menuItemIds = [];

// Función para generar un ID aleatorio
function generateRandomId() {
  return new ObjectId().toString();
}

// Función para seleccionar un elemento aleatorio de un array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para generar un número aleatorio en un rango
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para generar una fecha aleatoria en los últimos 2 años
function getRandomDate() {
  const now = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(now.getFullYear() - 2);
  
  return new Date(twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime()));
}

// Función para generar coordenadas aleatorias (aproximadamente en España)
function getRandomCoordinates() {
  // Aproximadamente coordenadas de España
  return [getRandomNumber(-9, 3) + Math.random(), getRandomNumber(36, 43) + Math.random()];
}

// Datos de ejemplo
const cities = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao", "Málaga", "Zaragoza", "Murcia", "Palma", "Las Palmas"];
const names = ["Juan", "Ana", "Carlos", "María", "Pedro", "Laura", "Miguel", "Sofía", "David", "Lucía"];
const surnames = ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Martín"];
const restaurantNames = ["El Rincón", "La Tasca", "Casa", "Mesón", "Bar", "Restaurante", "El Jardín", "La Plaza", "El Patio", "La Bodega"];
const restaurantTypes = ["Tradicional", "Mediterráneo", "Italiano", "Japonés", "Mexicano", "Chino", "Vegano", "Fusión", "Tapas", "Parrilla"];
const menuItemNames = ["Paella", "Ensalada", "Pizza", "Pasta", "Sushi", "Hamburguesa", "Taco", "Arroz", "Carne", "Pescado"];

// Generar usuarios
const users = [];
for (let i = 0; i < NUM_USERS; i++) {
  const userId = generateRandomId();
  userIds.push(userId);
  
  const firstName = getRandomElement(names);
  const lastName = getRandomElement(surnames);
  
  users.push({
    _id: userId,
    username: `${firstName.toLowerCase()}${getRandomNumber(1, 999)}`,
    password: `pass${getRandomNumber(1000, 9999)}`,
    city: getRandomElement(cities),
    birthdate: getRandomDate()
  });
}

// Generar restaurantes
const restaurants = [];
for (let i = 0; i < NUM_RESTAURANTS; i++) {
  const restaurantId = generateRandomId();
  restaurantIds.push(restaurantId);
  
  const menu = [];
  const numMenuItems = getRandomNumber(5, 15);
  
  for (let j = 0; j < numMenuItems; j++) {
    const menuItemId = generateRandomId();
    menuItemIds.push(menuItemId);
    
    menu.push({
      _id: menuItemId,
      name: `${getRandomElement(menuItemNames)} ${getRandomElement(restaurantTypes)}`,
      price: parseFloat((getRandomNumber(5, 30) + Math.random()).toFixed(2)),
      description: `Delicioso plato de ${getRandomElement(menuItemNames).toLowerCase()} al estilo ${getRandomElement(restaurantTypes).toLowerCase()}`
    });
  }
  
  restaurants.push({
    _id: restaurantId,
    name: `${getRandomElement(restaurantNames)} ${getRandomElement(restaurantTypes)}`,
    location: {
      type: "Point",
      coordinates: getRandomCoordinates()
    },
    city: getRandomElement(cities),
    description: `Un excelente restaurante de comida ${getRandomElement(restaurantTypes).toLowerCase()} en el centro de la ciudad`,
    menu: menu
  });
}

// Generar reviews
const reviews = [];
for (let i = 0; i < NUM_REVIEWS; i++) {
  reviews.push({
    _id: generateRandomId(),
    rating: getRandomNumber(1, 5),
    comment: `Experiencia ${getRandomElement(["excelente", "buena", "regular", "mala", "terrible"])}. ${getRandomElement(["Recomendado", "Volvería", "No volvería", "Platos deliciosos", "Servicio lento"])}`,
    user_id: getRandomElement(userIds),
    restaurant_id: getRandomElement(restaurantIds)
  });
}

// Generar órdenes
const orders = [];
for (let i = 0; i < NUM_ORDERS; i++) {
  const restaurantId = getRandomElement(restaurantIds);
  const restaurant = restaurants.find(r => r._id === restaurantId);
  
  // Seleccionar items aleatorios del menú del restaurante
  const numItems = getRandomNumber(1, 5);
  const orderDetails = [];
  let total = 0;
  
  for (let j = 0; j < numItems; j++) {
    const menuItem = getRandomElement(restaurant.menu);
    const quantity = getRandomNumber(1, 3);
    
    orderDetails.push({
      product_id: menuItem._id,
      quantity: quantity
    });
    
    total += menuItem.price * quantity;
  }
  
  orders.push({
    _id: generateRandomId(),
    detail: orderDetails,
    total: parseFloat(total.toFixed(2)),
    restaurant_id: restaurantId,
    user_id: getRandomElement(userIds)
  });
}

// Escribir los datos en archivos JSON
fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
fs.writeFileSync('restaurants.json', JSON.stringify(restaurants, null, 2));
fs.writeFileSync('reviews.json', JSON.stringify(reviews, null, 2));
fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));

console.log('Archivos generados:');
console.log('- users.json');
console.log('- restaurants.json');
console.log('- reviews.json');
console.log('- orders.json');
console.log('\nUtiliza mongoimport para importar estos archivos a tu base de datos MongoDB.');