import { useState } from 'react';
import { Modal } from './Modal';
import type { CreateObjectiveInput, Quarter } from '../types';
import { OBJECTIVE_COLORS, COLOR_MAP } from '../utils';

interface AddObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateObjectiveInput) => void;
  defaultQuarter: Quarter;
  defaultYear: number;
}

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

export function AddObjectiveModal({
  isOpen,
  onClose,
  onSubmit,
  defaultQuarter,
  defaultYear,
}: AddObjectiveModalProps) {
  const [form, setForm] = useState<CreateObjectiveInput>({
    title: '',
    description: '',
    owner: '',
    quarter: defaultQuarter,
    year: defaultYear,
    color: 'amber',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateObjectiveInput, string>>>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.owner.trim()) newErrors.owner = 'Owner is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit(form);
    setForm({ title: '', description: '', owner: '', quarter: defaultQuarter, year: defaultYear, color: 'amber' });
    setErrors({});
    onClose();
  }

  function handleClose() {
    setForm({ title: '', description: '', owner: '', quarter: defaultQuarter, year: defaultYear, color: 'amber' });
    setErrors({});
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New Objective"
      subtitle="Define a clear, inspiring goal for your team."
      width="lg"
    >
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-ink-200 mb-1.5">
            Objective Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Become the #1 product in our category"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400/60 transition-colors text-sm"
          />
          {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-ink-200 mb-1.5">Description</label>
          <textarea
            placeholder="Optional context or rationale..."
            rows={2}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400/60 transition-colors text-sm resize-none"
          />
        </div>

        {/* Owner + Quarter + Year row */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-200 mb-1.5">
              Owner <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Team or person"
              value={form.owner}
              onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 placeholder-ink-500 focus:outline-none focus:border-amber-400/60 transition-colors text-sm"
            />
            {errors.owner && <p className="text-rose-400 text-xs mt-1">{errors.owner}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-200 mb-1.5">Quarter</label>
            <select
              value={form.quarter}
              onChange={e => setForm(f => ({ ...f, quarter: e.target.value as Quarter }))}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-400/60 transition-colors text-sm"
            >
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-200 mb-1.5">Year</label>
            <select
              value={form.year}
              onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 focus:outline-none focus:border-amber-400/60 transition-colors text-sm"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-ink-200 mb-2">Color Tag</label>
          <div className="flex gap-2">
            {OBJECTIVE_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setForm(f => ({ ...f, color }))}
                className={`w-8 h-8 rounded-full border-2 transition-all ${COLOR_MAP[color].bar} ${
                  form.color === color
                    ? 'border-ink-100 scale-110'
                    : 'border-transparent opacity-50 hover:opacity-80'
                }`}
                title={color}
              />
            ))}
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
            Create Objective
          </button>
        </div>
      </div>
    </Modal>
  );
}
