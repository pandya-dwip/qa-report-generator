<div align="center">

# QA Report Generator

**A professional, fully client-side QA test case management and reporting tool**

![Version](https://img.shields.io/badge/version-2.0.0-informational?style=flat-square)
![Platform](https://img.shields.io/badge/platform-Web%20App-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![React](https://img.shields.io/badge/framework-React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/build-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/styling-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)
![Storage](https://img.shields.io/badge/storage-IndexedDB%20(Local)-blueviolet?style=flat-square)
![Excel](https://img.shields.io/badge/export-ExcelJS%20%2F%20XLSX-217346?style=flat-square&logo=microsoftexcel&logoColor=white)
![Theme](https://img.shields.io/badge/theme-light%20%2F%20dark-333333?style=flat-square)

Upload, edit, analyze, and export test case data — entirely in your browser, with zero backend required.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Required File Format](#required-file-format)
- [Export Options](#export-options)
- [Project Structure](#project-structure)
- [Configuration](#configuration)

---

## Overview

**QA Report Generator** is a fully client-side web application built with React and Vite that streamlines the QA reporting workflow. Teams can upload raw test case spreadsheets, edit data inline, visualize execution status with interactive charts, and export polished, formula-driven Excel reports — all without any server or internet connection.

All data is persisted locally in the browser via IndexedDB, meaning reports survive page refreshes and can be loaded, renamed, or deleted from a built-in history panel.

---

## Features

### File Upload & Parsing
- Drag-and-drop or click-to-select `.xlsx`, `.xls`, and `.csv` files
- **Flexible Sheet Detection** — automatically checks for a sheet named `"Test Cases"` (e.g. system exports) and reads it, instead of failing on the dashboard page
- **Relaxed Validation** — only **`Test Case ID`** and **`Status`** are strictly required; missing optional columns are filled with default values on import
- Auto-normalizes `Status`, `Severity`, `Priority`, and `Testing Method` values (case-insensitive)
- Parses dates in multiple formats: `YYYY-MM-DD`, `DD-MM-YYYY`, ISO 8601, and Excel serial numbers
- Merges uploaded files by unique `Test Case ID` — overwrites existing rows and appends new ones

### Local Files Sync (Dev Mode)
- Automatically creates a `Files/` folder in the project root (gitignored)
- Auto-syncs your current test cases to `Files/[fileName].csv` whenever you load a file, edit cells, add rows, or delete test cases (debounced at 500ms)
- Provides a manual **Sync Now** button in the sidebar to force synchronization at any time

### Inline Data Editing
- Edit any cell directly in the table — textareas auto-resize for long content
- Dropdown fields (`Status`, `Severity`, `Priority`) render as color-coded inline selectors
- Add new test cases with full control over insertion position (before/after selection, at start or end)
- Delete single rows or bulk-delete selected rows, each with a styled confirmation dialog
- `Sr No` column auto-reindexes after every add or delete operation

### Search, Filter & Sort
- Real-time search across all columns simultaneously
- Filter by execution status: `Pass`, `Fail`, `Blocked`, `Not Executed`
- Sort by any column (ascending / descending toggle)
- Toggle column visibility (with `Sr No` always pinned)
- Configurable pagination: 10, 20, 50, 100 rows, or view all

### Analytics Dashboard
- Live KPI cards: Total Cases, Passed, Failed, Blocked, Not Executed
- Pass rate percentage with a visual progress bar
- Five interactive charts:
  - **Doughnut** — overall execution status breakdown
  - **Pie** — severity distribution
  - **Pie** — priority distribution
  - **Bar** — module-wise execution breakdown
  - **Line** — daily trend (pass/fail over time)
- Charts panel is collapsible to maximize table space

### Bulk Operations
- Select all / deselect all rows with a header checkbox
- Apply a status update to all selected rows at once

### Local Report History
- Auto-saves every edit to IndexedDB (no upload limit, no network calls)
- Browse past reports in the History tab: name, case count, last modified timestamp
- Rename or delete reports directly from the history list
- One-click load for continued editing or re-export

### Export
| Format | Description |
|--------|-------------|
| **Excel (.xlsx)** | 4-sheet workbook with KPI dashboard, project details, full test cases, and module summary — all with live formulas |
| **Google Sheets** | Same 4-sheet structure with column widths and border styles optimized for Google Drive import |
| **Test Cases Only** | Lightweight single-sheet `.xlsx` containing just the test data |

---

## Tech Stack

| Layer | Library / Tool | Version |
|-------|---------------|---------|
| UI Framework | React | 19.2.6 |
| Build Tool | Vite | 8.0.12 |
| Styling | TailwindCSS | 4.3.0 |
| Animation | Framer Motion | 12.40.0 |
| Icons | Lucide React | 1.21.0 |
| Excel Export | ExcelJS | 4.4.0 |
| File Parsing | XLSX (SheetJS) | 0.18.5 |
| File Download | FileSaver.js | 2.0.5 |
| Charts | Chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 |
| Local Storage | IndexedDB (browser native) | — |
| Linting | ESLint | 10.3.0 |

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd qa-report-generator

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Build for production (outputs to /dist)
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint across the project
```

> The production build outputs a fully static bundle in `/dist` that can be hosted on any static server — Vercel, Netlify, GitHub Pages, or a plain nginx instance. No backend is required.

---

## Usage Guide

### 1 — Upload a File

On the **Workspace** tab, drag your `.xlsx`, `.xls`, or `.csv` file onto the upload zone in the sidebar, or click to open a file picker. The app validates all required columns and shows a detailed error panel if any are missing.

A sample file (`sample_qa_cases.csv`) is included in the repository root to demonstrate the expected format.

### 2 — Edit Test Cases

The main table supports full inline editing:

- Click any text cell to edit it in place
- Use the color-coded dropdowns for `Status`, `Severity`, and `Priority`
- Use the toolbar to add rows, delete selected rows, or apply bulk status changes
- Use the search bar and filter dropdowns in the toolbar to narrow the view
- Toggle column visibility from the column-selector button in the toolbar

### 3 — Review Analytics

Click the **Charts** toggle in the header toolbar to expand the analytics panel. KPI summary cards and the pass-rate progress bar are always visible in the sidebar whenever data is loaded.

### 4 — Export

Click the **Export** button in the top-right header to open the export menu and choose a format. The file generates and downloads instantly in the browser — no upload, no wait.

### 5 — History

Switch to the **History** tab to browse all previously saved reports. Reports are auto-saved to IndexedDB on every edit. From the history list you can load, rename, export, or permanently delete any saved report.

---

## Required File Format

Uploaded files support up to 18 columns. Only **`Test Case ID`** and **`Status`** are strictly required for validation to succeed; all other columns are optional and default to sensible values. Column order does not matter, and headers are matched case-insensitively.

| Column | Required | Description |
|--------|:---:|-------------|
| `Sr No` | No | Serial number — auto-managed by the app |
| `Module` | No | Feature or functional area under test |
| `Test Case ID` | **Yes** | Unique identifier for the test case |
| `Test Type` | No | e.g. Functional, Security, Regression, Performance |
| `Testing Method` | No | e.g. `Manual` or `Automated` (defaults to `Manual`) |
| `Test Scenario` | No | Full description of the test scenario |
| `Simplified Test Scenario` | No | Short summary of the scenario |
| `Test Steps` | No | Step-by-step execution instructions |
| `Expected Result` | No | The expected system behavior |
| `Actual Result` | No | The observed system behavior |
| `Priority` | No | `HIGH`, `MEDIUM`, or `LOW` (defaults to `MEDIUM`) |
| `Severity` | No | `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW` (defaults to `MEDIUM`) |
| `Status` | **Yes** | `PASS`, `FAIL`, `BLOCKED`, or `NOT EXECUTED` |
| `Tested By` | No | Name of the QA engineer (defaults to `Dwip Pandya`) |
| `Execution Date` | No | Date the test was run (defaults to current date) |
| `Defect No. / Bug No.` | No | Legacy defect reference field |
| `Defect ID` | No | Bug tracker ID (rendered as a hyperlink in Excel exports) |
| `QA Comments` | No | Additional notes or observations |

A sample file demonstrating this format is included at [sample_qa_cases.csv](sample_qa_cases.csv).

---

## Export Options

### Excel Export — 4 Sheets

| Sheet | Contents |
|-------|---------|
| **Dashboard** | KPI cards with live `COUNTIF` formulas, module-wise breakdown table, severity and priority summary grid |
| **Project Details** | Editable project metadata (name, build version, environment, test cycle, dates, remarks) with an auto-calculated execution summary |
| **Test Cases** | Full 18-column dataset with frozen headers, auto-filters, and conditional cell formatting for `Status`, `Severity`, and `Priority` |
| **Summary** | Module-wise execution totals with pass percentage column and a formatted totals row |

Additional Excel features: merged title cells, Arial font throughout, optimized column widths, percentage number formatting (`0.0%`), alternating row shading in the Summary sheet, and `HYPERLINK` formulas on all `Defect ID` values.

### Google Sheets Export

Identical 4-sheet structure with column widths scaled up 10–15% and borders converted from `hair` to `thin` style to prevent clipping and invisible lines on import. Download the file and use **File → Import** in Google Drive.

### Test Cases Only Export

A minimal single-sheet `.xlsx` containing only the raw test case data — ideal for sharing with stakeholders who don't need the dashboard or summary.

---

## Project Structure

```
qa-report-generator/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation tabs, export dropdown, status badges
│   │   ├── Sidebar.jsx          # Upload zone, KPI cards, pass-rate bar, history list
│   │   ├── FilePreview.jsx      # Main data table — inline edit, search, sort, paginate
│   │   ├── ChartsSection.jsx    # Collapsible analytics charts panel
│   │   ├── DashboardCards.jsx   # KPI summary card grid
│   │   ├── HistoryPage.jsx      # Saved report browser
│   │   ├── UploadBox.jsx        # Drag-and-drop file input
│   │   ├── ValidationAlert.jsx  # Missing-column error display
│   │   └── ToastContainer.jsx   # Toast notification system
│   ├── services/
│   │   ├── excelService.js      # 4-sheet workbook builder (ExcelJS)
│   │   ├── chartService.js      # Statistics computation and chart dataset generators
│   │   └── validationService.js # Column validation and field normalization
│   ├── utils/
│   │   ├── fileParser.js        # XLSX/CSV reader, header normalization, data mapping
│   │   ├── fileSync.js          # CSV serializer and filesystem sync API interface
│   │   └── historyDb.js         # IndexedDB CRUD operations
│   ├── hooks/
│   │   └── useToast.js          # Toast notification state hook
│   ├── constants/
│   │   └── columns.js           # Column definitions and color scheme maps
│   ├── App.jsx                  # Root component and global state
│   ├── main.jsx                 # React entry point
│   └── index.css                # Design tokens and global styles
├── public/                      # Static assets
├── sample_qa_cases.csv          # Example input file
├── index.html                   # HTML shell
├── vite.config.js               # Vite configuration
└── package.json
```

---

## Configuration

### Default Values for New Rows

| Field | Default |
|-------|---------|
| `Status` | `NOT EXECUTED` |
| `Priority` | `MEDIUM` |
| `Severity` | `MEDIUM` |
| `Testing Method` | `Manual` |
| `Execution Date` | Current date |
| `Tested By` | `Dwip Pandya` |

### Defect Hyperlinks

In Excel exports, values in the `Defect ID` column are rendered as clickable hyperlinks. The base URL defaults to `https://jira.example.com/browse/`. Update this constant in [src/services/excelService.js](src/services/excelService.js) to point to your team's issue tracker.

### Local Storage

All report data is stored client-side in the browser's IndexedDB under the database name `qa-report-history`. No data is ever transmitted to a server. Clearing browser site data will erase all stored reports.

---

## Browser Compatibility

The app targets modern evergreen browsers. The following APIs are required:

- ES Modules
- IndexedDB
- FileReader API
- CSS Grid, Flexbox, and Custom Properties

**Supported:** Chrome 90+, Firefox 90+, Edge 90+, Safari 15+  
**Not supported:** Internet Explorer

---
