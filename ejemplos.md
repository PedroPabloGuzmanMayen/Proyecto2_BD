Claro, vamos a probar sistemáticamente cada una de las opciones en los componentes CrudManager y StatsManager. Te guiaré paso a paso sobre cómo utilizar cada funcionalidad.

# Pruebas para CrudManager

Vamos a probar cada operación CRUD en el orden natural de creación, consulta, actualización y eliminación.

## 1. Crear documentos

### Opción 1: Crear 1 documento (createOne)

1. **Colección**: Escribe `restaurants`
2. **Operación**: Selecciona `Crear 1 documento`
3. **Documento (JSON)**: Ingresa el siguiente JSON:
```json
{
  "name": "La Parrilla Argentina",
  "city": "Madrid",
  "rating": 4.7,
  "tags": ["parrilla", "carne", "argentino"],
  "menu": [
    {
      "name": "Bife de Chorizo",
      "price": 22.50,
      "description": "300g de carne a la parrilla"
    },
    {
      "name": "Empanadas",
      "price": 8.90,
      "description": "4 unidades de carne o queso"
    }
  ]
}
```
4. Haz clic en **Ejecutar Operación**
5. Deberías recibir un resultado exitoso con el documento creado, incluyendo un ID generado

### Opción 2: Crear varios documentos (createMany)

1. **Colección**: Escribe `users`
2. **Operación**: Selecciona `Crear varios documentos`
3. **Documentos (Array JSON)**: Ingresa el siguiente array:
```json
[
  {
    "username": "maria_garcia",
    "name": "María García",
    "email": "maria@example.com",
    "city": "Barcelona",
    "age": 28
  },
  {
    "username": "juan_lopez",
    "name": "Juan López",
    "email": "juan@example.com",
    "city": "Madrid",
    "age": 34
  },
  {
    "username": "ana_martinez",
    "name": "Ana Martínez",
    "email": "ana@example.com",
    "city": "Barcelona",
    "age": 31
  }
]
```
4. Haz clic en **Ejecutar Operación**
5. Deberías recibir un resultado con la confirmación de que se crearon 3 documentos

## 2. Consultar documentos (query)

1. **Colección**: Escribe `users`
2. **Operación**: Selecciona `Consultar (filtros/…)`
3. **Filtro**: Para obtener solo usuarios de Barcelona:
```json
{"city": "Barcelona"}
```
4. **Proyección**: Para mostrar solo algunos campos:
```json
{"name": 1, "email": 1, "city": 1}
```
5. **Orden (sort)**: Para ordenar por nombre:
```json
{"name": 1}
```
6. **Skip**: Deja en blanco o pon `0`
7. **Limit**: Ingresa `10`
8. Haz clic en **Ejecutar Operación**
9. Deberías obtener los usuarios de Barcelona con solo los campos especificados

## 3. Actualizar documentos

### Opción 1: Actualizar 1 documento (updateOne)

1. **Colección**: Escribe `users`
2. **Operación**: Selecciona `Actualizar 1 documento`
3. **ID del doc**: Ingresa el ID de uno de los usuarios que obtuviste en la consulta anterior
4. **Patch (JSON)**:
```json
{
  "age": 29,
  "lastLogin": "2025-05-08"
}
```
5. Haz clic en **Ejecutar Operación**
6. Deberías ver la confirmación de que el documento fue actualizado

### Opción 2: Actualizar varios documentos (updateMany)

1. **Colección**: Escribe `users`
2. **Operación**: Selecciona `Actualizar varios documentos`
3. **Filtro**:
```json
{"city": "Barcelona"}
```
4. **Patch (JSON)**:
```json
{
  "country": "España",
  "updatedAt": "2025-05-08"
}
```
5. Haz clic en **Ejecutar Operación**
6. Deberías ver la confirmación de cuántos documentos fueron actualizados

## 4. Eliminar documentos

### Opción 1: Eliminar 1 documento (deleteOne)

