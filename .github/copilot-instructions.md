# Copilot Instructions for jyuko-yoshida-textile-tools

## Project Overview

This repository contains **textile simulation tools** for Jyuko Yoshida, a Japanese textile/weaving business. The primary application is a **plaid colorway simulator** (先染めシミュレーター) — an interactive web tool that lets users design fabric patterns by selecting weave structures, yarn types, colors, and pattern layouts, then visualize the result on an HTML5 canvas.

The project also includes several standalone HTML files (legacy/alternative simulator versions) in the root directory.

## Tech Stack

- **Framework**: React 18 with JSX
- **Build tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **Language**: JavaScript (ESM, no TypeScript)
- **Node.js**: Use whatever version is available (no `.nvmrc`); the project uses Vite 6 which requires Node 18+

## Repository Layout

```
/
├── .github/
│   └── copilot-instructions.md   # This file
├── src/
│   ├── App.jsx                   # Main React component (fabric simulator UI + canvas rendering)
│   ├── main.jsx                  # React entry point
│   ├── index.css                 # Global styles (Tailwind directives)
│   ├── data/
│   │   ├── weaveDatabase.js      # Weave structure definitions (matrix, repeat, metadata)
│   │   └── yarnDatabase.js       # Yarn/fiber definitions (fiber type, count, composition)
│   └── utils/
│       └── productionAnalysis.js # Risk analysis & selling point generation for fabric specs
├── docs/
│   └── index.html                # GitHub Pages deployment output
├── index.html                    # Vite HTML entry point
├── simulator.html                # Standalone simulator (no build required)
├── 先染めシミュレーター*.html      # Legacy standalone Japanese-named simulator files
├── package.json
├── vite.config.js                # Vite config (allowedHosts: 'all' for dev server)
├── tailwind.config.js            # Tailwind content paths: index.html + src/**/*.{js,ts,jsx,tsx}
└── postcss.config.js
```

## Build & Development Commands

Always run `npm install` before building or running for the first time:

```bash
npm install
```

**Development server** (hot reload on http://localhost:5173):
```bash
npm run dev
```

**Production build** (outputs to `dist/`):
```bash
npm run build
```

**Preview production build**:
```bash
npm run preview
```

There are **no tests** configured in this project (no test runner, no test files).  
There is **no linter** configured (no ESLint, Prettier, etc.).

## Key Architectural Notes

- **`src/App.jsx`** is a single large component containing all UI state, canvas draw functions, and event handlers. The canvas drawing pipeline is: `drawFabric()` → `drawWeavePattern()` / `drawStripePattern()` / `drawCheckPattern()`.
- **`src/data/weaveDatabase.js`** exports `WEAVE_DATABASE` (array), `WEAVE_CATEGORIES`, and helper `getWeaveById(id)`. Each weave entry has `matrix`, `repeatX`, `repeatY`, plus display metadata.
- **`src/data/yarnDatabase.js`** exports `YARN_DATABASE` (array), `FIBER_CATEGORIES`, `getYarnById(id)`, and `getCompositionString(yarn)`. Each yarn entry has fiber type, count, composition ratios, and production properties.
- **`src/utils/productionAnalysis.js`** exports `analyzeProductionRisks()`, `generateSellingPoints()`, `calculateGSM()`, and `RISK_LEVELS`. This module performs rule-based analysis of weave + yarn combinations to surface production risks.
- **Tailwind** is used for all layout and utility styling. No custom CSS beyond `src/index.css` (Tailwind directives).
- The `docs/index.html` file is used for **GitHub Pages** deployment — do not confuse it with the Vite entry `index.html` at the repo root.

## Validation Steps

Since there are no automated tests or linters, validate changes by:

1. Running `npm run build` and confirming it exits with code 0 (no errors).
2. Running `npm run dev` and opening the app in a browser to visually verify the simulator renders and interacts correctly.
3. Checking that canvas rendering works for all three pattern types: チェック (check), ストライプ (stripe), 無地 (solid).

Trust these instructions; only search the codebase if the information here seems incomplete or incorrect.
