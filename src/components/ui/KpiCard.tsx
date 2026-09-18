import React, { ReactNode } from 'react';

interface KpiCardProps {
  id?: string;
  title: string;
  metric: string | number;
  subMetric?: string | number;
  subLabel?: string;
  context?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status?: 'healthy' | 'warning' | 'critical' | 'info' | 'neutral';
  icon?: ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  id,
  title,
  metric,
  subMetric,
  subLabel,
  context,
  trend,
  trendDirection = 'neutral',
  status = 'neutral',
  icon
}) => {
  const statusBorder = {
    healthy: 'border-l-4 border-l-emerald-600',
    warning: 'border-l-4 border-l-amber-500',
    critical: 'border-l-4 border-l-rose-600',
    info: 'border-l-4 border-l-blue-600',
    neutral: 'border-l-4 border-l-slate-300'
  }[status];

  return (
    <div
      id={id || `kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`bg-white rounded-lg border border-slate-200 p-4 shadow-xs transition-shadow hover:shadow-sm ${statusBorder}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{metric}</span>
        {subMetric !== undefined && subLabel && (
          <span className="text-xs text-slate-500 font-medium">
            / <span className="text-slate-700 font-semibold">{subMetric}</span> {subLabel}
          </span>
        )}
      </div>

      {(context || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          {context && <span>{context}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trendDirection === 'down'
                  ? 'text-emerald-700'
                  : trendDirection === 'up'
                  ? 'text-rose-700'
                  : 'text-slate-600'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
