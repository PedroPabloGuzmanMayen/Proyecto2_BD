import { useState } from 'react';
import {
  countOrders,
  distinctRestaurantCities,
  topRatedRestaurants,
  topDishes
} from '../api/crud.js';

export default function StatsManager() {
  const [output, setOutput] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      <h1>Estadísticas [Agregaciones]</h1>
      <button onClick={async () => setOutput(await countOrders())}>
        Contar Órdenes
      </button>
      <button onClick={async () => setOutput(await distinctRestaurantCities())} style={{ marginLeft: 10 }}>
        Ciudades de Restaurantes
      </button>
      <button onClick={async () => setOutput(await topRatedRestaurants())} style={{ marginLeft: 10 }}>
        Top 5 Restaurantes
      </button>
      <button onClick={async () => setOutput(await topDishes())} style={{ marginLeft: 10 }}>
        Platos Más Vendidos
      </button>

      {output && (
        <pre style={{ marginTop: 20, fontFamily: 'monospace' }}>
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}

