import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CrudManager from './components/CrudManager.jsx';
import StatsManager from './components/StatsManager.jsx';
import Login from './components/Login.jsx';
import CustomerDashboard from './components/CustomerDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css';

function Navigation() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      padding: '10px',
      borderBottom: '1px solid #e0e0e0',
      marginBottom: '20px'
    }}>
      <div>
        {isAuthenticated && isAdmin ? (
          // Navegación para administradores
          <>
            <Link to="/" style={{ marginRight: '15px' }}>CRUD</Link>
            <Link to="/stats">Estadísticas</Link>
          </>
        ) : isAuthenticated ? (
          // Navegación para usuarios normales
          <>
            <Link to="/" style={{ marginRight: '15px' }}>Restaurantes</Link>
            <Link to="/orders" style={{ marginRight: '15px' }}>Mis Órdenes</Link>
            <Link to="/reviews">Mis Reviews</Link>
          </>
        ) : null}
      </div>
      
      {isAuthenticated && (
        <div>
          <span style={{ marginRight: '10px' }}>
            {user?.username}
          </span>
          <button 
            onClick={logout}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        {/* Ruta de login accesible para todos */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login />
        } />

        {/* Rutas para administradores */}
        <Route path="/" element={
          <ProtectedRoute requireAdmin={isAdmin}>
            {isAdmin ? <CrudManager /> : <CustomerDashboard />}
          </ProtectedRoute>
        } />

        <Route path="/stats" element={
          <ProtectedRoute requireAdmin={true}>
            <StatsManager />
          </ProtectedRoute>
        } />

        {/* Rutas para usuarios normales */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/reviews" element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        } />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

