// src/components/StatsManager.jsx
import { useState } from 'react';
import {
  countOrders,
  distinctRestaurantCities,
  topRatedRestaurants,
  topDishes,
  addMenuItem,
  removeMenuItem,
  addTag,
  getExpensiveDishes,
  updateMenuItemPrice
} from '../api/crud.js';

export default function StatsManager() {
  const [output, setOutput] = useState(null);
  const [rid, setRid] = useState('');       // restaurantId
  const [item, setItem] = useState({});     // nuevo platillo
  const [itemId, setItemId] = useState(''); // para remove/update
  const [tag, setTag] = useState('');
  const [minPrice, setMinPrice] = useState(20);
  const [newPrice, setNewPrice] = useState(0);

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Estadísticas y Operaciones Avanzadas</h1>

      {/* — Estadísticas existentes — */}
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

      <hr style={{ margin: '20px 0' }}/>

      {/* — 3. Manejo de Arrays — */}
      <h2>🍽️ Menú de Restaurante (arrays)</h2>
      <input
        placeholder="Restaurant ID"
        value={rid}
        onChange={e => setRid(e.target.value)}
      />
      <h3>Añadir Platillo</h3>
      <textarea
        rows={3}
        placeholder='{"name":"Taco","price":5,"description":"Delicioso"}'
        value={JSON.stringify(item)}
        onChange={e => setItem(JSON.parse(e.target.value))}
      />
      <button onClick={async () => setOutput(await addMenuItem(rid, item))}>
        $push(menu)
      </button>

      <h3>Eliminar Platillo</h3>
      <input
        placeholder="Item ID"
        value={itemId}
        onChange={e => setItemId(e.target.value)}
      />
      <button onClick={async () => setOutput(await removeMenuItem(rid, itemId))}>
        $pull(menu)
      </button>

      <h3>Añadir Tag (sin duplicados)</h3>
      <input
        placeholder="Tag"
        value={tag}
        onChange={e => setTag(e.target.value)}
      />
      <button onClick={async () => setOutput(await addTag(rid, tag))}>
        $addToSet(tags)
      </button>

      <hr style={{ margin: '20px 0' }}/>

      {/* — 4. Documentos Embebidos — */}
      <h2>📑 Documentos Embebidos (menu)</h2>
      <h3>Filtrar por Precio Mínimo</h3>
      <input
        placeholder="Restaurant ID"
        value={rid}
        onChange={e => setRid(e.target.value)}
      />
      <input
        type="number"
        placeholder="Precio Mínimo"
        value={minPrice}
        onChange={e => setMinPrice(Number(e.target.value))}
      />
      <button onClick={async () => setOutput(await getExpensiveDishes(rid, minPrice))}>
        Pipeline Embebido
      </button>

      <h3>Actualizar Precio de Item</h3>
      <input
        placeholder="Item ID"
        value={itemId}
        onChange={e => setItemId(e.target.value)}
      />
      <input
        type="number"
        placeholder="Nuevo Precio"
        value={newPrice}
        onChange={e => setNewPrice(Number(e.target.value))}
      />
      <button onClick={async () => setOutput(await updateMenuItemPrice(rid, itemId, newPrice))}>
        $set(menu.$.price)
      </button>

      {output && (
        <pre style={{ marginTop: 20, fontFamily: 'monospace' }}>
          {JSON.stringify(output, null, 2)}
        </pre>
      )}
    </div>
  );
}

