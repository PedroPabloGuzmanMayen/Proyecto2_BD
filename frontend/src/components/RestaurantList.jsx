import { useState, useEffect } from 'react';
import { query, distinctRestaurantCities } from '../api/crud';
import { useCart } from '../context/CartContext';

const RestaurantList = () => {
  // Estados para el componente
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [addedToCartMessages, setAddedToCartMessages] = useState({});

  // Acceder al contexto del carrito
  const { addToCart, getTotalItemsCount } = useCart();
  
  // Estado para el contador del carrito
  const [cartCount, setCartCount] = useState(0);
  
  // Actualizar el contador del carrito
  useEffect(() => {
    setCartCount(getTotalItemsCount());
  }, [getTotalItemsCount]);

  // Cargar restaurantes desde la API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        
        // Crear filtro combinado (ciudad + precio si están seleccionados)
        let filter = {};
        
        if (selectedCity) {
          filter.city = selectedCity;
        }
        
        // Obtener los restaurantes filtrados
        const restaurantsData = await query('restaurants', { filter });
        
        // Verificar que restaurantsData sea un array
        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
          
          // Extraer ciudades únicas de los restaurantes cargados
          const uniqueCities = [...new Set(restaurantsData.map(restaurant => restaurant.city))];
          setCities(uniqueCities);
        } else {
          console.error('La respuesta de restaurantes no es un array:', restaurantsData);
          setRestaurants([]);
          setCities([]);
        }
        
        // Intentar obtener la lista de ciudades del endpoint específico
        try {
          const citiesData = await distinctRestaurantCities();
          // Verificar que citiesData sea un array antes de usarlo
          if (Array.isArray(citiesData)) {
            setCities(citiesData);
          } else if (citiesData && typeof citiesData === 'object') {
            // Si es un objeto con una propiedad que contiene el array
            const possibleArrays = Object.values(citiesData).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              setCities(possibleArrays[0]);
            }
          }
        } catch (cityError) {
          console.error('Error al obtener ciudades:', cityError);
          // No mostramos error al usuario porque ya tenemos ciudades de los restaurantes
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar restaurantes:', err);
        setError('No se pudieron cargar los restaurantes. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, [selectedCity]);

  // Filtrar menús por precio (esto se hace en el cliente para no recargar la API)
  const getFilteredMenu = (menu) => {
    if (!menu || !Array.isArray(menu)) {
      return [];
    }
    
    if (!priceFilter || priceFilter === '') {
      return menu;
    }

    const maxPrice = Number(priceFilter);
    return menu.filter(item => item.price <= maxPrice);
  };

  // Alternar la visualización expandida de un restaurante
  const toggleRestaurant = (index) => {
    setExpandedRestaurant(expandedRestaurant === index ? null : index);
  };
  
  // Manejar la adición de un item al carrito
  const handleAddToCart = (restaurant, menuItem) => {
    addToCart(restaurant, menuItem);
    
    // Mostrar mensaje de confirmación
    setAddedToCartMessages(prev => ({
      ...prev,
      [`${restaurant._id}-${menuItem._id}`]: true
    }));
    
    // Ocultar el mensaje después de 2 segundos
    setTimeout(() => {
      setAddedToCartMessages(prev => ({
        ...prev,
        [`${restaurant._id}-${menuItem._id}`]: false
      }));
    }, 2000);
    
    // Actualizar el contador del carrito
    setCartCount(getTotalItemsCount());
  };

  // Componente para indicador de carga
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '40px',
        flexDirection: 'column'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        <p>Cargando restaurantes...</p>
      </div>
    );
  }

  // Componente para mensaje de error
  if (error) {
    return (
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
    );
  }

  // Renderizar el listado de restaurantes
  return (
    <div>
      {/* Indicador del carrito */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px',
          backgroundColor: '#2196f3',
          color: 'white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          zIndex: 1000
        }}
        onClick={() => window.location.href = '/orders'}
        title="Ver carrito"
      >
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: '24px' }}>🛒</span>
          {cartCount > 0 && (
            <span 
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: '#ff5722',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              {cartCount}
            </span>
          )}
        </div>
      </div>
    
      {/* Barra de filtros */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2 style={{ margin: '0', fontSize: '1.5rem', color: '#333' }}>
          Restaurantes Disponibles
        </h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filtro de ciudad */}
          <div>
            <label htmlFor="cityFilter" style={{ marginRight: '8px', fontWeight: 'bold' }}>
              Ciudad:
            </label>
            <select 
              id="cityFilter" 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white'
              }}
            >
              <option value="">Todas</option>
              {Array.isArray(cities) && cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          {/* Filtro de precio máximo */}
          <div>
            <label htmlFor="priceFilter" style={{ marginRight: '8px', fontWeight: 'bold' }}>
              Precio máximo:
            </label>
            <input 
              id="priceFilter" 
              type="number" 
              min="0" 
              step="5" 
              value={priceFilter} 
              onChange={(e) => setPriceFilter(e.target.value)}
              placeholder="€"
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                width: '80px'
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Lista de restaurantes */}
      {!Array.isArray(restaurants) || restaurants.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '30px', 
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          color: '#666' 
        }}>
          No se encontraron restaurantes con los filtros seleccionados.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {restaurants.map((restaurant, index) => (
            <div 
              key={index} 
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: 'white',
                transition: 'transform 0.2s ease',
                transform: expandedRestaurant === index ? 'scale(1.01)' : 'scale(1)'
              }}
            >
              {/* Cabecera del restaurante */}
              <div 
                style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: expandedRestaurant === index ? '1px solid #e0e0e0' : 'none'
                }}
                onClick={() => toggleRestaurant(index)}
              >
                <div>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '20px', 
                    color: '#2196f3'
                  }}>
                    {restaurant.name}
                  </h3>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#4caf50'
                    }}></span>
                    {restaurant.city}
                  </p>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    {restaurant.description}
                  </p>
                </div>
                
                <button 
                  style={{
                    padding: '10px 16px',
                    backgroundColor: expandedRestaurant === index ? '#ff9800' : '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {expandedRestaurant === index ? (
                    <>
                      <span style={{ fontSize: '18px' }}>&#8722;</span> Ocultar Menú
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '18px' }}>&#43;</span> Ver Menú
                    </>
                  )}
                </button>
              </div>
              
              {/* Menú del restaurante */}
              {expandedRestaurant === index && restaurant.menu && (
                <div style={{ padding: '20px' }}>
                  <h4 style={{ 
                    marginTop: 0, 
                    marginBottom: '15px',
                    color: '#333',
                    borderBottom: '2px solid #f0f0f0',
                    paddingBottom: '10px'
                  }}>
                    Menú ({Array.isArray(restaurant.menu) ? getFilteredMenu(restaurant.menu).length : 0} platos)
                  </h4>
                  
                  {!Array.isArray(restaurant.menu) || getFilteredMenu(restaurant.menu).length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>
                      No hay platos que cumplan con el filtro de precio seleccionado.
                    </p>
                  ) : (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                      gap: '16px' 
                    }}>
                      {getFilteredMenu(restaurant.menu).map((item, itemIndex) => (
                        <div 
                          key={itemIndex} 
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '16px',
                            transition: 'all 0.2s',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '10px'
                            }}>
                              <h5 style={{ 
                                margin: 0, 
                                fontSize: '16px',
                                color: '#333'
                              }}>
                                {item.name}
                              </h5>
                              <span style={{ 
                                color: '#4caf50', 
                                fontWeight: 'bold',
                                backgroundColor: '#f1f8e9',
                                padding: '4px 8px',
                                borderRadius: '16px',
                                fontSize: '14px'
                              }}>
                                {item.price.toFixed(2)} €
                              </span>
                            </div>
                            
                            <p style={{ 
                              margin: '0 0 16px 0',
                              color: '#666',
                              fontSize: '14px',
                              lineHeight: '1.4'
                            }}>
                              {item.description}
                            </p>
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(restaurant, item);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 0',
                              backgroundColor: addedToCartMessages[`${restaurant._id}-${item._id}`] 
                                ? '#8bc34a' 
                                : '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              transition: 'background-color 0.2s',
                              marginTop: 'auto'
                            }}
                          >
                            {addedToCartMessages[`${restaurant._id}-${item._id}`] ? (
                              <>
                                <span style={{ fontSize: '16px' }}>✓</span>
                                Añadido
                              </>
                            ) : (
                              <>
                                <span style={{ fontSize: '16px' }}>🛒</span>
                                Añadir al carrito
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;