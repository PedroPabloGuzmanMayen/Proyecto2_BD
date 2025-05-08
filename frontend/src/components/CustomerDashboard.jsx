import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('restaurants');

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bienvenido, {user?.username}</h1>
      
      <div style={{ marginTop: '20px' }}>
        <ul style={{ 
          display: 'flex',
          listStyle: 'none',
          padding: 0,
          margin: '0 0 20px 0',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <li>
            <button 
              onClick={() => setActiveTab('restaurants')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'restaurants' ? '#f0f0f0' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'restaurants' ? '2px solid #1976d2' : 'none',
                cursor: 'pointer'
              }}
            >
              Restaurantes
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'orders' ? '#f0f0f0' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'orders' ? '2px solid #1976d2' : 'none',
                cursor: 'pointer'
              }}
            >
              Mis Órdenes
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('reviews')}
              style={{
                padding: '10px 20px',
                backgroundColor: activeTab === 'reviews' ? '#f0f0f0' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'reviews' ? '2px solid #1976d2' : 'none',
                cursor: 'pointer'
              }}
            >
              Mis Reviews
            </button>
          </li>
        </ul>
        
        <div>
          {activeTab === 'restaurants' && (
            <div>
              <h2>Restaurantes</h2>
              <p>Aquí se mostrará un listado de restaurantes disponibles.</p>
              {/* Componente de listado de restaurantes */}
            </div>
          )}
          
          {activeTab === 'orders' && (
            <div>
              <h2>Mis Órdenes</h2>
              <p>Aquí se mostrarán tus órdenes recientes.</p>
              {/* Componente de órdenes del usuario */}
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <h2>Mis Reviews</h2>
              <p>Aquí se mostrarán las reseñas que has escrito.</p>
              {/* Componente de reviews del usuario */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}