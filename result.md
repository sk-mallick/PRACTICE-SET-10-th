# ENGLISHJIBI Practice Set — Project Documentation

> **Project:** GrammarHub / ENGLISHJIBI Practice Set  
> **Author:** Chiranjibi Sir (Content) · Subham Kumar Mallick (Web Design)  
> **Stack:** Vanilla HTML · Tailwind CSS (CDN) · ES Modules (JavaScript)  
> **Generated:** 2026-03-15  
> **Last Updated:** 2026-03-16

---

## 1. Project Overview

ENGLISHJIBI Practice Set is a **static, serverless web application** for English grammar practice. It serves interactive **MCQ (Multiple Choice Questions)**, **Fill-in-the-Blank**, and **Find-the-Error** exercises organized by grammar topic, difficulty level, and numbered sets. There is no backend — all data lives in JSON files, and the app runs entirely in the browser using ES Modules.

---

## 2. Directory Structure

```
PRACTICE-SET/
│
├── index.html                ← Landing page (card grid of all available topics)
├── icon.png                  ← Favicon
├── CODE.TXT                  ← Legacy Python utility (splitting set.json → setN.json)
├── setup_topic.py            ← Interactive wizard: creates topic folders + config.js
├── split_sets.py             ← Interactive wizard: splits set.json → set1.json, set2.json, …
├── README.md                 ← Minimal readme
├── result.md                 ← This documentation file
│
├── engine/                   ← Quiz engine HTML shells (one per question type)
│   ├── mcq.html              ← MCQ quiz page (loads mcq-engine.js)
│   ├── fill.html             ← Fill-in-the-blank quiz page (loads fill-engine.js)
│   └── error.html            ← Find-the-Error quiz page (loads error-engine.js)
│
├── js/                       ← All JavaScript logic (ES Modules)
│   ├── ui.js                 ← Shared UI toolkit (header, menu, sound, confetti, skeletons, UX utils)
│   ├── index-loader.js       ← Auto-discovery: scans data/ for config.js, builds index grid
│   ├── mcq-engine.js         ← MCQ quiz logic (load, validate, render, answer handling)
│   ├── fill-engine.js        ← Fill-in-the-blank quiz logic (same architecture as MCQ)
│   └── error-engine.js       ← Find-the-Error quiz logic (sentence parts + correction display)
│
├── components/               ← Small standalone scripts
│   ├── header.js             ← (empty – header is injected by ui.js)
│   └── footer.js             ← Adds click-to-portfolio on footer element
│
└── data/                     ← ALL QUESTION DATA (the heart of the project)
    ├── tenses/
    │   ├── primary/          ← Level: Primary
    │   │   ├── config.js
    │   │   ├── set.json      ← Master question bank (all questions combined)
    │   │   ├── set1.json     ← Individual set (split from set.json)
    │   │   └── ...
    │   ├── middle/           ← Level: Middle
    │   │   ├── config.js
    │   │   ├── set.json
    │   │   └── set1–set9.json
    │   └── high/             ← Level: High
    │       ├── config.js
    │       ├── set.json
    │       └── set1–set22.json
    │
    ├── sva/                  ← Subject-Verb Agreement
    │   ├── primary/
    │   │   ├── config.js
    │   │   ├── set.json
    │   │   └── set1–set13.json
    │   ├── middle/
    │   │   ├── config.js
    │   │   ├── set.json
    │   │   └── set1–set4.json
    │   └── high/
    │       ├── config.js
    │       ├── set.json
    │       └── set1–set10.json
    │
    └── preposition/          ← Preposition
        ├── primary/          ← MCQ fill-in-the-blank (10 sets)
        │   ├── config.js
        │   ├── set.json
        │   └── set1–set10.json
        ├── middle/           ← MCQ fill-in-the-blank (7 sets)
        │   ├── config.js
        │   ├── set.json
        │   └── set1–set7.json
        └── high/             ← Find-the-Error format (1 set, 15 questions)
            ├── config.js     ← engine: "error"
            ├── set.json
            └── set1.json
```

---

## 3. Data Architecture (Core Design)

### 3.1 Hierarchy Model

