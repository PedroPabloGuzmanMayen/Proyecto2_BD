import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { query, createOne, updateOne, deleteOne } from '../api/crud';

const ReviewsList = () => {
  const { userId } = useAuth();
  const [restaurantList, setRestaurantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    restaurant_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Cargar la lista de restaurantes disponibles
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los restaurantes para el selector
        const restaurantsData = await query('restaurants', {});
        if (Array.isArray(restaurantsData)) {
          setRestaurantList(restaurantsData);
        } else {
          setRestaurantList([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar restaurantes:', err);
        setError('No se pudieron cargar los restaurantes. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    });
  };

  // Crear una nueva review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!userId || !formData.restaurant_id || !formData.comment || !formData.rating) {
      setError('Por favor completa todos los campos.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const reviewData = {
        ...formData,
        user_id: userId
      };
      
      // Crear nueva review
      await createOne('reviews', reviewData);
      
      // Mostrar mensaje de éxito
      setSuccess('¡Review creada con éxito!');
      
      // Limpiar el formulario
      setFormData({
        rating: 5,
        comment: '',
        restaurant_id: ''
      });
      
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error al guardar review:', err);
      setError('Error al guardar la review. Por favor, intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
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
        <p>Cargando restaurantes...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '20px', 
        color: '#333',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px'
      }}>
        Crear una Nueva Review
      </h2>
      
      {/* Mostrar mensajes de error o éxito */}
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {success}
        </div>
      )}
      
      {/* Formulario para crear reviews */}
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        backgroundColor: '#f9f9f9'
      }}>
        <form onSubmit={handleSubmitReview}>
          {/* Selector de restaurante */}
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="restaurant_id" 
              style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              Restaurante:
            </label>
            
            <select
              id="restaurant_id"
              name="restaurant_id"
              value={formData.restaurant_id}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
            >
              <option value="">Selecciona un restaurante</option>
              {restaurantList.map(restaurant => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name} - {restaurant.city}
                </option>
              ))}
            </select>
          </div>
          
          {/* Selector de calificación */}
          <div style={{ marginBottom: '20px' }}>
            <label 
              style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              Calificación:
            </label>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <label 
                  key={star}
                  style={{
                    cursor: 'pointer',
                    fontSize: '32px',
                    color: star <= formData.rating ? '#FFD700' : '#e0e0e0'
                  }}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={formData.rating === star}
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                  />
                  ★
                </label>
              ))}
            </div>
          </div>
          
          {/* Campo para el comentario */}
          <div style={{ marginBottom: '25px' }}>
            <label 
              htmlFor="comment" 
              style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              Tu opinión:
            </label>
            
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              required
              placeholder="¿Qué te pareció este restaurante? Comparte tu experiencia..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                minHeight: '120px',
                resize: 'vertical',
                fontSize: '16px',
                lineHeight: '1.5'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '12px 25px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              opacity: submitting ? 0.7 : 1,
              transition: 'background-color 0.2s ease'
            }}
          >
            {submitting ? 'Enviando...' : 'Publicar Review'}
          </button>
        </form>
      </div>
      
      <div style={{
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '30px'
      }}>
        <h3 style={{ color: '#1976d2', marginTop: 0 }}>¿Cómo funcionan las reviews?</h3>
        <p>
          Tus opiniones son muy importantes para ayudar a otros usuarios a elegir 
          dónde comer. Una buena review incluye:
        </p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Detalles sobre la calidad de la comida</li>
          <li>Comentarios sobre el servicio</li>
          <li>Tu experiencia general con el restaurante</li>
        </ul>
        <p>
          ¡Gracias por compartir tus experiencias con la comunidad!
        </p>
      </div>
    </div>
  );
};

export default ReviewsList;