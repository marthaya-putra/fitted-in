import ReactDOM from "react-dom/client";
import { Content } from "./content";

function injectApp() {
  const container = document.createElement("div");
  container.id = "my-extension-root";
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(<Content />);
}

injectApp();