1. **Colección**: Escribe `users`
2. **Operación**: Selecciona `Eliminar 1 documento`
3. **ID del doc**: Ingresa el ID de uno de los usuarios
4. Haz clic en **Ejecutar Operación**
5. Deberías ver la confirmación de que el documento fue eliminado

### Opción 2: Eliminar varios documentos (deleteMany)

1. **Colección**: Escribe `users`
2. **Operación**: Selecciona `Eliminar varios documentos`
3. **Filtro**: Para eliminar usuarios de Madrid:
```json
{"city": "Madrid"}
```
4. Haz clic en **Ejecutar Operación**
5. Deberías ver la confirmación de cuántos documentos fueron eliminados

# Pruebas para StatsManager

Ahora vamos a probar las funcionalidades del StatsManager.

## 1. Consultas Estadísticas

Prueba cada uno de los botones de la sección "Consultas Estadísticas":

### Contar Órdenes
1. Haz clic en el botón **Contar Órdenes**
2. Deberías ver el número total de órdenes en la base de datos

### Ciudades de Restaurantes
1. Haz clic en el botón **Ciudades de Restaurantes**
2. Deberías ver una lista de ciudades únicas donde hay restaurantes

### Top 5 Restaurantes
1. Haz clic en el botón **Top 5 Restaurantes**
2. Deberías ver una lista de los 5 restaurantes mejor valorados

### Platos Más Vendidos
1. Haz clic en el botón **Platos Más Vendidos**
2. Deberías ver un ranking de los platos más populares

## 2. Operaciones con Menú de Restaurante

Vamos a utilizar el ID del restaurante que creamos anteriormente:

### Añadir Platillo
1. **ID de Restaurante**: Ingresa el ID del restaurante "La Parrilla Argentina" que creamos
2. **Añadir Platillo**: Ingresa el siguiente JSON:
```json
{
  "name": "Provoleta",
  "price": 12.50,
  "description": "Queso provolone a la parrilla con orégano y aceite de oliva"
}
```
3. Haz clic en el botón **$push(menu)**
4. Deberías ver la confirmación de que el platillo fue añadido

### Añadir Tag (sin duplicados)
1. **ID de Restaurante**: Mantén el mismo ID
2. **Tag**: Escribe `vegetariano`
3. Haz clic en el botón **$addToSet(tags)**
4. Deberías ver la confirmación de que el tag fue añadido

### Filtrar por Precio Mínimo
1. **ID de Restaurante**: Mantén el mismo ID
2. **Precio Mínimo**: Ingresa `15`
3. Haz clic en el botón **Pipeline Embebido**
4. Deberías ver los platos que cuestan 15 o más

### Actualizar Precio de Item
1. **ID de Restaurante**: Mantén el mismo ID
2. **ID del Platillo**: Ingresa el ID del platillo "Bife de Chorizo" (deberás obtenerlo de una consulta previa)
3. **Nuevo Precio**: Ingresa `24.90`
4. Haz clic en el botón **$set(menu.$.price)**
5. Deberías ver la confirmación de que el precio fue actualizado

### Eliminar Platillo
1. **ID de Restaurante**: Mantén el mismo ID
2. **ID del Platillo**: Ingresa el ID del platillo "Empanadas"
3. Haz clic en el botón **$pull(menu)**
4. Deberías ver la confirmación de que el platillo fue eliminado

## Verificación final

Para verificar que todo funciona correctamente, realiza una consulta final:

1. Vuelve al CrudManager
2. **Colección**: Escribe `restaurants`
3. **Operación**: Selecciona `Consultar (filtros/…)`
4. **Filtro**: 
```json
{"name": "La Parrilla Argentina"}
```
5. Haz clic en **Ejecutar Operación**
6. Deberías ver el restaurante con todos los cambios aplicados:
   - El nuevo platillo "Provoleta" añadido
   - El tag "vegetariano" añadido
   - El precio actualizado del "Bife de Chorizo"
   - El platillo "Empanadas" eliminado (si realizaste esta operación)

¿Quieres que profundice en alguna operación específica o necesitas ayuda con algún problema que hayas encontrado durante las pruebas?
