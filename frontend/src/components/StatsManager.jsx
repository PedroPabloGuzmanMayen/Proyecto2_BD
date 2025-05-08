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
import '../styles/components.css';

export default function StatsManager() {
  const [output, setOutput] = useState(null);
  const [rid, setRid] = useState('');       // restaurantId
  const [item, setItem] = useState({});     // nuevo platillo
  const [itemId, setItemId] = useState(''); // para remove/update
  const [tag, setTag] = useState('');
  const [minPrice, setMinPrice] = useState(20);
  const [newPrice, setNewPrice] = useState(0);

  // Función para manejar cambios en el estado del nuevo item (platillo)
  const handleItemChange = (e) => {
    try {
      setItem(JSON.parse(e.target.value));
    } catch (err) {
      // Si no es JSON válido, solo guardamos el texto
      setItem(e.target.value);
    }
  };

  return (
    <div className="stats-container">
      <h1>Estadísticas y Operaciones Avanzadas</h1>
      
      {/* — Estadísticas existentes — */}
      <div className="section">
        <h2>Consultas Estadísticas</h2>
        <div className="stats-buttons-group">
          <button onClick={async () => setOutput(await countOrders())}>
            Contar Órdenes
          </button>
          <button onClick={async () => setOutput(await distinctRestaurantCities())}>
            Ciudades de Restaurantes
          </button>
          <button onClick={async () => setOutput(await topRatedRestaurants())}>
            Top 5 Restaurantes
          </button>
          <button onClick={async () => setOutput(await topDishes())}>
            Platos Más Vendidos
          </button>
        </div>
      </div>
      
      <hr />
      
      {/* — 3. Manejo de Arrays — */}
      <div className="section">
        <h2>Menú de Restaurante (arrays)</h2>
        
        <div className="form-group">
          <label>ID de Restaurante:</label>
          <input
            placeholder="Restaurant ID"
            value={rid}
            onChange={e => setRid(e.target.value)}
          />
        </div>
        
        <div className="menu-operations">
          <div className="menu-operation">
            <h3>Añadir Platillo</h3>
            <textarea
              rows={4}
              placeholder='{"name":"Taco","price":5,"description":"Delicioso"}'
              value={typeof item === 'object' ? JSON.stringify(item) : item}
              onChange={handleItemChange}
            />
            <button onClick={async () => setOutput(await addMenuItem(rid, item))}>
              $push(menu)
            </button>
          </div>
          
          <div className="menu-operation">
            <h3>Eliminar Platillo</h3>
            <div className="form-group">
              <label>ID del Platillo:</label>
              <input
                placeholder="Item ID"
                value={itemId}
                onChange={e => setItemId(e.target.value)}
              />
            </div>
            <button onClick={async () => setOutput(await removeMenuItem(rid, itemId))}>
              $pull(menu)
            </button>
          </div>
          
          <div className="menu-operation">
            <h3>Añadir Tag (sin duplicados)</h3>
            <div className="form-group">
              <label>Tag:</label>
              <input
                placeholder="Tag"
                value={tag}
                onChange={e => setTag(e.target.value)}
              />
            </div>
            <button onClick={async () => setOutput(await addTag(rid, tag))}>
              $addToSet(tags)
            </button>
          </div>
        </div>
      </div>
      
      <hr />
      
      {/* — 4. Documentos Embebidos — */}
      <div className="section">
        <h2>Documentos Embebidos (menu)</h2>
        
        <div className="menu-operations">
          <div className="menu-operation">
            <h3>Filtrar por Precio Mínimo</h3>
            
            <div className="form-group">
              <label>ID de Restaurante:</label>
              <input
                placeholder="Restaurant ID"
                value={rid}
                onChange={e => setRid(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Precio Mínimo:</label>
              <input
                type="number"
                placeholder="Precio Mínimo"
                value={minPrice}
                onChange={e => setMinPrice(Number(e.target.value))}
              />
            </div>
            
            <button onClick={async () => setOutput(await getExpensiveDishes(rid, minPrice))}>
              Pipeline Embebido
            </button>
          </div>
          
          <div className="menu-operation">
            <h3>Actualizar Precio de Item</h3>
            
            <div className="form-group">
              <label>ID del Platillo:</label>
              <input
                placeholder="Item ID"
                value={itemId}
                onChange={e => setItemId(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Nuevo Precio:</label>
              <input
                type="number"
                placeholder="Nuevo Precio"
                value={newPrice}
                onChange={e => setNewPrice(Number(e.target.value))}
              />
            </div>
            
            <button onClick={async () => setOutput(await updateMenuItemPrice(rid, itemId, newPrice))}>
              $set(menu.$.price)
            </button>
          </div>
        </div>
      </div>
      
      {/* Resultado */}
      {output && (
        <div className="result-container">
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(output, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
