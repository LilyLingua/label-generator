// Label generator: German household words with article, plural and a translation, as printable cards.
// Renders HTML with headless Chrome (Puppeteer), so every script works: Arabic, Hebrew, Hindi, Thai, Chinese, Japanese, Korean …
//
// Usage:
//   node generate.js --lang=english            one language (column prefix from words.csv, e.g. farsi, ukrainian, chinese)
//   node generate.js --lang=none               German only, no translation
//   node generate.js --lang=all                every language in words.csv + German only
//   node generate.js --lang=english --format=a8   one card per page (A8 landscape) instead of 16 cards per A4 page
//
// Output: output/cards-<lang>-<format>.pdf
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const puppeteer = require("puppeteer");

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value = "true"] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);
const FORMAT = args.format === "a8" ? "a8" : "a4";
const OUT = path.join(__dirname, args.out || "output");

const words = parse(fs.readFileSync(path.join(__dirname, "words.csv"), "utf8"), { columns: true, skip_empty_lines: true });
const LANGUAGES = Object.keys(words[0])
  .filter((column) => column.endsWith("_singular") && !column.startsWith("german"))
  .map((column) => column.replace(/_singular$/, ""));

// lang/dir attributes per language (font choice and right-to-left layout)
const LANG_ATTR = {
  english: "en", ukrainian: "uk", french: "fr", spanish: "es", farsi: "fa", arabic: "ar", hebrew: "he", turkish: "tr",
  portuguese: "pt-BR", italian: "it", romanian: "ro", dutch: "nl", georgian: "ka", hindi: "hi", thai: "th", chinese: "zh-CN",
  japanese: "ja", korean: "ko", russian: "ru", polish: "pl", kurdish: "ku", vietnamese: "vi", swahili: "sw", albanian: "sq",
  bosnian_croatian_serbian: "bs", bulgarian: "bg", pashto: "ps", urdu: "ur", bengali: "bn", indonesian: "id", filipino: "fil",
};
const RTL = new Set(["farsi", "arabic", "hebrew", "pashto", "urdu"]);

const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function splitArticle(text) {
  const parts = text.trim().split(" ");
  if (parts.length > 1 && ["der", "die", "das"].includes(parts[0].toLowerCase())) {
    return { article: parts[0], word: parts.slice(1).join(" ") };
  }
  return { article: "", word: text.trim() };
}

// Plural: letters that differ from the singular are black, the rest grey
function plural(word, pluralWord) {
  return [...pluralWord].map((char, i) => (word[i] === char ? escape(char) : `<b>${escape(char)}</b>`)).join("");
}

function card(entry, lang) {
  const { article, word } = splitArticle(entry.german_article_singular);
  // font size like the original A8 generator: 50 pt minus 2 pt per letter, at least 20 pt (relative to card width)
  const size = Math.max(20, 50 - word.length * 2) * 0.336;
  const translation = lang === "none" ? "" : (entry[`${lang}_singular`] || "").trim();
  const label = translation
    ? `<span class="tr" lang="${LANG_ATTR[lang] || "und"}" dir="${RTL.has(lang) ? "rtl" : "ltr"}">${escape(translation)}</span>`
    : "";
  return `<div class="card" style="--s:${size.toFixed(2)}cqi"><div class="main">
<div class="de"><span class="art">${escape(article)}</span> <span class="word">${escape(word)}</span></div>
<div class="pl">${plural(word, entry.german_plural || "")}</div></div>${label}</div>`;
}

