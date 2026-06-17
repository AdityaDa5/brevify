export function getCurrentDateTime() {
  const now = new Date();
  return now;
}

export async function createUniqueId(date, time, url) {
  const combined = `${date}_${time}_${url}`;

  const encoded = new TextEncoder().encode(combined);

  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}

function getFaviconUrl(url) {
  const domain = new URL(url).hostname;

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export function createTableRow(rowData) {
  const row = document.createElement("li");
  row.classList.add("table-row");
  row.id = rowData.dataId;

  const faviconUrl = getFaviconUrl(rowData.webUrl);

  const col1 = document.createElement("div");
  col1.className = "col col-1";
  col1.setAttribute("data-label", "Date");

  const dateSpan = document.createElement("span");
  dateSpan.className = "date";
  dateSpan.textContent = rowData.date;

  const timeSpan = document.createElement("span");
  timeSpan.className = "time";
  timeSpan.textContent = rowData.time;

  col1.appendChild(dateSpan);
  col1.appendChild(timeSpan);

  const col2 = document.createElement("div");
  col2.className = "col col-2 website-col";

  const faviconImg = document.createElement("img");
  faviconImg.className = "favicon";
  faviconImg.setAttribute("src", faviconUrl);
  faviconImg.setAttribute("alt", "Favicon");
  col2.appendChild(faviconImg);

  const col3 = document.createElement("div");
  col3.className = "col col-3";
  col3.setAttribute("data-label", "Summary");
  col3.textContent = rowData.summary;

  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);

  row.addEventListener("click", () => onItemClick(rowData));
  return row;
}

export function showPage(pageClass) {
  document.querySelector(".main-page").classList.add("hidden");
  document.querySelector(".settings-page").classList.add("hidden");
  document.querySelector(".summary-page").classList.add("hidden");

  document.querySelector(pageClass).classList.remove("hidden");
}

function onItemClick(rowData) {
  const summaryPage = document.querySelector(".summary-page");
  summaryPage.classList.remove("hidden");

  const mainPage = document.querySelector(".main-page");
  mainPage.classList.add("hidden");

  const favicon = document.querySelector(".summaryWebUrl");
  favicon.src = getFaviconUrl(rowData.webUrl);

  favicon.addEventListener("click", () => {
    window.open(rowData.webUrl, "_blank");
  });

  document.querySelector(".summary-title").textContent = rowData.title;

  const ulContainer = document.createElement("ul");
  const sentences = rowData.summary.split("\n");

  sentences.forEach((sent) => {
    const li = document.createElement("li");
    li.textContent = sent;
    ulContainer.appendChild(li);
  });

  const summaryBody = document.querySelector(".summary-body");
  summaryBody.replaceChildren(ulContainer);

  console.log(rowData);
}