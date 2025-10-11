// src/pages/ArtworkDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getObject as getMetObject } from "../api/metApi.js";
import { getAICObject } from "../api/aicApi.js";
import { getHarvardObject } from "../api/harvardApi.js";
import "../styling/ArtworkDetail.css";
import { useExhibition } from "../context/ExhibitionContext.jsx";

export default function ArtworkDetail() {
  const { museum, id } = useParams();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFull, setShowFull] = useState(false);

  // refs separados para a imagem principal e a do modal
  const imgRef = useRef(null);
  const modalImgRef = useRef(null);

  const { addItem, removeItem, isSelected } = useExhibition();

  useEffect(() => {
    async function fetchArtwork() {
      try {
        setLoading(true);
        setError("");
        setArtwork(null);

        let data = null;
        const muse = (museum || "").toLowerCase();

        if (muse.includes("met")) data = await getMetObject(id);
        else if (muse.includes("aic")) data = await getAICObject(id);
        else if (muse.includes("harvard")) data = await getHarvardObject(id);

        if (!data) {
          setError("Artwork not found.");
          return;
        }
        setArtwork(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load artwork details.");
      } finally {
        setLoading(false);
      }
    }
    fetchArtwork();
  }, [museum, id]);

  // escolhe primeira imagem (sem placeholder)
  function pickFirstSrc(a) {
    return (
      a?.primaryImage ||
      a?.primaryImageSmall ||
      a?.imageUrl ||
      a?.primaryimageurl ||
      a?.baseimageurl ||
      ""
    );
  }

  // fallback de imagem por <img>
  function tryNextImage(imgEl, a) {
    if (!a || !imgEl) return;
    const tried = imgEl.getAttribute("data-tried") || "";
    const triedList = tried ? tried.split("|") : [];
    const candidates = [
      a.primaryImage,
      a.primaryImageSmall,
      a.imageUrl,
      a.primaryimageurl,
      a.baseimageurl,
    ].filter(Boolean);
    const next = candidates.find((url) => !triedList.includes(url));
    if (next) {
      const newTried = tried ? `${tried}|${next}` : next;
      imgEl.setAttribute("data-tried", newTried);
      imgEl.src = next;
    }
  }
  function handleMainImgError()  { tryNextImage(imgRef.current, artwork); }
  function handleModalImgError() { tryNextImage(modalImgRef.current, artwork); }

  if (loading) return <p className="loading">Loading...</p>;
  if (error)   return <p className="error">{error}</p>;
  if (!artwork) return null;

  const firstSrc = pickFirstSrc(artwork);
  const artistName =
    artwork.artistDisplayName ||
    artwork.artist_title ||
    (artwork.people && artwork.people[0]?.name) ||
    "Unknown";

  // Where to see it (AIC/Harvard)
  function getWhereToSee(a) {
    const museumName = (a.museum || "").toLowerCase();
    const theId = a.id ?? a.objectID;

    if (museumName.includes("chicago")) {
      return {
        url: theId ? `https://www.artic.edu/artworks/${theId}` : null,
        label: "view on The Art Institute of Chicago",
        address: "111 S Michigan Ave, Chicago, IL 60603, United States",
      };
    }
    if (museumName.includes("harvard")) {
      const url =
        a.url || (theId ? `https://harvardartmuseums.org/collections/object/${theId}` : null);
      return {
        url,
        label: "view on Harvard Art Museums",
        address: "32 Quincy St, Cambridge, MA 02138, United States",
      };
    }
    return { url: null, label: "", address: "" };
  }
  const where = getWhereToSee(artwork);

  return (
    <section className="artwork-detail">
      <h2>{artwork.title || "Untitled"}</h2>

      <div className="artwork-detail__content">
        {firstSrc && (
          <img
            ref={imgRef}
            src={firstSrc}
            alt={artwork.title || "Artwork image"}
            className="artwork-detail__image"
            onClick={() => setShowFull(true)}
            onError={handleMainImgError}
            data-tried={firstSrc || ""}
          />
        )}

        <div className="artwork-detail__info">
          <p><strong>Artist:</strong> {artistName}</p>
          <p><strong>Date:</strong> {artwork.objectDate || artwork.date || "N/A"}</p>
          <p><strong>Medium:</strong> {artwork.medium || "N/A"}</p>
          <p><strong>Department:</strong> {artwork.department || artwork.department_title || "—"}</p>

          {where.url && (
            <div style={{ marginTop: 12 }}>
              <p>
                <strong>Where to see it:</strong>{" "}
                <a href={where.url} target="_blank" rel="noopener noreferrer">
                  {where.label}
                </a>
              </p>
              {where.address && <p><strong>Address:</strong> {where.address}</p>}
            </div>
          )}

          {!where.url && artwork.objectURL && (
            <div style={{ marginTop: 12 }}>
              <a
                href={artwork.objectURL}
                target="_blank"
                rel="noopener noreferrer"
                className="artwork-detail__link"
              >
                View on Museum Website →
              </a>
            </div>
          )}

          {/* >>> AÇÕES: agora embaixo de tudo <<< */}
          <div style={{ marginTop: 16 }}>
            {isSelected(artwork) ? (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeItem(artwork)}
              >
                remove from my exhibition
              </button>
            ) : (
              <button
                type="button"
                className="add-btn"
                onClick={() => addItem(artwork)}
              >
                add to my exhibition
              </button>
            )}
          </div>
        </div>
      </div>

      {showFull && firstSrc && (
        <div
          className="artwork-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowFull(false)}
        >
          <div className="artwork-modal__content" onClick={(e) => e.stopPropagation()}>
            <img
              ref={modalImgRef}
              src={firstSrc}
              alt={artwork.title || "Artwork image"}
              className="artwork-modal__image"
              onError={handleModalImgError}
              data-tried={firstSrc || ""}
            />
            <button
              type="button"
              className="artwork-modal__close"
              aria-label="Close image"
              onClick={() => setShowFull(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}


// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { getObject as getMetObject } from "../api/metApi.js";
// import { getAICObject } from "../api/aicApi.js";
// import { getHarvardObject } from "../api/harvardApi.js";
// import "../styling/ArtworkDetail.css";

// export default function ArtworkDetail() {
//   const { museum, id } = useParams();
//   const [artwork, setArtwork] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [showFull, setShowFull] = useState(false); // controla modal

//   useEffect(() => {
//     async function fetchArtwork() {
//       try {
//         setLoading(true);
//         let data;

//         if (museum.includes("met")) {
//           data = await getMetObject(id);
//         } else if (museum.includes("aic")) {
//           data = await getAICObject(id);
//         } else if (museum.includes("harvard")) {
//           data = await getHarvardObject(id);
//         }

//         if (data) setArtwork(data);
//         else setError("Artwork not found.");
//       } catch (err) {
//         setError("Failed to load artwork details.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchArtwork();
//   }, [museum, id]);

//   if (loading) return <p className="loading">Loading...</p>;
//   if (error) return <p className="error">{error}</p>;
//   if (!artwork) return null;

//   return (
//     <section className="artwork-detail">
//       <h2>{artwork.title || "Untitled"}</h2>

//       <div className="artwork-detail__content">
//         <img
//           src={artwork.primaryImage || artwork.primaryImageSmall}
//           alt={artwork.title}
//           className="artwork-detail__image"
//           onClick={() => setShowFull(true)}
//         />

//         <div className="artwork-detail__info">
//           <p><strong>Artist:</strong> {artwork.artistDisplayName || "Unknown"}</p>
//           <p><strong>Date:</strong> {artwork.objectDate || "N/A"}</p>
//           <p><strong>Medium:</strong> {artwork.medium || "N/A"}</p>
//           <p><strong>Department:</strong> {artwork.department || "—"}</p>

//           {artwork.objectURL && (
//             <a
//               href={artwork.objectURL}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="artwork-detail__link"
//             >
//               View on Museum Website →
//             </a>
//           )}
//         </div>
//       </div>

//       {showFull && (
//         <div
//           className="artwork-modal"
//           onClick={() => setShowFull(false)}
//           role="dialog"
//           aria-modal="true"
//         >
//           <div className="artwork-modal__content">
//             <img
//               src={artwork.primaryImage || artwork.primaryImageSmall}
//               alt={artwork.title}
//               className="artwork-modal__image"
//             />
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }
