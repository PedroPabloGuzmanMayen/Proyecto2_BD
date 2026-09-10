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
  const [mode, setMode] = useState('login');

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
        await register(username, password, { birthDate, birthCity });
        setMode('login');
        setError('');
        setBirthDate('');
        setBirthCity('');
        alert('Usuario registrado con exito. Ahora puedes iniciar sesion.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setBirthDate('');
    setBirthCity('');
    setError('');
  };

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-primary)',
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: 'var(--space-lg)',
          }}>
            🍽
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-xs)' }}>
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            {mode === 'login'
              ? 'Inicia sesion para ordenar tu comida favorita'
              : 'Registrate para empezar a ordenar'}
          </p>
        </div>

        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre de usuario"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contrasena</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contrasena"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label htmlFor="birthDate">Fecha de nacimiento</label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="birthCity">Ciudad de nacimiento</label>
                  <input
                    id="birthCity"
                    type="text"
                    value={birthCity}
                    onChange={(e) => setBirthCity(e.target.value)}
                    placeholder="Ej: Guatemala"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 'var(--space-sm)' }}
            >
              {isLoading
                ? 'Procesando...'
                : mode === 'login' ? 'Iniciar Sesion' : 'Registrarse'}
            </button>
          </form>

          <div style={{
            marginTop: 'var(--space-xl)',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}>
            {mode === 'login' ? (
              <>
                No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); resetForm(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 600,
                    font: 'inherit',
                  }}
                >
                  Registrate
                </button>
              </>
            ) : (
              <>
                Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); resetForm(); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 600,
                    font: 'inherit',
                  }}
                >
                  Inicia sesion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
