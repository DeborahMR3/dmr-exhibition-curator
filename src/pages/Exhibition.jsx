import { useEffect, useState, useRef } from "react";
import "../styling/Exhibition.css";
import { useExhibition } from "../context/ExhibitionContext.jsx";

export default function Exhibition() {
  const { items, count, removeItem } = useExhibition();

  const [selectedItem, setSelectedItem] = useState(null);
  const modalImgRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setSelectedItem(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function getBestSrc(obj) {
    return (
      obj.primaryImage ||         // Met grande
      obj.primaryImageSmall ||    // Met pequena
      obj.imageUrl ||             // AIC IIIF
      obj.primaryimageurl ||      // Harvard
      obj.baseimageurl ||         // Harvard base
      ""
    );
  }

  function handleModalImgError() {
    if (!selectedItem || !modalImgRef.current) return;

    const tried = modalImgRef.current.getAttribute("data-tried") || "";
    const candidates = [
      selectedItem.primaryImage,
      selectedItem.primaryImageSmall,
      selectedItem.imageUrl,
      selectedItem.primaryimageurl,
      selectedItem.baseimageurl,
    ].filter(Boolean);

    let next = null;
    for (const url of candidates) {
      if (!tried.split("|").includes(url)) {
        next = url;
        break;
      }
    }

    if (next) {
      const newTried = tried ? tried + "|" + next : next;
      modalImgRef.current.setAttribute("data-tried", newTried);
      modalImgRef.current.src = next;
    }
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

      <div className="exhibition-grid">
        {items.map((item) => {
          const imgSrc = getBestSrc(item);
          const artistName =
            item.artistDisplayName ||
            item.artist_title ||
            (item.people && item.people[0]?.name) ||
            "Unknown artist";

          return (
            <article key={item.objectID || item.id} className="exhibition-card">
              <img
                src={imgSrc}
                alt={item.title || "Artwork image"}
                className="thumb-img"
                loading="lazy"
                onClick={() => setSelectedItem(item)}
                onError={(e) => {
                  // se a miniatura quebrar, tenta cair para outra fonte
                  const tried = e.currentTarget.getAttribute("data-tried") || "";
                  const candidates = [
                    item.primaryImage,
                    item.primaryImageSmall,
                    item.imageUrl,
                    item.primaryimageurl,
                    item.baseimageurl,
                  ].filter(Boolean);

                  let next = null;
                  for (const url of candidates) {
                    if (!tried.split("|").includes(url)) {
                      next = url;
                      break;
                    }
                  }

                  if (next) {
                    const newTried = tried ? tried + "|" + next : next;
                    e.currentTarget.setAttribute("data-tried", newTried);
                    e.currentTarget.src = next;
                  }
                }}
                data-tried={imgSrc || ""}
                style={{ cursor: imgSrc ? "zoom-in" : "default" }}
              />

              <h3 className="title">{item.title || "Untitled"}</h3>
              <p className="artist">{artistName}</p>
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

      {/* Modal */}
      {selectedItem && (
        <div
          className="exhibition-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedItem(null)}
        >
          <div className="exhibition-modal__content" onClick={(e) => e.stopPropagation()}>
            <img
              ref={modalImgRef}
              src={getBestSrc(selectedItem)}
              alt={
                `${selectedItem.title || "Untitled"} — ` +
                (selectedItem.artistDisplayName ||
                  selectedItem.artist_title ||
                  (selectedItem.people && selectedItem.people[0]?.name) ||
                  "Unknown artist")
              }
              className="exhibition-modal__image"
              onError={handleModalImgError}
              data-tried={getBestSrc(selectedItem) || ""}
            />
            <button
              type="button"
              className="exhibition-modal__close"
              aria-label="Close image"
              onClick={() => setSelectedItem(null)}
            >
              ×
            </button>
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
