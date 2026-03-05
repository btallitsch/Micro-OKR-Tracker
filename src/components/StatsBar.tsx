import { Target, TrendingUp, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import type { ProgressStats } from '../types';

interface StatsBarProps {
  stats: ProgressStats;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
}

function StatCard({ label, value, icon, accent, sub }: StatCardProps) {
  return (
    <div className="bg-ink-800 border border-ink-700 rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-ink-700 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className={`font-mono text-2xl font-semibold tabular-nums ${accent}`}>{value}</p>
        <p className="text-ink-400 text-xs">{label}</p>
        {sub && <p className="text-ink-600 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard
        label="Total Objectives"
        value={stats.total}
        icon={<Target size={16} />}
        accent="text-ink-200"
      />
      <StatCard
        label="Avg. Progress"
        value={`${stats.averageProgress}%`}
        icon={<Activity size={16} />}
        accent="text-amber-400"
      />
      <StatCard
        label="On Track"
        value={stats.onTrack}
        icon={<TrendingUp size={16} />}
        accent="text-emerald-400"
      />
      <StatCard
        label="At Risk"
        value={stats.atRisk}
        icon={<AlertTriangle size={16} />}
        accent="text-amber-400"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        icon={<CheckCircle2 size={16} />}
        accent="text-sky-400"
      />
    </div>
  );
}
