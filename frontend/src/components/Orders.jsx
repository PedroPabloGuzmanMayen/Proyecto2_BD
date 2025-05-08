import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OrderService from '../api/orderService';
import { query } from '../api/crud';
import Cart from './Cart';

const Orders = () => {
  const { userId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [restaurants, setRestaurants] = useState({});
  
  // Cargar las órdenes del usuario
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Asegurarse de que userId es un string para la consulta
        const stringUserId = String(userId);
        const ordersData = await OrderService.getUserOrders(stringUserId);
        
        // Ordenar por fecha de creación (más reciente primero)
        const sortedOrders = Array.isArray(ordersData) 
          ? ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
        
        setOrders(sortedOrders);
        
        // Cargar información de restaurantes y productos para mostrarlos en los pedidos
        await fetchRestaurantsAndMenuItems(sortedOrders);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar órdenes:', err);
        setError('No se pudieron cargar tus órdenes. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [userId]);
  
  // Cargar información de restaurantes y productos para las órdenes
  const fetchRestaurantsAndMenuItems = async (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) return;
    
    try {
      // Obtener IDs únicos de restaurantes y productos
      const restaurantIds = [...new Set(orders.map(order => String(order.restaurant_id)))];
      
      const productIds = [];
      orders.forEach(order => {
        if (Array.isArray(order.detail)) {
          order.detail.forEach(item => {
            if (item.product_id) {
              productIds.push(String(item.product_id));
            }
          });
        }
      });
      
      // Cargar información de restaurantes
      if (restaurantIds.length > 0) {
        const restaurantsData = await query('restaurants', { 
          filter: { _id: { $in: restaurantIds } } 
        });
        
        const restaurantsMap = {};
        if (Array.isArray(restaurantsData)) {
          restaurantsData.forEach(restaurant => {
            restaurantsMap[String(restaurant._id)] = restaurant;
            
            // También guardar información de los menús
            if (Array.isArray(restaurant.menu)) {
              const menuMap = {};
              restaurant.menu.forEach(item => {
                menuMap[String(item._id)] = item;
              });
              setMenuItems(prev => ({ ...prev, ...menuMap }));
            }
          });
          setRestaurants(restaurantsMap);
        }
      }
    } catch (error) {
      console.error('Error al cargar detalles de pedidos:', error);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  // Obtener nombre del producto desde el ID
  const getProductName = (productId) => {
    if (!productId) return 'Producto desconocido';
    
    const stringId = String(productId);
    if (menuItems[stringId]) {
      return menuItems[stringId].name;
    }
    
    return `Producto (ID: ${stringId.substring(stringId.length - 6).toUpperCase()})`;
  };
  
  // Obtener nombre del restaurante desde el ID
  const getRestaurantName = (restaurantId) => {
    if (!restaurantId) return 'Restaurante desconocido';
    
    const stringId = String(restaurantId);
    if (restaurants[stringId]) {
      return restaurants[stringId].name;
    }
    
    return `Restaurante (ID: ${stringId.substring(stringId.length - 6).toUpperCase()})`;
  };
  
  return (
    <div>
      {/* Mostrar el carrito primero */}
      <Cart />
      
      {/* Separador */}
      <div style={{ 
        margin: '40px 0', 
        borderBottom: '1px solid #e0e0e0', 
        paddingBottom: '10px' 
      }}>
        <h2 style={{ fontSize: '24px', color: '#333' }}>Mis Pedidos Anteriores</h2>
      </div>
      
      {/* Historial de órdenes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          <p>Cargando tus pedidos...</p>
        </div>
      ) : error ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          margin: '20px 0'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          padding: '30px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <h3>No tienes pedidos anteriores</h3>
          <p>Cuando realices un pedido, aparecerá aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{
                padding: '15px 20px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>
                    Pedido #{String(order._id).substring(String(order._id).length - 6).toUpperCase()} - {getRestaurantName(order.restaurant_id)}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                
                <div>
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    backgroundColor: '#e3f2fd',
                    color: '#2196f3',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    Total: {order.total.toFixed(2)} €
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '15px 20px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                  Detalles del pedido
                </h4>
                
                <ul style={{ 
                  margin: 0, 
                  padding: 0, 
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {Array.isArray(order.detail) && order.detail.map((item, itemIndex) => (
                    <li 
                      key={itemIndex}
                      style={{
                        padding: '10px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 'bold' }}>
                          {getProductName(item.product_id)}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>
                          Cantidad: {item.quantity}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;