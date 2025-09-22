import { useState } from "react";
import { searchObjects, getObject } from "../api/metApi.js";

export default function Home() {
  const [obj, setObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleLoadOne() {
    setLoading(true);
    setError("");
    setObj(null);

    searchObjects("portrait")
      .then(function (data) {
        const firstId = (data.objectIDs && data.objectIDs[0]) ? data.objectIDs[0] : null;

        if (!firstId) {
          setError("No results found.");
          throw new Error("No IDs returned");
        }

        return getObject(firstId);
      })
      .then(function (details) {
        setObj(details);
      })
      .catch(function (error) {
        console.error(error);
        setError("Request failed.");
      })
      .finally(function () {
        setLoading(false);
      });
  }

  return (
    <section style={{ padding: 20 }}>
      <h2>The Met — step by step</h2>
      <button onClick={handleLoadOne} disabled={loading}>
        {loading ? "Loading..." : "Load ONE artwork"}
      </button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {obj && (
        <div>
          <p><b>Title:</b> {obj.title || "Untitled"}</p>
          <p><b>Artist:</b> {obj.artistDisplayName || "Unknown"}</p>
        </div>
      )}
    </section>
  );
}



// import "../styling/Home.css";

// export default function Home() {
//   return (
//     <section className="home container">
//       <h2>Welcome to Exhibition Curator</h2>
//       <p>
//         Start curating your own exhibition by exploring artworks and adding them
//         to your personal collection.
//       </p>
//     </section>
//   );
// }
