import React, { useEffect, useRef } from "react";
import type { ActionType } from "../types";
import "./content.css";

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
    const el = document.getElementById("job-details");
    const data = el ? el.textContent : "";
    console.log("Sending extract-job-description response");
    sendResponse({ data });
    return true;
  }

  if (request.action === "reset-panel") {
    console.log("Received reset-panel request");

    const companyEl = document.querySelector(
      ".job-details-jobs-unified-top-card__company-name"
    );
    const positionEl = document.querySelector(
      ".job-details-jobs-unified-top-card__job-title"
    );

    console.log("companyEl: ", companyEl);
    console.log("positionEl: ", positionEl);

    const company = companyEl ? companyEl.textContent : "";
    const position = positionEl ? positionEl.textContent : "";

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
