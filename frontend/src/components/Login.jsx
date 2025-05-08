import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthCity, setBirthCity] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' o 'register'
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await login(username, password);
        navigate('/');
      } else {
        // Para el registro, incluimos fecha y ciudad de nacimiento
        await register(username, password, {
          birthDate,
          birthCity
        });
        setMode('login');
        setError('');
        // Mostrar mensaje de éxito
        alert('Usuario registrado con éxito. Ahora puedes iniciar sesión.');
        // Limpiar campos para el login
        setBirthDate('');
        setBirthCity('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      borderRadius: '8px'
    }}>
      <h2>{mode === 'login' ? 'Iniciar Sesión' : 'Registro'}</h2>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
            Nombre de usuario
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        {/* Campos adicionales solo para el registro */}
        {mode === 'register' && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="birthDate" style={{ display: 'block', marginBottom: '5px' }}>
                Fecha de nacimiento
              </label>
              <input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="birthCity" style={{ display: 'block', marginBottom: '5px' }}>
                Ciudad de nacimiento
              </label>
              <input
                id="birthCity"
                type="text"
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          </>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            padding: '10px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading 
            ? 'Procesando...' 
            : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
        </button>
        
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          {mode === 'login' ? (
            <p>
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit',
                  textDecoration: 'underline'
                }}
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit',
                  textDecoration: 'underline'
                }}
              >
                Inicia sesión
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}