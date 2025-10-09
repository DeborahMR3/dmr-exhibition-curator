import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ⟵ import do Link
import { searchMetObjects, getObject } from "../api/metApi.js";
import { searchAICObjects } from "../api/aicApi.js";
import { searchHarvardObjects } from "../api/harvardApi.js";
import "../styling/Home.css"; // importa o css da página

// atalho da minha coleção (contador e ações)
import { useExhibition } from "../context/ExhibitionContext.jsx";

// limites simples para manter estável
const PAGE_SIZE = 100; // total exibido
const MET_COUNT = 1;   // quantos detalhes do met eu busco por vez

export default function Home() {
  // estados do componente
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // campo de busca começa vazio
  const [searchTerm, setSearchTerm] = useState("");
  const initialSearchTerm = "painting"; // termo padrão usado só no carregamento inicial

  // lista de artistas encontrados
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState("");

  // pego do contexto: contador e as ações da minha coleção
  const { count, addItem, removeItem, isSelected } = useExhibition();

  // função reutilizável para buscar dados
  async function fetchArtworks(termToSearch) {
    setLoading(true);
    setError("");
    setItems([]);

    try {
      const [metData, aicObjects, harvardObjects] = await Promise.all([
        searchMetObjects(termToSearch),
        searchAICObjects(termToSearch),
        searchHarvardObjects(termToSearch),
      ]);

      const metIDs = (metData?.objectIDs || []).slice(0, MET_COUNT);

      const metResults = [];
      for (let i = 0; i < metIDs.length; i++) {
        try {
          const detail = await getObject(metIDs[i]);
          if (detail && detail.primaryImageSmall) {
            metResults.push({ ...detail, museum: "The Met" });
          }
        } catch (error) {
          // ignora erro e continua
        }
      }

      const allResults = [...metResults, ...aicObjects, ...harvardObjects];

      // artistas únicos
      const uniqueArtists = Array.from(
        new Set(allResults.map((item) => item.artistDisplayName).filter(Boolean))
      );
      setArtists(uniqueArtists);

      const combined = allResults.slice(0, PAGE_SIZE);
      setItems(combined);

      if (allResults.length === 0) {
        setError("No results found.");
      }
    } catch (err) {
      console.error(err);
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  // busca inicial automática (usa termo padrão invisível)
  useEffect(() => {
    fetchArtworks(initialSearchTerm);
  }, []);

  // busca sempre que o termo mudar manualmente
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      fetchArtworks(searchTerm);
    }
  }, [searchTerm]);

  return (
    <section className="home-page">
      <h2>Artworks from The Met, AIC and Harvard</h2>

      {/* contador simples da minha exposição */}
      <p className="counter" aria-live="polite">
        my exhibition: {count} item(s)
      </p>

      {loading && <p className="loading">loading...</p>}
      {error && <p className="error">{error}</p>}

      {/* formulário de busca */}
      <form
        className="search-form"
        onSubmit={function (event) {
          event.preventDefault(); // impede recarregar a página
          if (searchTerm.trim() === "") {
            fetchArtworks(initialSearchTerm);
          } else {
            fetchArtworks(searchTerm);
          }
        }}
      >
        <input
          type="text"
          placeholder="search artworks..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <button type="submit">search</button>
      </form>

      {/* dropdown de artistas */}
      <div className="artist-filter">
        <label htmlFor="artistSelect">Filter by Artist</label>
        <select
          id="artistSelect"
          value={selectedArtist}
          onChange={(e) => setSelectedArtist(e.target.value)}
        >
          <option value="">All</option>
          {artists.map((artist) => (
            <option key={artist} value={artist}>
              {artist}
            </option>
          ))}
        </select>
      </div>

      {/* grade de obras */}
      <div className="artworks-grid">
        {items.map((object) => {
          return (
            <article key={object.objectID || object.id} className="art-card">
              {/* 🔗 LINK — leva à página de detalhes da obra */}
              <Link
                to={`/artwork/${
                  object.museum.toLowerCase().includes("met")
                    ? "met"
                    : object.museum.toLowerCase().includes("chicago")
                    ? "aic"
                    : "harvard"
                }/${object.objectID || object.id}`}
              >
                {/* imagem segura para todos os museus */}
                <img
                  src={
                    object.primaryImageSmall || // The Met
                    object.imageUrl ||          // AIC
                    object.primaryimageurl ||   // Harvard
                    object.primaryImage ||      // fallback genérico
                    "/placeholder.jpg"          // caso nenhuma imagem exista
                  }
                  alt={object.title || "Artwork image"}
                  loading="lazy"
                />
              </Link>

              <h3>{object.title || "untitled"}</h3>
              <p>{object.artistDisplayName || "unknown artist"}</p>
              <p className="museum">{object.museum}</p>

              <div className="actions">
                {isSelected(object) ? (
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(object)}
                    aria-label="remove from my exhibition"
                  >
                    remove
                  </button>
                ) : (
                  <button
                    className="add-btn"
                    onClick={() => addItem(object)}
                    aria-label="add to my exhibition"
                  >
                    add
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
