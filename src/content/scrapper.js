export function getPageContent() {
  const title = document.title;

  const paragraphs = Array.from(document.querySelectorAll("p"))
    .map((p) => p.innerText.trim())
    .filter((p) => p.length > 0)
    .join(" ");

  const headings = Array.from(
    document.querySelectorAll("h1", "h2", "h3", "h4", "h5", "h6"),
  )
    .map((h) => h.innerText.trim())
    .filter((h) => h.length > 0)
    .join("\n");

  const fullText = `${headings} \n${paragraphs}`;

  return {
    title,
    fullText,
  };
}
