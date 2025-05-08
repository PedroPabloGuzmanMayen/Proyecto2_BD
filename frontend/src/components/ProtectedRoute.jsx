import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Verificar autenticación
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Verificar si se requiere ser admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}