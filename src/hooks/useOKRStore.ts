import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Objective,
  KeyResult,
  OKRStore,
  Quarter,
  CreateObjectiveInput,
  CreateKeyResultInput,
  UpdateProgressInput,
} from '../types';
import {
  computeKRProgress,
  computeObjectiveProgress,
  deriveStatus,
  currentWeekNumber,
} from '../utils';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_DATA: Objective[] = [
  {
    id: 'obj-1',
    title: 'Grow Monthly Active Users',
    description: 'Expand our user base through product-led growth and targeted marketing.',
    owner: 'Growth Team',
    quarter: 'Q1',
    year: 2025,
    color: 'amber',
    overallProgress: 62,
    status: 'on-track',
    createdAt: new Date('2025-01-01').toISOString(),
    updatedAt: new Date().toISOString(),
    keyResults: [
      {
        id: 'kr-1',
        title: 'Increase MAU from 10k to 25k',
        unit: 'users',
        startValue: 10000,
        currentValue: 17500,
        targetValue: 25000,
        progress: 50,
        status: 'at-risk',
        weeklyUpdates: [
          { id: 'wu-1', date: new Date('2025-01-07').toISOString(), week: 2, note: 'Started paid campaign.', progressSnapshot: 10 },
          { id: 'wu-2', date: new Date('2025-01-14').toISOString(), week: 3, note: 'Referral program launched.', progressSnapshot: 30 },
        ],
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'kr-2',
        title: 'Achieve NPS score of 45+',
        unit: 'NPS',
        startValue: 28,
        currentValue: 42,
        targetValue: 45,
        progress: 82,
        status: 'on-track',
        weeklyUpdates: [
          { id: 'wu-3', date: new Date('2025-01-14').toISOString(), week: 3, note: 'Survey sent to 500 users.', progressSnapshot: 55 },
        ],
        createdAt: new Date('2025-01-01').toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'okr-tracker-v1';

function loadFromStorage(): OKRStore | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(store: OKRStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // silent
  }
}

const currentYear = new Date().getFullYear();
const currentQuarter: Quarter = (['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[])[
  Math.floor(new Date().getMonth() / 3)
];

const defaultStore: OKRStore = {
  objectives: SEED_DATA,
  activeQuarter: currentQuarter,
  activeYear: currentYear,
};

export function useOKRStore() {
  const [store, setStore] = useState<OKRStore>(() => {
    const saved = loadFromStorage();
    return saved ?? defaultStore;
  });

  const persist = useCallback((next: OKRStore) => {
    setStore(next);
    saveToStorage(next);
  }, []);

  // ─── Objectives ─────────────────────────────────────────────────────────────

  const addObjective = useCallback((input: CreateObjectiveInput) => {
    const now = new Date().toISOString();
    const newObjective: Objective = {
      id: uuidv4(),
      ...input,
      keyResults: [],
      overallProgress: 0,
      status: 'off-track',
      createdAt: now,
      updatedAt: now,
    };
    persist({ ...store, objectives: [...store.objectives, newObjective] });
  }, [store, persist]);

  const deleteObjective = useCallback((objectiveId: string) => {
    persist({
      ...store,
      objectives: store.objectives.filter(o => o.id !== objectiveId),
    });
  }, [store, persist]);

  const updateObjective = useCallback((objectiveId: string, changes: Partial<CreateObjectiveInput>) => {
    persist({
      ...store,
      objectives: store.objectives.map(o =>
        o.id === objectiveId
          ? { ...o, ...changes, updatedAt: new Date().toISOString() }
          : o
      ),
    });
  }, [store, persist]);

  // ─── Key Results ─────────────────────────────────────────────────────────────

  const addKeyResult = useCallback((objectiveId: string, input: CreateKeyResultInput) => {
    const now = new Date().toISOString();
    const progress = computeKRProgress(input);
    const newKR: KeyResult = {
      id: uuidv4(),
      ...input,
      progress,
      status: deriveStatus(progress),
      weeklyUpdates: [],
      createdAt: now,
      updatedAt: now,
    };

    persist({
      ...store,
      objectives: store.objectives.map(o => {
        if (o.id !== objectiveId) return o;
        const updatedKRs = [...o.keyResults, newKR];
        const overallProgress = computeObjectiveProgress(updatedKRs);
        return {
          ...o,
          keyResults: updatedKRs,
          overallProgress,
          status: deriveStatus(overallProgress),
          updatedAt: now,
        };
      }),
    });
  }, [store, persist]);

  const deleteKeyResult = useCallback((objectiveId: string, keyResultId: string) => {
    const now = new Date().toISOString();
    persist({
      ...store,
      objectives: store.objectives.map(o => {
        if (o.id !== objectiveId) return o;
        const updatedKRs = o.keyResults.filter(kr => kr.id !== keyResultId);
        const overallProgress = computeObjectiveProgress(updatedKRs);
        return {
          ...o,
          keyResults: updatedKRs,
          overallProgress,
          status: deriveStatus(overallProgress),
          updatedAt: now,
        };
      }),
    });
  }, [store, persist]);

  const updateProgress = useCallback((objectiveId: string, input: UpdateProgressInput) => {
    const now = new Date().toISOString();
    persist({
      ...store,
      objectives: store.objectives.map(o => {
        if (o.id !== objectiveId) return o;
        const updatedKRs = o.keyResults.map(kr => {
          if (kr.id !== input.keyResultId) return kr;
          const progress = computeKRProgress({
            startValue: kr.startValue,
            currentValue: input.newValue,
            targetValue: kr.targetValue,
          });
          const weekUpdate = {
            id: uuidv4(),
            date: now,
            week: currentWeekNumber(),
            note: input.updateNote,
            progressSnapshot: progress,
          };
          return {
            ...kr,
            currentValue: input.newValue,
            progress,
            status: deriveStatus(progress),
            weeklyUpdates: [...kr.weeklyUpdates, weekUpdate],
            updatedAt: now,
          };
        });
        const overallProgress = computeObjectiveProgress(updatedKRs);
        return {
          ...o,
          keyResults: updatedKRs,
          overallProgress,
          status: deriveStatus(overallProgress),
          updatedAt: now,
        };
      }),
    });
  }, [store, persist]);

  // ─── Filter / Quarter Controls ───────────────────────────────────────────────

  const setActiveQuarter = useCallback((quarter: Quarter, year: number) => {
    persist({ ...store, activeQuarter: quarter, activeYear: year });
  }, [store, persist]);

  const filteredObjectives = store.objectives.filter(
    o => o.quarter === store.activeQuarter && o.year === store.activeYear
  );

  return {
    objectives: store.objectives,
    filteredObjectives,
    activeQuarter: store.activeQuarter,
    activeYear: store.activeYear,
    addObjective,
    deleteObjective,
    updateObjective,
    addKeyResult,
    deleteKeyResult,
    updateProgress,
    setActiveQuarter,
  };
}
