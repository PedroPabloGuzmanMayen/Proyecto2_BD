import { createMany } from './crud';

// Función para asegurar que los IDs sean strings
const ensureStringIds = (order) => {
  if (!order) return order;
  
  return {
    ...order,
    restaurant_id: String(order.restaurant_id),
    user_id: String(order.user_id),
    detail: Array.isArray(order.detail) ? order.detail.map(item => ({
      ...item,
      product_id: String(item.product_id)
    })) : order.detail
  };
};

// Servicio para manejar operaciones relacionadas con órdenes
const OrderService = {
  // Crear una nueva orden
  createOrder: async (orderData) => {
    try {
      // Asegurar que los IDs son strings
      const processedOrderData = ensureStringIds(orderData);
      
      // Usar el endpoint de bulk aunque solo sea una orden
      const response = await createMany('orders', [processedOrderData]);
      return response[0]; // Devolver la primera orden creada
    } catch (error) {
      console.error('Error al crear la orden:', error);
      throw error;
    }
  },
  
  // Crear múltiples órdenes a la vez
  createMultipleOrders: async (ordersData) => {
    try {
      // Asegurar que los IDs son strings en todas las órdenes
      const processedOrdersData = Array.isArray(ordersData) 
        ? ordersData.map(ensureStringIds) 
        : ordersData;
      
      return await createMany('orders', processedOrdersData);
    } catch (error) {
      console.error('Error al crear órdenes:', error);
      throw error;
    }
  },
  
  // Obtener órdenes del usuario actual
  getUserOrders: async (userId) => {
    try {
      // Asegurar que el userId es un string
      const stringUserId = String(userId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders?filter=${JSON.stringify({ user_id: stringUserId })}`);
      if (!response.ok) throw new Error('Error al obtener órdenes');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener órdenes del usuario:', error);
      throw error;
    }
  }
};

export default OrderService;