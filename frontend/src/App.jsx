import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CrudManager from './components/CrudManager.jsx';
import StatsManager from './components/StatsManager.jsx';
import Login from './components/Login.jsx';
import CustomerDashboard from './components/CustomerDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './App.css';

function Navigation() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const initial = user?.username?.[0] || '?';

  return (
    <nav className="nav">
      <div className="nav-links">
        {isAdmin ? (
          <>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              CRUD
            </Link>
            <Link
              to="/stats"
              className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}
            >
              Estadisticas
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Restaurantes
            </Link>
            <Link
              to="/orders"
              className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
            >
              Mis Ordenes
            </Link>
            <Link
              to="/reviews"
              className={`nav-link ${location.pathname === '/reviews' ? 'active' : ''}`}
            >
              Mis Reviews
            </Link>
          </>
        )}
      </div>

      <div className="nav-right">
        <div className="nav-user">
          <div className="nav-avatar">{initial}</div>
          <span>{user?.username}</span>
        </div>
        <button onClick={logout} className="nav-logout">
          Salir
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={
              isAuthenticated ? <Navigate to="/" /> : <Login />
            } />

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

            <Route path="/orders" element={
              <ProtectedRoute>
                <CustomerDashboard initialTab="orders" />
              </ProtectedRoute>
            } />

            <Route path="/reviews" element={
              <ProtectedRoute>
                <CustomerDashboard initialTab="reviews" />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
