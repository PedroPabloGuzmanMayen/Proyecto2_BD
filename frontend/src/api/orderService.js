import { createMany } from './crud';

// Servicio para manejar operaciones relacionadas con órdenes
const OrderService = {
  // Crear una nueva orden
  createOrder: async (orderData) => {
    try {
      // Usar el endpoint de bulk aunque solo sea una orden
      const response = await createMany('orders', [orderData]);
      return response[0]; // Devolver la primera orden creada
    } catch (error) {
      console.error('Error al crear la orden:', error);
      throw error;
    }
  },
  
  // Crear múltiples órdenes a la vez
  createMultipleOrders: async (ordersData) => {
    try {
      return await createMany('orders', ordersData);
    } catch (error) {
      console.error('Error al crear órdenes:', error);
      throw error;
    }
  },
  
  // Obtener órdenes del usuario actual
  getUserOrders: async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders?filter=${JSON.stringify({ user_id: userId })}`);
      if (!response.ok) throw new Error('Error al obtener órdenes');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener órdenes del usuario:', error);
      throw error;
    }
  }
};

export default OrderService;