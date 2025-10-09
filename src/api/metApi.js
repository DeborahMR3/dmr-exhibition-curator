// base aponta pro proxy do vite pra não dar cors (antes era a url completa do met)
const BASE = "/met";

// busca ids de objetos por termo
export async function searchMetObjects(term) {
  try {
    const res = await fetch(`${BASE}/search?q=${encodeURIComponent(term)}&hasImages=true`);
    if (!res.ok) {
      throw new Error("failed to fetch object ids");
    }

    const data = await res.json();
    if (!data.objectIDs || data.objectIDs.length === 0) return [];

    // limita a 10 resultados para não sobrecarregar
    const limitedIDs = data.objectIDs.slice(0, 10);

    // busca detalhes de cada objeto
    const objects = await Promise.all(
      limitedIDs.map(async (id) => {
        const objRes = await fetch(`${BASE}/objects/${id}`);
        if (!objRes.ok) return null;
        const obj = await objRes.json();
        return {
          id: obj.objectID,
          title: obj.title || "Untitled",
          artistDisplayName: obj.artistDisplayName || "Unknown artist",
          primaryImageSmall: obj.primaryImageSmall || "",
          museum: "The Met",
          link: obj.objectURL || "",
        };
      })
    );

    // remove resultados nulos
    return objects.filter((o) => o !== null);
  } catch (error) {
    console.error("Erro na Met API:", error);
    return [];
  }
}
