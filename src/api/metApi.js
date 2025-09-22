const BASE = "https://collectionapi.metmuseum.org/public/collection/v1";

// busca IDs de objetos por termo
export function searchObjects(term) {
  return fetch(`${BASE}/search?q=${encodeURIComponent(term)}&hasImages=true`)
    .then((res) => {
      if (!res.ok) {
        return Promise.reject({
          status: res.status,
          msg: "Failed to fetch object IDs",
        });
      }
      return res.json();
    });
}

// busca detalhes de um objeto específico
export function getObject(id) {
  return fetch(`${BASE}/objects/${id}`)
    .then((res) => {
      if (!res.ok) {
        return Promise.reject({
          status: res.status,
          msg: "Failed to fetch object details",
        });
      }
      return res.json();
    });
}
