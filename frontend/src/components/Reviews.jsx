import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { query, createOne, updateOne, deleteOne } from '../api/crud';

const ReviewsList = () => {
  const { userId } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeView, setActiveView] = useState('list');

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    restaurant_id: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);

      const [restaurantsData, reviewsData] = await Promise.all([
        query('restaurants', {}),
        query('reviews', { filter: { user_id: String(userId) } })
      ]);

      if (Array.isArray(restaurantsData)) setRestaurants(restaurantsData);
      if (Array.isArray(reviewsData)) {
        setReviews(reviewsData.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : 0;
          const dateB = b.createdAt ? new Date(b.createdAt) : 0;
          return dateB - dateA;
        }));
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find(r => String(r._id) === String(restaurantId));
    return restaurant ? `${restaurant.name} - ${restaurant.city}` : `Restaurante (ID: ${String(restaurantId).slice(-6).toUpperCase()})`;
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }));
  };

  const resetForm = () => {
    setFormData({ rating: 5, comment: '', restaurant_id: '' });
    setEditingId(null);
    setActiveView('list');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.restaurant_id || !formData.comment || !formData.rating) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingId) {
        await updateOne('reviews', editingId, {
          rating: formData.rating,
          comment: formData.comment
        });
        showSuccess('Review actualizada con exito.');
      } else {
        await createOne('reviews', {
          ...formData,
          user_id: userId
        });
        showSuccess('Review creada con exito.');
      }

      resetForm();
      await fetchData();
    } catch (err) {
      console.error('Error al guardar review:', err);
      setError('Error al guardar la review. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setFormData({
      rating: review.rating,
      comment: review.comment,
      restaurant_id: review.restaurant_id
    });
    setEditingId(review._id);
    setActiveView('form');
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Estas seguro de que quieres eliminar esta review?')) return;
    try {
      setDeletingId(reviewId);
      setError(null);
      await deleteOne('reviews', reviewId);
      showSuccess('Review eliminada.');
      await fetchData();
    } catch (err) {
      console.error('Error al eliminar review:', err);
      setError('Error al eliminar la review.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <label
            key={star}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              fontSize: '1.125rem',
              color: star <= rating ? 'var(--color-warning)' : 'var(--border-color)',
              padding: 0,
              lineHeight: 1,
            }}
          >
            {interactive && (
              <input
                type="radio"
                name="rating"
                value={star}
                checked={formData.rating === star}
                onChange={handleInputChange}
                style={{ display: 'none' }}
              />
            )}
            ★
          </label>
        ))}
      </div>
    );
  };

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
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1.25rem' }}>
          {activeView === 'form' ? (editingId ? 'Editar Review' : 'Nueva Review') : 'Mis Reviews'}
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {activeView === 'form' && (
            <button onClick={resetForm} className="btn btn-outline btn-sm">
              ← Volver
            </button>
          )}
          {activeView === 'list' && (
            <button onClick={() => { resetForm(); setActiveView('form'); }} className="btn btn-primary btn-sm">
              + Nueva Review
            </button>
          )}
        </div>
      </div>

      {activeView === 'form' && (
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="restaurant_id">Restaurante:</label>
                <select
                  id="restaurant_id"
                  name="restaurant_id"
                  value={formData.restaurant_id}
                  onChange={handleInputChange}
                  required
                  disabled={editingId}
                >
                  <option value="">Selecciona un restaurante</option>
                  {restaurants.map(r => (
                    <option key={r._id} value={r._id}>{r.name} - {r.city}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Calificacion:</label>
                <div style={{ padding: '4px 0' }}>
                  {renderStars(formData.rating, true)}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Tu opinion:</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  required
                  placeholder="Comparte tu experiencia con este restaurante..."
                  style={{ minHeight: '100px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Guardando...' : editingId ? 'Actualizar Review' : 'Publicar Review'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn btn-outline">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {activeView === 'list' && (
        <>
          {reviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">⭐</div>
              <h3>Sin reviews</h3>
              <p>Aun no has publicado ninguna review. Comparte tu experiencia!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {reviews.map(review => (
                <div key={review._id} className="card">
                  <div className="card-header">
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-xs)' }}>
                        {getRestaurantName(review.restaurant_id)}
                      </h3>
                      {renderStars(review.rating)}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                      <button
                        onClick={() => handleEdit(review)}
                        className="btn btn-ghost btn-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={deletingId === review._id}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-danger)' }}
                      >
                        {deletingId === review._id ? '...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            backgroundColor: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            marginTop: 'var(--space-2xl)',
          }}>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>
              Como funcionan las reviews?
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Tus opiniones ayudan a otros usuarios a elegir donde comer.
              Puedes crear, editar y eliminar tus reviews en cualquier momento.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewsList;
