const BASE_URL = "https://api.artic.edu/api/v1/artworks";

export function searchAICObjects(term) {
  // limit= apenas 10 resultados
  // fields=  especifica os campos que quero
  const url = `${BASE_URL}/search?q=${term}&fields=id,title,artist_title,image_id&limit=10`;

  return fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("AIC API request failed");
      }
      return response.json();
    })
    .then(function (aicResponse) {
      //resposta vem em aicResponse.data (array de objetos)
      if (!aicResponse.data) return [];

      // Mapeia os resultados
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
          link: `https://www.artic.edu/artworks/${artwork.id}`,
        };
      });
    })
    .catch(function (error) {
      console.error("Erro na AIC API:", error);
      return [];
    });
}
