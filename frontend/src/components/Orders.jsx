import { useState, useEffect, useCallback } from 'react';
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

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const stringUserId = String(userId);
      const ordersData = await OrderService.getUserOrders(stringUserId);

      const sortedOrders = Array.isArray(ordersData)
        ? ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      setOrders(sortedOrders);
      await fetchRestaurantsAndMenuItems(sortedOrders);
    } catch (err) {
      console.error('Error al cargar ordenes:', err);
      setError('No se pudieron cargar tus ordenes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchRestaurantsAndMenuItems = async (orders) => {
    if (!Array.isArray(orders) || orders.length === 0) return;

    try {
      const restaurantIds = [...new Set(orders.map(o => String(o.restaurant_id)))];

      const productIds = [];
      orders.forEach(order => {
        if (Array.isArray(order.detail)) {
          order.detail.forEach(item => {
            if (item.product_id) productIds.push(String(item.product_id));
          });
        }
      });

      if (restaurantIds.length > 0) {
        const restaurantsData = await query('restaurants', {
          filter: { _id: { $in: restaurantIds } }
        });

        const restaurantsMap = {};
        if (Array.isArray(restaurantsData)) {
          restaurantsData.forEach(restaurant => {
            restaurantsMap[String(restaurant._id)] = restaurant;
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
    } catch (err) {
      console.error('Error al cargar detalles de pedidos:', err);
    }
  };

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

  const getProductName = (productId) => {
    if (!productId) return 'Producto desconocido';
    const stringId = String(productId);
    if (menuItems[stringId]) return menuItems[stringId].name;
    return `Producto (ID: ${stringId.slice(-6).toUpperCase()})`;
  };

  const getRestaurantName = (restaurantId) => {
    if (!restaurantId) return 'Restaurante desconocido';
    const stringId = String(restaurantId);
    if (restaurants[stringId]) return restaurants[stringId].name;
    return `Restaurante (ID: ${stringId.slice(-6).toUpperCase()})`;
  };

  return (
    <div>
      <Cart onOrderCreated={fetchOrders} />

      <div className="section-title" style={{ marginTop: 'var(--space-4xl)' }}>
        Mis Pedidos Anteriores
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)' }}>Cargando tus pedidos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <h3 style={{ margin: '0 0 var(--space-sm) 0' }}>Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No tienes pedidos anteriores</h3>
          <p>Cuando realices un pedido, aparecera aqui.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {orders.map((order, index) => (
            <div key={index} className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: '0.9375rem', marginBottom: 'var(--space-xs)' }}>
                    Pedido #{String(order._id).slice(-6).toUpperCase()} — {getRestaurantName(order.restaurant_id)}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.8125rem', padding: '5px 12px' }}>
                  Total: {order.total.toFixed(2)} €
                </span>
              </div>

              <div className="card-body" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-lg)' }}>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>
                  Detalles del pedido
                </h4>
                <ul style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)'
                }}>
                  {Array.isArray(order.detail) && order.detail.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      style={{
                        padding: 'var(--space-sm) var(--space-md)',
                        backgroundColor: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem'
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{getProductName(item.product_id)}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>x{item.quantity}</span>
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