The data is organized in a **3-tier hierarchy**:

```
data / <SUBJECT> / <LEVEL> / setN.json
```

| Tier        | Values                                                        | Purpose                    |
| ----------- | ------------------------------------------------------------- | -------------------------- |
| **Subject** | `tenses`, `sva`, `preposition` (expandable to 12+ topics)    | Grammar topic              |
| **Level**   | `primary`, `middle`, `high`                                   | Difficulty / student grade |
| **Set**     | `set1.json`, `set2.json`, …                                   | Paginated question batches |

### 3.2 `config.js` — Per-Level Configuration

Each `data/<subject>/<level>/` folder contains a `config.js` file that serves as the **metadata manifest**. It is a standard ES Module exporting a default object:

```js
export default {
    order: 3,                       // Display order on the index page (01, 02, ...)
    title: "Tenses",                // Card title text
    description: "22 Sets • 20 Questions Each - H",  // Card subtitle
    engine: "mcq",                  // Which engine to use: "mcq" | "fill" | "error"
    icon: "book",                   // Icon key: "time" | "list" | "book" | "chat"
    sets: 22,                       // Total number of setN.json files
    level: "H",                     // Short level label

    headerTitle: "TIME & TENSE PRACTICE",        // Engine page header
    headerSubtitlePrefix: "By Chiranjibi Sir",   // Subtitle prefix
    pdfheader: "Time & Tense"                    // PDF export header
}
```

**Key config properties:**

| Property                 | Type     | Description                                                              |
| ------------------------ | -------- | ------------------------------------------------------------------------ |
| `order`                  | `number` | Sort order for the index grid cards                                      |
| `title`                  | `string` | Bold title shown on index card                                           |
| `description`            | `string` | Descriptive text (set count, question count, level)                      |
| `engine`                 | `string` | `"mcq"` → MCQ, `"fill"` → Fill-in-the-blank, `"error"` → Find-the-Error |
| `icon`                   | `string` | SVG icon key (`time`, `list`, `book`, `chat`)                            |
| `sets`                   | `number` | Total set count — used for **zero-network** set discovery                |
| `level`                  | `string` | Short label (`P` / `M` / `H`)                                           |
| `headerTitle`            | `string` | Page title inside the engine view                                        |
| `headerSubtitlePrefix`   | `string` | Subtitle line before "• LEVEL • SET N"                                   |
| `pdfheader`              | `string` | Title used for PDF generation                                            |

### 3.3 Question Data Schemas (`setN.json`)

Each set file is a **JSON array** of question objects. The schema varies by engine type:

#### 3.3.1 MCQ Question (used by `mcq-engine.js`)

```json
{
  "q": "It is time we ______ with determination.",
  "options": ["act", "acted", "have acted", "will act"],
  "answer": 1
}
```

| Field     | Type       | Required | Description                                                                   |
| --------- | ---------- | -------- | ----------------------------------------------------------------------------- |
| `q`       | `string`   | ✅       | Question text. Blanks represented by `__` (2+ underscores), `...`, or `…`     |
| `options` | `string[]` | ✅       | Array of answer choices (minimum 2). Typically 4 options                      |
| `answer`  | `number`   | ✅       | **Zero-based index** into the `options` array pointing to the correct answer  |

**Validation:** `q` non-empty string, `options` array ≥ 2 elements, `0 ≤ answer < options.length`. Options are **shuffled** on render using Fisher-Yates algorithm.

#### 3.3.2 Fill-in-the-Blank Question (used by `fill-engine.js`)

```json
{
  "q": "One of the pupils in our class ______ a car.",
  "options": ["own", "owns"],
  "answer": 1
}
```

Same schema as MCQ. Typically has 2–3 options. The blank in the question text is filled inline when the student clicks the correct option.

#### 3.3.3 Find-the-Error Question (used by `error-engine.js`) — NEW

```json
{
  "q": "They all met in a room / which was close to the centre / to discuss about the plan of action.",
  "options": [
    "They all met in a room",
    "which was close to the centre",
    "to discuss about the plan of action.",
    "No error"
  ],
  "answer": 2,
  "correction": "discuss about → discuss"
}
```

