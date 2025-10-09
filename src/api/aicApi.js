// src/api/aicApi.js

const AIC_BASE = "https://api.artic.edu/api/v1";

// busca obras por termo
export async function searchAICObjects(term) {
  const url = `${AIC_BASE}/artworks/search?q=${encodeURIComponent(
    term
  )}&limit=20&fields=id,title,artist_display,image_id`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("AIC search failed");

  const data = await response.json();
  const artworks = data.data || [];

  return artworks
    .filter((art) => art.image_id)
    .map((art) => ({
      id: art.id,
      title: art.title || "Untitled",
      artistDisplayName: art.artist_display || "Unknown artist",
      primaryImageSmall: `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`,
      museum: "Art Institute of Chicago",
    }));
}

export async function getAICObject(id) {
  const url = `${AIC_BASE}/artworks/${id}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("AIC object fetch failed");

  const data = await response.json();
  const art = data.data;

  return {
    id: art.id,
    title: art.title || "Untitled",
    artistDisplayName: art.artist_display || "Unknown artist",
    primaryImage: art.image_id
      ? `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`
      : null,
    medium: art.medium_display || "",
    date: art.date_display || "",
    department: art.department_title || "",
    museum: "Art Institute of Chicago",
  };
}
