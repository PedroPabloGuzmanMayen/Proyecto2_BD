/**
 * Utilidades para normalización de datos de usuario
 */

/**
 * Normaliza las propiedades del usuario recibidas del backend para
 * asegurar un formato consistente en toda la aplicación
 * @param {Object} userData Datos del usuario recibidos del backend
 * @returns {Object} Datos normalizados del usuario
 */
export const normalizeUserData = (userData) => {
    if (!userData) return null;
    
    // Normalizar formato de userId (el backend podría enviar userID o userId)
    const userId = userData.userId || userData.userID || userData._id || null;
    
    return {
      ...userData,
      userId,
      // Asegurarse de que siempre hay una propiedad username normalizada
      username: userData.username || userData.userName || userData.name || 'Usuario',
      // Determinar si es admin
      isAdmin: userData.isAdmin || userData.role === 'admin' || userData.username === 'admin'
    };
  };
  
  /**
   * Extrae los datos mínimos necesarios del usuario para almacenar en localStorage
   * @param {Object} userData Datos completos del usuario
   * @returns {Object} Datos mínimos necesarios para la sesión
   */
  export const extractSessionData = (userData) => {
    const normalized = normalizeUserData(userData);
    
    if (!normalized) return null;
    
    // Solo extraer los datos esenciales para la sesión
    return {
      userId: normalized.userId,
      username: normalized.username,
      isAdmin: normalized.isAdmin
    };
  };