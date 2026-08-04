import React, { useEffect, useRef } from "react";
import type { ActionType } from "../types";
import "./content.css";

// Return first non-empty trimmed textContent from a list of selectors.
const firstText = (...selectors: string[]): string => {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = el?.textContent?.trim() ?? "";
    if (text) return text;
  }
  return "";
};

// Job description: try primary #job-details, then LinkedIn AI expandable box.
// Remove the "see more" button before reading innerText.
const extractJobDescription = (): string => {
  const primary = document.getElementById("job-details");
  const primaryText = primary?.textContent?.trim() ?? "";
  if (primaryText) return primaryText;

  const box = document
    .querySelector('[data-testid="expandable-text-box"]')
    ?.cloneNode(true) as HTMLElement | null;
  box?.querySelector('[data-testid="expandable-text-button"]')?.remove();
  return box?.innerText?.trim() ?? "";
};

// Resolve company and position, polling until at least one is non-empty.
// The LinkedIn AI job panel renders asynchronously; on in-page navigation
// between jobs the elements are not yet in the DOM when the message arrives.
const resolveCompanyPosition = (
  timeoutMs = 3000,
  intervalMs = 200
): Promise<{ company: string; position: string }> => {
  const deadline = Date.now() + timeoutMs;
  const tryOnce = () => {
    const company = firstText(
      ".job-details-jobs-unified-top-card__company-name",
      'a[href*="/company/"]'
    );
    const position = firstText(
      ".job-details-jobs-unified-top-card__job-title",
      'a[href*="/jobs/view/"]'
    );
    if (company || position) return { company, position };
    if (Date.now() >= deadline) return { company, position };
    return new Promise(r => setTimeout(r, intervalMs)).then(tryOnce);
  };
  return Promise.resolve().then(tryOnce);
};

// Global message handler - outside React lifecycle to prevent cleanup issues
const handleRuntimeMessage = (
  request: { action: ActionType },
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
) => {
  // Check if extension context is still valid
  if (!chrome.runtime?.id) {
    console.warn("Extension context invalidated, ignoring message");
    return false;
  }

  console.log("Content script received message:", request.action);
  if (request.action === "extract-job-description") {
    const data = extractJobDescription();
    console.log("Sending extract-job-description response");
    sendResponse({ data });
    return true;
  }

  if (request.action === "reset-panel") {
    console.log("Received reset-panel request");

    resolveCompanyPosition().then(({ company, position }) => {
      console.log("company: ", company);
      console.log("position: ", position);

      if (!company && !position) {
        console.warn("No company or position found, sending null response");
        sendResponse({ data: null });
      } else {
        const jobTitle = `${position} at ${company}`;
        console.log(`Sending response:`, { data: jobTitle });
        sendResponse({ data: jobTitle });
        console.log("Response sent!");
      }
    });
    return true;
  }
  return false;
};

// Add listener globally once (check if already added to avoid duplicates)
if (!(globalThis as any).contentMessageListenerAdded) {
  chrome.runtime.onMessage.addListener(handleRuntimeMessage);
  (globalThis as any).contentMessageListenerAdded = true;
  console.log("Content script: Message listener added globally");
}

export const Content: React.FC = () => {
  const portRef = useRef<chrome.runtime.Port | null>(null);

  useEffect(() => {
    function connect() {
      const port = chrome.runtime.connect({ name: "content" });
      portRef.current = port;
      console.log("Content: Port connected to background");

      port.onDisconnect.addListener(() => {
        portRef.current = null;
        console.log("Content port disconnected, reconnecting...");
        setTimeout(connect, 1000);
      });
    }

    connect();

    return () => {
      if (portRef.current) {
        portRef.current.disconnect();
        portRef.current = null;
      }
    };
  }, []);

  const handleClick = () => {
    chrome.runtime.sendMessage({ action: "open-side-panel" });
  };

  return (
    <div id="fitted-in-floating-wrapper">
      <div id="fitted-in-floating-banner" onClick={handleClick}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="4"
            y="18"
            fontFamily="'Inter', system-ui, sans-serif"
            fontWeight="700"
            fontSize="18"
            fill="white"
          >
            fi
          </text>
        </svg>
        <span className="fi-label">FittedIn</span>
      </div>
    </div>
  );
};
