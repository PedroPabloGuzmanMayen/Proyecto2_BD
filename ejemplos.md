# Ejemplos por operación

## 1. Crear 1 documento (createOne)

**Colección:** users

**Documento (JSON):**
```json
{
  "username": "juan123",
  "password": "es_un_secreto_chen",
  "city": "Bogotá",
  "birthdate": "1990-05-10T00:00:00.000Z"
}
```

**Resultado esperado:** la interfaz te devuelve ese mismo json.

## 2. Crear varios documentos (createMany)

**Colección:** restaurants

**Documentos (Array JSON):**
```json
[
  {
    "name": "Sushi Bar",
    "location": { "coordinates": [-58.3816, -34.6037] },
    "city": "Buenos Aires",
    "description": "Especialidad en sushi fresco",
    "menu": [
      { "name": "Sushi Rolls", "price": 12.5, "description": "Rollo variado" }
    ]
  },
  {
    "name": "Pasta House",
    "location": { "coordinates": [-74.006, 40.7128] },
    "city": "New York",
    "description": "Pastas artesanales",
    "menu": [
      { "name": "Spaghetti", "price": 10.0, "description": "Con salsa boloñesa" }
    ]
  }
]
```

**Resultado esperado:** un array con ambos documentos creados.

## 3. Consultar documentos (query)

**Colección:** orders

**Filtro** (por ejemplo, todas las órdenes de un usuario, pero es mejor agarrar un id al hacer una consulta a todo):

El equivalente al select * from n;
```json
filtro: {}
proyeccion: {}
orden: {}
skip: [dejenlo vacio]
limit: [dejenlo vacio]
```

```json
{ "user_id": "681b941061307d035f70d8fc" }
```

**Proyección** (solo detail y total):
```json
{ "detail": 1, "total": 1 }
```

**Orden** (por total descendente):
```json
{ "total": -1 }
```

**Skip:** 0

**Limit:** 5

## 4. Actualizar 1 documento (updateOne)

**Colección:** reviews

**ID del doc:** poner aquí el _id exacto de la review a modificar

**Resultado:** el documento actualizado (nuevo valor de rating y comment).

## 5. Actualizar varios documentos (updateMany)

**Colección:** users

**Filtro** (todos los usuarios de "Málaga"):
```json
{ "city": "Málaga" }
```

**Patch (JSON):**
```json
{ "city": "Málaga, España" }
```

**Resultado:** un objeto con { acknowledged, modifiedCount, matchedCount }.

## 6. Eliminar 1 documento (deleteOne)

**Colección:** restaurants

**ID del doc:** el _id del restaurante que quieres borrar, e.g. 681b941061307d035f70d949

**Resultado:** el objeto borrado.

## 7. Eliminar varios documentos (deleteMany)

**Colección:** orders

**Filtro** (todas las órdenes con total menor a 10):
```json
{ "total": { "$lt": 10 } }
```

**Resultado:** un objeto con { acknowledged, deletedCount }.
