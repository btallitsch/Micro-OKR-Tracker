# OKR Tracker — Micro Goals Engine

A lightweight, cloud-backed OKR (Objectives & Key Results) tracker built with React, TypeScript, Tailwind CSS, and Supabase.

See it in action HERE: https://micro-okr-tracker.vercel.app/
---

## Features

- **Define Objectives** — Create clear, inspiring goals with owner, quarter, and year
- **Add Key Results** — Attach measurable results with start/target values and units
- **Track Progress %** — Real-time progress bars with automatic status derivation
- **Weekly Update Logs** — Log progress notes each week with historical snapshots
- **Quarter Navigation** — Browse across any quarter/year
- **Status Indicators** — On Track / At Risk / Off Track / Completed
- **Cloud Persistence** — All data stored in Supabase (syncs across devices and sessions)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| IDs | uuid |
| Date Utilities | date-fns |

---

## Project Structure

```
src/
├── lib/
│   └── supabase.ts               # Supabase client initialisation
├── types/
│   └── index.ts                  # All TypeScript types & interfaces
├── hooks/
│   └── useOKRStore.ts            # All state management + Supabase queries
├── utils/
│   └── index.ts                  # Progress calculations, status helpers, color maps
├── components/
│   ├── Modal.tsx                 # Reusable modal wrapper
│   ├── ProgressBar.tsx           # Animated progress bar
│   ├── StatusBadge.tsx           # On Track / At Risk / etc badge
│   ├── StatsBar.tsx              # Dashboard stats row
│   ├── QuarterSelector.tsx       # Q1–Q4 + year navigation
│   ├── ObjectiveCard.tsx         # Main objective card with KRs
│   ├── KeyResultItem.tsx         # Individual key result row
│   ├── AddObjectiveModal.tsx     # Create objective form
│   ├── AddKeyResultModal.tsx     # Add key result form
│   ├── UpdateProgressModal.tsx   # Update a KR's progress
│   └── WeeklyLogsModal.tsx       # View all weekly updates
├── App.tsx                       # Root component + modal orchestration
├── main.tsx                      # React entry point
└── index.css                     # Tailwind + base styles
```

---

## Database Schema

Three tables in Supabase (PostgreSQL):

```
objectives
  id, title, description, owner, quarter, year,
  color, overall_progress, status, created_at, updated_at

key_results
  id, objective_id (→ objectives), title, description,
  unit, start_value, current_value, target_value,
  progress, status, created_at, updated_at

weekly_updates
  id, key_result_id (→ key_results), date, week,
  note, progress_snapshot
```

Key results cascade-delete when their parent objective is deleted. Weekly updates cascade-delete when their parent key result is deleted.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

These are set in **Vercel → Project Settings → Environment Variables** and are never committed to the repository.

---

## Development Workflow

This project is developed entirely through **GitHub** and deployed automatically via **Vercel**. There is no local development environment required.

```
Edit file in GitHub → Commit to main → Vercel auto-deploys → Check live site
```

To make a change:
1. Navigate to the file in your GitHub repository
2. Click the pencil (edit) icon
3. Make your changes
4. Click **Commit changes** → commit directly to `main`
5. Vercel detects the push and deploys within ~30 seconds

---

## Initial Setup (for new environments)

### 1. Supabase — create tables

In **Supabase → SQL Editor**, run:

```sql
create table objectives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  owner text not null,
  quarter text not null,
  year integer not null,
  color text not null default 'amber',
  overall_progress integer not null default 0,
  status text not null default 'off-track',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid references objectives(id) on delete cascade,
  title text not null,
  description text,
  start_value numeric not null default 0,
  current_value numeric not null default 0,
  target_value numeric not null,
  unit text not null default '%',
  progress integer not null default 0,
  status text not null default 'off-track',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table weekly_updates (
  id uuid primary key default gen_random_uuid(),
  key_result_id uuid references key_results(id) on delete cascade,
  date timestamptz default now(),
  week integer not null,
  note text not null,
  progress_snapshot integer not null default 0
);

create index on key_results(objective_id);
create index on weekly_updates(key_result_id);
```

Then enable Row Level Security:

```sql
alter table objectives enable row level security;
alter table key_results enable row level security;
alter table weekly_updates enable row level security;

create policy "Allow all" on objectives for all using (true);
create policy "Allow all" on key_results for all using (true);
create policy "Allow all" on weekly_updates for all using (true);
```

### 2. Vercel — add environment variables

In **Vercel → Project Settings → Environment Variables**, add:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

Enable both for Production, Preview, and Development.

---

## Status Logic

| Progress | Status |
|---|---|
| ≥ 100% | Completed |
| 70–99% | On Track |
| 40–69% | At Risk |
| < 40% | Off Track |

---

## Roadmap

Potential next steps:
- **Authentication** — Supabase Auth so each user sees only their own objectives
- **Team support** — shared objectives visible to all members of a workspace
- **Progress charts** — Recharts line graph showing KR progress over time
- **Notifications** — alerts when objectives fall to At Risk or Off Track
- **CSV export** — download progress logs for reporting

---

## License

MIT — free to use and modify.
