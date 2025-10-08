import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // ← 追加（Tailwindを有効化）

createRoot(document.getElementById("root")).render(<App />);
