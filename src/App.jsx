import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Exhibition from "./pages/Exhibition.jsx";
import ArtworkDetail from "./pages/ArtworkDetail.jsx"; // página de detalhes

import "./styling/App.css"; // estilos de layout

// provider do contexto (guarda a exposição)
import { ExhibitionProvider } from "./context/ExhibitionContext.jsx";

export default function App() {
  return (
    <ExhibitionProvider>
      {/* tudo dentro desse provider pode usar useExhibition() */}

      <Header />
      <Nav />
      <main>
        <Routes>
          {/* página inicial com busca */}
          <Route path="/" element={<Home />} />

          {/* página da exposição */}
          <Route path="/exhibition" element={<Exhibition />} />

          {/* nova rota de detalhes da obra */}
          <Route path="/artwork/:museum/:id" element={<ArtworkDetail />} />

          {/* rota curinga (sempre no final!) */}
          <Route path="*" element={<h2 style={{ padding: 16 }}>Page Not Found</h2>} />
        </Routes>
      </main>

      <Footer />
    </ExhibitionProvider>
  );
}


// export default function App() {
//   return (
//     <>
//       <Header />
//       <Nav />
//       <main>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/exhibition" element={<Exhibition />} />
//           <Route path="*" element={<h2 style={{ padding: 16 }}>Page Not Found</h2>} />
//         </Routes>
//       </main>
//       <Footer />
//     </>
//   );
// }
