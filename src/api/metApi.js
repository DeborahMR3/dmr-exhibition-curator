// base aponta pro proxy do vite pra não dar cors (antes era a url completa do met)
const BASE = "/met";

// busca ids de objetos por termo
export function searchMetObjects(term) {
  return fetch(`${BASE}/search?q=${encodeURIComponent(term)}&hasImages=true`)
    .then(function (res) {
      if (!res.ok) {
        return Promise.reject({
          status: res.status,
          msg: "failed to fetch object ids",
        });
      }
      return res.json();
    });
}

// busca detalhes de um objeto específico pelo id
export function getObject(id) {
  return fetch(`${BASE}/objects/${id}`)
    .then(function (res) {
      if (!res.ok) {
        return Promise.reject({
          status: res.status,
          msg: "failed to fetch object details",
        });
      }
      return res.json();
    });
}
