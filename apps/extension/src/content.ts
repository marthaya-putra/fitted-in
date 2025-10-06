import { ActionType } from "./types";

function createNotification(): void {
  const existing = document.getElementById("fitted-in-notification");
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement("div");
  notification.id = "fitted-in-notification";
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 60px;
    height: 60px;
    background: #0A66C2;
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(10, 102, 194, 0.3);
    z-index: 999999;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: slideInRight 0.3s ease-out;
    transition: all 0.2s ease;
  `;

  const icon = createIcon();
  notification.appendChild(icon);

  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%) translateY(-50%); opacity: 0; }
      to { transform: translateX(0) translateY(-50%); opacity: 1; }
    }

    #fitted-in-notification:hover {
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 6px 20px rgba(10, 102, 194, 0.4);
    }
  `;
  document.head.appendChild(style);

  notification.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "open-side-panel" });
  });

  document.body.appendChild(notification);
}

function createIcon() {
  const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  iconSvg.setAttribute("width", "32");
  iconSvg.setAttribute("height", "32");
  iconSvg.setAttribute("viewBox", "0 0 24 24");

  // Blue square background
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "24");
  rect.setAttribute("height", "24");
  rect.setAttribute("rx", "4");
  rect.setAttribute("fill", "#0A66C2");

  // FI text
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "7");
  text.setAttribute("y", "18");
  text.setAttribute("font-family", "Arial, Helvetica, sans-serif");
  text.setAttribute("font-weight", "bold");
  text.setAttribute("font-size", "16");
  text.setAttribute("fill", "white");
  text.textContent = "fi";

  iconSvg.appendChild(rect);
  iconSvg.appendChild(text);

  return iconSvg;
}

setTimeout(() => {
  createNotification();
}, 500);

chrome.runtime.onMessage.addListener(
  (request: { action: ActionType }, _sender, sendResponse) => {
    if (request.action === "extract-job-description") {
      const el = document.getElementById("job-details");
      const data = el ? el.textContent : "";
      sendResponse({ data });
      return true;
    }

    if (request.action === "reset-panel") {
      const companyEl = document.querySelector(
        ".job-details-jobs-unified-top-card__company-name"
      );
      const positionEl = document.querySelector(
        ".job-details-jobs-unified-top-card__job-title"
      );

      const company = companyEl ? companyEl.textContent : "";
      const position = positionEl ? positionEl.textContent : "";
      sendResponse({ data: `${position} at ${company}` });
      return true;
    }
    return false;
  }
);
