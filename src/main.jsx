import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./styles/global.css";
import "./styles/variables.css";
import "./styles/responsive.css";

// Prevent mouse wheel from changing values on focused number inputs
document.addEventListener("wheel", function (e) {
  if (
    document.activeElement &&
    document.activeElement.tagName === "INPUT" &&
    document.activeElement.type === "number"
  ) {
    document.activeElement.blur();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);