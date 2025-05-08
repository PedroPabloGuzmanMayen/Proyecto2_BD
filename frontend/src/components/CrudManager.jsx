import { useState } from 'react';
import { createOne, createMany, query, updateOne, updateMany, deleteOne, deleteMany } from '../api/crud.js';
import '../styles/components.css';

const OPERATIONS = [
  { key: 'createOne',   label: 'Crear 1 documento' },
  { key: 'createMany',  label: 'Crear varios documentos' },
  { key: 'query',       label: 'Consultar (filtros/…)' },
  { key: 'updateOne',   label: 'Actualizar 1 documento' },
  { key: 'updateMany',  label: 'Actualizar varios documentos' },
  { key: 'deleteOne',   label: 'Eliminar 1 documento' },
  { key: 'deleteMany',  label: 'Eliminar varios documentos' },
];

export default function CrudManager() {
  const [op,    setOp]    = useState('createOne');
  const [coll,  setColl]  = useState('users');
  const [input, setInput] = useState({});    // contendrá filter, doc, docs, id, patch...
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState(null);

  const handleRun = async () => {
    try {
      setError(null);
      let res;
      switch (op) {
        case 'createOne':
          res = await createOne(coll, JSON.parse(input.doc));
          break;
        case 'createMany':
          res = await createMany(coll, JSON.parse(input.docs));
          break;
        case 'query':
          res = await query(coll, {
            filter: JSON.parse(input.filter || '{}'),
            projection: JSON.parse(input.projection || '{}'),
            sort: JSON.parse(input.sort || '{}'),
            skip:  input.skip ? Number(input.skip) : undefined,
            limit: input.limit? Number(input.limit) : undefined
          });
          break;
        case 'updateOne':
          res = await updateOne(coll, input.id, JSON.parse(input.patch));
          break;
        case 'updateMany':
          res = await updateMany(coll,
            JSON.parse(input.filter || '{}'),
            JSON.parse(input.patch  || '{}')
          );
          break;
        case 'deleteOne':
          res = await deleteOne(coll, input.id);
          break;
        case 'deleteMany':
          res = await deleteMany(coll, JSON.parse(input.filter || '{}'));
          break;
        default:
          throw new Error('Operación no soportada');
      }
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="crud-container">
      <h1>CRUD Manager</h1>
      
      {/* Selección de Colección y Operación */}
      <div className="operation-selector">
        <div className="form-group">
          <label>Colección:</label>
          <input 
            value={coll}
            onChange={e => setColl(e.target.value)}
            placeholder="e.g. users, restaurants" 
          />
        </div>
        <div className="form-group">
          <label>Operación:</label>
          <select value={op} onChange={e => setOp(e.target.value)}>
            {OPERATIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Inputs variables según operación */}
      <div className="section">
        {(op === 'createOne') && (
          <div className="form-group">
            <label>Documento (JSON):</label>
            <textarea 
              rows={6}
              value={input.doc || ''}
              onChange={e => setInput({ ...input, doc: e.target.value })}
              placeholder='{"username":"juan","city":"Lima",…}'
            />
          </div>
        )}
        
        {(op === 'createMany') && (
          <div className="form-group">
            <label>Documentos (Array JSON):</label>
            <textarea 
              rows={6}
              value={input.docs || ''}
              onChange={e => setInput({ ...input, docs: e.target.value })}
              placeholder='[{"…"},{"…"}]'
            />
          </div>
        )}
        
        {(op === 'query') && (
          <>
            <div className="form-group">
              <label>Filtro:</label>
              <textarea 
                rows={2}
                value={input.filter || ''}
                onChange={e => setInput({ ...input, filter: e.target.value })}
                placeholder='{"city":"Madrid"}'
              />
            </div>
            <div className="form-group">
              <label>Proyección:</label>
              <textarea 
                rows={2}
                value={input.projection || ''}
                onChange={e => setInput({ ...input, projection: e.target.value })}
                placeholder='{"name":1,"city":1}'
              />
            </div>
            <div className="form-group">
              <label>Orden (sort):</label>
              <textarea 
                rows={2}
                value={input.sort || ''}
                onChange={e => setInput({ ...input, sort: e.target.value })}
                placeholder='{"name":1}'
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Skip:</label>
                <input 
                  type="number" 
                  value={input.skip || ''}
                  onChange={e => setInput({ ...input, skip: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Limit:</label>
                <input 
                  type="number" 
                  value={input.limit || ''}
                  onChange={e => setInput({ ...input, limit: e.target.value })}
                />
              </div>
            </div>
          </>
        )}
        
        {(op === 'updateOne') && (
          <>
            <div className="form-group">
              <label>ID del doc:</label>
              <input 
                value={input.id || ''}
                onChange={e => setInput({ ...input, id: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Patch (JSON):</label>
              <textarea 
                rows={4}
                value={input.patch || ''}
                onChange={e => setInput({ ...input, patch: e.target.value })}
                placeholder='{"city":"Sevilla"}'
              />
            </div>
          </>
        )}
        
        {(op === 'updateMany') && (
          <>
            <div className="form-group">
              <label>Filtro:</label>
              <textarea 
                rows={2}
                value={input.filter || ''}
                onChange={e => setInput({ ...input, filter: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Patch (JSON):</label>
              <textarea 
                rows={4}
                value={input.patch || ''}
                onChange={e => setInput({ ...input, patch: e.target.value })}
              />
            </div>
          </>
        )}
        
        {(op === 'deleteOne') && (
          <div className="form-group">
            <label>ID del doc:</label>
            <input 
              value={input.id || ''}
              onChange={e => setInput({ ...input, id: e.target.value })}
            />
          </div>
        )}
        
        {(op === 'deleteMany') && (
          <div className="form-group">
            <label>Filtro:</label>
            <textarea 
              rows={2}
              value={input.filter || ''}
              onChange={e => setInput({ ...input, filter: e.target.value })}
            />
          </div>
        )}
        
        <button className="action-button" onClick={handleRun}>
          Ejecutar Operación
        </button>
      </div>
      
      {/* Resultado */}
      {error && <div className="error">{error}</div>}
      
      {result !== null && (
        <div className="result-container">
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