| Field        | Type       | Required | Description                                                                         |
| ------------ | ---------- | -------- | ----------------------------------------------------------------------------------- |
| `q`          | `string`   | ✅       | Full sentence with parts separated by `/` — displayed in the question header        |
| `options`    | `string[]` | ✅       | Array of sentence parts + "No error" as last option. Typically 4 options             |
| `answer`     | `number`   | ✅       | **Zero-based index** into the `options` array pointing to the error part             |
| `correction` | `string`   | ✅       | Explanation shown after correct answer (e.g., `"discuss about → discuss"`). Empty string for "No error" questions |

**Key differences from MCQ:**
- Uses same `q`/`options`/`answer` schema — plus `correction` field
- Options are **NOT shuffled** — displayed in original sentence order
- `/` separators in `q` are rendered as styled dividers
- Option labels use `(1)`, `(2)`, `(3)`, `(4)` instead of A, B, C, D
- Correction banner appears below options after correct answer

### 3.4 Master File (`set.json`)

Each level folder also contains a `set.json` which is the **complete, unsplit question bank**. The Python utilities (`split_sets.py` or `CODE.TXT`) split this master file into paginated `setN.json` files (default: 25 questions per set). This master file is not used at runtime.

### 3.5 Data Statistics

| Subject                        | Level   | Sets | Questions | Engine |
| ------------------------------ | ------- | ---- | --------- | ------ |
| Tenses                         | Primary |  4   |    80     | MCQ    |
| Tenses                         | Middle  |  9   |   225     | MCQ    |
| Tenses                         | High    | 22   |   435     | MCQ    |
| Subject-Verb Agreement         | Primary | 13   |   195     | Fill   |
| Subject-Verb Agreement         | Middle  |  4   |    60     | Fill   |
| Subject-Verb Agreement         | High    | 10   |   250     | MCQ    |
| Preposition                    | Primary | 10   |   150     | MCQ    |
| Preposition                    | Middle  |  7   |   105     | MCQ    |
| Preposition — Error Finding    | High    |  1   |    15     | Error  |
| **Total**                      |         | **80** | **1,515** |      |

---

## 4. Application Architecture

### 4.1 Page Flow

```
┌─────────────┐     click card      ┌────────────────────────────────────────────┐
│ index.html  │ ──────────────────► │ engine/mcq.html  OR  fill.html  OR         │
│ (card grid) │                     │ error.html                                 │
└─────────────┘                     │ ?subject=preposition&level=high&set=1      │
       │                            └────────────────────────────────────────────┘
       │ loads                                          │
       ▼                                                │ loads
  index-loader.js                              mcq-engine.js / fill-engine.js /
       │                                       error-engine.js
       │ imports                                        │
       ▼                                                │ imports
     ui.js                                              ▼
                                                      ui.js
```

**URL parameters (query string):**

| Param     | Example       | Purpose            |
| --------- | ------------- | ------------------ |
| `subject` | `preposition` | Topic folder name  |
| `level`   | `high`        | Difficulty folder  |
| `set`     | `1`           | Set number to load |

### 4.2 Index Page (`index.html` + `index-loader.js`)

1. On load, shows 6 skeleton cards immediately
2. **Auto-discovery**: Probes every `SUBJECTS × LEVELS` combination by dynamically importing `../data/<subject>/<level>/config.js`
3. Successful imports are collected, sorted by `order`, and rendered as clickable cards
4. Each card links to `engine/<engine>.html?subject=<subject>&level=<level>&set=1`
5. A "More Coming Soon..." placeholder is appended

**Subject registry** (in `index-loader.js`):
```
tenses, sva, preposition, voice, articles, prepositions,
modals, nouns, pronouns, adjectives, adverbs, conjunctions
```
Currently `tenses`, `sva`, and `preposition` have data; the rest silently fail during probe.

### 4.3 Engine Pages

All three engine pages follow an identical architecture:

