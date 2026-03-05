// ─── Core Domain Types ────────────────────────────────────────────────────────

export type OKRStatus = 'on-track' | 'at-risk' | 'off-track' | 'completed';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface WeeklyUpdate {
  id: string;
  date: string; // ISO date string
  week: number; // week number of the year
  note: string;
  progressSnapshot: number; // progress % at time of update
}

export interface KeyResult {
  id: string;
  title: string;
  description?: string;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string; // e.g. "%", "$", "users", "tickets"
  progress: number; // 0-100 computed
  status: OKRStatus;
  weeklyUpdates: WeeklyUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  owner: string;
  quarter: Quarter;
  year: number;
  keyResults: KeyResult[];
  overallProgress: number; // average of all KR progress
  status: OKRStatus;
  color: ObjectiveColor;
  createdAt: string;
  updatedAt: string;
}

export type ObjectiveColor =
  | 'amber'
  | 'emerald'
  | 'sky'
  | 'rose'
  | 'violet'
  | 'orange';

// ─── Form / Input Types ───────────────────────────────────────────────────────

export interface CreateObjectiveInput {
  title: string;
  description?: string;
  owner: string;
  quarter: Quarter;
  year: number;
  color: ObjectiveColor;
}

export interface CreateKeyResultInput {
  title: string;
  description?: string;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
}

export interface UpdateProgressInput {
  keyResultId: string;
  newValue: number;
  updateNote: string;
}

// ─── Store / State Types ──────────────────────────────────────────────────────

export interface OKRStore {
  objectives: Objective[];
  activeQuarter: Quarter;
  activeYear: number;
}

// ─── Utility Types ─────────────────────────────────────────────────────────────

export interface ProgressStats {
  total: number;
  onTrack: number;
  atRisk: number;
  offTrack: number;
  completed: number;
  averageProgress: number;
}
