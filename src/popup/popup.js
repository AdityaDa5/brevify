import { getHistory, saveHistory, clearHistory, saveSettings, getSettings } from "../utils/db.js";

import {
  getCurrentDateTime,
  createUniqueId,
  createTableRow,
  showPage,
} from "./helpers.js";

// ============ Globals ============
let currentPage = 1;
const LIMIT = 10;

let isLoading = false;
let hasMore = true;

let topNSentences = 5;
let autoInjectIntoDOM = true;
let autoDeletePeriodically = false;
const maxNSentences = 15;
const minNSentences = 5;
// ==============================

async function loadMoreData() {
  if (isLoading || !hasMore) return;

  isLoading = true;

  const tableBody = document.querySelector(".table-body");

  const result = await getHistory(currentPage, LIMIT);

  result.data.forEach((item) => {
    const row = createTableRow(item);

    tableBody.appendChild(row);
  });

  hasMore = result.hasMore;
  currentPage++;

  isLoading = false;
}

async function loadSettingsData() {
  const settings = await getSettings();

  topNSentences = settings.topNSentences;
  autoDeletePeriodically = settings.autoDeleteHistory;
  autoInjectIntoDOM = settings.autoInjectIntoDOM;

  document.getElementById("sent-size").textContent = topNSentences;
  document.querySelector(".auto-inject-checkbox").checked = autoInjectIntoDOM;
  document.querySelector(".delete-periodically-checkbox").checked = autoDeletePeriodically;
}

document.addEventListener("DOMContentLoaded", async () => {
  const tableBody = document.querySelector(".table-body");

  await loadSettingsData();

  const deleteButton = document.querySelector(".delete-btn");
  deleteButton.addEventListener("click", async () => {
    await clearHistory();
    tableBody.innerHTML = "";
  });

  const backButtons = document.querySelectorAll(".back-btn");
  backButtons.forEach((bckButton) => {
    bckButton.addEventListener("click", () => {
      showPage(".main-page");
      document.querySelector(".summary-body").innerHTML = "";
    });
  });

  const settingsButton = document.querySelector(".settings-icon");
  settingsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    showPage(".settings-page");
  })

  const sentSize = document.getElementById("sent-size");
  const increaseButton = document.getElementById("increase-btn");
  const decreaseButton = document.getElementById("decrease-btn");

  increaseButton.addEventListener("click", async () => {
    if (topNSentences >= maxNSentences) {
      return;
    }
    topNSentences += 1;
    sentSize.textContent = topNSentences;
    await saveSettings({ topNSentences: topNSentences });
  });

  decreaseButton.addEventListener("click", async () => {
    if (topNSentences <= minNSentences) {
      return;
    }
    topNSentences -= 1;
    sentSize.textContent = topNSentences;
    await saveSettings({ topNSentences: topNSentences });
  });

  const autoInjectCheckbox = document.querySelector(".auto-inject-checkbox");
  autoInjectCheckbox.addEventListener("change", async (e) => {
    await saveSettings({
      autoInjectIntoDOM: e.target.checked
    });

    autoInjectIntoDOM = e.target.checked;
    autoInjectCheckbox.checked = autoInjectIntoDOM;
  });

  const autoDeletePeriodicallyCheckbox = document.querySelector(".delete-periodically-checkbox");
  autoDeletePeriodicallyCheckbox.addEventListener("change", async (e) => {

    let deleteHistoryAt;
    if (e.target.checked) {
      deleteHistoryAt = Date.now() + 15 * 24 * 60 * 60 * 1000;
    } else {
      deleteHistoryAt = null;
    }

    await saveSettings({
      autoDeleteHistory: e.target.checked,
      deleteHistoryAt: deleteHistoryAt
    });

    autoDeletePeriodically = e.target.checked;
    autoDeletePeriodicallyCheckbox.checked = autoDeletePeriodically;

  });

  const actionBtn = document.getElementById("action-btn");
  actionBtn.addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      let response = null;

      if (tab?.id) {
        response = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(
            tab.id,
            {
              action: "startAnalysis",
            },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            },
          );
        });
      }

      if (response) {
        const now = getCurrentDateTime();

        const date = `${now.getDate()}/${now.getUTCMonth() + 1}/${now.getFullYear()}`;

        const time = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const webUrl = response.webUrl;
        const summary = response.summary;
        const title = response.title;

        const dataId = await createUniqueId(date, time, webUrl);

        const item = {
          date,
          time,
          title,
          webUrl,
          summary,
          dataId,
        };
        const row = createTableRow(item);

        tableBody.insertBefore(row, tableBody.children[0]);

        saveHistory(item);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });

  tableBody.addEventListener("scroll", async () => {
    const scrollTop = tableBody.scrollTop;

    const clientHeight = tableBody.clientHeight;

    const scrollHeight = tableBody.scrollHeight;

    if (scrollTop + clientHeight >= scrollHeight - 5) {
      await loadMoreData();
    }
  });

  await loadMoreData();
});
