// src/api/harvardApi.js
const HARVARD_BASE = "https://api.harvardartmuseums.org";
const HARVARD_KEY = import.meta.env.VITE_HARVARD_API_KEY;

// Busca obras
export async function searchHarvardObjects(term) {
  const url = `${HARVARD_BASE}/object?apikey=${HARVARD_KEY}&q=${encodeURIComponent(
    term
  )}&size=20`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Harvard search failed");

  const data = await response.json();
  const records = data.records || [];

  return records
    .filter((r) => r.primaryimageurl || r.baseimageurl)
    .map((record) => ({
      id: record.id,
      title: record.title || "Untitled",
      artistDisplayName:
        record.people && record.people.length > 0
          ? record.people[0].name
          : "Unknown artist",
      primaryImageSmall:
        record.primaryimageurl || record.baseimageurl,
      museum: "Harvard Art Museum",
    }));
}

// Busca detalhes de uma obra específica
export async function getHarvardObject(id) {
  const url = `${HARVARD_BASE}/object/${id}?apikey=${HARVARD_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Harvard object fetch failed");

  const data = await response.json();
  const record = data.records?.[0];

  return {
    id: record.id,
    title: record.title || "Untitled",
    artistDisplayName:
      record.people && record.people.length > 0
        ? record.people[0].name
        : "Unknown artist",
    primaryImage: record.primaryimageurl || record.baseimageurl,
    medium: record.medium || "",
    date: record.dated || "",
    department: record.department || "",
    museum: "Harvard Art Museum",
  };
}
