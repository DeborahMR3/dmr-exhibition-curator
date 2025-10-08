import { useState, useEffect } from "react";
import { searchMetObjects, getObject } from "../api/metApi.js";
import { searchAICObjects } from "../api/aicApi.js";
import "../styling/Home.css"; // importa o css da página

export default function Home() {
  // estados do componente
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(function () {
    setLoading(true);
    setError("");
    setItems([]);

    // faz as duas buscas ao mesmo tempo (the met + aic)
    Promise.all([
      searchMetObjects("portrait"),    // busca ids do the met
      searchAICObjects("portrait"), // busca artworks do aic
    ])
      .then(function ([metData, aicObjects]) {
        // pega até 8 ids do met pra não sobrecarregar
        const metIDs = (metData.objectIDs || []).slice(0, 8);

        // cria uma lista de promessas pra buscar detalhes de cada obra do met
        const metPromises = metIDs.map(function (id) {
          return getObject(id);
        });

        // espera o met terminar e depois junta com os resultados do aic
        return Promise.all(metPromises).then(function (metObjects) {
          // filtra só as obras do met que têm imagem
          const filteredMetObjects = metObjects.filter(function (metObject) {
            return metObject && metObject.primaryImageSmall;
          });

          // junta as obras dos dois museus num único array
          const combined = [...filteredMetObjects, ...aicObjects];

          if (combined.length === 0) {
            setError("No results found.");
          }

          // atualiza o estado com todos os resultados
          setItems(combined);
        });
      })
      .catch(function (error) {
        console.error(error);
        setError("Request failed.");
      })
      .finally(function () {
        setLoading(false);
      });
  }, []); // roda só uma vez quando a página carrega

  return (
    <section className="home-page">
      <h2>Artworks from The Met and the Art Institute of Chicago</h2>

      {loading && <p className="loading">loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="artworks-grid">
        {items.map(function (obj) {
          return (
            <article key={obj.objectID || obj.id} className="art-card">
              <img
                src={obj.primaryImageSmall}
                alt={obj.title}
              />
              <h3>{obj.title || "untitled"}</h3>
              <p>{obj.artistDisplayName || "unknown artist"}</p>
              <p className="museum">{obj.museum}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
