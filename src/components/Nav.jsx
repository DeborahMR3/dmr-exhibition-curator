import "../styling/Nav.css";
import { NavLink } from "react-router-dom";

export default function Nav() {
  return (
    <nav>
      <div className="container">
        <NavLink to="/" end>Home</NavLink>
        <span className="sep" aria-hidden="true">|</span>
        <NavLink to="/exhibition">My Exhibition</NavLink>
      </div>
    </nav>
  );
}
