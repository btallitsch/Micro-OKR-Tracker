import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Modal } from './Modal';
import { ProgressBar } from './ProgressBar';
import type { KeyResult, UpdateProgressInput } from '../types';
import { computeKRProgress, deriveStatus } from '../utils';

interface UpdateProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: UpdateProgressInput) => void;
  keyResult: KeyResult | null;
}

export function UpdateProgressModal({
  isOpen,
  onClose,
  onSubmit,
  keyResult,
}: UpdateProgressModalProps) {
  const [newValue, setNewValue] = useState<number>(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Sync newValue when KR changes
  const effectiveValue = keyResult?.currentValue ?? 0;

  function handleOpen() {
    setNewValue(effectiveValue);
  }

  function handleSubmit() {
    if (!keyResult) return;
    if (newValue < keyResult.startValue) {
      setError(`Value can't be less than start value (${keyResult.startValue})`);
      return;
    }
    onSubmit({
      keyResultId: keyResult.id,
      newValue,
      updateNote: note || 'Progress updated.',
    });
    setNote('');
    setError('');
    onClose();
  }

  function handleClose() {
    setNote('');
    setError('');
    onClose();
  }

  if (!keyResult) return null;

  const previewProgress = computeKRProgress({
    startValue: keyResult.startValue,
    currentValue: newValue,
    targetValue: keyResult.targetValue,
  });
  const previewStatus = deriveStatus(previewProgress);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Progress"
      subtitle={keyResult.title}
    >
      <div className="space-y-5" onLoad={handleOpen}>
        {/* Current → New value */}
        <div className="bg-ink-700 rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-xs text-ink-400 font-mono">
            <span>Start: {keyResult.startValue} {keyResult.unit}</span>
            <span>Target: {keyResult.targetValue} {keyResult.unit}</span>
          </div>
          <ProgressBar progress={previewProgress} status={previewStatus} size="lg" showLabel />
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-400">Was: <span className="text-ink-200 font-mono">{keyResult.currentValue} {keyResult.unit}</span></span>
            <TrendingUp size={14} className="text-amber-400" />
            <span className="text-ink-400">Now: <span className="text-amber-400 font-mono">{newValue} {keyResult.unit}</span></span>
          </div>
        </div>

        {/* New value input */}
        <div>
          <label className="block text-sm font-medium text-ink-200 mb-1.5">
            New Value ({keyResult.unit})
          </label>
          <input
            type="number"
            value={newValue}
            onChange={e => { setNewValue(Number(e.target.value)); setError(''); }}
            className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-400/60 transition-colors text-sm font-mono"
          />
          {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
        </div>

        {/* Weekly note */}
        <div>
          <label className="block text-sm font-medium text-ink-200 mb-1.5">
            Weekly Update Note
          </label>
          <textarea
            rows={3}
            placeholder="What drove this change? Any blockers?"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400/60 transition-colors text-sm resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-ink-700">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-ink-300 hover:text-ink-100 hover:bg-ink-700 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-ink-950 font-medium text-sm hover:bg-amber-300 transition-colors"
          >
            Save Update
          </button>
        </div>
      </div>
    </Modal>
  );
}
