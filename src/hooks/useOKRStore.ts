import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import type {
  Objective, KeyResult, Quarter,
  CreateObjectiveInput, CreateKeyResultInput, UpdateProgressInput,
} from '../types';
import {
  computeKRProgress, computeObjectiveProgress,
  deriveStatus, currentWeekNumber,
} from '../utils';

const currentYear = new Date().getFullYear();
const currentQuarter: Quarter = (['Q1','Q2','Q3','Q4'] as Quarter[])[
  Math.floor(new Date().getMonth() / 3)
];

// ─── DB row → app type converters ─────────────────────────────────────────────

function dbToObjective(row: Record<string, unknown>, keyResults: KeyResult[] = []): Objective {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    owner: row.owner as string,
    quarter: row.quarter as Quarter,
    year: row.year as number,
    color: row.color as Objective['color'],
    overallProgress: row.overall_progress as number,
    status: row.status as Objective['status'],
    keyResults,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function dbToKeyResult(
  row: Record<string, unknown>,
  updates: KeyResult['weeklyUpdates'] = []
): KeyResult {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    unit: row.unit as string,
    startValue: row.start_value as number,
    currentValue: row.current_value as number,
    targetValue: row.target_value as number,
    progress: row.progress as number,
    status: row.status as KeyResult['status'],
    weeklyUpdates: updates,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOKRStore() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQuarter, setActiveQuarterState] = useState<Quarter>(currentQuarter);
  const [activeYear, setActiveYearState] = useState(currentYear);

  // ─── Fetch all data ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: objRows, error: e1 }, { data: krRows, error: e2 }, { data: updateRows, error: e3 }] =
        await Promise.all([
          supabase.from('objectives').select('*').order('created_at', { ascending: true }),
          supabase.from('key_results').select('*').order('created_at', { ascending: true }),
          supabase.from('weekly_updates').select('*').order('date', { ascending: true }),
        ]);

      if (e1 || e2 || e3) throw new Error('Failed to load data from Supabase');

      // Group updates by key_result_id
      const updatesByKR: Record<string, KeyResult['weeklyUpdates']> = {};
      for (const u of updateRows ?? []) {
        const krId = u.key_result_id as string;
        if (!updatesByKR[krId]) updatesByKR[krId] = [];
        updatesByKR[krId].push({
          id: u.id,
          date: u.date,
          week: u.week,
          note: u.note,
          progressSnapshot: u.progress_snapshot,
        });
      }

      // Group key results by objective_id
      const krsByObj: Record<string, KeyResult[]> = {};
      for (const kr of krRows ?? []) {
        const objId = kr.objective_id as string;
        if (!krsByObj[objId]) krsByObj[objId] = [];
        krsByObj[objId].push(dbToKeyResult(kr, updatesByKR[kr.id] ?? []));
      }

      setObjectives((objRows ?? []).map(o => dbToObjective(o, krsByObj[o.id] ?? [])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Objectives ──────────────────────────────────────────────────────────────

  const addObjective = useCallback(async (input: CreateObjectiveInput) => {
    const { data, error } = await supabase
      .from('objectives')
      .insert({
        id: uuidv4(),
        title: input.title,
        description: input.description ?? null,
        owner: input.owner,
        quarter: input.quarter,
        year: input.year,
        color: input.color,
        overall_progress: 0,
        status: 'off-track',
      })
      .select()
      .single();

    if (!error && data) {
      setObjectives(prev => [...prev, dbToObjective(data)]);
    }
  }, []);

  const deleteObjective = useCallback(async (objectiveId: string) => {
    await supabase.from('objectives').delete().eq('id', objectiveId);
    setObjectives(prev => prev.filter(o => o.id !== objectiveId));
  }, []);

  // ─── Key Results ─────────────────────────────────────────────────────────────

  const addKeyResult = useCallback(async (objectiveId: string, input: CreateKeyResultInput) => {
    const progress = computeKRProgress(input);
    const status = deriveStatus(progress);
    const now = new Date().toISOString();

    const { data: krData, error } = await supabase
      .from('key_results')
      .insert({
        id: uuidv4(),
        objective_id: objectiveId,
        title: input.title,
        description: input.description ?? null,
        unit: input.unit,
        start_value: input.startValue,
        current_value: input.currentValue,
        target_value: input.targetValue,
        progress,
        status,
      })
      .select()
      .single();

    if (error || !krData) return;

    const newKR = dbToKeyResult(krData);

    setObjectives(prev => prev.map(o => {
      if (o.id !== objectiveId) return o;
      const updatedKRs = [...o.keyResults, newKR];
      const overallProgress = computeObjectiveProgress(updatedKRs);
      const newStatus = deriveStatus(overallProgress);
      supabase.from('objectives')
        .update({ overall_progress: overallProgress, status: newStatus, updated_at: now })
        .eq('id', objectiveId);
      return { ...o, keyResults: updatedKRs, overallProgress, status: newStatus };
    }));
  }, []);

  const deleteKeyResult = useCallback(async (objectiveId: string, keyResultId: string) => {
    await supabase.from('key_results').delete().eq('id', keyResultId);
    const now = new Date().toISOString();

    setObjectives(prev => prev.map(o => {
      if (o.id !== objectiveId) return o;
      const updatedKRs = o.keyResults.filter(kr => kr.id !== keyResultId);
      const overallProgress = computeObjectiveProgress(updatedKRs);
      const status = deriveStatus(overallProgress);
      supabase.from('objectives')
        .update({ overall_progress: overallProgress, status, updated_at: now })
        .eq('id', objectiveId);
      return { ...o, keyResults: updatedKRs, overallProgress, status };
    }));
  }, []);

  // ─── Progress Updates ────────────────────────────────────────────────────────

  const updateProgress = useCallback(async (objectiveId: string, input: UpdateProgressInput) => {
    const now = new Date().toISOString();

    setObjectives(prev => prev.map(o => {
      if (o.id !== objectiveId) return o;

      const updatedKRs = o.keyResults.map(kr => {
        if (kr.id !== input.keyResultId) return kr;

        const progress = computeKRProgress({
          startValue: kr.startValue,
          currentValue: input.newValue,
          targetValue: kr.targetValue,
        });
        const status = deriveStatus(progress);
        const newUpdate = {
          id: uuidv4(),
          date: now,
          week: currentWeekNumber(),
          note: input.updateNote,
          progressSnapshot: progress,
        };

        supabase.from('key_results')
          .update({ current_value: input.newValue, progress, status, updated_at: now })
          .eq('id', kr.id);

        supabase.from('weekly_updates').insert({
          id: newUpdate.id,
          key_result_id: kr.id,
          date: now,
          week: newUpdate.week,
          note: input.updateNote,
          progress_snapshot: progress,
        });

        return {
          ...kr,
          currentValue: input.newValue,
          progress,
          status,
          weeklyUpdates: [...kr.weeklyUpdates, newUpdate],
          updatedAt: now,
        };
      });

      const overallProgress = computeObjectiveProgress(updatedKRs);
      const status = deriveStatus(overallProgress);

      supabase.from('objectives')
        .update({ overall_progress: overallProgress, status, updated_at: now })
        .eq('id', objectiveId);

      return { ...o, keyResults: updatedKRs, overallProgress, status, updatedAt: now };
    }));
  }, []);

  // ─── Quarter Controls ─────────────────────────────────────────────────────────

  const setActiveQuarter = useCallback((quarter: Quarter, year: number) => {
    setActiveQuarterState(quarter);
    setActiveYearState(year);
  }, []);

  const filteredObjectives = objectives.filter(
    o => o.quarter === activeQuarter && o.year === activeYear
  );

  return {
    objectives,
    filteredObjectives,
    activeQuarter,
    activeYear,
    loading,
    error,
    addObjective,
    deleteObjective,
    addKeyResult,
    deleteKeyResult,
    updateProgress,
    setActiveQuarter,
  };
}
