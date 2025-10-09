// src/api/aicApi.js
// busca na API do Art Institute of Chicago (AIC)
const AIC_BASE = "/aic";

export async function searchAICObjects(term) {
  const url = `${AIC_BASE}/search?q=${encodeURIComponent(term)}&limit=20`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("AIC search failed");
  const data = await response.json();

  // filtra apenas obras com imagem
  const artworks = (data.data || [])
    .filter((artwork) => artwork.image_id) // só com imagem
    .map((artwork) => ({
      id: artwork.id,
      title: artwork.title || "Untitled",
      artistDisplayName: artwork.artist_title || "Unknown artist",
      primaryImageSmall: `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`,
      museum: "Art Institute of Chicago",
    }));

  return artworks;
}

export async function getAICObject(id) {
  const url = `${AIC_BASE}/objects/${id}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("AIC detail fetch failed");
  const data = await response.json();
  const artwork = data.data;

  return {
    id: artwork.id,
    title: artwork.title || "Untitled",
    artistDisplayName: artwork.artist_title || "Unknown artist",
    primaryImage: `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`,
    medium: artwork.medium_display || "",
    date: artwork.date_display || "",
    department: artwork.department_title || "",
    museum: "Art Institute of Chicago",
  };
}
