import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Exhibition from "./pages/Exhibition.jsx";

/* estilos de layout que não são globais podem ficar aqui */
import "./styling/App.css";

export default function App() {
  return (
    <>
      <Header />
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exhibition" element={<Exhibition />} />
          <Route path="*" element={<h2 style={{ padding: 16 }}>Page Not Found</h2>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
