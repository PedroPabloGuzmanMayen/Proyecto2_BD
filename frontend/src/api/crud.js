const BASE = import.meta.env.VITE_API_URL;

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  return res.json();
}

export const createOne = (collection, doc) =>
  request(`${collection}`, { method: 'POST', body: JSON.stringify(doc) });

export const createMany = (collection, docs) =>
  request(`${collection}/bulk`, { method: 'POST', body: JSON.stringify(docs) });

export const query = (collection, { filter, projection, sort, skip, limit }) => {
  const qp = new URLSearchParams();
  if (filter)     qp.append('filter',     JSON.stringify(filter));
  if (projection) qp.append('projection', JSON.stringify(projection));
  if (sort)       qp.append('sort',       JSON.stringify(sort));
  if (skip != null)  qp.append('skip',  skip);
  if (limit != null) qp.append('limit', limit);
  return request(`${collection}?${qp.toString()}`);
};

export const updateOne = (collection, id, patch) =>
  request(`${collection}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });

export const updateMany = (collection, filter, patch) =>
  request(`${collection}`, { method: 'PATCH', body: JSON.stringify({ filter, patch }) });

export const deleteOne = (collection, id) =>
  request(`${collection}/${id}`, { method: 'DELETE' });

export const deleteMany = (collection, filter) =>
  request(`${collection}`, { method: 'DELETE', body: JSON.stringify({ filter }) });

export const countOrders = () =>
  request(`stats/orders/count`);

export const distinctRestaurantCities = () =>
  request(`stats/restaurants/cities`);

export const topRatedRestaurants = () =>
  request(`stats/restaurants/top-rated`);

export const topDishes = () =>
  request(`stats/orders/top-dishes`);

export const addMenuItem = (restaurantId, item) =>
  request(`restaurants/${restaurantId}/menu/add`, {
    method: 'POST',
    body: JSON.stringify(item)
  });

export const removeMenuItem = (restaurantId, itemId) =>
  request(`restaurants/${restaurantId}/menu/remove/${itemId}`, {
    method: 'DELETE'
  });

export const addTag = (restaurantId, tag) =>
  request(`restaurants/${restaurantId}/tags`, {
    method: 'PATCH',
    body: JSON.stringify({ tag })
  });

export const getExpensiveDishes = (restaurantId, minPrice) =>
  request(`reports/restaurants/${restaurantId}/expensive-dishes?minPrice=${minPrice}`);

export const updateMenuItemPrice = (restaurantId, itemId, newPrice) =>
  request(`restaurants/${restaurantId}/menu/${itemId}/price`, {
    method: 'PATCH',
    body: JSON.stringify({ newPrice })
  });
