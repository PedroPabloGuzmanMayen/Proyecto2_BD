import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { query, distinctRestaurantCities } from '../api/crud';
import { useCart } from '../context/CartContext';

const ensureStringIds = (obj) => {
  if (!obj) return obj;
  const result = { ...obj };
  if (result._id) result._id = String(result._id);
  if (Array.isArray(result.menu)) {
    result.menu = result.menu.map(item => ({
      ...item,
      _id: item._id ? String(item._id) : item._id,
    }));
  }
  return result;
};

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [addedToCartMessages, setAddedToCartMessages] = useState({});

  const { addToCart, getTotalItemsCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        let filter = {};
        if (selectedCity) filter.city = selectedCity;

        const restaurantsData = await query('restaurants', { filter });

        if (Array.isArray(restaurantsData)) {
          const processed = restaurantsData.map(ensureStringIds);
          setRestaurants(processed);
          const uniqueCities = [...new Set(processed.map(r => r.city))];
          setCities(uniqueCities);
        } else {
          setRestaurants([]);
          setCities([]);
        }

        try {
          const citiesData = await distinctRestaurantCities();
          if (Array.isArray(citiesData)) {
            setCities(citiesData);
          } else if (citiesData && typeof citiesData === 'object') {
            const arr = Object.values(citiesData).find(v => Array.isArray(v));
            if (arr) setCities(arr);
          }
        } catch {}

        setLoading(false);
      } catch (err) {
        console.error('Error al cargar restaurantes:', err);
        setError('No se pudieron cargar los restaurantes. Intenta de nuevo mas tarde.');
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [selectedCity]);

  const getFilteredMenu = (menu) => {
    if (!menu || !Array.isArray(menu)) return [];
    if (!priceFilter || priceFilter === '') return menu;
    return menu.filter(item => item.price <= Number(priceFilter));
  };

  const toggleRestaurant = (index) => {
    setExpandedRestaurant(expandedRestaurant === index ? null : index);
  };

  const handleAddToCart = (restaurant, menuItem) => {
    const processedRestaurant = ensureStringIds(restaurant);
    const processedMenuItem = { ...menuItem, _id: String(menuItem._id) };

    addToCart(processedRestaurant, processedMenuItem);

    const key = `${processedRestaurant._id}-${processedMenuItem._id}`;
    setAddedToCartMessages(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedToCartMessages(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Cargando restaurantes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-xl)',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '160px' }}>
            <label htmlFor="cityFilter" style={{ fontSize: '0.8125rem' }}>Ciudad</label>
            <select
              id="cityFilter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">Todas las ciudades</option>
              {Array.isArray(cities) && cities.map((city, i) => (
                <option key={i} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0, minWidth: '120px' }}>
            <label htmlFor="priceFilter" style={{ fontSize: '0.8125rem' }}>Precio max.</label>
            <input
              id="priceFilter"
              type="number"
              min="0"
              step="5"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              placeholder="Sin limite"
            />
          </div>
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {restaurants.length} restaurante{restaurants.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Restaurant cards */}
      {restaurants.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Sin resultados</h3>
          <p>No se encontraron restaurantes con los filtros seleccionados.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {restaurants.map((restaurant, index) => {
            const isExpanded = expandedRestaurant === index;
            const menuItems = getFilteredMenu(restaurant.menu);

            return (
              <div key={index} className="card">
                <div
                  style={{
                    padding: 'var(--space-xl)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 'var(--space-lg)',
                    transition: 'background var(--transition-fast)',
                    background: isExpanded ? 'var(--bg-hover)' : 'transparent',
                  }}
                  onClick={() => toggleRestaurant(index)}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-xs)',
                    }}>
                      {restaurant.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-sm)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                      marginBottom: 'var(--space-sm)',
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--color-success)',
                        flexShrink: 0,
                      }} />
                      {restaurant.city}
                    </div>
                    {restaurant.description && (
                      <p style={{
                        margin: 0,
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        lineHeight: 1.5,
                      }}>
                        {restaurant.description}
                      </p>
                    )}
                  </div>

                  <span className={`btn btn-sm ${isExpanded ? 'btn-outline' : 'btn-primary'}`}>
                    {isExpanded ? 'Ocultar' : `Ver Menu (${restaurant.menu?.length || 0})`}
                  </span>
                </div>

                {isExpanded && (
                  <div style={{
                    padding: '0 var(--space-xl) var(--space-xl)',
                    animation: 'fadeIn 0.2s ease',
                  }}>
                    <div style={{
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: 'var(--space-xl)',
                    }}>
                      {menuItems.length === 0 ? (
                        <p style={{
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          padding: 'var(--space-xl)',
                        }}>
                          No hay platos que cumplan con el filtro de precio.
                        </p>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: 'var(--space-md)',
                        }}>
                          {menuItems.map((item, itemIndex) => {
                            const itemId = String(item._id);
                            const restaurantId = String(restaurant._id);
                            const messageKey = `${restaurantId}-${itemId}`;
                            const added = addedToCartMessages[messageKey];

                            return (
                              <div
                                key={itemIndex}
                                style={{
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 'var(--radius-md)',
                                  padding: 'var(--space-lg)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 'var(--space-sm)',
                                  background: 'var(--bg-card)',
                                  transition: 'border-color var(--transition-fast)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                              >
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  gap: 'var(--space-sm)',
                                }}>
                                  <h4 style={{
                                    fontSize: '0.9375rem',
                                    color: 'var(--text-primary)',
                                    margin: 0,
                                  }}>
                                    {item.name}
                                  </h4>
                                  <span className="badge badge-success" style={{ flexShrink: 0 }}>
                                    {item.price.toFixed(2)} €
                                  </span>
                                </div>

                                {item.description && (
                                  <p style={{
                                    margin: 0,
                                    color: 'var(--text-muted)',
                                    fontSize: '0.8125rem',
                                    lineHeight: 1.5,
                                    flex: 1,
                                  }}>
                                    {item.description}
                                  </p>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(restaurant, item);
                                  }}
                                  className={`btn btn-sm ${added ? 'btn-success' : 'btn-primary'}`}
                                  style={{ width: '100%', marginTop: 'auto' }}
                                >
                                  {added ? '✓ Anadido' : '＋ Anadir'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating cart button */}
      {getTotalItemsCount() > 0 && (
        <button
          onClick={() => navigate('/orders')}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            boxShadow: 'var(--shadow-lg)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            zIndex: 1000,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary-hover)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-primary)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Ver carrito"
        >
          <span style={{ position: 'relative' }}>
            🛒
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-10px',
              background: 'var(--color-danger)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.6875rem',
              fontWeight: 700,
            }}>
              {getTotalItemsCount()}
            </span>
          </span>
        </button>
      )}
    </div>
  );
};

export default RestaurantList;
