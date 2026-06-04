import { actions, ActionType } from "./types";
import { shouldEnableSidePanel } from "./utils";

let contentPort: chrome.runtime.Port | null = null;
let sidePanelPorts: Set<chrome.runtime.Port> = new Set();

// Ping server every 14 minutes (840,000 milliseconds)
setInterval(
  async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      console.log("Pinging backend URL:", backendUrl);
      if (!backendUrl) {
        console.warn("VITE_BACKEND_URL is not defined");
        return;
      }
      const response = await fetch(`${backendUrl}/ping`);
      if (response.ok) {
        console.log("Ping successful");
      } else {
        console.warn("Ping failed with status:", response.status);
      }
    } catch (error) {
      console.error("Ping error:", error);
    }
  },
  5 * 60 * 1000
); // 14 minutes

function toggleSidePanel(tabId: number, enabled: boolean): void {
  chrome.sidePanel
    .setOptions({
      tabId,
      enabled,
      path: enabled ? "sidepanel.html" : undefined,
    })
    .then(() => {})
    .catch(err => {
      console.warn("Failed to update sidepanel options:", err);
    });
}

chrome.runtime.onConnect.addListener(port => {
  console.log("onConnect: ", port.name);
  if (port.name === "content") {
    contentPort = port;

    if (sidePanelPorts.size === 0) {
      console.log("Content connected but sidepanel not ready yet");
      return true;
    }

    console.log("Content connected, sidepanel ready - sending update");
    setTimeout(() => {
      if (sidePanelPorts.size > 0) {
        sendResetPanelAndUpdateJobTitle("onConnect:content");
      }
    }, 100);

    port.onDisconnect.addListener(() => {
      console.log("Content is disconnected");
      contentPort = null;
    });
  }

  if (port.name === "sidepanel") {
    console.log("=== SIDE PANEL CONNECT ===");
    console.log("Existing sidepanel ports:", sidePanelPorts.size);
    console.log("New port:", port);

    // Add this port to the set of connected sidepanels
    sidePanelPorts.add(port);

    port.onDisconnect.addListener(() => {
      console.log("Sidepanel disconnected, removing from set");
      sidePanelPorts.delete(port);
    });

    // Check if active tab is LinkedIn before sending update
    chrome.tabs.query({ active: true, currentWindow: true }, activeTabs => {
      const activeTab = activeTabs[0];

      if (!activeTab || !shouldEnableSidePanel(activeTab.url || "")) {
        console.log(
          "Sidepanel connected but active tab is not LinkedIn, clearing job title"
        );
        broadcastToSidepanels({
          action: actions.updateJobTitle,
          data: "",
        });
        return;
      }

      console.log("Sidepanel connected, content ready - sending update");
      // Small delay to ensure content script's useEffect has run
      setTimeout(() => {
        if (sidePanelPorts.size > 0) {
          sendResetPanelAndUpdateJobTitle("onConnect:sidepanel");
        }
      }, 100);
    });
  }
});

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  if (details.frameId === 0) {
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

        // After history state update, refresh job title if sidepanel is ready
        // Use the specific tabId from the event, not query
        if (sidePanelPorts.size > 0) {
          sendResetPanelAndUpdateJobTitleForTab(
            details.tabId,
            "history-updated"
          );
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

    console.log("sidePanelPorts: ", sidePanelPorts.size);
    if (sidePanelPorts.size > 0 && enabled) {
      // Use the specific tabId from the event
      sendResetPanelAndUpdateJobTitleForTab(tabId, "changed url");
    }
  }
});

