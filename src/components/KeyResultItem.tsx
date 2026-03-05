import { Pencil, Trash2 } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import type { KeyResult } from '../types';

interface KeyResultItemProps {
  keyResult: KeyResult;
  onUpdateProgress: (kr: KeyResult) => void;
  onDelete: (krId: string) => void;
}

export function KeyResultItem({ keyResult, onUpdateProgress, onDelete }: KeyResultItemProps) {
  return (
    <div className="group bg-ink-800/50 border border-ink-700 rounded-xl p-4 hover:border-ink-600 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-ink-100 text-sm font-medium leading-snug mb-1">{keyResult.title}</p>
          {keyResult.description && (
            <p className="text-ink-400 text-xs leading-relaxed">{keyResult.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge status={keyResult.status} size="sm" />
          <button
            onClick={() => onUpdateProgress(keyResult)}
            className="p-1.5 rounded-lg text-ink-500 hover:text-amber-400 hover:bg-ink-700 transition-colors opacity-0 group-hover:opacity-100"
            title="Update progress"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(keyResult.id)}
            className="p-1.5 rounded-lg text-ink-500 hover:text-rose-400 hover:bg-ink-700 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete key result"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Values row */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-ink-400">
          {keyResult.currentValue} <span className="text-ink-600">/</span> {keyResult.targetValue} {keyResult.unit}
        </span>
        <span className="font-mono text-xs font-semibold text-ink-200">
          {keyResult.progress}%
        </span>
      </div>

      <ProgressBar progress={keyResult.progress} status={keyResult.status} size="sm" />

      {/* Last update */}
      {keyResult.weeklyUpdates.length > 0 && (
        <p className="text-xs text-ink-500 mt-2 truncate">
          Last: {keyResult.weeklyUpdates[keyResult.weeklyUpdates.length - 1].note}
        </p>
      )}
    </div>
  );
}
