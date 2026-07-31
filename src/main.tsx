import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new ReferenceError("First Light root element is missing");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