chrome.tabs.onActivated.addListener(async activeInfo => {
  const tab = await chrome.tabs.get(activeInfo.tabId);

  // Check if activated tab is LinkedIn
  if (tab.url && shouldEnableSidePanel(tab.url)) {
    // Enable sidepanel for this tab without recreating it
    chrome.sidePanel.setOptions({
      tabId: activeInfo.tabId,
      enabled: true,
    });

    if (sidePanelPorts.size > 0) {
      console.log("Tab activated, sending reset panel update");
      sendResetPanelAndUpdateJobTitleForTab(activeInfo.tabId, "tab-activated");
    }
  } else {
    // Activated tab is NOT LinkedIn - clear the job title
    console.log("Non-LinkedIn tab activated, clearing job title");
    broadcastToSidepanels({
      action: actions.updateJobTitle,
      data: "",
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  chrome.action.setBadgeText({ text: "" });
});

function broadcastToSidepanels(message: { action: ActionType; data?: any }) {
  console.log("Broadcasting to", sidePanelPorts.size, "sidepanels:", message);
  sidePanelPorts.forEach(port => {
    try {
      port.postMessage(message);
    } catch (err) {
      console.error("Error sending to sidepanel:", err);
      sidePanelPorts.delete(port);
    }
  });
}

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
    broadcastToSidepanels({ action: actions.streamingEnded });
    return false;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      broadcastToSidepanels({ action: actions.streamingEnded });
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
          broadcastToSidepanels({
            action: actions.optimizationStatus,
            data: parsed.data,
          });
        } else if (parsed.type === "text-delta") {
          broadcastToSidepanels({
            action: actions.streaming,
            data: parsed.delta,
          });
        }
      }
    }
  }
  return true;
}

function sendResetPanelAndUpdateJobTitleForTab(
  tabId: number,
  context?: string
) {
  console.log(
    "Sending resetPanel to specific tab:",
    tabId,
    "context:",
    context
  );
  sendToContentScript(tabId, context);
}

function sendResetPanelAndUpdateJobTitle(context?: string) {
  // First get the current window's active tab, then check if it's LinkedIn
  chrome.tabs.query({ active: true, currentWindow: true }, activeTabs => {
    const activeTab = activeTabs[0];

    if (!activeTab) {
      console.warn("No active tab in current window");
      return;
    }

    console.log("=== sendResetPanelAndUpdateJobTitle ===");
    console.log("Context:", context);
    console.log("Current active tab:", {
      id: activeTab.id,
      url: activeTab.url,
      title: activeTab.title,
    });

    // If active tab is LinkedIn, use it directly
    if (shouldEnableSidePanel(activeTab.url || "")) {
      console.log("Active tab is LinkedIn, using it:", activeTab.id);
      sendToContentScript(activeTab.id!, context);
      return;
    }

    // Active tab is NOT LinkedIn - find LinkedIn tabs in current window only
    chrome.tabs.query(
      { url: "https://www.linkedin.com/jobs/*", currentWindow: true },
      tabs => {
        console.log(
          "LinkedIn tabs in current window:",
          tabs.map(t => ({
            id: t.id,
            url: t.url,
            active: t.active,
            title: t.title,
          }))
        );

        if (!tabs.length) {
          console.warn("No LinkedIn tabs in current window");
          return;
        }

        // Use the first LinkedIn tab in current window
        console.log("Using first LinkedIn tab in current window:", tabs[0].id);
        sendToContentScript(tabs[0].id!, context);
      }
    );
  });
}

function sendToContentScript(tabId: number, context?: string) {
  console.log("=== sendToContentScript ===");
  console.log("TabId:", tabId, "Context:", context);

  // Verify this is actually a LinkedIn tab before sending
  chrome.tabs.get(tabId, tab => {
    console.log("Target tab info:", {
      id: tab.id,
      url: tab.url,
      active: tab.active,
      title: tab.title,
    });
  });

  chrome.tabs.sendMessage(tabId, { action: actions.resetPanel }, response => {
    console.log("sendResetPanelAndUpdateJobTitle callback FIRED");
    console.log(
      "sendResetPanelAndUpdateJobTitle callback - response:",
      response
    );
    console.log(
      "sendResetPanelAndUpdateJobTitle callback - lastError:",
      chrome.runtime.lastError
    );

    if (chrome.runtime.lastError) {
      const errorMessage = context
        ? `Error when ${context}: ${chrome.runtime.lastError.message}`
        : `Error: ${chrome.runtime.lastError.message}`;
      console.warn(errorMessage);
      return;
    }
    if (context) {
      console.log(`response from resetting panel (${context}): `, response);
    }
    console.log("Broadcasting to", sidePanelPorts.size, "sidepanels");
    console.log("Sending to sidepanels:", {
      action: actions.updateJobTitle,
      data: response?.data,
    });

    if (sidePanelPorts.size === 0) {
      console.error("No sidepanel ports connected, cannot send message");
      return;
    }

    broadcastToSidepanels({
      action: actions.updateJobTitle,
      data: response?.data,
    });
    console.log("Message sent to sidepanels successfully");
  });
}
