import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // ⟵ link de navegação entre páginas
import { searchMetObjects, getObject } from "../api/metApi.js";
import { searchAICObjects } from "../api/aicApi.js";
import { searchHarvardObjects } from "../api/harvardApi.js";
import "../styling/Home.css"; // importa o css da página

// contexto da exposição (contador + adicionar/remover obras)
import { useExhibition } from "../context/ExhibitionContext.jsx";

// limites simples para manter estável
const PAGE_SIZE = 100; // número máximo de obras mostradas
const MET_COUNT = 1; // quantos detalhes do Met buscar por vez

export default function Home() {
  // estados do componente
  const [items, setItems] = useState([]); // lista de obras exibidas
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // campo de busca
  const [searchTerm, setSearchTerm] = useState("");
  const initialSearchTerm = "painting"; // termo inicial carregado automaticamente

  // lista de artistas para o filtro
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState("");

  // contexto da exposição
  const { count, addItem, removeItem, isSelected } = useExhibition();

  // função principal que busca as obras
  async function fetchArtworks(termToSearch) {
    setLoading(true);
    setError("");
    setItems([]);

    try {
      // busca paralela nas três APIs
      const [metData, aicObjects, harvardObjects] = await Promise.all([
        searchMetObjects(termToSearch),
        searchAICObjects(termToSearch),
        searchHarvardObjects(termToSearch),
      ]);

      // busca detalhes do Met
      const metIDs = (metData?.objectIDs || []).slice(0, MET_COUNT);
      const metResults = [];
      for (let i = 0; i < metIDs.length; i++) {
        try {
          const detail = await getObject(metIDs[i]);
          // só entra se tiver imagem
          if (detail && (detail.primaryImageSmall || detail.primaryImage)) {
            metResults.push({ ...detail, museum: "The Met" });
          }
        } catch {
          // ignora erro e continua
        }
      }

      // combina e mantém apenas itens com alguma imagem válida
      const allResults = [...metResults, ...aicObjects, ...harvardObjects].filter((o) => {
        return (
          o.primaryImageSmall ||
          o.primaryImage ||
          o.imageUrl || // AIC às vezes mapeia como imageUrl em alguns exemplos antigos
          o.primaryimageurl ||
          o.baseimageurl
        );
      });

      // ✅ extrai nomes corretos de artistas de cada API
      const allArtists = allResults
        .map((item) => {
          if (item.artistDisplayName) return item.artistDisplayName; // Met / Harvard (normalizado)
          if (item.artist_title) return item.artist_title; // AIC (se você ainda usar esse campo no mapeamento antigo)
          if (item.people && item.people.length > 0) return item.people[0].name; // fallback Harvard bruto
          return "Unknown artist";
        })
        .filter(Boolean);

      // remove duplicados e define lista final
      const uniqueArtists = Array.from(new Set(allArtists));
      setArtists(uniqueArtists);

      // mantém só até o limite
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

  // busca inicial automática (quando a página carrega)
  useEffect(() => {
    fetchArtworks(initialSearchTerm);
  }, []);

  // busca sempre que o termo mudar manualmente
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      fetchArtworks(searchTerm);
    }
  }, [searchTerm]);

  // aplica filtro de artista antes de renderizar
  const filteredItems = selectedArtist
    ? items.filter((item) => {
        const artist =
          item.artistDisplayName ||
          item.artist_title ||
          (item.people && item.people[0]?.name) ||
          "Unknown artist";
        return artist === selectedArtist;
      })
    : items;

  return (
    <section className="home-page">
      <h2>Artworks from The Met, AIC and Harvard</h2>

      {/* contador simples da exposição */}
      <p className="counter" aria-live="polite">
        my exhibition: {count} item(s)
      </p>

      {loading && <p className="loading">loading...</p>}
      {error && <p className="error">{error}</p>}

      {/* formulário de busca */}
      <form
        className="search-form"
        onSubmit={(event) => {
          event.preventDefault(); // impede reload
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

      {/* filtro por artista */}
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
        {filteredItems.map((object) => {
          // nome do artista dinâmico para exibição
          const artistName =
            object.artistDisplayName ||
            object.artist_title ||
            (object.people && object.people[0]?.name) ||
            "Unknown artist";

          // escolhe imagem certa de acordo com o museu
          const imgSrc =
            object.primaryImageSmall || // Met e Harvard (normalizado)
            object.primaryImage || // Met/Harvard (detalhe grande se small não veio)
            object.imageUrl || // AIC (caso seu mapeamento antigo use esse nome)
            object.primaryimageurl || // Harvard bruto
            object.baseimageurl || // Harvard bruto
            ""; // sem placeholder, se não tiver imagem, não mostra <img>

          // rota por museu
          const museumSlug = object.museum.toLowerCase().includes("met")
            ? "met"
            : object.museum.toLowerCase().includes("chicago")
            ? "aic"
            : "harvard";

          return (
            <article key={object.objectID || object.id} className="art-card">
              {/* 🔗 Link para detalhes */}
              <Link to={`/artwork/${museumSlug}/${object.objectID || object.id}`}>
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={object.title || "Artwork image"}
                    loading="lazy"
                  />
                )}
              </Link>

              <h3>{object.title || "Untitled"}</h3>
              <p>{artistName}</p>
              <p className="museum">{object.museum}</p>

              {/* botões de adicionar/remover */}
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
