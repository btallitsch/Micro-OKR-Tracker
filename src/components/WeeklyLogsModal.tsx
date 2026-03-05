import { Calendar, TrendingUp, MessageSquare } from 'lucide-react';
import { Modal } from './Modal';
import { ProgressBar } from './ProgressBar';
import type { Objective } from '../types';
import { formatShortDate, deriveStatus } from '../utils';

interface WeeklyLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: Objective | null;
}

export function WeeklyLogsModal({ isOpen, onClose, objective }: WeeklyLogsModalProps) {
  if (!objective) return null;

  // Flatten all updates across all KRs, sorted newest first
  const allUpdates = objective.keyResults
    .flatMap(kr =>
      kr.weeklyUpdates.map(u => ({
        ...u,
        krTitle: kr.title,
        krUnit: kr.unit,
        krTarget: kr.targetValue,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Weekly Update Log"
      subtitle={objective.title}
      width="lg"
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scroll">
        {allUpdates.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={32} className="text-ink-600 mx-auto mb-3" />
            <p className="text-ink-400 text-sm">No updates logged yet.</p>
            <p className="text-ink-500 text-xs mt-1">Update a key result to start logging weekly progress.</p>
          </div>
        ) : (
          allUpdates.map(update => (
            <div
              key={update.id}
              className="bg-ink-700 border border-ink-600 rounded-xl p-4 animate-slide-in"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-ink-300 text-xs font-mono uppercase tracking-wide mb-0.5">
                    {update.krTitle}
                  </p>
                  <p className="text-ink-100 text-sm leading-relaxed">{update.note}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 text-ink-400 text-xs font-mono justify-end">
                    <Calendar size={11} />
                    {formatShortDate(update.date)}
                  </div>
                  <div className="flex items-center gap-1 text-ink-500 text-xs font-mono justify-end mt-0.5">
                    <TrendingUp size={11} />
                    Week {update.week}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <ProgressBar
                    progress={update.progressSnapshot}
                    status={deriveStatus(update.progressSnapshot)}
                    size="sm"
                  />
                </div>
                <span className="font-mono text-xs text-ink-300 tabular-nums">
                  {update.progressSnapshot}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
