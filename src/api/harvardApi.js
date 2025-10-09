// uso a URL completa da API do Harvard e pego a key do .env (precisa começar com VITE_)
const BASE = 'https://api.harvardartmuseums.org';
const KEY = import.meta.env.VITE_HARVARD_API_KEY;

// busca objetos no harvard com imagem, limitado pra não exagerar
export function searchHarvardObjects(term) {
  const url = `${BASE}/object?apikey=${KEY}&hasimage=1&size=6&q=${encodeURIComponent(term)}`;

  return fetch(url)
    .then(function (res) {
      if (!res.ok) {
        return Promise.reject({ status: res.status, msg: 'harvard api request failed' });
      }
      return res.json();
    })
    .then(function (data) {
      const records = data.records || [];

      // padronizo o objeto pra bater com o que o grid espera
      return records.map(function (record) {
        const artist =
          Array.isArray(record.people) && record.people.length > 0
            ? record.people[0].name
            : 'unknown artist';

        return {
          id: record.id,
          title: record.title || 'untitled',
          artistDisplayName: artist,
          primaryImageSmall: record.primaryimageurl || '',
          museum: 'Harvard Art Museums',
        };
      });
    })
    .catch(function () {
      // se der erro aqui eu só retorno vazio pra não quebrar a página
      return [];
    });
}
