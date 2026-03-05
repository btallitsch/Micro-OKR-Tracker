import type { OKRStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS, STATUS_BG } from '../utils';

interface StatusBadgeProps {
  status: OKRStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-xs';
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-mono font-medium
        ${textSize} ${padding}
        ${STATUS_COLORS[status]} ${STATUS_BG[status]}
      `}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
