import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getObject } from "../api/metApi.js";
import "../styling/ArtworkDetail.css";

export default function ArtworkDetail() {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFull, setShowFull] = useState(false); // controla modal

  useEffect(() => {
    async function fetchArtwork() {
      try {
        setLoading(true);
        const data = await getObject(id);
        if (data) setArtwork(data);
        else setError("Artwork not found.");
      } catch (err) {
        setError("Failed to load artwork details.");
      } finally {
        setLoading(false);
      }
    }
    fetchArtwork();
  }, [id]);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!artwork) return null;

  return (
    <section className="artwork-detail">
      <h2>{artwork.title || "Untitled"}</h2>

      <div className="artwork-detail__content">
        <img
          src={artwork.primaryImage || artwork.primaryImageSmall}
          alt={artwork.title}
          className="artwork-detail__image"
          onClick={() => setShowFull(true)}
        />

        <div className="artwork-detail__info">
          <p><strong>Artist:</strong> {artwork.artistDisplayName || "Unknown"}</p>
          <p><strong>Date:</strong> {artwork.objectDate || "N/A"}</p>
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

      {showFull && (
        <div className="artwork-modal" onClick={() => setShowFull(false)} role="dialog" aria-modal="true">
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
