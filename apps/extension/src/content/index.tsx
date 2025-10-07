import ReactDOM from "react-dom/client";
import { Content } from "./content";
import { ActionType } from "../types";

let root: ReactDOM.Root | null = null;
let container: HTMLDivElement | null = null;

function shouldInjectApp(): boolean {
  return location.href.includes("linkedin.com/jobs");
}

function injectApp() {
  if (!shouldInjectApp()) {
    removeApp();
    return;
  }

  if (container) {
    return;
  }

  console.log("[Content]: Injecting app at", location.href);
  container = document.createElement("div");
  container.id = "my-extension-root";
  document.body.appendChild(container);

  root = ReactDOM.createRoot(container);
  root.render(<Content />);
}

function removeApp() {
  if (container && root) {
    console.log("[Content]: Removing app from", location.href);
    root.unmount();
    container.remove();
    container = null;
    root = null;
  }
}

function handleUrlChange() {
  console.log("[Content]: URL changed to", location.href);
  injectApp();
}

injectApp();

const observer = new MutationObserver(mutations => {
  const shouldCheck = mutations.some(mutation => {
    if (mutation.type === "attributes" && mutation.attributeName === "href") {
      return true;
    }
    if (mutation.type === "childList" && mutation.target === document.body) {
      return true;
    }
    return false;
  });

  if (shouldCheck) {
    handleUrlChange();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["href"],
});

window.addEventListener("popstate", handleUrlChange);

chrome.runtime.onMessage.addListener((msg: { action: ActionType }) => {
  if (msg.action === "history-state-updated") {
    injectApp();
    return true;
  }
});
