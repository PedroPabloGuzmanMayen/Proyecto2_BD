import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Crear el contexto
const CartContext = createContext(null);

// Proveedor del contexto
export const CartProvider = ({ children }) => {
  // Obtener información del usuario
  const { userId } = useAuth();
  
  // Estado para el carrito
  // cartItems se organiza por restaurante: { restaurant_id: { items: [], restaurantInfo: {} } }
  const [cartItems, setCartItems] = useState({});
  
  // Cargar el carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar el carrito:', error);
      }
    }
  }, []);
  
  // Guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  // Agregar un item al carrito
  const addToCart = (restaurant, menuItem) => {
    setCartItems(prevItems => {
      const restaurantId = restaurant._id;
      
      // Si ya hay items de este restaurante
      if (prevItems[restaurantId]) {
        // Verificar si el item ya está en el carrito
        const existingItemIndex = prevItems[restaurantId].items.findIndex(
          item => item.product_id === menuItem._id
        );
        
        if (existingItemIndex !== -1) {
          // El item ya existe, incrementar cantidad
          const updatedItems = [...prevItems[restaurantId].items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1
          };
          
          return {
            ...prevItems,
            [restaurantId]: {
              ...prevItems[restaurantId],
              items: updatedItems
            }
          };
        } else {
          // El item no existe, agregarlo
          return {
            ...prevItems,
            [restaurantId]: {
              ...prevItems[restaurantId],
              items: [
                ...prevItems[restaurantId].items,
                {
                  product_id: menuItem._id,
                  name: menuItem.name,
                  price: menuItem.price,
                  quantity: 1
                }
              ]
            }
          };
        }
      } else {
        // Primer item de este restaurante
        return {
          ...prevItems,
          [restaurantId]: {
            restaurantInfo: {
              id: restaurantId,
              name: restaurant.name,
              city: restaurant.city
            },
            items: [
              {
                product_id: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1
              }
            ]
          }
        };
      }
    });
  };
  
  // Actualizar la cantidad de un item
  const updateItemQuantity = (restaurantId, productId, quantity) => {
    if (quantity <= 0) {
      // Si la cantidad es 0 o menos, eliminar el item
      removeItem(restaurantId, productId);
      return;
    }
    
    setCartItems(prevItems => {
      if (!prevItems[restaurantId]) return prevItems;
      
      const itemIndex = prevItems[restaurantId].items.findIndex(
        item => item.product_id === productId
      );
      
      if (itemIndex === -1) return prevItems;
      
      const updatedItems = [...prevItems[restaurantId].items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity
      };
      
      return {
        ...prevItems,
        [restaurantId]: {
          ...prevItems[restaurantId],
          items: updatedItems
        }
      };
    });
  };
  
  // Eliminar un item del carrito
  const removeItem = (restaurantId, productId) => {
    setCartItems(prevItems => {
      if (!prevItems[restaurantId]) return prevItems;
      
      const updatedItems = prevItems[restaurantId].items.filter(
        item => item.product_id !== productId
      );
      
      // Si no quedan items para este restaurante, eliminar la entrada
      if (updatedItems.length === 0) {
        const updatedCart = { ...prevItems };
        delete updatedCart[restaurantId];
        return updatedCart;
      }
      
      return {
        ...prevItems,
        [restaurantId]: {
          ...prevItems[restaurantId],
          items: updatedItems
        }
      };
    });
  };
  
  // Vaciar el carrito de un restaurante
  const clearRestaurantCart = (restaurantId) => {
    setCartItems(prevItems => {
      const updatedCart = { ...prevItems };
      delete updatedCart[restaurantId];
      return updatedCart;
    });
  };
  
  // Vaciar todo el carrito
  const clearCart = () => {
    setCartItems({});
  };
  
  // Calcular el total por restaurante
  const getRestaurantTotal = (restaurantId) => {
    if (!cartItems[restaurantId]) return 0;
    
    return cartItems[restaurantId].items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  };
  
  // Contar el número total de items en el carrito
  const getTotalItemsCount = () => {
    return Object.values(cartItems).reduce(
      (count, restaurant) => count + restaurant.items.reduce(
        (restaurantCount, item) => restaurantCount + item.quantity, 
        0
      ),
      0
    );
  };
  
  // Preparar la orden para enviar a la API - Ahora asegurando que los IDs sean strings
  const prepareOrder = (restaurantId) => {
    if (!cartItems[restaurantId] || !userId) return null;
    
    const total = getRestaurantTotal(restaurantId);
    
    // Asegurarse de que todos los IDs sean strings
    return {
      detail: cartItems[restaurantId].items.map(item => ({
        product_id: String(item.product_id), // Convertir a string
        quantity: item.quantity
      })),
      total,
      restaurant_id: String(restaurantId), // Convertir a string
      user_id: String(userId) // Convertir a string
    };
  };
  
  // Valores proporcionados por el contexto
  const value = {
    cartItems,
    addToCart,
    updateItemQuantity,
    removeItem,
    clearRestaurantCart,
    clearCart,
    getRestaurantTotal,
    getTotalItemsCount,
    prepareOrder
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};