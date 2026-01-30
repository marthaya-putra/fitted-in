import { actions, ActionType } from "./types";
import { shouldEnableSidePanel } from "./utils";

let isContentReady = false;
let isSidePanelReady = false;

// Ping server every 14 minutes (840,000 milliseconds)
setInterval(
  async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ping`);
      if (response.ok) {
        console.log("Ping successful");
      } else {
        console.warn("Ping failed with status:", response.status);
      }
    } catch (error) {
      console.error("Ping error:", error);
    }
  },
  14 * 60 * 1000
); // 14 minutes

function toggleSidePanel(tabId: number, enabled: boolean): void {
  chrome.sidePanel
    .setOptions({
      tabId,
      enabled,
      path: enabled ? "sidepanel.html" : undefined,
    })
    .then(() => {
      isSidePanelReady = enabled;
    })
    .catch(err => {
      console.warn("Failed to update sidepanel options:", err);
    });
}

chrome.runtime.onConnect.addListener(port => {
  if (port.name === "content") {
    isContentReady = true;

    if (!isSidePanelReady) {
      return true;
    }

    sendResetPanelAndUpdateJobTitle("onConnect:content");

    port.onDisconnect.addListener(() => {
      console.log("Content is disconnected");
      isContentReady = false;
    });
  }

  if (port.name === "sidepanel") {
    isSidePanelReady = true;

    if (!isContentReady) {
      return true;
    }

    sendResetPanelAndUpdateJobTitle("onConnect:sidepanel");

    port.onDisconnect.addListener(() => {
      console.log("Sidepanel is disconnected");
      isSidePanelReady = false;
    });
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  if (details.frameId === 0 && isContentReady) {
    chrome.tabs.sendMessage(
      details.tabId,
      {
        action: actions.historyStateUpdated,
        url: details.url,
      },
      resp => {
        console.warn(
          `[chrome.webNavigation.onHistoryStateUpdated] resp: `,
          resp
        );

        if (chrome.runtime.lastError) {
          const errorMessage = `[chrome.webNavigation.onHistoryStateUpdated] Looks like Content is not ready to receive message: ${chrome.runtime.lastError.message}`;
          console.warn(errorMessage);
          return false;
        }
      }
    );
  }
});

chrome.runtime.onMessage.addListener(
  (request: { action: ActionType }, sender, sendResponse) => {
    if (request.action === actions.openSidePanel) {
      if (sender.tab) {
        if (sender.tab.url && shouldEnableSidePanel(sender.tab.url)) {
          chrome.sidePanel.open({ windowId: sender.tab.windowId });
          sendResponse({ success: true });
        } else {
          sendResponse({
            success: false,
            error: "Side panel is only available on LinkedIn job pages",
          });
        }
        return true;
      } else {
        sendResponse({ success: false, error: "No tab available" });
        return false;
      }
    }

    if (request.action === actions.optimizeResume) {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0]?.id;

        if (!tabId) {
          sendResponse({ data: "" });
          return true;
        }

        chrome.tabs.sendMessage(
          tabId,
          { action: actions.extractJobDescription },
          async response => {
            try {
              const data = await optimizeResume(response?.data || "");
              sendResponse({ data });
            } catch (err) {
              sendResponse({ error: "Unexpected error" });
            }
          }
        );
      });
      return true;
    }
  }
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    if (shouldEnableSidePanel(tab.url)) {
      chrome.action.enable(tabId);
      chrome.action.setBadgeText({ text: "ON", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#3b82f6", tabId: tabId });

      // Enable sidepanel for this tab
      toggleSidePanel(tabId, true);
    } else {
      chrome.action.disable(tabId);
      chrome.action.setBadgeText({ text: "", tabId: tabId });

      // Disable sidepanel for this tab
      toggleSidePanel(tabId, false);
    }
  }

  if (changeInfo.url) {
    const enabled = shouldEnableSidePanel(changeInfo.url);

    toggleSidePanel(tabId, enabled);

    console.log("isContentReady: ", isContentReady);
    console.log("isSidePanelReady: ", isSidePanelReady);
    if (isSidePanelReady && isContentReady) {
      sendResetPanelAndUpdateJobTitle("changed url");
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  chrome.action.setBadgeText({ text: "" });
});

chrome.action.onClicked.addListener(tab => {
  if (tab.url && shouldEnableSidePanel(tab.url)) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

async function optimizeResume(jobDescription: string) {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/api/resumes/optimize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobDescription: jobDescription,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    chrome.runtime.sendMessage({ action: actions.streamingEnded });
    return false;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      chrome.runtime.sendMessage({ action: actions.streamingEnded });
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;

        const parsed = JSON.parse(data);

        if (parsed.type === "data-status") {
          chrome.runtime.sendMessage({
            action: actions.optimizationStatus,
            data: parsed.data,
          });
        } else if (parsed.type === "text-delta") {
          chrome.runtime.sendMessage({
            action: actions.streaming,
            data: parsed.delta,
          });
        }
      }
    }
  }
  return true;
}

function sendResetPanelAndUpdateJobTitle(context?: string) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tabId = tabs[0]?.id;

    if (!tabId) {
      return false;
    }

    chrome.tabs.sendMessage(tabId, { action: actions.resetPanel }, response => {
      if (chrome.runtime.lastError) {
        const errorMessage = context
          ? `No side panel open to receive message when ${context}: ${chrome.runtime.lastError.message}`
          : `No side panel open to receive message: ${chrome.runtime.lastError.message}`;
        console.warn(errorMessage);
        return false;
      }
      if (context) {
        console.log(`response from resetting panel (${context}): `, response);
      }
      chrome.runtime.sendMessage({
        action: actions.updateJobTitle,
        data: response.data,
      });
    });
  });
}
