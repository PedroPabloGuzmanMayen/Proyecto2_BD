import { useState } from 'react';
import { createOne, createMany, query, updateOne, updateMany, deleteOne, deleteMany } from '../api/crud.js';

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
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h1>CRUD</h1>

      {/* Selección de Colección y Operación */}
      <div>
        <label>Colección: 
          <input value={coll}
                 onChange={e => setColl(e.target.value)}
                 placeholder="e.g. users, restaurants" />
        </label>
        <label style={{ marginLeft: 20 }}>Operación:
          <select value={op} onChange={e => setOp(e.target.value)}>
            {OPERATIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Inputs variables según operación */}
      <div style={{ marginTop: 10 }}>
        {(op === 'createOne') && <>
          <label>Documento (JSON):</label>
          <textarea rows={6}
            value={input.doc || ''}
            onChange={e => setInput({ ...input, doc: e.target.value })}
            placeholder='{"username":"juan","city":"Lima",…}'/>
        </>}

        {(op === 'createMany') && <>
          <label>Documentos (Array JSON):</label>
          <textarea rows={6}
            value={input.docs || ''}
            onChange={e => setInput({ ...input, docs: e.target.value })}
            placeholder='[{"…"},{"…"}]'/>
        </>}

        {(op === 'query') && <>
          <label>Filtro:</label>
          <textarea rows={2}
            value={input.filter || ''}
            onChange={e => setInput({ ...input, filter: e.target.value })}
            placeholder='{"city":"Madrid"}'/>
          <label>Proyección:</label>
          <textarea rows={2}
            value={input.projection || ''}
            onChange={e => setInput({ ...input, projection: e.target.value })}
            placeholder='{"name":1,"city":1}'/>
          <label>Orden (sort):</label>
          <textarea rows={2}
            value={input.sort || ''}
            onChange={e => setInput({ ...input, sort: e.target.value })}
            placeholder='{"name":1}'/>
          <label>Skip:</label>
          <input type="number" value={input.skip||''}
                 onChange={e => setInput({ ...input, skip: e.target.value })}/>
          <label style={{ marginLeft:10 }}>Limit:</label>
          <input type="number" value={input.limit||''}
                 onChange={e => setInput({ ...input, limit: e.target.value })}/>
        </>}

        {(op === 'updateOne') && <>
          <label>ID del doc:</label>
          <input value={input.id||''}
                 onChange={e => setInput({ ...input, id: e.target.value })}/>
          <label>Patch (JSON):</label>
          <textarea rows={4}
            value={input.patch||''}
            onChange={e => setInput({ ...input, patch: e.target.value })}
            placeholder='{"city":"Sevilla"}'/>
        </>}

        {(op === 'updateMany') && <>
          <label>Filtro:</label>
          <textarea rows={2}
            value={input.filter||''}
            onChange={e => setInput({ ...input, filter: e.target.value })}/>
          <label>Patch (JSON):</label>
          <textarea rows={4}
            value={input.patch||''}
            onChange={e => setInput({ ...input, patch: e.target.value })}/>
        </>}

        {(op === 'deleteOne') && <>
          <label>ID del doc:</label>
          <input value={input.id||''}
                 onChange={e => setInput({ ...input, id: e.target.value })}/>
        </>}

        {(op === 'deleteMany') && <>
          <label>Filtro:</label>
          <textarea rows={2}
            value={input.filter||''}
            onChange={e => setInput({ ...input, filter: e.target.value })}/>
        </>}
      </div>

      <button style={{ marginTop: 10 }} onClick={handleRun}>
        Ejecutar
      </button>

      {/* Resultado */}
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
      {result !== null && (
        <div style={{ marginTop: 10 }}>
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

