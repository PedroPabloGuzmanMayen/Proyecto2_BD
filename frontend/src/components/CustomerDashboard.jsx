import { useAuth } from '../context/AuthContext';
import RestaurantList from './RestaurantList';
import Orders from './Orders';
import ReviewsList from './Reviews';
import RestaurantReviews from './RestaurantReviews.jsx';

export default function CustomerDashboard({ initialTab = 'restaurants' }) {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ marginBottom: 'var(--space-xl)' }}>
        Hola, {user?.username || 'Usuario'}
      </h1>

      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        {initialTab === 'restaurants' && <RestaurantList />}
        {initialTab === 'orders' && <Orders />}
        {initialTab === 'reviews' && <ReviewsList />}
        {initialTab === 'restaurant-reviews' && <RestaurantReviews />}
      </div>
    </div>
  );
}