// background.js — Service Worker (Chrome MV3) / Background Script (Firefox)
// Runs persistently in Firefox, but may be terminated and restarted in Chrome.

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('[Extension] Installed for the first time.');
    // Set default storage values
    chrome.storage.local.set({ clickCount: 0, enabled: true });
  }
  if (reason === 'update') {
    console.log('[Extension] Updated to a new version.');
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Background] Message received:', message, 'from:', sender.tab?.url);

  if (message.type === 'GET_STATUS') {
    chrome.storage.local.get('enabled', (data) => {
      sendResponse({ enabled: data.enabled ?? true });
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'TOGGLE') {
    chrome.storage.local.get('enabled', (data) => {
      const newState = !data.enabled;
      chrome.storage.local.set({ enabled: newState });
      sendResponse({ enabled: newState });
    });
    return true;
  }
});

// Example: react to tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // You can inject scripts, update badge, etc.
    // chrome.action.setBadgeText({ tabId, text: '✓' });
  }
});
