 import React from "react";
 import { createRoot } from "react-dom/client";
-import App from "./App.jsx";
-import "./styles/index.css";
-
-createRoot(document.getElementById("root")).render(<App />);
+import App from "./App.jsx";
+import "./styles/index.css";
+
+// 一時的に AuthGate を外す（ログイン/登録なし運用）
+createRoot(document.getElementById("root")).render(<App />);
