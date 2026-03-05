import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Quarter } from '../types';

interface QuarterSelectorProps {
  quarter: Quarter;
  year: number;
  onChange: (quarter: Quarter, year: number) => void;
}

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

function nextQuarter(q: Quarter, y: number): [Quarter, number] {
  const idx = QUARTERS.indexOf(q);
  if (idx === 3) return ['Q1', y + 1];
  return [QUARTERS[idx + 1], y];
}

function prevQuarter(q: Quarter, y: number): [Quarter, number] {
  const idx = QUARTERS.indexOf(q);
  if (idx === 0) return ['Q4', y - 1];
  return [QUARTERS[idx - 1], y];
}

export function QuarterSelector({ quarter, year, onChange }: QuarterSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-ink-800 border border-ink-700 rounded-xl p-1">
      <button
        onClick={() => { const [q, y] = prevQuarter(quarter, year); onChange(q, y); }}
        className="p-1.5 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-700 transition-colors"
      >
        <ChevronLeft size={15} />
      </button>
      <div className="flex gap-1">
        {QUARTERS.map(q => (
          <button
            key={q}
            onClick={() => onChange(q, year)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-colors ${
              q === quarter
                ? 'bg-amber-400 text-ink-950'
                : 'text-ink-400 hover:text-ink-100 hover:bg-ink-700'
            }`}
          >
            {q}
          </button>
        ))}
      </div>
      <span className="font-mono text-sm text-ink-400 px-2">{year}</span>
      <button
        onClick={() => { const [q, y] = nextQuarter(quarter, year); onChange(q, y); }}
        className="p-1.5 rounded-lg text-ink-400 hover:text-ink-100 hover:bg-ink-700 transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
