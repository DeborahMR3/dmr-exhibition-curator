// base aponta para a URL completa do Met (em produção o proxy do Vite não é usado)
const BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

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
