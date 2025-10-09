import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getObject as getMetObject } from "../api/metApi.js";
import { getAICObject } from "../api/aicApi.js";
import { getHarvardObject } from "../api/harvardApi.js";
import "../styling/ArtworkDetail.css";

export default function ArtworkDetail() {
  // agora a URL contém também o museu, além do id
  const { museum, id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFull, setShowFull] = useState(false); // controla modal

  useEffect(() => {
    async function fetchArtwork() {
      try {
        setLoading(true);
        let data;

        // escolhe qual API chamar conforme o museu de origem
        if (museum.includes("met")) {
          data = await getMetObject(id);
        } else if (museum.includes("aic")) {
          data = await getAICObject(id);
        } else if (museum.includes("harvard")) {
          data = await getHarvardObject(id);
        }

        if (data) setArtwork(data);
        else setError("Artwork not found.");
      } catch (err) {
        setError("Failed to load artwork details.");
      } finally {
        setLoading(false);
      }
    }

    fetchArtwork();
  }, [museum, id]);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!artwork) return null;

  return (
    <section className="artwork-detail">
      <h2>{artwork.title || "Untitled"}</h2>

      <div className="artwork-detail__content">
        <img
          // 👉 sempre tenta a “grande” e cai na “small”; o Harvard agora já entrega IIIF válido
          src={artwork.primaryImage || artwork.primaryImageSmall}
          alt={artwork.title}
          className="artwork-detail__image"
          onClick={() => setShowFull(true)}
        />

        <div className="artwork-detail__info">
          <p>
            <strong>Artist:</strong>{" "}
            {artwork.artistDisplayName || "Unknown"}
          </p>
          <p><strong>Date:</strong> {artwork.objectDate || artwork.date || "N/A"}</p>
          <p><strong>Medium:</strong> {artwork.medium || "N/A"}</p>
          <p><strong>Department:</strong> {artwork.department || "—"}</p>

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

      {/* modal da imagem grande */}
      {showFull && (
        <div
          className="artwork-modal"
          onClick={() => setShowFull(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="artwork-modal__content">
            <img
              src={artwork.primaryImage || artwork.primaryImageSmall}
              alt={artwork.title}
              className="artwork-modal__image"
            />
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
