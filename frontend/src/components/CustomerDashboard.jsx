import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RestaurantList from './RestaurantList';
import Orders from './Orders';
import ReviewsList from './Reviews';

export default function CustomerDashboard({ initialTab = 'restaurants' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>
        Hola, {user?.username || 'Usuario'}
      </h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          Restaurantes
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Mis Ordenes
        </button>
        <button
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Mis Reviews
        </button>
      </div>

      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        {activeTab === 'restaurants' && <RestaurantList />}
        {activeTab === 'orders' && <Orders />}
        {activeTab === 'reviews' && <ReviewsList />}
      </div>
    </div>
  );
}
