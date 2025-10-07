import ReactDOM from "react-dom/client";
import { Content } from "./content";

let root: ReactDOM.Root | null = null;
let container: HTMLDivElement | null = null;

function shouldInjectApp(): boolean {
  return (
    location.href.includes("linkedin.com/jobs") &&
    location.href.includes("currentJobId")
  );
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

const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function (
  this: History,
  ...args: Parameters<typeof originalPushState>
) {
  const result = originalPushState.apply(this, args);
  handleUrlChange();
  return result;
};

history.replaceState = function (
  this: History,
  ...args: Parameters<typeof originalReplaceState>
) {
  const result = originalReplaceState.apply(this, args);
  handleUrlChange();
  return result;
};

window.addEventListener("popstate", handleUrlChange);
