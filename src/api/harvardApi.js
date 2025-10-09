// src/api/harvardApi.js
// API do Harvard Art Museums (HAM)

// Base oficial + chave (configure no Netlify: VITE_HARVARD_API_KEY)
const HARVARD_BASE = "https://api.harvardartmuseums.org";
const HARVARD_KEY = import.meta.env.VITE_HARVARD_API_KEY;

/**
 * Converte URLs do Harvard que apontam para o *viewer* (ids/view/:id)
 * para uma URL IIIF que é carregável em <img>.
 * Ex: view/17826080 -> iiif/17826080/full/600,/0/default.jpg
 */
function toIiif(url, width = 600) {
  if (!url) return "";
  // pega o número do ID se vier view/xxxx ou iiif/xxxx
  const m = url.match(/ids\.lib\.harvard\.edu\/ids\/(?:view|iiif)\/(\d+)/i);
  if (m) {
    const id = m[1];
    return `https://ids.lib.harvard.edu/ids/iiif/${id}/full/${width},/0/default.jpg`;
  }
  // se já for jpg direto ou outra origem, devolve como está
  return url;
}

/**
 * Busca objetos por termo
 * Nota: hasimage=1 já filtra resultados com imagem no acervo.
 */
export async function searchHarvardObjects(term) {
  const url = `${HARVARD_BASE}/object?apikey=${HARVARD_KEY}&q=${encodeURIComponent(
    term
  )}&size=20&hasimage=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Harvard search failed");
  const data = await res.json();

  const records = data.records || [];

  // Mapeia para o formato que o app espera
  const artworks = records
    .map((record) => {
      // tenta primaryimageurl, senão baseimageurl; normaliza pra IIIF
      const rawImg =
        record.primaryimageurl || record.baseimageurl || (record.images?.[0]?.baseimageurl ?? "");
      const imgSmall = toIiif(rawImg, 400);

      return {
        id: record.id,
        objectID: record.id, // para consistência com Met
        title: record.title || "Untitled",
        // exibe primeiro artista se existir
        artistDisplayName:
          (record.people && record.people.length > 0 && record.people[0].name) ||
          "Unknown artist",
        primaryImageSmall: imgSmall,
        // guardo também original caso útil em outro lugar
        primaryimageurl: record.primaryimageurl || "",
        baseimageurl: record.baseimageurl || "",
        museum: "Harvard Art Museum",
        people: record.people || [],
      };
    })
    // apenas itens com imagem calculada
    .filter((a) => !!a.primaryImageSmall);

  return artworks;
}

/**
 * Busca detalhes de um objeto específico
 */
export async function getHarvardObject(id) {
  const url = `${HARVARD_BASE}/object/${id}?apikey=${HARVARD_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Harvard object fetch failed");
  const data = await res.json();

  const record = data.records?.[0] || data;

  const rawImg =
    record.primaryimageurl || record.baseimageurl || (record.images?.[0]?.baseimageurl ?? "");

  return {
    id: record.id,
    objectID: record.id,
    title: record.title || "Untitled",
    artistDisplayName:
      (record.people && record.people.length > 0 && record.people[0].name) ||
      "Unknown artist",
    // imagem grande para página de detalhes (1200px)
    primaryImage: toIiif(rawImg, 1200),
    // thumb (400px) – caso você queira usar em outro lugar
    primaryImageSmall: toIiif(rawImg, 400),
    medium: record.medium || "",
    department: record.department || "",
    objectDate: record.dated || "",
    objectURL: record.url || "", // link do acervo
    museum: "Harvard Art Museum",
    people: record.people || [],
  };
}