function html(lang) {
  const perPage = FORMAT === "a4" ? 16 : 1;
  const pages = [];
  for (let i = 0; i < words.length; i += perPage) {
    pages.push(`<section class="page"><div class="grid">${words.slice(i, i + perPage).map((entry) => card(entry, lang)).join("")}</div></section>`);
  }
  // embedded as data URL: Chrome does not load file:// fonts into a page created with setContent
  const font = `data:font/ttf;base64,${fs.readFileSync(path.join(__dirname, "fonts/NotoSans-Bold.ttf")).toString("base64")}`;
  const page = FORMAT === "a4" ? { size: "A4 landscape", w: "297mm", h: "210mm", pad: "5mm", cols: 4 } : { size: "74mm 52mm", w: "74mm", h: "52mm", pad: "0mm", cols: 1 };
  return `<!doctype html><html lang="de"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@600&family=Noto+Sans+Hebrew:wght@600&family=Noto+Sans+Devanagari:wght@600&family=Noto+Sans+Thai:wght@600&family=Noto+Sans+Georgian:wght@600&family=Noto+Sans+SC:wght@600&family=Noto+Sans+JP:wght@600&family=Noto+Sans+KR:wght@600&family=Noto+Sans+Bengali:wght@600&display=block">
<style>
@font-face { font-family: "Noto Sans Card"; src: url("${font}"); font-weight: 700; }
@page { size: ${page.size}; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Noto Sans Card", sans-serif; font-weight: 700; color: #000; }
.page { width: ${page.w}; height: ${page.h}; padding: ${page.pad}; break-after: page; }
.grid { display: grid; grid-template-columns: repeat(${page.cols}, 1fr); grid-template-rows: repeat(${page.cols}, 1fr); width: 100%; height: 100%; }
.card { position: relative; border: 2.4mm solid #000; overflow: hidden; container-type: inline-size; }
.main { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-bottom: 2mm; }
.de { white-space: nowrap; line-height: 1; }
.art { font-size: calc(var(--s) * 0.5); }
.word { font-size: var(--s); }
.pl { margin-top: calc(var(--s) * 0.42); font-size: calc(var(--s) * 0.5); color: #8a8a8a; white-space: nowrap; line-height: 1; }
.pl b { color: #000; }
.tr { position: absolute; right: 0; bottom: 0; max-width: 100%; background: #000; color: #fff; padding: 0.6mm 1.6mm 0.9mm;
  font-size: 8.5pt; line-height: 1.25; white-space: nowrap; font-family: "Noto Sans Card", "Noto Sans Arabic", "Noto Sans Hebrew",
  "Noto Sans Devanagari", "Noto Sans Bengali", "Noto Sans Thai", "Noto Sans Georgian", "Noto Sans SC", sans-serif; }
.tr[lang="ja"] { font-family: "Noto Sans JP", sans-serif; }
.tr[lang="ko"] { font-family: "Noto Sans KR", sans-serif; }
</style></head><body>${pages.join("")}
<script>
// shrink words or translations that are too long for the card
for (const card of document.querySelectorAll(".card")) {
  const de = card.querySelector(".de");
  let s = parseFloat(card.style.getPropertyValue("--s"));
  while (de.scrollWidth > card.clientWidth * 0.9 && s > 3) { s -= 0.25; card.style.setProperty("--s", s + "cqi"); }
  const tr = card.querySelector(".tr");
  let t = 8.5;
  while (tr && tr.scrollWidth > card.clientWidth && t > 5) { t -= 0.25; tr.style.fontSize = t + "pt"; }
}
</script></body></html>`;
}

async function main() {
  const requested = args.lang || "english";
  const languages = requested === "all" ? ["none", ...LANGUAGES] : [requested];
  const unknown = languages.filter((lang) => lang !== "none" && !LANGUAGES.includes(lang));
  if (unknown.length) {
    console.error(`Unknown language: ${unknown.join(", ")}\nAvailable: none, all, ${LANGUAGES.join(", ")}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch();
  for (const lang of languages) {
    const tab = await browser.newPage();
    await tab.setContent(html(lang), { waitUntil: "load", timeout: 120000 });
    await tab.evaluate(() => document.fonts.ready);
    const file = path.join(OUT, `cards-${lang === "none" ? "german" : lang}-${FORMAT}.pdf`);
    await tab.pdf({ path: file, preferCSSPageSize: true, printBackground: true });
    await tab.close();
    console.log(`✅ ${path.relative(__dirname, file)}`);
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
