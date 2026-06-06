# 🧪 QA Report Generator v2.0

A premium, 100% client-side React + Vite web application to transform raw QA test case files (.xlsx, .xls, .csv) into professional, highly styled Excel sheets and Google Sheets-optimized reports. Features offline local storage, interactive previews with inline spreadsheet editing, data analytics, automatic tested-by column defaults, and dynamic formula calculations.

---

## 🌟 Key Features

### 1. **Premium Light Mode UI Theme**
- Designed with a clean, high-contrast Slate color palette.
- Dynamic color-coded priority, severity, and status badges for readability.
- Full responsive widescreen layout.

### 2. **Auto-Resizing Spreadsheet Grid**
- Edit cells directly inline like a spreadsheet (status select badges, comments, results, etc.).
- Fully hides auxiliary fields (`Test Type`, `Test Case ID`, `Test Steps`, `Priority`, `Severity`) in the UI preview for a clean editor interface, while preserving them for exports.
- **Scroll-Free Textareas**: Multi-line cells automatically resize their height based on contents, eliminating inner vertical scrollbars.
- Indented padding configured to perfectly align editable text cells with column headers.

### 3. **Dual-Format Exports**
- **MS Excel (.xlsx)**: Generates highly formatted workbooks with solid color fills, KPI dashboards, merged titles, and sequential tables.
- **Google Sheets Optimized**: Automatically converts thin borders (avoiding `hair` lines that Google Sheets ignores) and scales column widths (+10-15%) to prevent text clipping and truncation on import.
- **Dynamic Formulas**: All summary tables and KPI metrics are calculated in real-time inside the sheet using native UPPERCASE formulas (`ROWS`, `COUNTIF`, `COUNTIFS`, `SUM`, `IF`) to dynamically update if fields change.

### 4. **Persistent Offline History (IndexedDB)**
- Access previously uploaded test runs from a dedicated **History Page** tab.
- Stored completely client-side in the browser's database (`IndexedDB`) – **zero server uploads or data leaks**.
- Features inline card renaming (✏️ pencil edit tool) and direct download buttons (Excel and Google Sheets format) from any log card.

### 5. **Tested By Auto-Default & Merging**
- Automatically defaults blank `Tested By` columns to `"Dwip Pandya"` during file parsing.
- Merges separate test case files by unique `Test Case ID` matching (overwriting existing fields, appending new tests, and auto-resequencing `Sr No`).

---

## 🛠️ Tech Stack & Libraries

- **Frontend**: React 18, Vite, HMR
- **Styling**: Tailwind CSS & Vanilla CSS custom variables
- **Transitions**: Framer Motion
- **Spreadsheets & Downloads**: ExcelJS, FileSaver, PapaParse (CSV parser)
- **Charts**: Chart.js, React-Chartjs-2
- **Database**: Native browser IndexedDB

---

## 🚀 Getting Started

### 1. Installation
Install the project dependencies locally:
```bash
npm install
```

### 2. Run the Development Server
Launch the local development environment:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
Bundle the optimized web app for production:
```bash
npm run build
```
Outputs are compiled into the `dist/` directory, ready to be served from any static site hosting (Vercel, Netlify, GitHub Pages, etc.) since the app requires no database backend.

---

## 📋 Expected Input Column Header Format
When uploading files, ensure they contain the following columns:
```
Sr No · Module · Test Case ID · Test Type · Test Scenario · Simplified Test Scenario · Test Steps · Expected Result · Actual Result · Priority · Severity · Status · Tested By · Execution Date · Defect No. / Bug No. · Defect ID · QA Comments
```
