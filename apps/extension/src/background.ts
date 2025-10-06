import {
  actions,
  ActionType,
  SidePanelState,
  sidePanelStateStorageKey,
} from "./types";

async function optimizeResume(jobDescription: string) {
  const response = await fetch("http://localhost:3001/api/resumes/optimize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobDescription: jobDescription,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    chrome.runtime.sendMessage({ action: actions.streamingEnded });
    return false;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      chrome.runtime.sendMessage({ action: actions.streamingEnded });
      break;
    }
    chrome.runtime.sendMessage({
      action: actions.streaming,
      data: decoder.decode(value, { stream: true }),
    });
  }
  return true;
}

chrome.runtime.onConnect.addListener(port => {
  if (port.name === "sidepanel") {
    chrome.storage.local.set({ [sidePanelStateStorageKey]: "opened" }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0]?.id;

        if (!tabId) {
          return false;
        }

        chrome.tabs.sendMessage(
          tabId,
          { action: actions.resetPanel },
          response => {
            if (chrome.runtime.lastError) {
              console.warn(
                "No side panel open to receive message:",
                chrome.runtime.lastError.message
              );
              return;
            }
            chrome.runtime.sendMessage({
              action: actions.updateJobTitle,
              data: response.data,
            });
          }
        );
      });
    });

    port.onDisconnect.addListener(() => {
      chrome.storage.local.set({ [sidePanelStateStorageKey]: null });
    });
  }
});

chrome.runtime.onMessage.addListener(
  (request: { action: ActionType }, sender, sendResponse) => {
    if (request.action === actions.openSidePanel) {
      if (sender.tab) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
        sendResponse({ success: true });
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
    if (tab.url.includes("linkedin.com/jobs")) {
      chrome.action.enable(tabId);
      chrome.action.setBadgeText({ text: "ON", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#3b82f6", tabId: tabId });
    } else {
      chrome.action.disable(tabId);
      chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
  }

  if (changeInfo.url) {
    chrome.storage.local.get([sidePanelStateStorageKey], res => {
      if ((res[sidePanelStateStorageKey] as SidePanelState) === "opened") {
        chrome.tabs.sendMessage(
          tabId,
          { action: actions.resetPanel },
          response => {
            if (chrome.runtime.lastError) {
              console.warn(
                "No side panel open to receive message:",
                chrome.runtime.lastError.message
              );
              return;
            }
            chrome.runtime.sendMessage({
              action: actions.updateJobTitle,
              data: response.data,
            });
          }
        );
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.remove(["lastNotificationTime"]);
  chrome.action.disable();
  chrome.action.setBadgeText({ text: "" });
});
chrome.action.onClicked.addListener(tab => {
  if (tab.url && tab.url.includes("linkedin.com/jobs")) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
