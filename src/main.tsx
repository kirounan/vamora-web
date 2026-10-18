import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import App from "./App";
const element = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
const path = window.location.pathname.replace(/\/$/, "") || "/";
if (element.dataset.prerendered === "true" && element.dataset.path === path)
  hydrateRoot(element, app);
else createRoot(element).render(app);
