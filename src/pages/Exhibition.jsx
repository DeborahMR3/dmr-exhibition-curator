// src/pages/Exhibition.jsx
import { useEffect, useState } from "react";
import "../styling/Exhibition.css";

// contexto: itens salvos da exposição
import { useExhibition } from "../context/ExhibitionContext.jsx";

export default function Exhibition() {
  // pega itens salvos e helpers do contexto
  const { items, count, removeItem } = useExhibition();

  // controla o modal de imagem grande
  const [selectedItem, setSelectedItem] = useState(null);

  // fecha modal com ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setSelectedItem(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /**
   * Escolhe a melhor URL de imagem disponível no item,
   * respeitando as diferenças entre Met / AIC / Harvard.
   * NUNCA usa placeholder.
   */
  function getImageSrc(obj) {
    if (!obj) return "";

    // Harvard: alguns itens antigos podem ter sido salvos com link IDS (bloqueia hotlink e dá 503).
    // Preferimos SEMPRE baseimageurl (estático .jpg) ou primaryimageurl.
    const harvardBest =
      obj.baseimageurl ||               // Harvard (mais confiável)
      obj.primaryimageurl ||            // Harvard (campo comum)
      "";

    // AIC: salvamos uma URL IIIF montada (imageUrl). Se não tiver, usa campos originais.
    const aicBest =
      obj.imageUrl ||                   // nossa URL iiif montada
      obj.primaryImage ||               // fallback improvável, mas ok
      obj.primaryImageSmall ||          // último caso
      "";

    // Met: às vezes só temos a small (porque veio do card); se tiver a grande, usamos.
    const metBest =
      obj.primaryImage ||               // Met grande
      obj.primaryImageSmall ||          // Met thumb
      "";

    // Detecta museu pelo campo obj.museum (foi padronizado nos mapeamentos)
    const museum = (obj.museum || "").toLowerCase();

    if (museum.includes("harvard")) return harvardBest;
    if (museum.includes("institute of chicago") || museum.includes("aic")) return aicBest;
    if (museum.includes("met")) return metBest;

    // se não conseguir detectar, tenta o melhor geral
    return (
      metBest ||
      aicBest ||
      harvardBest ||
      ""
    );
  }

  // título e artista para exibir (normaliza campos entre as APIs)
  function getArtist(obj) {
    return (
      obj.artistDisplayName || // Met
      obj.artist_title ||      // AIC
      (obj.people && obj.people[0]?.name) || // Harvard
      "Unknown artist"
    );
  }

  function getTitle(obj) {
    return obj.title || "Untitled";
  }

  function getMuseum(obj) {
    return obj.museum || "";
  }

  return (
    <section className="exhibition-page">
      <h2>My Exhibition</h2>
      <p className="counter" aria-live="polite">total: {count} item(s)</p>

      {count === 0 && (
        <p className="empty-hint">
          Your exhibition is still empty — go back to <a href="/">Home</a> and add artworks.
        </p>
      )}

      {/* grade de itens salvos */}
      <div className="exhibition-grid">
        {items.map((item) => {
          const imgSrc = getImageSrc(item);
          return (
            <article key={item.objectID || item.id} className="exhibition-card">
              {/* imagem abre modal em tamanho maior */}
              <img
                src={imgSrc}
                alt={getTitle(item)}
                className="thumb-img"
                loading="lazy"
                onClick={() => imgSrc && setSelectedItem(item)}
                style={{ cursor: imgSrc ? "zoom-in" : "default" }}
              />

              {/* título + infos básicas */}
              <h3 className="title">{getTitle(item)}</h3>
              <p className="artist">{getArtist(item)}</p>
              <p className="museum">{getMuseum(item)}</p>

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

      {/* Modal da imagem grande */}
      {selectedItem && (
        <div
          className="exhibition-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="exhibition-modal__content"
            onClick={(e) => e.stopPropagation()} // impede fechar ao clicar no conteúdo
          >
            <button
              className="exhibition-modal__close"
              onClick={() => setSelectedItem(null)}
              aria-label="close"
              title="close"
            >
              ×
            </button>

            <img
              src={getImageSrc(selectedItem)}
              alt={`${getTitle(selectedItem)} — ${getArtist(selectedItem)}`}
              className="exhibition-modal__image"
            />

            <figcaption className="exhibition-modal__caption">
              <strong>{getTitle(selectedItem)}</strong> — {getArtist(selectedItem)}
            </figcaption>
          </div>
        </div>
      )}
    </section>
  );
}


// // no topo do arquivo, junto dos outros imports
// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import "../styling/Exhibition.css";
// import { useExhibition } from "../context/ExhibitionContext.jsx";

// export default function Exhibition() {
//   const { items, count, removeItem } = useExhibition();

//   // controla a visualização grande
//   const [selectedItem, setSelectedItem] = useState(null);

//   // fecha com ESC
//   useEffect(() => {
//     function onKeyDown(e) {
//       if (e.key === "Escape") setSelectedItem(null);
//     }
//     if (selectedItem) window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [selectedItem]);

//   return (
//     <section className="exhibition">
//       <h2>My Exhibition</h2>

//       {(!items || items.length === 0) ? (
//         <div className="empty-area">
//           <p className="empty-message">Your exhibition is still empty</p>

//           {/* link para voltar à página de artworks (home) */}
//           <Link to="/" className="back-btn" aria-label="go back to home link">
//             Have a look at all the Artworks
//           </Link>
//         </div>
//       ) : (
//         <>
//           <p className="counter" aria-live="polite">total: {count} item(s)</p>

//           <div className="exhibition-grid">
//             {items.map(function (item) {
//               return (
//                 <article key={item.objectID || item.id} className="exhibition-card">
//                   <button
//                     className="thumb-btn"
//                     onClick={() => setSelectedItem(item)} /* abre imagem grande */
//                     aria-label="view large image"
//                   >
//                     <img
//                       src={item.primaryImageSmall}
//                       alt={item.title}
//                       loading="lazy"
//                       className="thumb-img"
//                     />
//                   </button>

//                   <h3>{item.title || "untitled"}</h3>
//                   <p>{item.artistDisplayName || "unknown artist"}</p>
//                   <p className="museum">{item.museum}</p>

//                   <div className="actions">
//                     <button
//                       className="remove-btn"
//                       onClick={() => removeItem(item)}
//                       aria-label="remove from my exhibition"
//                     >
//                       remove
//                     </button>
//                   </div>
//                 </article>
//               );
//             })}
//           </div>
//         </>
//       )}

//       {/* MODAL: imagem grande */}
//       {selectedItem && (
//         <div
//           className="exhibition-modal"
//           role="dialog"
//           aria-modal="true"
//           onClick={() => setSelectedItem(null)} /* clique fora fecha */
//         >
//           <div
//             className="exhibition-modal__content"
//             onClick={(e) => e.stopPropagation()} /* impede fechar ao clicar dentro */
//           >
//             <button
//               className="exhibition-modal__close"
//               onClick={() => setSelectedItem(null)}
//               aria-label="close image"
//             >
//               ×
//             </button>

//             <img
//               src={selectedItem.primaryImage || selectedItem.primaryImageSmall}
//               alt={selectedItem.title}
//               className="exhibition-modal__image"
//             />
//             <p className="exhibition-modal__caption">
//               {selectedItem.title || "untitled"} — {selectedItem.artistDisplayName || "unknown artist"}
//             </p>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }
