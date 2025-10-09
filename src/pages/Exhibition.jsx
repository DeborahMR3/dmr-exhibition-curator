// no topo do arquivo, junto dos outros imports
import { Link } from "react-router-dom";
import "../styling/Exhibition.css";
import { useExhibition } from "../context/ExhibitionContext.jsx";

export default function Exhibition() {
  const { items, count, removeItem } = useExhibition();

  return (
    <section className="exhibition">
      <h2>My Exhibition</h2>

      {(!items || items.length === 0) ? (
        <div className="empty-area">
          <p className="empty-message">
            Your exhibition is still empty
          </p>

          {/* link para voltar à página de artworks (home) */}
          <Link
            to="/"
            className="back-btn"
            aria-label="go back to home link"
          >
            Have a look at all the Artworks
          </Link>
        </div>
      ) : (
        <>
          <p className="counter" aria-live="polite">
            total: {count} item(s)
          </p>

          <div className="exhibition-grid">
            {items.map(function (item) {
              return (
                <article key={item.objectID || item.id} className="exhibition-card">
                  <img
                    src={item.primaryImageSmall}
                    alt={item.title}
                    loading="lazy"
                  />
                  <h3>{item.title || "untitled"}</h3>
                  <p>{item.artistDisplayName || "unknown artist"}</p>
                  <p className="museum">{item.museum}</p>

                  <div className="actions">
                    <button
                      className="remove-btn"
                      onClick={function () { removeItem(item); }}
                      aria-label="remove from my exhibition"
                    >
                      remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
