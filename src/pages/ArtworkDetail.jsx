import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getObject as getMetObject } from "../api/metApi.js";
import { getAICObject } from "../api/aicApi.js";
import { getHarvardObject } from "../api/harvardApi.js";
import "../styling/ArtworkDetail.css";

export default function ArtworkDetail() {
  const { museum, id } = useParams();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFull, setShowFull] = useState(false);

  // guardo uma referência pra conseguir trocar a src no onError
  const imgRef = useRef(null);

  useEffect(() => {
    async function fetchArtwork() {
      try {
        setLoading(true);
        setError("");
        setArtwork(null);

        let data = null;

        const muse = (museum || "").toLowerCase();
        if (muse.includes("met")) {
          data = await getMetObject(id);
        } else if (muse.includes("aic")) {
          data = await getAICObject(id);
        } else if (muse.includes("harvard")) {
          data = await getHarvardObject(id);
        }

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

  // tenta trocar para a melhor alternativa quando a primeira imagem falha
  function handleImgError() {
    if (!artwork || !imgRef.current) return;

    const tried = imgRef.current.getAttribute("data-tried") || "";

    // ordem de tentativas (sem placeholder!)
    const candidates = [
      artwork.primaryImage,        // Met large
      artwork.primaryImageSmall,   // Met small
      artwork.imageUrl,            // AIC (IIIF montado)
      artwork.primaryimageurl,     // Harvard comum
      artwork.baseimageurl,        // Harvard base
    ].filter(Boolean);

    // encontra a próxima que ainda não tentamos
    let next = null;
    for (const url of candidates) {
      if (!tried.split("|").includes(url)) {
        next = url;
        break;
      }
    }

    if (next) {
      const newTried = tried ? tried + "|" + next : next;
      imgRef.current.setAttribute("data-tried", newTried);
      imgRef.current.src = next;
    }
  }

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!artwork) return null;

  // primeira opção que vamos tentar carregar
  const firstSrc =
    artwork.primaryImage ||            // Met grande
    artwork.primaryImageSmall ||       // Met pequena
    artwork.imageUrl ||                // AIC
    artwork.primaryimageurl ||         // Harvard
    artwork.baseimageurl ||            // Harvard
    "";

  return (
    <section className="artwork-detail">
      <h2>{artwork.title || "Untitled"}</h2>

      <div className="artwork-detail__content">
        <img
          ref={imgRef}
          src={firstSrc}
          alt={artwork.title || "Artwork image"}
          className="artwork-detail__image"
          onClick={() => firstSrc && setShowFull(true)}
          onError={handleImgError}
          data-tried={firstSrc || ""}
        />

        <div className="artwork-detail__info">
          <p>
            <strong>Artist:</strong>{" "}
            {artwork.artistDisplayName ||
              artwork.artist_title ||
              (artwork.people && artwork.people[0]?.name) ||
              "Unknown"}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {artwork.objectDate || artwork.date || "N/A"}
          </p>
          <p>
            <strong>Medium:</strong> {artwork.medium || "N/A"}
          </p>
          <p>
            <strong>Department:</strong>{" "}
            {artwork.department || artwork.department_title || "—"}
          </p>

          {artwork.objectURL && (
            <a
              href={artwork.objectURL}
              target="_blank"
              rel="noopener noreferrer"
              className="artwork-detail__link"
            >
              View on Museum Website →
            </a>
          )}
        </div>
      </div>

      {/* Modal de imagem grande */}
      {showFull && (
        <div
          className="artwork-modal"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowFull(false)}
        >
          <div className="artwork-modal__content">
            <img
              src={firstSrc}
              alt={artwork.title || "Artwork image"}
              className="artwork-modal__image"
              onError={handleImgError}
              ref={imgRef}
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
