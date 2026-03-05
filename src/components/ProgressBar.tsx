import type { OKRStatus } from '../types';

interface ProgressBarProps {
  progress: number;
  status?: OKRStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  colorClass?: string;
  animated?: boolean;
}

const SIZE_MAP = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
};

const STATUS_BAR_COLOR: Record<OKRStatus, string> = {
  'on-track': 'bg-emerald-400',
  'at-risk': 'bg-amber-400',
  'off-track': 'bg-rose-400',
  'completed': 'bg-sky-400',
};

export function ProgressBar({
  progress,
  status,
  size = 'md',
  showLabel = false,
  colorClass,
  animated = true,
}: ProgressBarProps) {
  const barColor = colorClass
    ? colorClass
    : status
    ? STATUS_BAR_COLOR[status]
    : 'bg-ink-400';

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={`flex-1 bg-ink-700 rounded-full overflow-hidden ${SIZE_MAP[size]}`}>
        <div
          className={`${SIZE_MAP[size]} rounded-full ${barColor} ${animated ? 'transition-all duration-700 ease-out' : ''}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-xs text-ink-300 tabular-nums w-8 text-right">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}
