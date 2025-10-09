// no topo do arquivo, junto dos outros imports
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styling/Exhibition.css";
import { useExhibition } from "../context/ExhibitionContext.jsx";

export default function Exhibition() {
  const { items, count, removeItem } = useExhibition();

  // controla a visualização grande
  const [selectedItem, setSelectedItem] = useState(null);

  // fecha com ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setSelectedItem(null);
    }
    if (selectedItem) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedItem]);

  return (
    <section className="exhibition">
      <h2>My Exhibition</h2>

      {(!items || items.length === 0) ? (
        <div className="empty-area">
          <p className="empty-message">Your exhibition is still empty</p>

          {/* link para voltar à página de artworks (home) */}
          <Link to="/" className="back-btn" aria-label="go back to home link">
            Have a look at all the Artworks
          </Link>
        </div>
      ) : (
        <>
          <p className="counter" aria-live="polite">total: {count} item(s)</p>

          <div className="exhibition-grid">
            {items.map(function (item) {
              return (
                <article key={item.objectID || item.id} className="exhibition-card">
                  <button
                    className="thumb-btn"
                    onClick={() => setSelectedItem(item)} /* abre imagem grande */
                    aria-label="view large image"
                  >
                    <img
                      src={item.primaryImageSmall}
                      alt={item.title}
                      loading="lazy"
                      className="thumb-img"
                    />
                  </button>

                  <h3>{item.title || "untitled"}</h3>
                  <p>{item.artistDisplayName || "unknown artist"}</p>
                  <p className="museum">{item.museum}</p>

                  <div className="actions">
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item)}
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

      {/* MODAL: imagem grande */}
      {selectedItem && (
        <div
          className="exhibition-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedItem(null)} /* clique fora fecha */
        >
          <div
            className="exhibition-modal__content"
            onClick={(e) => e.stopPropagation()} /* impede fechar ao clicar dentro */
          >
            <button
              className="exhibition-modal__close"
              onClick={() => setSelectedItem(null)}
              aria-label="close image"
            >
              ×
            </button>

            <img
              src={selectedItem.primaryImage || selectedItem.primaryImageSmall}
              alt={selectedItem.title}
              className="exhibition-modal__image"
            />
            <p className="exhibition-modal__caption">
              {selectedItem.title || "untitled"} — {selectedItem.artistDisplayName || "unknown artist"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
