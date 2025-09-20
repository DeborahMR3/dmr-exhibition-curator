import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";   // IMPORTA o objeto exportado
import "./styling/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} /> // ENTREGA o objeto para o Provider
);
