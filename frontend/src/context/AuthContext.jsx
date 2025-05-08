import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar
    const user = getCurrentUser();
    setUser(user);
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiLogin(username, password);
      setUser({ 
        username: response.username,
        isAdmin: response.username === 'admin'
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, password) => {
    try {
      return await apiRegister(username, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  // Valores proporcionados por el contexto
  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};