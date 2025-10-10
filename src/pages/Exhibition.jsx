// src/pages/Exhibition.jsx
import { useEffect, useState } from "react";
import "../styling/Exhibition.css";
import { useExhibition } from "../context/ExhibitionContext.jsx";

export default function Exhibition() {
  const { items, count, removeItem } = useExhibition();
  const [selectedItem, setSelectedItem] = useState(null);

  // fecha o modal com esc
  useEffect(function () {
    function onKeyDown(e) {
      if (e.key === "Escape") setSelectedItem(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return function () { window.removeEventListener("keydown", onKeyDown); };
  }, []);

  // escolhe url de imagem sem placeholder (se não houver, retorna "")
  function getImageSrc(obj) {
    return (
      obj.primaryImage ||         // met grande (se tiver)
      obj.primaryImageSmall ||    // met thumb
      obj.imageUrl ||             // aic normalizado
      obj.primaryimageurl ||      // harvard bruto (se vier)
      obj.baseimageurl ||         // harvard iiif estável
      ""
    );
  }

  // abre o modal apenas se houver imagem
  function openCard(item) {
    const img = getImageSrc(item);
    if (!img) return; // sem foto, não abre
    setSelectedItem(item);
  }

  // suporte ao teclado no card (enter/space)
  function onCardKeyDown(e, item) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openCard(item);
    }
  }

  // utilitários de metadados
  function getArtist(item) {
    return item.artistDisplayName ||
           item.artist_title ||
           (item.people && item.people[0]?.name) ||
           "";
  }

  function getDate(item) {
    return item.dateDisplay || item.dated || item.objectDate || "";
  }

  function getMedium(item) {
    return item.medium || item.medium_display || "";
  }

  function getDepartment(item) {
    return item.department || item.department_title || "";
  }

  // where to see it: AIC e Harvard com links e endereços fixos
  function getWhereToSee(item) {
    const museum = (item.museum || "").toLowerCase();
    const id = item.id ?? item.objectID;

    // AIC
    if (museum.includes("chicago")) {
      return {
        url: id ? `https://www.artic.edu/artworks/${id}` : null,
        label: "view on The Art Institute of Chicago",
        address: "111 S Michigan Ave, Chicago, IL 60603, United States",
      };
    }
    // Harvard
    if (museum.includes("harvard")) {
      const url =
        item.url ||
        (id ? `https://harvardartmuseums.org/collections/object/${id}` : null);
      return {
        url,
        label: "view on Harvard Art Museums",
        address: "32 Quincy St, Cambridge, MA 02138, United States",
      };
    }

    // outros: não exibe seção
    return { url: null, label: "", address: "" };
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
        {items.map(function (item) {
          const imgSrc = getImageSrc(item);
          const artistName = getArtist(item);
          const isClickable = Boolean(imgSrc); // sem foto, não é clicável

          return (
            <article
              key={item.objectID || item.id}
              className={"exhibition-card" + (isClickable ? " is-clickable" : "")}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={function () { if (isClickable) openCard(item); }}
              onKeyDown={function (e) { if (isClickable) onCardKeyDown(e, item); }}
              aria-label={(item.title || "Artwork") + (artistName ? ` — ${artistName}` : "")}
            >
              {/* imagem só aparece se existir url; se quebrar, remove */}
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={item.title || "Artwork image"}
                  className="thumb-img"
                  loading="lazy"
                  onError={function (e) { e.currentTarget.remove(); }}
                />
              )}

              <h3 className="title">{item.title || "Untitled"}</h3>
              <p className="artist">{artistName || "Unknown artist"}</p>
              <p className="museum">{item.museum}</p>

              <div className="actions">
                <button
                  type="button"
                  className="remove-btn"
                  onClick={(e) => {
                    e.preventDefault();    // não dispara nenhuma ação padrão
                    e.stopPropagation();   // não deixa o clique subir para o card
                    removeItem(item);
                  }}
                >
                  remove
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* modal de imagem grande + informações */}
      {selectedItem && (
        <div
          className="exhibition-modal"
          onClick={function () { setSelectedItem(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="exhibition-modal__content"
            onClick={function (e) { e.stopPropagation(); }}
          >
            <button
              className="close-btn"
              onClick={function () { setSelectedItem(null); }}
              aria-label="close"
            >
              ×
            </button>

            <img
              src={getImageSrc(selectedItem)}
              alt={selectedItem.title || "Artwork image"}
              className="exhibition-modal__image"
            />

            <figcaption className="exhibition-modal__caption">
              <strong>{selectedItem.title || "Untitled"}</strong>
              {getArtist(selectedItem) ? <> — {getArtist(selectedItem)}</> : null}
            </figcaption>

            <div className="exhibition-modal__meta">
              {getDate(selectedItem) && <p><strong>date:</strong> {getDate(selectedItem)}</p>}
              {getMedium(selectedItem) && <p><strong>medium:</strong> {getMedium(selectedItem)}</p>}
              {getDepartment(selectedItem) && <p><strong>department:</strong> {getDepartment(selectedItem)}</p>}
              {selectedItem.museum && <p><strong>museum:</strong> {selectedItem.museum}</p>}

              {/* where to see it (AIC/Harvard) */}
              {(() => {
                const info = getWhereToSee(selectedItem);
                return info.url ? (
                  <>
                    <p>
                      <strong>where to see it:</strong>{" "}
                      <a href={info.url} target="_blank" rel="noopener noreferrer">
                        {info.label}
                      </a>
                    </p>
                    {info.address && <p><strong>address:</strong> {info.address}</p>}
                  </>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


// // src/pages/Exhibition.jsx
// import { useEffect, useState } from "react";
// import "../styling/Exhibition.css";
// import { useExhibition } from "../context/ExhibitionContext.jsx";

// export default function Exhibition() {
//   const { items, count, removeItem } = useExhibition();
//   const [selectedItem, setSelectedItem] = useState(null);

//   useEffect(() => {
//     function onKeyDown(e) {
//       if (e.key === "Escape") setSelectedItem(null);
//     }
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, []);

//   function getImageSrc(obj) {
//     return (
//       obj.primaryImage ||         // Met grande
//       obj.primaryImageSmall ||    // Met thumb
//       obj.imageUrl ||             // AIC normalizado
//       obj.primaryimageurl ||      // Harvard bruto (se sobrar)
//       obj.baseimageurl ||         // Harvard IIIF estável
//       ""
//     );
//   }

//   return (
//     <section className="exhibition-page">
//       <h2>My Exhibition</h2>
//       <p className="counter" aria-live="polite">total: {count} item(s)</p>

//       {count === 0 && (
//         <p className="empty-hint">
//           Your exhibition is still empty — go back to <a href="/">Home</a> and add artworks.
//         </p>
//       )}

//       <div className="exhibition-grid">
//         {items.map((item) => {
//           const imgSrc = getImageSrc(item);
//           const artistName =
//             item.artistDisplayName ||
//             item.artist_title ||
//             (item.people && item.people[0]?.name) ||
//             "Unknown artist";

//           return (
//             <article key={item.objectID || item.id} className="exhibition-card">
//               <img
//                 src={imgSrc}
//                 alt={item.title || "Artwork image"}
//                 className="thumb-img"
//                 loading="lazy"
//                 onClick={() => imgSrc && setSelectedItem(item)}
//                 style={{ cursor: imgSrc ? "zoom-in" : "default" }}
//               />
//               <h3 className="title">{item.title || "Untitled"}</h3>
//               <p className="artist">{artistName}</p>
//               <p className="museum">{item.museum}</p>

//               <div className="actions">
//                 <button className="remove-btn" onClick={() => removeItem(item)}>
//                   remove
//                 </button>
//               </div>
//             </article>
//           );
//         })}
//       </div>

//       {/* Modal de imagem grande */}
//       {selectedItem && (
//         <div className="exhibition-modal" onClick={() => setSelectedItem(null)}>
//           <div className="exhibition-modal__content" onClick={(e) => e.stopPropagation()}>
//             <button className="close-btn" onClick={() => setSelectedItem(null)} aria-label="close">
//               ×
//             </button>
//             <img
//               src={getImageSrc(selectedItem)}
//               alt={selectedItem.title || "Artwork image"}
//               className="exhibition-modal__image"
//             />
//             <figcaption className="exhibition-modal__caption">
//               {(selectedItem.title || "Untitled") +
//                 (selectedItem.artistDisplayName ? ` — ${selectedItem.artistDisplayName}` : "")}
//             </figcaption>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }
