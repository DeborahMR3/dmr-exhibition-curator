// src/api/harvardApi.js
// --- API do Harvard Art Museums (requer apikey via VITE_)

const HARVARD_BASE = "https://api.harvardartmuseums.org";
const HARVARD_KEY = import.meta.env.VITE_HARVARD_API_KEY;

// helper: converte /ids/view/{id} -> /ids/iiif/{id}/full/843,/0/default.jpg
function normalizeHarvardImageUrl(url) {
  if (!url) return "";
  try {
    // já é IIIF: só garante tamanho "843,"
    if (url.includes("/ids/iiif/")) {
      return url.replace("/full/full/0/default.jpg", "/full/843,/0/default.jpg");
    }

    // caso comum: .../ids/view/{id}[?...]
    if (url.includes("/ids/view/")) {
      const parts = url.split("/ids/view/");
      const tail = parts[1] || "";
      const id = tail.split("?")[0]; // remove query
      if (id) {
        return `https://ids.lib.harvard.edu/ids/iiif/${id}/full/843,/0/default.jpg`;
      }
    }
  } catch (_) {
    // fica quieto e retorna original
  }
  return url;
}

// mapeia 1 record da API para o formato usado no app (lista / grid)
function mapRecordToItem(record) {
  // prioriza baseimageurl (jpg direto). Se não tiver, cai para primaryimageurl (converte p/ IIIF).
  const imgSmall =
    record.baseimageurl ||
    normalizeHarvardImageUrl(record.primaryimageurl) ||
    "";

  return {
    id: record.id,
    title: record.title || "Untitled",
    // OBS: para a lista queremos só exibir o nome (você trata isso na Home)
    artistDisplayName:
      (Array.isArray(record.people) && record.people.length > 0
        ? record.people[0].name
        : "") || "Unknown artist",
    primaryImageSmall: imgSmall,
    primaryImage: imgSmall, // mantém a mesma p/ não faltar no detalhe
    museum: "Harvard Art Museum",
    // mantém o objeto “people” original para você extrair nome também
    people: record.people || [],
    // mantemos também campo “objectURL” se quiser linkar depois
    objectURL: record.url || "",
  };
}

// mapeia 1 record para a página de DETALHE
function mapRecordToDetail(record) {
  const img =
    record.baseimageurl ||
    normalizeHarvardImageUrl(record.primaryimageurl) ||
    "";

  return {
    id: record.id,
    title: record.title || "Untitled",
    artistDisplayName:
      (Array.isArray(record.people) && record.people.length > 0
        ? record.people[0].name
        : "") || "Unknown artist",
    primaryImageSmall: img,
    primaryImage: img,
    date: record.dated || "",
    medium: record.medium || "",
    department: record.department || "",
    objectURL: record.url || "",
    museum: "Harvard Art Museum",
    people: record.people || [],
  };
}

// --- busca por termo (lista) ---
export async function searchHarvardObjects(term) {
  const url = `${HARVARD_BASE}/object?apikey=${HARVARD_KEY}&q=${encodeURIComponent(
    term
  )}&size=24`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Harvard search failed");

  const data = await res.json();
  const records = Array.isArray(data.records) ? data.records : [];

  // filtra só itens com alguma imagem (baseimageurl ou primaryimageurl)
  const artworks = records
    .filter((r) => r.baseimageurl || r.primaryimageurl)
    .map(mapRecordToItem);

  return artworks;
}

// --- busca detalhe por id ---
export async function getHarvardObject(id) {
  const url = `${HARVARD_BASE}/object/${id}?apikey=${HARVARD_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Harvard object fetch failed");

  const data = await res.json();
  return mapRecordToDetail(data);
}
