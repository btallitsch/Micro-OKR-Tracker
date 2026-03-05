import { useState } from 'react';
import { Modal } from './Modal';
import type { CreateKeyResultInput } from '../types';

interface AddKeyResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateKeyResultInput) => void;
  objectiveTitle: string;
}

const UNIT_PRESETS = ['%', '$', 'users', 'tickets', 'days', 'points', 'reviews', 'sessions', 'custom'];

export function AddKeyResultModal({
  isOpen,
  onClose,
  onSubmit,
  objectiveTitle,
}: AddKeyResultModalProps) {
  const [form, setForm] = useState<CreateKeyResultInput>({
    title: '',
    description: '',
    startValue: 0,
    currentValue: 0,
    targetValue: 100,
    unit: '%',
  });
  const [customUnit, setCustomUnit] = useState('');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (form.targetValue <= form.startValue) newErrors.targetValue = 'Target must be greater than start value';
    if (form.currentValue < form.startValue) newErrors.currentValue = 'Current cannot be less than start value';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const unit = form.unit === 'custom' ? customUnit : form.unit;
    onSubmit({ ...form, unit });
    reset();
    onClose();
  }

  function reset() {
    setForm({ title: '', description: '', startValue: 0, currentValue: 0, targetValue: 100, unit: '%' });
    setCustomUnit('');
    setErrors({});
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Key Result"
      subtitle={`For: ${objectiveTitle}`}
      width="lg"
    >
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink-200 mb-1.5">
            Key Result <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Increase conversion rate from 2% to 5%"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400/60 transition-colors text-sm"
          />
          {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-ink-200 mb-1.5">Description</label>
          <input
            type="text"
            placeholder="Optional details..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400/60 transition-colors text-sm"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-ink-200 mb-2">Measurement Unit</label>
          <div className="flex gap-2 flex-wrap">
            {UNIT_PRESETS.map(unit => (
              <button
                key={unit}
                onClick={() => setForm(f => ({ ...f, unit }))}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${
                  form.unit === unit
                    ? 'bg-amber-400 text-ink-950 font-medium'
                    : 'bg-ink-700 text-ink-300 hover:text-ink-100 border border-ink-600'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
          {form.unit === 'custom' && (
            <input
              type="text"
              placeholder="Custom unit (e.g. NPS, sprints)"
              value={customUnit}
              onChange={e => setCustomUnit(e.target.value)}
              className="mt-2 w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400/60 transition-colors text-sm"
            />
          )}
        </div>

        {/* Values */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-200 mb-1.5">Start Value</label>
            <input
              type="number"
              value={form.startValue}
              onChange={e => setForm(f => ({ ...f, startValue: Number(e.target.value), currentValue: Number(e.target.value) }))}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-400/60 transition-colors text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-200 mb-1.5">Current Value</label>
            <input
              type="number"
              value={form.currentValue}
              onChange={e => setForm(f => ({ ...f, currentValue: Number(e.target.value) }))}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-400/60 transition-colors text-sm font-mono"
            />
            {errors.currentValue && <p className="text-rose-400 text-xs mt-1">{errors.currentValue}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-200 mb-1.5">
              Target Value <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              value={form.targetValue}
              onChange={e => setForm(f => ({ ...f, targetValue: Number(e.target.value) }))}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-400/60 transition-colors text-sm font-mono"
            />
            {errors.targetValue && <p className="text-rose-400 text-xs mt-1">{errors.targetValue}</p>}
          </div>
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
            Add Key Result
          </button>
        </div>
      </div>
    </Modal>
  );
}
