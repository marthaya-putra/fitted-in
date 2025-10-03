import { ActionType } from "./actions";
// Simple content script without React dependencies

function createNotification(): void {
  // Remove any existing notification
  const existing = document.getElementById("fitted-in-notification");
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement("div");
  notification.id = "fitted-in-notification";

  const notificationInner = document.createElement("div");
  notificationInner.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #3b82f6;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideIn 0.3s ease-out;
  `;

  const span = document.createElement("span");
  span.textContent = "fitted-in is available! Click to open";

  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.style.cssText = `
    background: none;
    border: none;
    color: white;
    margin-left: 8px;
    cursor: pointer;
    font-size: 16px;
  `;
  closeButton.addEventListener("click", e => {
    e.stopPropagation();
    notification.remove();
  });

  notificationInner.appendChild(span);
  notificationInner.appendChild(closeButton);
  notification.appendChild(notificationInner);

  // Add CSS animation
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  notification.addEventListener("click", () => {
    // Send message to background to toggle sidepanel
    chrome.runtime.sendMessage({ action: "open-side-panel" });
  });

  document.body.appendChild(notification);
}

// Show notification whenever LinkedIn jobs page is visited
setTimeout(() => {
  createNotification();
}, 500); // Show after 500ms

// Listen for messages from background script
chrome.runtime.onMessage.addListener(
  (request: { action: ActionType }, _sender, sendResponse) => {
    if (request.action === "extract-job-description") {
      const el = document.getElementById("job-details");
      const data = el ? el.textContent : "";
      sendResponse({ data });
      return true; // Keep message channel open for async response
    }

    if (request.action === "reset-panel") {
      const el = document.querySelector(
        ".job-details-jobs-unified-top-card__job-title"
      );
      console.log({ el });
      const data = el ? el.textContent : "";
      sendResponse({ data });
      return true; // Keep message channel open for async response
    }
    return false; // No async response needed for other actions
  }
);

console.log("fitted-in content script loaded on LinkedIn Jobs");
