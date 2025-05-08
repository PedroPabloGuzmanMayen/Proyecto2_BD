import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CrudManager from './components/CrudManager.jsx';
import StatsManager from './components/StatsManager.jsx';

export default function App() {
  return (
  <BrowserRouter>
  <nav>
    <Link to="/">CRUD</Link> | 
    <Link to="/stats">Estadísticas</Link>
  </nav>
  <Routes>
    <Route path="/" element={<CrudManager />} />
    <Route path="/stats" element={<StatsManager />} />
  </Routes>
</BrowserRouter>
  );
}

