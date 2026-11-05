# Label Generator

Printable German vocabulary labels for your home: 148 everyday things with **article, plural and a translation**.
Print them, cut them out and stick them on the things around you – you see the German words every day.

Ready-made PDFs for all languages: **[lilylingua.de/de/lernkarten](https://lilylingua.de/de/lernkarten)**

Examples: [German–English](examples/german-english.pdf) · [German–Spanish](examples/german-spain.pdf) · [German–Ukrainian](examples/german-ukrainian.pdf)

## Languages

German only, or German plus one of 31 languages:

English · Ukrainian · French · Spanish · Farsi · Arabic · Hebrew · Turkish · Portuguese (Brazil) · Italian · Romanian ·
Dutch · Georgian · Hindi · Thai · Chinese (simplified) · Japanese · Korean · Russian · Polish · Kurdish (Kurmanji) · Vietnamese ·
Swahili · Albanian · Bosnian/Croatian/Serbian · Bulgarian · Pashto · Urdu · Bengali · Indonesian · Filipino

## Translations

All translations were made by AI – **Anthropic Claude Opus 5.5** (November 2026; earlier versions partly used OpenAI gpt-4.1, all of those were replaced).
They have not been checked by native speakers yet and may contain mistakes.
Found a wrong or unusual word? Please open an issue or a pull request with the fix in `words.csv`.

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
That way right-to-left scripts (Arabic, Farsi, Hebrew, Urdu, Pashto) and complex scripts (Hindi, Bengali, Thai, Chinese, Japanese, Korean, Georgian) are set correctly.

## Fonts

Only free fonts under the [SIL Open Font License 1.1](https://openfontlicense.org), all loaded locally – generating needs no internet connection and sends nothing to Google Fonts:

| Font | Used for | Source |
|---|---|---|
| Noto Sans Bold | German words, Latin, Cyrillic, Devanagari | [`fonts/`](fonts/) with [`OFL.txt`](fonts/OFL.txt) |
| Noto Sans Arabic, Hebrew, Bengali, Thai, Georgian, SC, JP, KR (SemiBold) | translations in these scripts | [Fontsource](https://fontsource.org) npm packages, installed by `npm install` (license file in each package) |

There is no system font fallback (no Arial, Helvetica or Segoe), so the PDFs embed Noto fonts only.
Check a PDF with `pdffonts output/cards-japanese-a4.pdf`.
The fonts are embedded in the PDFs as subsets, which the OFL allows: you may print, share and sell the PDFs.

## License

Code and word list: MIT – see [LICENSE](LICENSE).
Fonts: SIL Open Font License 1.1 – see [`fonts/OFL.txt`](fonts/OFL.txt) and the `LICENSE` file in each `@fontsource` package.
