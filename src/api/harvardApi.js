// uso o proxy /harvard e pego a key do .env (precisa começar com VITE_)
const BASE = '/harvard';
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

// busca detalhes de uma obra específica pelo id
export async function getHarvardObject(id) {
  const url = `${BASE}/object/${id}?apikey=${KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Harvard object request failed");
    const data = await response.json();
    const record = data.record;

    if (!record) return null;

    const artist =
      Array.isArray(record.people) && record.people.length > 0
        ? record.people[0].name
        : "unknown artist";

    return {
      id: record.id,
      title: record.title || "untitled",
      artistDisplayName: artist,
      primaryImageSmall: record.primaryimageurl || "",
      primaryImage: record.primaryimageurl || "",
      objectDate: record.dated || "",
      medium: record.medium || "",
      department: record.department || "",
      objectURL: record.url || "",
      museum: "Harvard Art Museums",
    };
  } catch (error) {
    console.error("Erro ao buscar obra específica da Harvard:", error);
    return null;
  }
}
