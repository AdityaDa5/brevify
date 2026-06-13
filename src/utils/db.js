export async function saveHistory(item) {
  const result = await chrome.storage.local.get("History");

  const history = result["History"] || [];

  history.unshift(item);

  await chrome.storage.local.set({
    ["History"]: history,
  });
}

export async function getHistory(page = 1, limit = 10) {
  const result = await chrome.storage.local.get("History");

  const history = result["History"] || [];

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: history.slice(start, end),
    total: history.length,
    hasMore: end < history.length,
  };
}

export async function saveSettings(settingsValue) {
  const result = await chrome.storage.local.get("Settings");

  const settings = result["Settings"] || {};

  const existingSettings = {
    topNSentences: settings.topNSentences ?? 5,
    autoInjectIntoDOM: settings.autoInjectIntoDOM ?? true,
    autoDeleteHistory: settings.autoDeleteHistory ?? false,
    deleteHistoryAt: settings.deleteHistoryAt ?? null,
  };

  const updatedSettings = {
    topNSentences:
      settingsValue.topNSentences ?? existingSettings.topNSentences,
    autoInjectIntoDOM:
      settingsValue.autoInjectIntoDOM ?? existingSettings.autoInjectIntoDOM,
    autoDeleteHistory:
      settingsValue.autoDeleteHistory ?? existingSettings.autoDeleteHistory,
    deleteHistoryAt:
      settingsValue.deleteHistoryAt ?? existingSettings.deleteHistoryAt,
  };

  await chrome.storage.local.set({
    Settings: updatedSettings,
  });
}

export async function getSettings() {
  const result = await chrome.storage.local.get("Settings");

  const settings = result["Settings"] || {};

  return {
    topNSentences: settings.topNSentences ?? 5,
    autoInjectIntoDOM: settings.autoInjectIntoDOM ?? true,
    autoDeleteHistory: settings.autoDeleteHistory ?? false,
    deleteHistoryAt: settings.deleteHistoryAt ?? null,
  };
}

export async function clearHistory() {
  await chrome.storage.local.remove("History");
}
