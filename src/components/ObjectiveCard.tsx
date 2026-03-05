import { useState } from 'react';
import { Plus, Trash2, History, ChevronDown, ChevronUp, User } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { KeyResultItem } from './KeyResultItem';
import type { Objective, KeyResult } from '../types';
import { COLOR_MAP } from '../utils';

interface ObjectiveCardProps {
  objective: Objective;
  onAddKeyResult: (objectiveId: string) => void;
  onUpdateProgress: (objectiveId: string, kr: KeyResult) => void;
  onDeleteKeyResult: (objectiveId: string, krId: string) => void;
  onDeleteObjective: (objectiveId: string) => void;
  onViewLogs: (objective: Objective) => void;
}

export function ObjectiveCard({
  objective,
  onAddKeyResult,
  onUpdateProgress,
  onDeleteKeyResult,
  onDeleteObjective,
  onViewLogs,
}: ObjectiveCardProps) {
  const [expanded, setExpanded] = useState(true);
  const colors = COLOR_MAP[objective.color];

  return (
    <div
      className={`
        bg-ink-800 border rounded-2xl overflow-hidden transition-all duration-200 animate-slide-in
        ${colors.border}
      `}
    >
      {/* Color accent bar */}
      <div className={`h-1 w-full ${colors.bar}`} />

      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono font-semibold uppercase tracking-widest ${colors.accent}`}>
                {objective.quarter} {objective.year}
              </span>
              <span className="text-ink-600">·</span>
              <span className="flex items-center gap-1 text-xs text-ink-400">
                <User size={11} />
                {objective.owner}
              </span>
            </div>
            <h3 className="font-display text-lg text-ink-100 leading-tight mb-1">
              {objective.title}
            </h3>
            {objective.description && (
              <p className="text-ink-400 text-sm leading-relaxed">{objective.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 mt-1">
            <StatusBadge status={objective.status} />
            <button
              onClick={() => onViewLogs(objective)}
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-700 transition-colors"
              title="View weekly logs"
            >
              <History size={15} />
            </button>
            <button
              onClick={() => onDeleteObjective(objective.id)}
              className="p-1.5 rounded-lg text-ink-400 hover:text-rose-400 hover:bg-ink-700 transition-colors"
              title="Delete objective"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-700 transition-colors"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-ink-400">Overall Progress</span>
            <span className={`font-mono text-sm font-semibold ${colors.accent}`}>
              {objective.overallProgress}%
            </span>
          </div>
          <ProgressBar
            progress={objective.overallProgress}
            colorClass={colors.bar}
            size="md"
            animated
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-ink-500">
              {objective.keyResults.length} key result{objective.keyResults.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-ink-500">
              {objective.keyResults.filter(kr => kr.status === 'completed').length} completed
            </span>
          </div>
        </div>
      </div>

      {/* Key Results */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-ink-700 pt-4">
          {objective.keyResults.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-ink-500 text-sm">No key results yet.</p>
              <p className="text-ink-600 text-xs mt-1">Add measurable results to track progress.</p>
            </div>
          ) : (
            objective.keyResults.map(kr => (
              <KeyResultItem
                key={kr.id}
                keyResult={kr}
                onUpdateProgress={kr => onUpdateProgress(objective.id, kr)}
                onDelete={krId => onDeleteKeyResult(objective.id, krId)}
              />
            ))
          )}

          <button
            onClick={() => onAddKeyResult(objective.id)}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed
              text-sm font-medium transition-all duration-200
              ${colors.border} ${colors.accent}
              hover:${colors.bg} hover:opacity-80
            `}
          >
            <Plus size={15} />
            Add Key Result
          </button>
        </div>
      )}
    </div>
  );
}
