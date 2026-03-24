import ReactDOM from "react-dom/client";
import { Content } from "./content";
import { ActionType } from "../types";

let root: ReactDOM.Root | null = null;
let container: HTMLDivElement | null = null;
let currentUrl = "";

function bootstrapApp() {
  currentUrl = location.pathname;
  container = document.createElement("div");
  container.id = "my-extension-root";
  document.body.appendChild(container);

  root = ReactDOM.createRoot(container);
  root.render(<Content />);
}

chrome.runtime.onMessage.addListener(
  (msg: { action: ActionType; url?: string }, _sender, sendResponse) => {
    // Only process history-state-updated messages with valid URL
    if (msg.action === "history-state-updated" && msg.url) {
      try {
        const urlFromMsg = new URL(msg.url);
        if (urlFromMsg.pathname !== currentUrl) {
          sendResponse("received");
          window.location.reload();
        }
      } catch (err) {
        console.error("Invalid URL in history-state-updated message:", err);
      }
      return true;
    }
    return false;
  }
);

bootstrapApp();
