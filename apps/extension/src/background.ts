import { actions, ActionType } from "./actions";

async function optimizeResume(jobDescription: string) {
  try {
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

    const result = await response.json();
    return result.resume;
  } catch (error) {
    console.error("Error optimizing resume:", error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener(
  (request: { action: ActionType }, sender, sendResponse) => {
    if (request.action === actions.sidePanelReady) {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0]?.id;

        if (!tabId) {
          sendResponse({ data: "" });
          return true;
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
    }
    if (request.action === actions.openSidePanel) {
      // User clicked the notification, so we can open the sidepanel
      // This is allowed because it's in response to a user gesture (click)
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

        // Step 2: Ask content.js for DOM param
        chrome.tabs.sendMessage(
          tabId,
          { action: actions.extractJobDescription },
          async response => {
            const optimizedResume = await optimizeResume(response?.data || "");
            sendResponse({ data: optimizedResume });
          }
        );
      });
      return true; // Keep message channel open for async response
    }
  }
);

// Update the extension action to show when on LinkedIn job pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    if (tab.url.includes("linkedin.com/jobs")) {
      // Enable the extension action for LinkedIn job pages
      chrome.action.enable(tabId);

      // Set a badge to indicate the extension is active on this page
      chrome.action.setBadgeText({ text: "ON", tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: "#3b82f6", tabId: tabId });
    } else {
      // Disable for non-LinkedIn pages
      chrome.action.disable(tabId);
      chrome.action.setBadgeText({ text: "", tabId: tabId });
    }
  }
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { action: actions.resetPanel }, response => {
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
    });
  }
});

// Extension install/update event
chrome.runtime.onInstalled.addListener(() => {
  // Clear any existing notification data
  chrome.storage.local.remove(["lastNotificationTime"]);

  // Set default action state
  chrome.action.disable();
  chrome.action.setBadgeText({ text: "" });
});

// Handle extension icon click
chrome.action.onClicked.addListener(tab => {
  if (tab.url && tab.url.includes("linkedin.com/jobs")) {
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
