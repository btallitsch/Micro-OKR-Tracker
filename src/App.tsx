import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useOKRStore } from './hooks/useOKRStore';
import { ObjectiveCard } from './components/ObjectiveCard';
import { StatsBar } from './components/StatsBar';
import { QuarterSelector } from './components/QuarterSelector';
import { AddObjectiveModal } from './components/AddObjectiveModal';
import { AddKeyResultModal } from './components/AddKeyResultModal';
import { UpdateProgressModal } from './components/UpdateProgressModal';
import { WeeklyLogsModal } from './components/WeeklyLogsModal';
import type { Objective, KeyResult, CreateObjectiveInput, CreateKeyResultInput, UpdateProgressInput, Quarter } from './types';
import { computeProgressStats } from './utils';

export default function App() {
  const {
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
  } = useOKRStore();

  // Modal state
  const [showAddObjective, setShowAddObjective] = useState(false);
  const [addKRForObjectiveId, setAddKRForObjectiveId] = useState<string | null>(null);
  const [updateProgressTarget, setUpdateProgressTarget] = useState<{ objectiveId: string; kr: KeyResult } | null>(null);
  const [logsObjective, setLogsObjective] = useState<Objective | null>(null);

  const stats = computeProgressStats(filteredObjectives);

  function handleAddObjective(input: CreateObjectiveInput) {
    addObjective(input);
  }

  function handleAddKeyResult(input: CreateKeyResultInput) {
    if (!addKRForObjectiveId) return;
    addKeyResult(addKRForObjectiveId, input);
  }

  function handleUpdateProgress(input: UpdateProgressInput) {
    if (!updateProgressTarget) return;
    updateProgress(updateProgressTarget.objectiveId, input);
  }

  const addKRObjective = filteredObjectives.find(o => o.id === addKRForObjectiveId) ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-ink-400 text-sm font-mono">Loading objectives...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-400 text-sm font-mono">Error: {error}</p>
          <p className="text-ink-500 text-xs mt-2">Check your Supabase environment variables in Vercel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ink-100 font-body">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-ink-950/90 backdrop-blur-md border-b border-ink-800">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center">
              <Target size={16} className="text-ink-950" />
            </div>
            <div>
              <h1 className="font-display text-xl text-ink-100 leading-none">OKR Tracker</h1>
              <p className="text-xs text-ink-500 font-mono mt-0.5">Micro Goals Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <QuarterSelector
              quarter={activeQuarter}
              year={activeYear}
              onChange={(q: Quarter, y: number) => setActiveQuarter(q, y)}
            />
            <button
              onClick={() => setShowAddObjective(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 text-ink-950 rounded-xl font-medium text-sm hover:bg-amber-300 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New Objective</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-5 py-8 space-y-8">
        {/* Stats Row */}
        <StatsBar stats={stats} />

        {/* Objectives Grid */}
        {filteredObjectives.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-ink-800 border border-ink-700 flex items-center justify-center mx-auto mb-4">
              <Target size={28} className="text-ink-500" />
            </div>
            <h2 className="font-display text-2xl text-ink-300 mb-2">No objectives yet</h2>
            <p className="text-ink-500 text-sm mb-6">
              Create your first objective for {activeQuarter} {activeYear}
            </p>
            <button
              onClick={() => setShowAddObjective(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-ink-950 rounded-xl font-medium hover:bg-amber-300 transition-colors"
            >
              <Plus size={18} />
              Create Objective
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredObjectives.map(objective => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                onAddKeyResult={id => setAddKRForObjectiveId(id)}
                onUpdateProgress={(objId, kr) => setUpdateProgressTarget({ objectiveId: objId, kr })}
                onDeleteKeyResult={(objId, krId) => deleteKeyResult(objId, krId)}
                onDeleteObjective={id => deleteObjective(id)}
                onViewLogs={obj => setLogsObjective(obj)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-800 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between text-ink-600 text-xs font-mono">
          <span>OKR Tracker v1.0</span>
          <span>Data stored locally in your browser</span>
        </div>
      </footer>

      {/* Modals */}
      <AddObjectiveModal
        isOpen={showAddObjective}
        onClose={() => setShowAddObjective(false)}
        onSubmit={handleAddObjective}
        defaultQuarter={activeQuarter}
        defaultYear={activeYear}
      />

      <AddKeyResultModal
        isOpen={!!addKRForObjectiveId}
        onClose={() => setAddKRForObjectiveId(null)}
        onSubmit={handleAddKeyResult}
        objectiveTitle={addKRObjective?.title ?? ''}
      />

      <UpdateProgressModal
        isOpen={!!updateProgressTarget}
        onClose={() => setUpdateProgressTarget(null)}
        onSubmit={handleUpdateProgress}
        keyResult={updateProgressTarget?.kr ?? null}
      />

      <WeeklyLogsModal
        isOpen={!!logsObjective}
        onClose={() => setLogsObjective(null)}
        objective={logsObjective}
      />
    </div>
  );
}
