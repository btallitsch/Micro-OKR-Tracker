import { getWeek } from 'date-fns';
import type {
  KeyResult,
  Objective,
  OKRStatus,
  ProgressStats,
  ObjectiveColor,
} from '../types';

// ─── Progress Calculations ────────────────────────────────────────────────────

export function computeKRProgress(kr: Pick<KeyResult, 'startValue' | 'currentValue' | 'targetValue'>): number {
  const range = kr.targetValue - kr.startValue;
  if (range === 0) return 100;
  const progress = ((kr.currentValue - kr.startValue) / range) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function computeObjectiveProgress(keyResults: KeyResult[]): number {
  if (keyResults.length === 0) return 0;
  const total = keyResults.reduce((sum, kr) => sum + kr.progress, 0);
  return Math.round(total / keyResults.length);
}

export function deriveStatus(progress: number): OKRStatus {
  if (progress >= 100) return 'completed';
  if (progress >= 70) return 'on-track';
  if (progress >= 40) return 'at-risk';
  return 'off-track';
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function computeProgressStats(objectives: Objective[]): ProgressStats {
  const total = objectives.length;
  if (total === 0) {
    return { total: 0, onTrack: 0, atRisk: 0, offTrack: 0, completed: 0, averageProgress: 0 };
  }

  let onTrack = 0, atRisk = 0, offTrack = 0, completed = 0;
  let progressSum = 0;

  for (const obj of objectives) {
    progressSum += obj.overallProgress;
    switch (obj.status) {
      case 'on-track': onTrack++; break;
      case 'at-risk': atRisk++; break;
      case 'off-track': offTrack++; break;
      case 'completed': completed++; break;
    }
  }

  return {
    total,
    onTrack,
    atRisk,
    offTrack,
    completed,
    averageProgress: Math.round(progressSum / total),
  };
}

// ─── Date Helpers ──────────────────────────────────────────────────────────────

export function currentWeekNumber(): number {
  return getWeek(new Date());
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ─── Status Helpers ───────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<OKRStatus, string> = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'off-track': 'Off Track',
  'completed': 'Completed',
};

export const STATUS_COLORS: Record<OKRStatus, string> = {
  'on-track': 'text-emerald-400',
  'at-risk': 'text-amber-400',
  'off-track': 'text-rose-400',
  'completed': 'text-sky-400',
};

export const STATUS_BG: Record<OKRStatus, string> = {
  'on-track': 'bg-emerald-400/10 border-emerald-400/20',
  'at-risk': 'bg-amber-400/10 border-amber-400/20',
  'off-track': 'bg-rose-400/10 border-rose-400/20',
  'completed': 'bg-sky-400/10 border-sky-400/20',
};

// ─── Color Helpers ────────────────────────────────────────────────────────────

export const OBJECTIVE_COLORS: ObjectiveColor[] = [
  'amber', 'emerald', 'sky', 'rose', 'violet', 'orange',
];

export const COLOR_MAP: Record<ObjectiveColor, { accent: string; bg: string; border: string; bar: string }> = {
  amber:   { accent: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   bar: 'bg-amber-400' },
  emerald: { accent: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', bar: 'bg-emerald-400' },
  sky:     { accent: 'text-sky-400',     bg: 'bg-sky-400/10',     border: 'border-sky-400/30',     bar: 'bg-sky-400' },
  rose:    { accent: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/30',    bar: 'bg-rose-400' },
  violet:  { accent: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'border-violet-400/30',  bar: 'bg-violet-400' },
  orange:  { accent: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/30',  bar: 'bg-orange-400' },
};
