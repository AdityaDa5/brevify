// content.js

import { injectSummaryBanner, setSummary } from "../brevify_core/dom_injectors.js";
import { isPageSupported } from "../brevify_core/sanity_checkers.js";
import { generateSummary } from "../brevify_core/summary_generator.js";
import { getSettings, saveSettings, clearHistory, saveHistory } from "../utils/db.js";
import { getPageContent } from "./scrapper.js";
import { createUniqueId } from "../popup/helpers.js";

const ext = typeof browser !== "undefined" ? browser : chrome;

(async () => {
  try {
    console.log("[Brevify] Content script loaded");

    // ==============================
    // Message Listener
    // ==============================

    ext.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {

        if (message.action === "getPageContent") {
          sendResponse(getPageContent());
          return true;
        }

        if (message.action === "startAnalysis") {
          (async () => {
            try {
              const pageContent = getPageContent();
              const settings = await getSettings();
              const summary = generateSummary(
                pageContent.fullText,
                settings.topNSentences
              );

              const summaryText = summary.join("\n");
              const webUrl = window.location.href;
              const title = pageContent.title;

              sendResponse({
                title,
                webUrl,
                summary: summaryText
              });

            } catch (error) {
              console.error(error);
              sendResponse({
                error: error.message
              });
            }
          })();

          return true;
        }

        return false;
      }
    );

    // ==============================
    // Auto Delete History
    // ==============================

    const settings = await getSettings();

    if (
      settings.autoDeleteHistory &&
      settings.deleteHistoryAt &&
      Date.now() >= settings.deleteHistoryAt
    ) {

      await clearHistory();

      await saveSettings({
        deleteHistoryAt:
          Date.now() +
          15 * 24 * 60 * 60 * 1000
      });
    }

    // ==============================
    // Auto Inject Summary Banner
    // ==============================

    if (!settings.autoInjectIntoDOM) {
      return;
    }

    if (!isPageSupported()) {
      return;
    }

    console.log(
      "[Brevify] Injecting summary..."
    );

    if (!injectSummaryBanner()) {
      return;
    }

    const pageContent = getPageContent();

    const summary = generateSummary(
      pageContent.fullText,
      settings.topNSentences
    );

    setSummary(summary);

    console.log(
      "[Brevify] Summary injected"
    );

    const summaryText = summary.join("\n");
    const webUrl = window.location.href;

    const now = new Date();
    const date = `${now.getDate()}/${now.getUTCMonth() + 1}/${now.getFullYear()}`;

    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const title = pageContent.title;

    const dataId = await createUniqueId(date, time, webUrl);

    const item = {
      date,
      time,
      webUrl,
      title,
      summary: summaryText,
      dataId
    };

    saveHistory(item);

    console.log("[Brevify] Added to history");

  } catch (error) {
    console.error(
      "[Brevify] Content Script Error:",
      error
    );
  }
})();