1. Show skeleton loading cards immediately
2. **Parallel load** `config.js` + `setN.json` via `Promise.all` (saves ~200–400ms)
3. Inject dynamic header with branding, sound/confetti toggles, home button, and tools menu
4. Discover available sets from `config.sets` (zero network calls) or fallback to HEAD probing
5. Validate all questions; skip invalid ones
6. Render question cards using `DocumentFragment` for single-DOM-mutation efficiency
7. Apply staggered entrance animations
8. Prefetch next set in background via `requestIdleCallback`

#### MCQ Engine (`mcq.html` + `mcq-engine.js`)
- Renders each question with 4 shuffled options in a 2-column grid
- Correct answer → green highlight + confetti + sound
- Wrong answer → red + shake animation (150ms tension delay)

#### Fill Engine (`fill.html` + `fill-engine.js`)
- Renders question text with inline blank
- Options displayed as small pill buttons beside the blank
- Correct click → fills the blank with green text, locks card
- Wrong click → disables that option, allows retry

#### Error Engine (`error.html` + `error-engine.js`) — NEW
- Shows full sentence as a preview with numbered parts
- Each part rendered as a full-width clickable button (NOT shuffled)
- "No error" rendered as a distinct button
- Correct answer → green highlight + confetti + **correction text revealed**
- Wrong answer → red + shake + option disabled (allows retry)
- Correction text shown in a green banner below the options

### 4.4 Shared UI Module (`ui.js`)

`ui.js` is the **largest and most critical file** (~620 lines). It exports:

| Export                     | Type       | Description                                                |
| -------------------------- | ---------- | ---------------------------------------------------------- |
| `UX`                       | Object     | Utility namespace (skeletons, progress bar, shuffle, batch render, stagger, prefetch) |
| `Sound`                    | Object     | Web Audio API sound effects (correct/wrong tones)          |
| `Effects`                  | Object     | Confetti + toggle functions                                |
| `injectHeader()`           | Function   | Builds and mounts the full header+menu HTML                |
| `injectFooter()`           | Function   | Adds footer credit line                                    |
| `injectMenu()`             | Function   | Populates tools menu (set selector, filters, random generator) |
| `getParams()`              | Function   | Parses URL query parameters                                |
| `discoverSetsFromConfig()` | Function   | Instant set discovery from config.sets count               |
| `discoverSetsFallback()`   | Function   | Legacy: parallel HEAD probes for set discovery             |
| `initPrintProtection()`    | Function   | Blocks browser print with branded notice overlay           |

---

## 5. Key Features

### 5.1 Teacher Tools Menu
- **Set Selector**: Grid of numbered buttons to switch between sets
- **Odd/Even Filter**: Show only odd-numbered or even-numbered questions
- **Random Generator**: Combines questions from ALL sets, shuffles with Fisher-Yates, and displays N random questions

### 5.2 Answer Interaction
- **MCQ**: Click an option → instant visual + audio feedback. Correct = green highlight + confetti. Wrong = red + shake animation with 150ms tension delay
- **Fill**: Click a word → fills the blank inline. Correct answer locks the card. Wrong option gets disabled
- **Error Finding**: Click a sentence part → Correct = green highlight + confetti + correction banner. Wrong = red + shake + disabled (retry with remaining parts)
- **MCQ/Fill options are always shuffled** per render using Fisher-Yates algorithm
- **Error Finding parts are NOT shuffled** — displayed in original sentence order

### 5.3 Performance Optimizations
- **Modulepreload**: `<link rel="modulepreload">` for critical JS files
- **Parallel data loading**: Config + question data fetched simultaneously
- **DocumentFragment**: All question cards built off-DOM, appended in single mutation
- **Background prefetch**: Next set is prefetched during idle time
- **Skeleton loading**: Immediate visual feedback before data arrives

### 5.4 Print Protection
Browser printing is intercepted — all page content is hidden via CSS `@media print` and replaced with a branded notice directing users to contact for official PDFs.

### 5.5 Sound & Effects
- Sound effects via **Web Audio API** (no audio files needed)
- **Canvas Confetti** library for correct answer celebration
- Both toggleable via header buttons

---

## 6. Data Pipeline (How Sets Are Created)

### 6.1 Interactive Wizards (Recommended)

