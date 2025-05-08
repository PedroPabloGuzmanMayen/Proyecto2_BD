import { useState } from 'react';
import { useCart } from '../context/CartContext';
import OrderService from '../api/orderService';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, updateItemQuantity, removeItem, clearRestaurantCart, getRestaurantTotal, prepareOrder } = useCart();
  const { userId } = useAuth();
  
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState({});
  const [orderError, setOrderError] = useState({});
  
  // Verificar si el carrito está vacío
  const isCartEmpty = Object.keys(cartItems).length === 0;
  
  // Manejar la creación de una orden para un restaurante específico
  const handleCreateOrder = async (restaurantId) => {
    if (!userId) {
      setOrderError({
        ...orderError,
        [restaurantId]: 'Debes iniciar sesión para realizar un pedido'
      });
      return;
    }
    
    try {
      setCreatingOrder(true);
      setOrderError({
        ...orderError,
        [restaurantId]: null
      });
      
      // Preparar los datos de la orden (asegurando que los IDs sean strings)
      const orderData = prepareOrder(restaurantId);
      
      if (!orderData) {
        throw new Error('Error al preparar la orden');
      }
      
      // Asegurar que los IDs sean strings
      const processedOrderData = {
        ...orderData,
        restaurant_id: String(orderData.restaurant_id),
        user_id: String(orderData.user_id),
        detail: orderData.detail.map(item => ({
          ...item,
          product_id: String(item.product_id)
        }))
      };
      
      // Crear la orden
      await OrderService.createOrder(processedOrderData);
      
      // Marcar como exitosa
      setOrderSuccess({
        ...orderSuccess,
        [restaurantId]: true
      });
      
      // Limpiar el carrito de este restaurante
      clearRestaurantCart(restaurantId);
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setOrderSuccess({
          ...orderSuccess,
          [restaurantId]: false
        });
      }, 3000);
    } catch (error) {
      console.error('Error al crear la orden:', error);
      setOrderError({
        ...orderError,
        [restaurantId]: error.message || 'Ha ocurrido un error al crear la orden'
      });
    } finally {
      setCreatingOrder(false);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>Mi Carrito</h2>
      
      {isCartEmpty ? (
        <div style={{
          padding: '40px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛒</div>
          <h3>Tu carrito está vacío</h3>
          <p>Explora nuestros restaurantes y añade deliciosos platos a tu carrito.</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Ver restaurantes
          </button>
        </div>
      ) : (
        <div>
          {Object.keys(cartItems).map(restaurantId => (
            <div
              key={restaurantId}
              style={{
                marginBottom: '30px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              {/* Cabecera del restaurante */}
              <div style={{
                padding: '15px 20px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2196f3' }}>
                    {cartItems[restaurantId].restaurantInfo.name}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {cartItems[restaurantId].restaurantInfo.city}
                  </p>
                </div>
                <button
                  onClick={() => clearRestaurantCart(restaurantId)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Vaciar
                </button>
              </div>
              
              {/* Listado de items */}
              <div style={{ padding: '0 20px' }}>
                {cartItems[restaurantId].items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '15px 0',
                      borderBottom: index < cartItems[restaurantId].items.length - 1 ? '1px solid #f0f0f0' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 2 }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{item.name}</h4>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                        {item.price.toFixed(2)} € por unidad
                      </p>
                    </div>
                    
                    <div style={{ 
                      flex: 1, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={() => updateItemQuantity(restaurantId, item.product_id, item.quantity - 1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        -
                      </button>
                      <span style={{ margin: '0 10px', fontWeight: 'bold' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(restaurantId, item.product_id, item.quantity + 1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                    
                    <div style={{ 
                      flex: 1, 
                      textAlign: 'right',
                      fontWeight: 'bold'
                    }}>
                      {(item.price * item.quantity).toFixed(2)} €
                    </div>
                    
                    <button
                      onClick={() => removeItem(restaurantId, item.product_id)}
                      style={{
                        marginLeft: '15px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f44336',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Resumen y botón de compra */}
              <div style={{
                padding: '15px 20px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                    Total: <span style={{ color: '#4caf50' }}>{getRestaurantTotal(restaurantId).toFixed(2)} €</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    {cartItems[restaurantId].items.reduce((total, item) => total + item.quantity, 0)} artículos
                  </p>
                </div>
                
                <div>
                  {orderSuccess[restaurantId] ? (
                    <div style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#4caf50', 
                      color: 'white',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      ¡Pedido realizado con éxito!
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCreateOrder(restaurantId)}
                      disabled={creatingOrder}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: creatingOrder ? '#9e9e9e' : '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: creatingOrder ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {creatingOrder ? 'Procesando...' : 'Realizar pedido'}
                    </button>
                  )}
                  
                  {orderError[restaurantId] && (
                    <p style={{ color: '#f44336', margin: '10px 0 0 0', fontSize: '14px' }}>
                      {orderError[restaurantId]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;