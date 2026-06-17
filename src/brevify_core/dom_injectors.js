// dom_injectors.js

let contentContainer = null;
let expandButton = null;
let footerContainer = null;
let bannerWrapper = null;

// const BANNER_HEIGHT = 72;

export function injectSummaryBanner() {
  if (document.getElementById("__brevify_border")) {
    return false;
  }

  injectStyles();

  const pageBg =
    getComputedStyle(document.body).backgroundColor ||
    getComputedStyle(document.documentElement).backgroundColor ||
    "#ffffff";

  const borderWrapper = document.createElement("div");
  borderWrapper.id = "__brevify_border";

  // Create main banner container
  const banner = document.createElement("div");
  banner.id = "__brevify_banner";
  banner.style.setProperty("--brevify-bg", pageBg);

  // Create border animation wrapper and its spans
  const animationWrapper = document.createElement("div");
  animationWrapper.className = "brevify-border-animation";
  for (let i = 0; i < 4; i++) {
    const span = document.createElement("span");
    animationWrapper.appendChild(span);
  }
  banner.appendChild(animationWrapper);

  // Create header
  const header = document.createElement("div");
  header.className = "brevify-header";

  // Header Title
  const titleDiv = document.createElement("div");
  titleDiv.className = "brevify-title";
  titleDiv.appendChild(document.createTextNode("Summary by "));
  
  const brandSpan = document.createElement("span");
  brandSpan.className = "brevify-brand";
  brandSpan.textContent = "Brevify";
  titleDiv.appendChild(brandSpan);
  header.appendChild(titleDiv);

  // Controls Container
  const controlsDiv = document.createElement("div");
  controlsDiv.className = "brevify-controls";

  // SVG Helper Function for Name-spaced attributes
  const createSvgEl = (type, attrs) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", type);
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
    return el;
  };

  // Toggle Button
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "__brevify_toggle";
  toggleBtn.className = "brevify-toggle hidden";
  toggleBtn.setAttribute("aria-label", "Expand Summary");

  // Chevron Down SVG
  const chevronDown = createSvgEl("svg", {
    class: "chevron-down",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none"
  });
  const pathDown = createSvgEl("path", {
    d: "M6 9L12 15L18 9",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  chevronDown.appendChild(pathDown);
  toggleBtn.appendChild(chevronDown);

  // Chevron Up SVG
  const chevronUp = createSvgEl("svg", {
    class: "chevron-up hidden",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none"
  });
  const pathUp = createSvgEl("path", {
    d: "M18 15L12 9L6 15",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  chevronUp.appendChild(pathUp);
  toggleBtn.appendChild(chevronUp);
  controlsDiv.appendChild(toggleBtn);

  // Dismiss Button
  const dismissBtn = document.createElement("button");
  dismissBtn.id = "__brevify_dismiss";
  dismissBtn.className = "brevify-dismiss";
  dismissBtn.setAttribute("aria-label", "Dismiss Summary");

  // Dismiss SVG
  const dismissSvg = createSvgEl("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none"
  });
  const dismissPath = createSvgEl("path", {
    d: "M18 6L6 18M6 6L18 18",
    stroke: "currentColor",
    "stroke-width": "2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round"
  });
  dismissSvg.appendChild(dismissPath);
  dismissBtn.appendChild(dismissSvg);
  controlsDiv.appendChild(dismissBtn);

  header.appendChild(controlsDiv);
  banner.appendChild(header);

  // Content Container
  const contentDiv = document.createElement("div");
  contentDiv.id = "__brevify_content";
  contentDiv.className = "brevify-content hidden";
  banner.appendChild(contentDiv);

  // Footer Container
  const footerDiv = document.createElement("div");
  footerDiv.id = "__brevify_footer";
  footerDiv.className = "brevify-footer hidden";
  footerDiv.textContent = "Summaries generated using TextRank";
  banner.appendChild(footerDiv);

  borderWrapper.appendChild(banner);
  document.body.prepend(borderWrapper);

  bannerWrapper = borderWrapper;
  contentContainer = contentDiv;
  expandButton = toggleBtn;
  footerContainer = footerDiv;

  expandButton.addEventListener("click", toggleSummary);
  dismissBtn.addEventListener("click", dismissBanner);

  return true;
}

export function setSummary(summary) {
  if (!contentContainer || !expandButton) {
    return;
  }

  const summaryArray = Array.isArray(summary) ? summary : [summary];

  // Securely purge content using replaceChildren
  contentContainer.replaceChildren();

  summaryArray.forEach((sentence) => {
    const p = document.createElement("p");
    p.className = "brevify-sentence";
    p.textContent = sentence;
    contentContainer.appendChild(p);
  });

  expandButton.classList.remove("hidden");
}

function toggleSummary() {
  const collapsed = contentContainer.classList.contains("hidden");

  const downIcon = expandButton.querySelector(".chevron-down");
  const upIcon = expandButton.querySelector(".chevron-up");

  if (collapsed) {
    contentContainer.classList.remove("hidden");
    footerContainer.classList.remove("hidden");
    downIcon.classList.add("hidden");
    upIcon.classList.remove("hidden");
  } else {
    contentContainer.classList.add("hidden");
    footerContainer.classList.add("hidden");
    upIcon.classList.add("hidden");
    downIcon.classList.remove("hidden");
  }
}

function dismissBanner() {
  if (bannerWrapper) {
    bannerWrapper.style.animation = "brevify-slide-up 0.3s ease-out forwards";

    setTimeout(() => {
      bannerWrapper.remove();
      bannerWrapper = null;
      contentContainer = null;
      expandButton = null;
      footerContainer = null;
    }, 300);
  }
}

function injectStyles() {
  if (document.getElementById("__brevify_styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "__brevify_styles";
  style.textContent = `
  
@keyframes brevify-slide-up {
  from {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
    max-height: 0;
  }
}

#__brevify_border {
  position: relative;

  width: 100%;

  padding: 0;

  margin: 0;

  box-sizing: border-box;

  overflow: hidden;
}

#__brevify_banner {
  position: relative;

  z-index: 1;

  background: var(--brevify-bg);

  padding: 16px 20px;

  color: inherit;

  font-family:
    system-ui,
    sans-serif;

  box-sizing: border-box;

  min-height: 60px;
}

.brevify-border-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.brevify-border-animation span {
  position: absolute;
  display: block;
}

.brevify-border-animation span:nth-child(1) {
  top: 0;
  left: -100%;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #52b788, #2dc653, #52b788, transparent);
  animation: brevify-animate1 8s linear infinite;
}

@keyframes brevify-animate1 {
  0% {
    left: -100%;
  }
  50%, 100% {
    left: 100%;
  }
}

.brevify-border-animation span:nth-child(2) {
  top: -100%;
  right: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #52b788, #2dc653, #52b788, transparent);
  animation: brevify-animate2 8s linear infinite;
  animation-delay: 2s;
}

@keyframes brevify-animate2 {
  0% {
    top: -100%;
  }
  50%, 100% {
    top: 100%;
  }
}

.brevify-border-animation span:nth-child(3) {
  bottom: 0;
  right: -100%;
  width: 100%;
  height: 3px;
  background: linear-gradient(270deg, transparent, #52b788, #2dc653, #52b788, transparent);
  animation: brevify-animate3 8s linear infinite;
  animation-delay: 4s;
}

@keyframes brevify-animate3 {
  0% {
    right: -100%;
  }
  50%, 100% {
    right: 100%;
  }
}

.brevify-border-animation span:nth-child(4) {
  bottom: -100%;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(360deg, transparent, #52b788, #2dc653, #52b788, transparent);
  animation: brevify-animate4 8s linear infinite;
  animation-delay: 6s;
}

@keyframes brevify-animate4 {
  0% {
    bottom: -100%;
  }
  50%, 100% {
    bottom: 100%;
  }
}

.brevify-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 12px;

  position: relative;

  z-index: 2;
}

.brevify-title {
  font-size: 16px;

  font-weight: 600;

  color: inherit;
}

.brevify-brand {
  color: #52b788;

  font-style: italic;

  font-weight: 700;
}

.brevify-controls {
  display: flex;

  align-items: center;

  gap: 8px;
}

.brevify-toggle,
.brevify-dismiss {
  display: flex;

  align-items: center;

  justify-content: center;

  border: none;

  background: transparent;

  color: inherit;

  cursor: pointer;

  padding: 4px;

  transition: opacity 0.2s;
}

.brevify-toggle:hover,
.brevify-dismiss:hover {
  opacity: 0.6;
}

.brevify-dismiss {
  opacity: 0.7;
}

.brevify-content {
  margin-top: 14px;

  position: relative;

  z-index: 2;
}

.brevify-sentence {
  line-height: 1.7;

  margin-bottom: 10px;

  color: inherit;

  font-size: inherit;
}

.brevify-footer {
  margin-top: 12px;

  font-size: 11px;

  opacity: 0.65;

  text-align: left;

  position: relative;

  z-index: 2;
}

.hidden {
  display: none !important;
}
`;

  document.head.appendChild(style);
}