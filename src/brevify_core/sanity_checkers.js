export function isPageSupported() {
  const isVerificationPage = (
    document.querySelector("#challenge-running") ||
    document.querySelector(".cf-browser-verification") ||
    document.querySelector("#cf-challenge-running") ||
    document.title.toLowerCase().includes("just a moment")
  );

 return !(
    isVerificationPage ||
    location.protocol === "chrome:" ||
    location.protocol === "chrome-extension:" ||
    location.hostname === "localhost" ||
    document.body.innerText.length < 500
  );
}