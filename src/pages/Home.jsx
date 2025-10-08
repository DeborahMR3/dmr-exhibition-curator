import { useState, useEffect } from "react";
import { searchObjects, getObject } from "../api/metApi.js";
import "../styling/Home.css"; // importa o css da página

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(function () {
    setLoading(true);
    setError("");
    setItems([]);

    searchObjects("portrait")
      .then(function (data) {
        const ids = (data.objectIDs || []).slice(0, 12);  //objectIDs vem do API

        if (ids.length === 0) {
          setError("No results found.");
          throw new Error("No IDs returned");
        }

        const promises = ids.map(function (id) {
          return getObject(id);
        });

        return Promise.all(promises);
      })
      .then(function (objects) {
        const completeObject = objects.filter(function (obj) {
          return obj && obj.primaryImageSmall;
        });

        setItems(completeObject);
      })
      .catch(function (error) {
        console.error(error);
        setError("Request failed.");
      })
      .finally(function () {
        setLoading(false);
      });
  }, []); // [] = roda só quando a página carregar

  return (
    <section className="home-page">
      <h2>The Met — artworks</h2>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="artworks-grid">
        {items.map(function (obj) {
          return (
            <article key={obj.objectID} className="art-card">
              <img
                src={obj.primaryImageSmall}
                alt={obj.title}
              />
              <h3>{obj.title || "Untitled"}</h3>
              <p>{obj.artistDisplayName || "Unknown artist"}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}



// import "../styling/Home.css";

// export default function Home() {
//   return (
//     <section className="home container">
//       <h2>Welcome to Exhibition Curator</h2>
//       <p>
//         Start curating your own exhibition by exploring artworks and adding them
//         to your personal collection.
//       </p>
//     </section>
//   );
// }
