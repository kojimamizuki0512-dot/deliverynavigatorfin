import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import AuthGate from "./components/AuthGate.jsx";

createRoot(document.getElementById("root")).render(
  <AuthGate>
    <App />
  </AuthGate>
);
