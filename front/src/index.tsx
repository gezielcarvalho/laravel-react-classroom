import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

export function mountRoot() {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// mount automatically when run in the browser
if (document.getElementById("root")) {
  mountRoot();
}
