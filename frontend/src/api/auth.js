// Definir la URL del backend directamente
import { normalizeUserData, extractSessionData } from './userUtils';

const API_URL = 'http://127.0.0.1:5555';

export const login = async (username, password) => {
  try {

    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const text = await response.text();
      
      throw new Error('Credenciales inválidas o error del servidor');
    }
    
    // Si llegamos aquí, podemos convertir a JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('La respuesta del servidor no es JSON válido');
    }
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('El servidor devolvió una respuesta JSON inválida');
    }
    
    // Normalizar los datos del usuario
    const normalizedUser = normalizeUserData(data);
    
    // Extraer solo los datos necesarios para la sesión
    const sessionData = extractSessionData(normalizedUser);
    
    // Guardar información del usuario en localStorage
    localStorage.setItem('user', JSON.stringify(sessionData));
    
    // Retornar los datos normalizados para su uso inmediato
    return normalizedUser;
  } catch (error) {

    throw error;
  }
};

export const register = async (username, password, userData = {}) => {
  try {

    
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, 
        password,
        city: userData.birthCity,
        birthdate: userData.birthDate })
    });
    
    // Error handling
    if (!response.ok) {
      const text = await response.text();
      
      throw new Error('Error al registrar usuario');
    }
    
    // Si llegamos aquí, podemos convertir a JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('La respuesta del servidor no es JSON válido');
    }
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('El servidor devolvió una respuesta JSON inválida');
    }
    
    return normalizeUserData(data);
  } catch (error) {

    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  
  try {
    const userData = JSON.parse(userString);
    return normalizeUserData(userData); // Normalizar al recuperar
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.isAdmin;
};