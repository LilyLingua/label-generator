const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function combineToA4LandscapeWithMargin() {
  const cardsBytes = fs.readFileSync('cards_a8.pdf'); // fertiges A8-PDF
  const cardsDoc = await PDFDocument.load(cardsBytes);
  const outputDoc = await PDFDocument.create();

  const pages = await outputDoc.embedPages(cardsDoc.getPages());

  const A4_WIDTH = 841.89;   // Querformat-Breite
  const A4_HEIGHT = 595.28;  // Querformat-Höhe
  const MARGIN = 14;         // ≈ 5 mm
  const COLS = 4;
  const ROWS = 4;

  const usableWidth = A4_WIDTH - 2 * MARGIN;
  const usableHeight = A4_HEIGHT - 2 * MARGIN;

  const slotWidth = usableWidth / COLS;
  const slotHeight = usableHeight / ROWS;

  let cardIndex = 0;
  let page = outputDoc.addPage([A4_WIDTH, A4_HEIGHT]);

  for (let i = 0; i < pages.length; i++) {
    const col = cardIndex % COLS;
    const row = Math.floor(cardIndex / COLS) % ROWS;

    const x = MARGIN + col * slotWidth;
    const y = A4_HEIGHT - MARGIN - (row + 1) * slotHeight;

    // Karte unverändert einsetzen (kein Rotate!)
    page.drawPage(pages[i], {
      x,
      y,
      width: slotWidth,
      height: slotHeight
    });

    cardIndex++;
    if (cardIndex % (COLS * ROWS) === 0 && i < pages.length - 1) {
      page = outputDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    }
  }

  const pdfBytes = await outputDoc.save();
  fs.writeFileSync('A4_landscape_with_margin.pdf', pdfBytes);
  console.log('✅ Fertig: A4_landscape_with_margin.pdf erstellt');
}

combineToA4LandscapeWithMargin();