**Topic Setup Wizard** (`setup_topic.py`):
```
python setup_topic.py
```
Interactive CLI that creates `data/<topic>/<level>/` folders with `config.js` and empty `set.json` for each selected level.

**Set Splitter** (`split_sets.py`):
```
python split_sets.py
```
Interactive CLI that reads `set.json` from any topic/level, splits into paginated `setN.json` files, and auto-patches the `sets` count in `config.js`.

### 6.2 Legacy Script (`CODE.TXT`)

The `CODE.TXT` file contains a non-interactive Python script that:
1. Reads a master `set.json` (all questions for a topic/level)
2. Splits it into paginated `setN.json` files (default: 25 questions/set)
3. Writes compact, one-line-per-question JSON format

```
set.json (master) ──► split_sets.py (or CODE.TXT) ──► set1.json, set2.json, ..., setN.json
```

To add new content:
1. Create/edit `set.json` in the appropriate `data/<subject>/<level>/` folder
2. Run the Python splitter
3. Update `config.js` with the new set count (auto-patched by `split_sets.py`)

---

## 7. How to Add a New Topic

1. **Run the wizard**: `python setup_topic.py` — creates folders, config, and empty set.json
2. **Add questions** to `data/<topic>/<level>/set.json`
3. **Run the splitter**: `python split_sets.py` — generates set1.json, set2.json, etc.
4. **Register the topic** in `index-loader.js` → `SUBJECTS` array (if not already listed)
5. The index page will auto-discover it on next load

### 7.1 Adding Error-Finding Questions

For "Find the Error" type questions, use engine `"error"` in config.js and format questions with the `parts`/`answer`/`correction` schema:

```js
// config.js
export default {
    engine: "error",
    // ... other fields
}
```

```json
// set1.json
[
  {
    "parts": ["sentence part 1", "sentence part 2", "sentence part 3"],
    "answer": 1,
    "correction": "error text → correct text"
  }
]
```

---

## 8. Technology Stack Summary

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Markup         | HTML5                                     |
| Styling        | Tailwind CSS v3 (CDN)                     |
| JavaScript     | Vanilla ES Modules (no framework)         |
| Fonts          | Google Fonts (Inter, Playfair Display)     |
| Effects        | canvas-confetti (CDN), Web Audio API      |
| Data Format    | Static JSON files                         |
| Build System   | None (zero-build, CDN-based)              |
| Server         | None required (static file hosting)       |

---

## 9. File Dependency Map

```
index.html
  └── js/index-loader.js (module)
        └── js/ui.js (module)
  └── components/footer.js (script)

engine/mcq.html
  └── js/mcq-engine.js (module)
        └── js/ui.js (module)

engine/fill.html
  └── js/fill-engine.js (module)
        └── js/ui.js (module)

engine/error.html
  └── js/error-engine.js (module)
        └── js/ui.js (module)

Runtime data fetches:
  ├── data/<subject>/<level>/config.js  (dynamic import)
  └── data/<subject>/<level>/setN.json  (fetch API)
```

---

## 10. Engine Comparison

| Feature             | MCQ Engine          | Fill Engine           | Error Engine (NEW)            |
| ------------------- | ------------------- | --------------------- | ----------------------------- |
| HTML Shell          | `engine/mcq.html`   | `engine/fill.html`    | `engine/error.html`           |
| JS Module           | `mcq-engine.js`     | `fill-engine.js`      | `error-engine.js`             |
| Data Fields         | `q`, `options`, `answer` | `q`, `options`, `answer` | `q`, `options`, `answer`, `correction` |
| Options Shuffled    | ✅ Yes              | ✅ Yes                | ❌ No (sentence order)        |
| Option Count        | Typically 4         | Typically 2–3         | Typically 4 (3 parts + No error) |
| Option Labels       | A, B, C, D          | Pill buttons          | (1), (2), (3), (4)           |
| Answer Display      | Green/Red highlight  | Fill blank inline     | Highlight + correction banner |
| Card Layout         | 2-col option grid   | Inline pill buttons   | 2-col option grid (MCQ-style)|

---

*End of documentation.*
