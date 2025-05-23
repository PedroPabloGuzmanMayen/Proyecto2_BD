import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RestaurantList from './RestaurantList';
import Orders from './Orders';
import ReviewsList from './Reviews'; // Importa el nuevo componente

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('restaurants');

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: '2rem',
        color: '#333',
        marginBottom: '20px'
      }}>
        Bienvenido, {user?.username || 'Usuario'}
      </h1>
      
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
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'restaurants' ? 'bold' : 'normal',
                color: activeTab === 'restaurants' ? '#1976d2' : '#333',
                transition: 'all 0.2s'
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
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
                color: activeTab === 'orders' ? '#1976d2' : '#333',
                transition: 'all 0.2s'
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
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
                color: activeTab === 'reviews' ? '#1976d2' : '#333',
                transition: 'all 0.2s'
              }}
            >
              Mis Reviews
            </button>
          </li>
        </ul>
        
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'restaurants' && <RestaurantList />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'reviews' && <ReviewsList />} {/* Usa el componente aquí */}
        </div>
      </div>
    </div>
  );
}