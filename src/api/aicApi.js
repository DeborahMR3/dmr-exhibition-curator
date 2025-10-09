// define a URL completa da API do Art Institute of Chicago
const BASE_URL = "https://api.artic.edu/api/v1/artworks";

// busca lista de obras por termo
export function searchAICObjects(term) {
  // limit = apenas 12 resultados
  const url = `${BASE_URL}/search?q=${encodeURIComponent(term)}&limit=12`;

  return fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("AIC API request failed");
      }
      return response.json();
    })
    .then(function (aicResponse) {
      // resposta vem em aicResponse.data (array de objetos)
      if (!aicResponse.data) return [];

      // mapeia os resultados
      return aicResponse.data.map(function (artwork) {
        const imageUrl = artwork.image_id
          ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
          : null;

        return {
          id: artwork.id,
          title: artwork.title,
          artistDisplayName: artwork.artist_title || "Unknown artist",
          primaryImageSmall: imageUrl,
          museum: "Art Institute of Chicago",
        };
      });
    })
    .catch(function (error) {
      console.error("Erro na AIC API:", error);
      return [];
    });
}

// busca detalhes de uma obra específica pelo id
export async function getAICObject(id) {
  const url = `${BASE_URL}/${id}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("AIC object request failed");
    const data = await response.json();
    const artwork = data.data;

    return {
      id: artwork.id,
      title: artwork.title || "Untitled",
      artistDisplayName: artwork.artist_title || "Unknown artist",
      primaryImageSmall: artwork.image_id
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
        : "",
      primaryImage: artwork.image_id
        ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
        : "",
      objectDate: artwork.date_display || "",
      medium: artwork.medium_display || "",
      department: artwork.department_title || "",
      objectURL: `https://www.artic.edu/artworks/${artwork.id}`,
      museum: "Art Institute of Chicago",
    };
  } catch (error) {
    console.error("Erro ao buscar obra específica da AIC:", error);
    return null;
  }
}
