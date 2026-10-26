# Label Generator

Printable German vocabulary labels for your home: 148 everyday things with **article, plural and a translation**.
Print them, cut them out and stick them on the things around you – you see the German words every day.

Ready-made PDFs for all languages: **[lilylingua.de/de/lernkarten](https://lilylingua.de/de/lernkarten)**

Examples: [German–English](examples/german-english.pdf) · [German–Spanish](examples/german-spain.pdf) · [German–Ukrainian](examples/german-ukrainian.pdf)

## Languages

German only, or German plus one of 22 languages:

English · Ukrainian · French · Spanish · Farsi · Arabic · Hebrew · Turkish · Portuguese (Brazil) · Italian · Romanian ·
Dutch · Georgian · Hindi · Thai · Chinese (simplified) · Japanese · Korean · Russian · Polish · Kurdish (Kurmanji) · Vietnamese

## Usage

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run cards -- --lang=english             # one language
npm run cards -- --lang=none                # German only
npm run cards -- --lang=farsi --format=a8   # one card per page (A8 landscape)
npm start                                   # all languages
```

The PDFs land in `output/` (`cards-<language>-a4.pdf`). A4 landscape, 16 cards per page – print at 100 % size.

## Your own words

Edit `words.csv`. Columns:

| Column | Example |
|---|---|
| `german_article_singular` | das Bett |
| `german_plural` | Betten |
| `<language>_singular` | bed |
| `<language>_plural` | beds |

Add a new language by adding a `<language>_singular` column – it is picked up automatically.
In the plural, letters that change compared to the singular are printed black, the rest grey.

## How it works

The cards are HTML, printed to PDF with headless Chrome ([Puppeteer](https://pptr.dev)).
That way right-to-left scripts (Arabic, Farsi, Hebrew) and complex scripts (Hindi, Thai, Chinese, Japanese, Korean, Georgian) are set correctly.
The German words use Noto Sans Bold (`fonts/`, SIL Open Font License); the translation fonts come from Google Fonts, so generating needs an internet connection.

## License

MIT – see [LICENSE](LICENSE).
