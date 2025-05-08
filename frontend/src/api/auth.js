// Definir la URL del backend directamente
import { normalizeUserData, extractSessionData } from './userUtils';

const API_URL = 'http://localhost:3000';

export const login = async (username, password) => {
  try {
    console.log(`Intentando login en: ${API_URL}/login`);
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const text = await response.text();
      
      console.error('Respuesta no exitosa:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        textPreview: text.substring(0, 100) // Mostrar los primeros 100 caracteres
      });
      
      throw new Error(`Error de servidor: ${response.status} ${response.statusText}`);
    }
    
    // Si llegamos aquí, podemos convertir a JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Respuesta no es JSON:', contentType);
      throw new Error('La respuesta del servidor no es JSON válido');
    }
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Error al parsear JSON:', e);
      console.error('Texto recibido:', text.substring(0, 200));
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
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (username, password, userData = {}) => {
  try {
    console.log(`Intentando registro en: ${API_URL}/register`);
    
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
      
      console.error('Respuesta no exitosa:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        textPreview: text.substring(0, 100)
      });
      
      throw new Error(`Error de servidor: ${response.status} ${response.statusText}`);
    }
    
    // Si llegamos aquí, podemos convertir a JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Respuesta no es JSON:', contentType);
      throw new Error('La respuesta del servidor no es JSON válido');
    }
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Error al parsear JSON:', e);
      console.error('Texto recibido:', text.substring(0, 200));
      throw new Error('El servidor devolvió una respuesta JSON inválida');
    }
    
    return normalizeUserData(data);
  } catch (error) {
    console.error('Error en registro:', error);
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