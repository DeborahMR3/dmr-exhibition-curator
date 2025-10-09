import { useState, useEffect } from "react";
import { searchMetObjects, getObject } from "../api/metApi.js";
import { searchAICObjects } from "../api/aicApi.js";
import { searchHarvardObjects } from "../api/harvardApi.js";
import "../styling/Home.css"; // importa o css da página

// atalho da minha coleção (contador e ações)
import { useExhibition } from "../context/ExhibitionContext.jsx";

// limites simples para manter estável
const PAGE_SIZE = 50; // total exibido
const MET_COUNT = 1;  // quantos detalhes do met eu busco por vez

export default function Home() {
  // estados do componente
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // termo inicial de busca
  const [searchTerm, setSearchTerm] = useState("portrait");

  // pego do contexto: contador e as ações da minha coleção
  const { count, addItem, removeItem, isSelected } = useExhibition();

  useEffect(function () {
    setLoading(true);
    setError("");
    setItems([]);

    // faço as três buscas em paralelo: met (ids), aic (dados completos), harvard (dados completos)
    Promise.all([
      searchMetObjects(searchTerm),
      searchAICObjects(searchTerm),
      searchHarvardObjects(searchTerm),
    ])
      .then(async function ([metData, aicObjects, harvardObjects]) {
        // preparo os ids do met (por enquanto deixo 1 pra estabilidade)
        const metIDs = (metData && metData.objectIDs ? metData.objectIDs : []).slice(0, MET_COUNT);

        // tento buscar os detalhes do met, mas sem deixar o app quebrar
        const metResults = [];
        for (let i = 0; i < metIDs.length; i++) {
          try {
            const detail = await getObject(metIDs[i]);
            if (detail && detail.primaryImageSmall) {
              metResults.push({ ...detail, museum: "The Met" });
            }
          } catch (error) {
            // se o met der 502/403 aqui, eu simplesmente sigo em frente e uso aic + harvard
          }
        }

        // combino tudo e corto pelo tamanho da página
        const combined = [...metResults, ...aicObjects, ...harvardObjects].slice(0, PAGE_SIZE);

        // se tiver pelo menos 1 item de qualquer museu, não mostro erro
        if (combined.length === 0) {
          setError("No results found.");
        } else {
          setError("");
        }

        setItems(combined);
      })
      .catch(function (error) {
        // só cai aqui se as 3 buscas iniciais falharem ao mesmo tempo (bem raro)
        console.error(error);
        setError("Request failed.");
      })
      .finally(function () {
        setLoading(false);
      });
  }, [searchTerm]); // roda toda vez que o termo muda

  return (
    <section className="home-page">
      <h2>Artworks from The Met and the Art Institute of Chicago</h2>

      {/* contador simples da minha exposição (sem styling inline) */}
      <p className="counter" aria-live="polite">
        my exhibition: {count} item(s)
      </p>

      {loading && <p className="loading">loading...</p>}
      {error && <p className="error">{error}</p>}

      <form
        className="search-form"
        onSubmit={function (event) {
          event.preventDefault(); // impede recarregar a página
          // o input controlado já dispara o useeffect quando muda o valor
        }}
      >
        <input
          type="text"
          placeholder="search artworks..."
          value={searchTerm}
          onChange={function (event) {
            setSearchTerm(event.target.value);
          }}
        />
        <button type="submit">search</button>
      </form>

      <div className="artworks-grid">
        {items.map(function (object) {
          return (
            <article key={object.objectID || object.id} className="art-card">
              <img
                src={object.primaryImageSmall}
                alt={object.title}
                loading="lazy" /* carrega a imagem só quando aparece na tela */
              />
              <h3>{object.title || "untitled"}</h3>
              <p>{object.artistDisplayName || "unknown artist"}</p>
              <p className="museum">{object.museum}</p>

              {/* área de ações do card: add ou remove conforme já está salvo */}
              <div className="actions">
                {isSelected(object) ? (
                  <button
                    className="remove-btn"
                    onClick={function () { removeItem(object); }}
                    aria-label="remove from my exhibition"
                  >
                    remove
                  </button>
                ) : (
                  <button
                    className="add-btn"
                    onClick={function () { addItem(object); }}
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
