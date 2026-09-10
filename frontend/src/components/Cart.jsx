import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import OrderService from '../api/orderService';
import { useAuth } from '../context/AuthContext';

const Cart = ({ onOrderCreated }) => {
  const { cartItems, updateItemQuantity, removeItem, clearRestaurantCart, getRestaurantTotal, prepareOrder } = useCart();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState({});
  const [orderError, setOrderError] = useState({});

  const isCartEmpty = Object.keys(cartItems).length === 0;

  const handleCreateOrder = async (restaurantId) => {
    if (!userId) {
      setOrderError({ ...orderError, [restaurantId]: 'Debes iniciar sesion para realizar un pedido' });
      return;
    }

    try {
      setCreatingOrder(true);
      setOrderError({ ...orderError, [restaurantId]: null });

      const orderData = prepareOrder(restaurantId);
      if (!orderData) throw new Error('Error al preparar la orden');

      const processedOrderData = {
        ...orderData,
        restaurant_id: String(orderData.restaurant_id),
        user_id: String(orderData.user_id),
        detail: orderData.detail.map(item => ({
          ...item,
          product_id: String(item.product_id),
        })),
      };

      await OrderService.createOrder(processedOrderData);

      setOrderSuccess({ ...orderSuccess, [restaurantId]: true });
      clearRestaurantCart(restaurantId);
      if (onOrderCreated) onOrderCreated();

      setTimeout(() => {
        setOrderSuccess(prev => ({ ...prev, [restaurantId]: false }));
      }, 3000);
    } catch (error) {
      console.error('Error al crear la orden:', error);
      setOrderError({
        ...orderError,
        [restaurantId]: error.message || 'Ha ocurrido un error al crear la orden',
      });
    } finally {
      setCreatingOrder(false);
    }
  };

  if (isCartEmpty) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <h3>Tu carrito esta vacio</h3>
        <p>Explora nuestros restaurantes y anade deliciosos platos.</p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Ver restaurantes
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title">Mi Carrito</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {Object.keys(cartItems).map(restaurantId => {
          const restaurant = cartItems[restaurantId];
          const total = getRestaurantTotal(restaurantId);
          const itemCount = restaurant.items.reduce((sum, item) => sum + item.quantity, 0);

          return (
            <div key={restaurantId} className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '2px' }}>
                    {restaurant.restaurantInfo.name}
                  </h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {restaurant.restaurantInfo.city}
                  </span>
                </div>
                <button
                  onClick={() => clearRestaurantCart(restaurantId)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--color-danger)' }}
                >
                  Vaciar
                </button>
              </div>

              <div style={{ padding: '0 var(--space-xl)' }}>
                {restaurant.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 'var(--space-lg) 0',
                      borderBottom: index < restaurant.items.length - 1 ? '1px solid var(--border-color)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-lg)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {item.price.toFixed(2)} € / unidad
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '2px',
                    }}>
                      <button
                        onClick={() => updateItemQuantity(restaurantId, item.product_id, item.quantity - 1)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '1rem',
                        }}
                      >
                        −
                      </button>
                      <span style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(restaurantId, item.product_id, item.quantity + 1)}
                        className="btn btn-ghost btn-sm"
                        style={{
                          width: '28px',
                          height: '28px',
                          padding: 0,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '1rem',
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.9375rem',
                      minWidth: '70px',
                      textAlign: 'right',
                    }}>
                      {(item.price * item.quantity).toFixed(2)} €
                    </div>

                    <button
                      onClick={() => removeItem(restaurantId, item.product_id)}
                      className="btn btn-ghost btn-sm"
                      style={{
                        color: 'var(--text-muted)',
                        padding: '4px 8px',
                        fontSize: '1.125rem',
                      }}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="card-footer">
                <div>
                  <span style={{ fontWeight: 600 }}>
                    Total:{' '}
                    <span style={{ color: 'var(--color-success)' }}>{total.toFixed(2)} €</span>
                  </span>
                  <span style={{
                    marginLeft: 'var(--space-sm)',
                    color: 'var(--text-muted)',
                    fontSize: '0.8125rem',
                  }}>
                    {itemCount} articulo{itemCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  {orderSuccess[restaurantId] && (
                    <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.8125rem' }}>
                      ¡Pedido realizado!
                    </span>
                  )}
                  <button
                    onClick={() => handleCreateOrder(restaurantId)}
                    disabled={creatingOrder || orderSuccess[restaurantId]}
                    className="btn btn-primary"
                  >
                    {creatingOrder ? 'Procesando...' : 'Realizar pedido'}
                  </button>
                </div>

                {orderError[restaurantId] && (
                  <div style={{ width: '100%', marginTop: 'var(--space-sm)' }}>
                    <span className="alert alert-error" style={{ display: 'block', margin: 0, marginBottom: 0 }}>
                      {orderError[restaurantId]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Cart;
