import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: {
    value: string;
    isGood?: boolean; // e.g. lower wait time is good
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  subtitle?: string;
  icon?: React.ReactNode;
  severity?: 'normal' | 'moderate' | 'critical';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  change,
  subtitle,
  icon,
  severity = 'normal',
}) => {
  const severityBorder =
    severity === 'critical'
      ? 'border-l-4 border-l-rose-500'
      : severity === 'moderate'
      ? 'border-l-4 border-l-amber-500'
      : '';

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 transition-all duration-150 ${severityBorder}`}>
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500 font-medium">{unit}</span>}
      </div>

      {change && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`inline-flex items-center font-medium ${
              change.isGood === true
                ? 'text-emerald-700'
                : change.isGood === false
                ? 'text-rose-700'
                : 'text-slate-600'
            }`}
          >
            {change.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {change.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {change.direction === 'neutral' && <Minus className="w-3.5 h-3.5 mr-0.5" />}
            {change.value}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500 truncate">{change.label}</span>
        </div>
      )}

      {subtitle && !change && (
        <div className="text-xs text-slate-500 truncate">{subtitle}</div>
      )}
    </div>
  );
};
