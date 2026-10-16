
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../src/main.js');

let server;
let base;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
});

// ---------- Hallazgo 2: divulgacion del framework ----------

test('las respuestas no incluyen el header X-Powered-By', async () => {
  const res = await fetch(`${base}/coleccion-inexistente`);
  assert.equal(res.headers.get('x-powered-by'), null);
});

// ---------- Hallazgo 1: subida sin limite de tamano ----------

test('POST /upload ya no existe: un archivo de 5 MB devuelve 404', async () => {
  const archivo = new Blob([new Uint8Array(5 * 1024 * 1024)], {
    type: 'application/octet-stream',
  });
  const form = new FormData();
  form.append('file', archivo, 'grande.bin');

  const res = await fetch(`${base}/upload`, { method: 'POST', body: form });

  assert.equal(res.status, 404);
});

test('GET /files ya no lista archivos', async () => {
  const res = await fetch(`${base}/files`);
  assert.equal(res.status, 404);
});

test('GET /files/:id ya no descarga archivos', async () => {
  const res = await fetch(`${base}/files/000000000000000000000000`);
  assert.equal(res.status, 404);
});

test('DELETE /files/:id ya no permite borrar archivos', async () => {
  const res = await fetch(`${base}/files/000000000000000000000000`, {
    method: 'DELETE',
  });
  assert.equal(res.status, 404);
});