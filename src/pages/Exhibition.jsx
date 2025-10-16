// src/pages/Exhibition.jsx
import { useEffect, useState } from "react";
import "../styling/Exhibition.css";
import { useExhibition } from "../context/ExhibitionContext.jsx";

export default function Exhibition() {
  const { items, count, removeItem } = useExhibition();
  const [selectedItem, setSelectedItem] = useState(null);

  // controla o modo display (slideshow da exposição)
  const [isDisplayOpen, setIsDisplayOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // fecha o modal com esc e controla setas no display
  useEffect(function () {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setSelectedItem(null);
        setIsDisplayOpen(false);
      }
      if (isDisplayOpen && e.key === "ArrowRight") nextItem();
      if (isDisplayOpen && e.key === "ArrowLeft") prevItem();
    }
    window.addEventListener("keydown", onKeyDown);
    return function () {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDisplayOpen]);

  // abre o display (modo slideshow)
  function openDisplay() {
    if (items.length > 0) {
      setIsDisplayOpen(true);
      setCurrentIndex(0);
    }
  }

  // fecha o display
  function closeDisplay() {
    setIsDisplayOpen(false);
  }

  // avança e retrocede no display
  function nextItem() {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }
  function prevItem() {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }

  // pega a url da imagem (sem placeholder)
  function getImageSrc(obj) {
    return (
      obj.primaryImage ||
      obj.primaryImageSmall ||
      obj.imageUrl ||
      obj.primaryimageurl ||
      obj.baseimageurl ||
      ""
    );
  }

  // abre o modal de detalhes do card
  function openCard(item) {
    const img = getImageSrc(item);
    if (!img) return;
    setSelectedItem(item);
  }

  // permite abrir o card com enter/space
  function onCardKeyDown(e, item) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openCard(item);
    }
  }

  // funções auxiliares de metadados
  function getArtist(item) {
    return (
      item.artistDisplayName ||
      item.artist_title ||
      (item.people && item.people[0]?.name) ||
      ""
    );
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

  // gera link "where to see it" para AIC e Harvard
  function getWhereToSee(item) {
    const museum = (item.museum || "").toLowerCase();
    const id = item.id ?? item.objectID;

    if (museum.includes("chicago")) {
      return {
        url: id ? `https://www.artic.edu/artworks/${id}` : null,
        label: "view on The Art Institute of Chicago",
        address: "111 S Michigan Ave, Chicago, IL 60603, United States",
      };
    }
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
    return { url: null, label: "", address: "" };
  }

  return (
    <section className="exhibition-page">
      <h2>My Exhibition</h2>
      <p className="counter" aria-live="polite">
        total: {count} item(s)
      </p>

      {/* dica pra deixar claro que os cards são clicáveis */}
      {count > 0 && (
        <p className="hint">💡 tip: click on any artwork card to see more details</p>
      )}

      {/* botão pra abrir o display */}
      {count > 0 && (
        <button type="button" className="display-btn" onClick={openDisplay}>
          Display Exhibition
        </button>
      )}

      {count === 0 && (
        <p className="empty-hint">
          Your exhibition is still empty — go back to <a href="/">Home</a> and
          add artworks.
        </p>
      )}

      {/* grade com os cards da exposição */}
      <div className="exhibition-grid">
        {items.map(function (item) {
          const imgSrc = getImageSrc(item);
          const artistName = getArtist(item);
          const isClickable = Boolean(imgSrc);

          return (
            <article
              key={item.objectID || item.id}
              className={
                "exhibition-card" + (isClickable ? " is-clickable" : "")
              }
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={function () {
                if (isClickable) openCard(item);
              }}
              onKeyDown={function (e) {
                if (isClickable) onCardKeyDown(e, item);
              }}
              aria-label={
                (item.title || "Artwork") +
                (artistName ? ` — ${artistName}` : "")
              }
            >
              {/* imagem (só renderiza se existir) */}
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={item.title || "Artwork image"}
                  className="thumb-img"
                  loading="lazy"
                  onError={function (e) {
                    e.currentTarget.remove();
                  }}
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
                    e.preventDefault();
                    e.stopPropagation();
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

      {/* modal com detalhes da obra (abre ao clicar no card) */}
      {selectedItem && (
        <div
          className="exhibition-modal"
          onClick={function () {
            setSelectedItem(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="exhibition-modal__content"
            onClick={function (e) {
              e.stopPropagation();
            }}
          >
            <button
              className="close-btn"
              onClick={function () {
                setSelectedItem(null);
              }}
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
              {getArtist(selectedItem) ? (
                <> — {getArtist(selectedItem)}</>
              ) : null}
            </figcaption>

            <div className="exhibition-modal__meta">
              {getDate(selectedItem) && (
                <p>
                  <strong>date:</strong> {getDate(selectedItem)}
                </p>
              )}
              {getMedium(selectedItem) && (
                <p>
                  <strong>medium:</strong> {getMedium(selectedItem)}
                </p>
              )}
              {getDepartment(selectedItem) && (
                <p>
                  <strong>department:</strong> {getDepartment(selectedItem)}
                </p>
              )}
              {selectedItem.museum && (
                <p>
                  <strong>museum:</strong> {selectedItem.museum}
                </p>
              )}

              {(() => {
                const info = getWhereToSee(selectedItem);
                return info.url ? (
                  <>
                    <p>
                      <strong>where to see it:</strong>{" "}
                      <a
                        href={info.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {info.label}
                      </a>
                    </p>
                    {info.address && (
                      <p>
                        <strong>address:</strong> {info.address}
                      </p>
                    )}
                  </>
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* modal do display (slideshow da exposição) */}
      {isDisplayOpen && (
        <div
          className="display-modal"
          onClick={closeDisplay}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="display-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={closeDisplay} aria-label="close">
              ×
            </button>

            <button className="arrow left" onClick={prevItem}>
              ←
            </button>
            <button className="arrow right" onClick={nextItem}>
              →
            </button>

            <img
              src={getImageSrc(items[currentIndex])}
              alt={items[currentIndex].title || "Artwork"}
              className="display-modal__image"
            />

            <figcaption className="display-modal__caption">
              <strong>{items[currentIndex].title || "Untitled"}</strong>
              {getArtist(items[currentIndex]) && (
                <> — {getArtist(items[currentIndex])}</>
              )}
            </figcaption>
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

//   // novo estado: controla o modo display
//   const [isDisplayOpen, setIsDisplayOpen] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // fecha o modal com esc
//   useEffect(function () {
//     function onKeyDown(e) {
//       if (e.key === "Escape") {
//         setSelectedItem(null);
//         setIsDisplayOpen(false);
//       }
//       if (isDisplayOpen && e.key === "ArrowRight") nextItem();
//       if (isDisplayOpen && e.key === "ArrowLeft") prevItem();
//     }
//     window.addEventListener("keydown", onKeyDown);
//     return function () {
//       window.removeEventListener("keydown", onKeyDown);
//     };
//   }, [isDisplayOpen]);

//   // funções do display
//   function openDisplay() {
//     if (items.length > 0) {
//       setIsDisplayOpen(true);
//       setCurrentIndex(0);
//     }
//   }

//   function closeDisplay() {
//     setIsDisplayOpen(false);
//   }

//   function nextItem() {
//     setCurrentIndex((prev) => (prev + 1) % items.length);
//   }

//   function prevItem() {
//     setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
//   }

//   // escolhe url de imagem sem placeholder (se não houver, retorna "")
//   function getImageSrc(obj) {
//     return (
//       obj.primaryImage ||
//       obj.primaryImageSmall ||
//       obj.imageUrl ||
//       obj.primaryimageurl ||
//       obj.baseimageurl ||
//       ""
//     );
//   }

//   // abre o modal apenas se houver imagem
//   function openCard(item) {
//     const img = getImageSrc(item);
//     if (!img) return;
//     setSelectedItem(item);
//   }

//   // suporte ao teclado no card (enter/space)
//   function onCardKeyDown(e, item) {
//     if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       openCard(item);
//     }
//   }

//   // utilitários de metadados
//   function getArtist(item) {
//     return (
//       item.artistDisplayName ||
//       item.artist_title ||
//       (item.people && item.people[0]?.name) ||
//       ""
//     );
//   }

//   function getDate(item) {
//     return item.dateDisplay || item.dated || item.objectDate || "";
//   }

//   function getMedium(item) {
//     return item.medium || item.medium_display || "";
//   }

//   function getDepartment(item) {
//     return item.department || item.department_title || "";
//   }

//   // where to see it: AIC e Harvard com links e endereços fixos
//   function getWhereToSee(item) {
//     const museum = (item.museum || "").toLowerCase();
//     const id = item.id ?? item.objectID;

//     // AIC
//     if (museum.includes("chicago")) {
//       return {
//         url: id ? `https://www.artic.edu/artworks/${id}` : null,
//         label: "view on The Art Institute of Chicago",
//         address: "111 S Michigan Ave, Chicago, IL 60603, United States",
//       };
//     }
//     // Harvard
//     if (museum.includes("harvard")) {
//       const url =
//         item.url ||
//         (id ? `https://harvardartmuseums.org/collections/object/${id}` : null);
//       return {
//         url,
//         label: "view on Harvard Art Museums",
//         address: "32 Quincy St, Cambridge, MA 02138, United States",
//       };
//     }

//     return { url: null, label: "", address: "" };
//   }

//   return (
//     <section className="exhibition-page">
//       <h2>My Exhibition</h2>
//       <p className="counter" aria-live="polite">
//         total: {count} item(s)
//       </p>

//       {/* botão novo */}
//       {count > 0 && (
//         <button type="button" className="display-btn" onClick={openDisplay}>
//           Display Exhibition
//         </button>
//       )}

//       {count === 0 && (
//         <p className="empty-hint">
//           Your exhibition is still empty — go back to <a href="/">Home</a> and
//           add artworks.
//         </p>
//       )}

//       <div className="exhibition-grid">
//         {items.map(function (item) {
//           const imgSrc = getImageSrc(item);
//           const artistName = getArtist(item);
//           const isClickable = Boolean(imgSrc);

//           return (
//             <article
//               key={item.objectID || item.id}
//               className={
//                 "exhibition-card" + (isClickable ? " is-clickable" : "")
//               }
//               role={isClickable ? "button" : undefined}
//               tabIndex={isClickable ? 0 : undefined}
//               onClick={function () {
//                 if (isClickable) openCard(item);
//               }}
//               onKeyDown={function (e) {
//                 if (isClickable) onCardKeyDown(e, item);
//               }}
//               aria-label={
//                 (item.title || "Artwork") +
//                 (artistName ? ` — ${artistName}` : "")
//               }
//             >
//               {imgSrc && (
//                 <img
//                   src={imgSrc}
//                   alt={item.title || "Artwork image"}
//                   className="thumb-img"
//                   loading="lazy"
//                   onError={function (e) {
//                     e.currentTarget.remove();
//                   }}
//                 />
//               )}

//               <h3 className="title">{item.title || "Untitled"}</h3>
//               <p className="artist">{artistName || "Unknown artist"}</p>
//               <p className="museum">{item.museum}</p>

//               <div className="actions">
//                 <button
//                   type="button"
//                   className="remove-btn"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     removeItem(item);
//                   }}
//                 >
//                   remove
//                 </button>
//               </div>
//             </article>
//           );
//         })}
//       </div>

//       {/* modal de imagem grande + informações */}
//       {selectedItem && (
//         <div
//           className="exhibition-modal"
//           onClick={function () {
//             setSelectedItem(null);
//           }}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div
//             className="exhibition-modal__content"
//             onClick={function (e) {
//               e.stopPropagation();
//             }}
//           >
//             <button
//               className="close-btn"
//               onClick={function () {
//                 setSelectedItem(null);
//               }}
//               aria-label="close"
//             >
//               ×
//             </button>

//             <img
//               src={getImageSrc(selectedItem)}
//               alt={selectedItem.title || "Artwork image"}
//               className="exhibition-modal__image"
//             />

//             <figcaption className="exhibition-modal__caption">
//               <strong>{selectedItem.title || "Untitled"}</strong>
//               {getArtist(selectedItem) ? (
//                 <> — {getArtist(selectedItem)}</>
//               ) : null}
//             </figcaption>

//             <div className="exhibition-modal__meta">
//               {getDate(selectedItem) && (
//                 <p>
//                   <strong>date:</strong> {getDate(selectedItem)}
//                 </p>
//               )}
//               {getMedium(selectedItem) && (
//                 <p>
//                   <strong>medium:</strong> {getMedium(selectedItem)}
//                 </p>
//               )}
//               {getDepartment(selectedItem) && (
//                 <p>
//                   <strong>department:</strong> {getDepartment(selectedItem)}
//                 </p>
//               )}
//               {selectedItem.museum && (
//                 <p>
//                   <strong>museum:</strong> {selectedItem.museum}
//                 </p>
//               )}

//               {(() => {
//                 const info = getWhereToSee(selectedItem);
//                 return info.url ? (
//                   <>
//                     <p>
//                       <strong>where to see it:</strong>{" "}
//                       <a
//                         href={info.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         {info.label}
//                       </a>
//                     </p>
//                     {info.address && (
//                       <p>
//                         <strong>address:</strong> {info.address}
//                       </p>
//                     )}
//                   </>
//                 ) : null;
//               })()}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* novo modal simples de exibição com setas */}
//       {isDisplayOpen && (
//         <div
//           className="display-modal"
//           onClick={closeDisplay}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div
//             className="display-modal__content"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <button className="close-btn" onClick={closeDisplay} aria-label="close">
//               ×
//             </button>

//             <button className="arrow left" onClick={prevItem}>
//               ←
//             </button>
//             <button className="arrow right" onClick={nextItem}>
//               →
//             </button>

//             <img
//               src={getImageSrc(items[currentIndex])}
//               alt={items[currentIndex].title || "Artwork"}
//               className="display-modal__image"
//             />

//             <figcaption className="display-modal__caption">
//               <strong>{items[currentIndex].title || "Untitled"}</strong>
//               {getArtist(items[currentIndex]) && (
//                 <> — {getArtist(items[currentIndex])}</>
//               )}
//             </figcaption>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }
