import React, { useEffect } from "react";
import type { ActionType } from "../types";
import "./content.css";

export const Content: React.FC = () => {
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "content" });

    return () => {
      port.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleRuntimeMessage = (
      request: { action: ActionType },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => {
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
        if (!company && !position) {
          sendResponse({ data: null });
        }
        sendResponse({ data: `${position} at ${company}` });
        return true;
      }
      return false;
    };

    chrome.runtime.onMessage.addListener(handleRuntimeMessage);
    return () => chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
  }, []);

  const handleClick = () => {
    chrome.runtime.sendMessage({ action: "open-side-panel" });
  };

  return (
    <div id="fitted-in-floating-wrapper">
      <div id="fitted-in-floating-banner" onClick={handleClick}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="24" height="24" rx="4" fill="#0A66C2" />
          <text
            x="7"
            y="18"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="bold"
            fontSize="16"
            fill="white"
          >
            fi
          </text>
        </svg>
      </div>
    </div>
  );
};
