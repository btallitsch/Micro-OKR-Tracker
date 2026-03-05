# OKR Tracker — Micro Goals Engine

A lightweight, local-first OKR (Objectives & Key Results) tracker built with React, TypeScript, and Tailwind CSS.

See it in action here: https://micro-okr-tracker.vercel.app/

---

## Features

- **Define Objectives** — Create clear, inspiring goals with owner, quarter, and year
- **Add Key Results** — Attach measurable results with start/target values and units
- **Track Progress %** — Real-time progress bars with automatic status derivation
- **Weekly Update Logs** — Log progress notes each week with historical snapshots
- **Quarter Navigation** — Browse across any quarter/year
- **Status Indicators** — On Track / At Risk / Off Track / Completed
- **Persistent Storage** — All data saved to localStorage (no backend needed)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| IDs | uuid |
| Date Utilities | date-fns |

---

## Project Structure

```
src/
├── types/
│   └── index.ts              # All TypeScript types & interfaces
├── hooks/
│   └── useOKRStore.ts        # State management + localStorage persistence
├── utils/
│   └── index.ts              # Progress calculations, status helpers, color maps
├── components/
│   ├── Modal.tsx             # Reusable modal wrapper
│   ├── ProgressBar.tsx       # Animated progress bar
│   ├── StatusBadge.tsx       # On Track / At Risk / etc badge
│   ├── StatsBar.tsx          # Dashboard stats row
│   ├── QuarterSelector.tsx   # Q1–Q4 + year navigation
│   ├── ObjectiveCard.tsx     # Main objective card with KRs
│   ├── KeyResultItem.tsx     # Individual key result row
│   ├── AddObjectiveModal.tsx # Create objective form
│   ├── AddKeyResultModal.tsx # Add key result form
│   ├── UpdateProgressModal.tsx # Update a KR's progress
│   └── WeeklyLogsModal.tsx   # View all weekly updates
├── App.tsx                   # Root component + modal orchestration
├── main.tsx                  # React entry point
└── index.css                 # Tailwind + base styles
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Usage Guide

### Creating an Objective
1. Click **New Objective** in the top-right
2. Enter a title, optional description, owner name, quarter, and year
3. Pick a color tag to visually group objectives
4. Click **Create Objective**

### Adding Key Results
1. Click **Add Key Result** at the bottom of any objective card
2. Set a title, measurement unit, start value, and target value
3. Current value defaults to start value (update it when progress happens)

### Updating Progress
1. Hover over any key result — an edit icon appears
2. Click it to open the **Update Progress** modal
3. Enter the new current value and an optional weekly note
4. Progress % and status update automatically

### Viewing Logs
1. Click the **history** icon on any objective card
2. See all weekly updates across all key results, sorted newest first

---

## Status Logic

| Progress | Status |
|---|---|
| ≥ 100% | Completed |
| 70–99% | On Track |
| 40–69% | At Risk |
| < 40% | Off Track |

---

## License

MIT — free to use and modify.
