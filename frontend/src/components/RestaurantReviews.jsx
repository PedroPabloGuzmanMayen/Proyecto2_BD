// frontend/src/components/RestaurantReviews.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { query, deleteOne } from '../api/crud';

const RestaurantReviews = () => {
  const { isAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [cityFilter, setCityFilter] = useState('');
  const [minRating, setMinRating] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [reviewsData, restaurantsData, usersData] = await Promise.all([
        query('reviews', {}),
        query('restaurants', {}),
        query('users', { projection: { username: 1 } }) // solo username, nunca password
      ]);

      if (Array.isArray(reviewsData)) setReviews(reviewsData);
      if (Array.isArray(restaurantsData)) {
        const map = {};
        restaurantsData.forEach(r => { map[String(r._id)] = r; });
        setRestaurants(map);
      }
      if (Array.isArray(usersData)) {
        const map = {};
        usersData.forEach(u => { map[String(u._id)] = u; });
        setUsers(map);
      }
    } catch (err) {
      console.error('Error al cargar reviews:', err);
      setError('No se pudieron cargar las reviews. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getUsername = (id) =>
    users[String(id)]?.username || `Usuario (ID: ${String(id).slice(-6).toUpperCase()})`;

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Eliminar esta review permanentemente?')) return;
    try {
      setDeletingId(reviewId);
      await deleteOne('reviews', reviewId);
      await fetchData();
    } catch (err) {
      console.error('Error al eliminar review:', err);
      setError('No se pudo eliminar la review.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating) => (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} style={{ fontSize: '1rem', color: star <= rating ? 'var(--color-warning)' : 'var(--border-color)' }}>★</span>
      ))}
    </div>
  );

  const cities = [...new Set(Object.values(restaurants).map(r => r.city))];

  // Agrupar reviews por restaurante
  const groups = {};
  reviews.forEach(review => {
    const restaurant = restaurants[String(review.restaurant_id)];
    if (cityFilter && restaurant?.city !== cityFilter) return;
    if (minRating && review.rating < Number(minRating)) return;

    const key = String(review.restaurant_id);
    if (!groups[key]) groups[key] = { restaurant, reviews: [] };
    groups[key].reviews.push(review);
  });

  const groupList = Object.values(groups)
    .filter(g => g.reviews.length > 0)
    .sort((a, b) => (a.restaurant?.name || '').localeCompare(b.restaurant?.name || ''));

  const totalReviews = groupList.reduce((sum, g) => sum + g.reviews.length, 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Cargando reviews...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>Reviews por Restaurante</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '160px' }}>
            <label style={{ fontSize: '0.8125rem' }}>Ciudad</label>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
              <option value="">Todas las ciudades</option>
              {cities.map((city, i) => <option key={i} value={city}>{city}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '140px' }}>
            <label style={{ fontSize: '0.8125rem' }}>Calificacion minima</label>
            <select value={minRating} onChange={e => setMinRating(e.target.value)}>
              <option value="">Cualquiera</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {totalReviews} review{totalReviews !== 1 ? 's' : ''}
        </span>
      </div>

      {groupList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <h3>Sin resultados</h3>
          <p>No hay reviews que cumplan con los filtros.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
          {groupList.map(group => {
            const avg = group.reviews.reduce((s, r) => s + r.rating, 0) / group.reviews.length;
            return (
              <div key={group.restaurant?._id || group.reviews[0].restaurant_id}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  <h2 style={{ fontSize: '1.125rem', margin: 0 }}>
                    {group.restaurant ? `${group.restaurant.name} - ${group.restaurant.city}` : 'Restaurante desconocido'}
                  </h2>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {avg.toFixed(1)} ★ ({group.reviews.length} review{group.reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  {group.reviews.map(review => (
                    <div key={review._id} className="card">
                      <div className="card-header">
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          {renderStars(review.rating)}
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                            por {getUsername(review.user_id)}
                          </span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(review._id)}
                            disabled={deletingId === review._id}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--color-danger)' }}
                          >
                            {deletingId === review._id ? '...' : 'Eliminar'}
                          </button>
                        )}
                      </div>
                      <div className="card-body">
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RestaurantReviews;