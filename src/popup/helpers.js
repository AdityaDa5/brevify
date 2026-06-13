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

  row.innerHTML = `
    <div class="col col-1" data-label="Date">
      <span class="date">${rowData.date}</span>
      <span class="time">${rowData.time}</span>
    </div>
     <div class="col col-2 website-col">
    <img class="favicon" src="${faviconUrl}" />
  </div> 
    <div class="col col-3" data-label="Summary">${rowData.summary}</div> 
  `;

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

  document.querySelector(".summary-title").innerHTML = `${rowData.title}`;

  const sentencesList = rowData.summary.split("\n").map(sent =>  `<li>${sent}</li>`);
  const sentences = sentencesList.join("\n");

  document.querySelector(".summary-body").innerHTML =
    `<ul>
      ${sentences}
    </ul>`;

  console.log(rowData);
}

