const fs = require("fs");
const PDFDocument = require("pdfkit");
const parse = require("csv-parse/sync");

const csvData = fs.readFileSync("words.csv", "utf8");
const words = parse.parse(csvData, { columns: true, skip_empty_lines: true });

const doc = new PDFDocument({ size: [297.64, 210.12], margin: 0 }); // A8 Querformat
doc.pipe(fs.createWriteStream("cards_a8.pdf"));
doc.registerFont("NotoSansBold", "fonts/NotoSans-Bold.ttf");

const spacingFactor = 0.6;
const borderThickness = 10.0;

function splitArticle(text) {
  const parts = text.trim().split(" ");
  if (
    parts.length > 1 &&
    ["der", "die", "das"].includes(parts[0].toLowerCase())
  ) {
    return { article: parts[0], word: parts.slice(1).join(" ") };
  }
  return { article: "", word: text };
}

words.forEach((entry, index) => {
  if (index > 0) doc.addPage({ size: [297.64, 210.12], margin: 0 });

  const singular = entry.german_article_singular || "";
  const plural = entry.german_plural || "";
  const translation = entry.english_singular || "";

  const { article, word } = splitArticle(singular);

  const maxFont = 50;
  const minFont = 20;
  const wordFontSize = Math.max(minFont, maxFont - word.length * 2);
  const articleFontSize = Math.round(wordFontSize * 0.5);
  const pluralFontSize = Math.round(wordFontSize * 0.5);
  const translationFontSize = Math.round(wordFontSize * 0.3);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // border
  doc
    .lineWidth(borderThickness)
    .strokeColor("black")
    .rect(
      borderThickness / 2,
      borderThickness / 2,
      pageWidth - borderThickness,
      pageHeight - borderThickness,
    )
    .stroke();

  // article + word
  doc.font("NotoSansBold").fontSize(articleFontSize);
  const articleWidth = article ? doc.widthOfString(article + " ") : 0;

  doc.fontSize(wordFontSize);
  const wordWidth = doc.widthOfString(word);
  const totalWidth = articleWidth + wordWidth;

  const opticalCorrection = (wordFontSize - articleFontSize) / 4;
  const baseY = pageHeight / 2 - wordFontSize / 2 - opticalCorrection;
  const startX = (pageWidth - totalWidth) / 2;

  if (article) {
    doc
      .fontSize(articleFontSize)
      .fillColor("black")
      .text(article + " ", startX, baseY + (wordFontSize - articleFontSize), {
        lineBreak: false,
      });
  }

  doc
    .fontSize(wordFontSize)
    .fillColor("black")
    .text(word, startX + articleWidth, baseY, { lineBreak: false });

  // Plural
  const dynamicSpacing = spacingFactor * wordFontSize + word.length * 0.3;
  const pluralY = baseY + wordFontSize + dynamicSpacing;
  doc.fontSize(pluralFontSize).fillColor("gray");
  const pluralWidth = doc.widthOfString(plural);
  const pluralX = (pageWidth - pluralWidth) / 2;

  let x = pluralX;
  for (let i = 0; i < plural.length; i++) {
    const char = plural[i];
    const same = word[i] === char;

    doc
       .fillColor(same ? "gray" : "black")
      .text(char, x, pluralY);
    x += doc.widthOfString(char);
  }

  if (translation.trim() !== "") {
    const padding = 4;
    doc.fontSize(translationFontSize);
    const textWidth = doc.widthOfString(translation);
    const textHeight = translationFontSize * 1.2;

    const boxX = pageWidth - borderThickness - textWidth - padding * 2;
    const boxY = pageHeight - borderThickness - textHeight - padding * 2;

    // black background
    doc
      .save()
      .rect(boxX, boxY, textWidth + padding * 2, textHeight + padding * 2)
      .fill("black");

    // white text
    doc.fillColor("white").text(translation, boxX + padding, boxY + padding);

    doc.restore();
  }
  doc.fillColor("black");
});

doc.end();
console.log("✅ Done: cards_a8.pdf created");
