import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'health' | 'risk' | 'maintenance' | 'recommendation' | 'alert' | 'quality';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'health', size = 'md' }) => {
  const norm = status.toLowerCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
  let Icon = Clock;

  if (norm === 'healthy' || norm === 'resolved' || norm === 'approved' || norm === 'completed' || norm === 'good' || norm === 'low') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    Icon = CheckCircle2;
  } else if (norm === 'warning' || norm === 'medium' || norm === 'reviewed' || norm === 'in progress' || norm === 'attention' || norm === 'pending') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300';
    Icon = AlertTriangle;
  } else if (norm === 'critical' || norm === 'high' || norm === 'overdue' || norm === 'detected' || norm === 'failed' || norm === 'degraded') {
    colorClasses = 'bg-rose-50 text-rose-800 border-rose-300';
    Icon = ShieldAlert;
  } else if (norm === 'rejected') {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-300';
    Icon = AlertCircle;
  } else if (norm === 'upcoming' || norm === 'connected' || norm === 'running') {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-300';
    Icon = Clock;
  }

  const paddingClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded border ${paddingClasses} ${colorClasses} whitespace-nowrap`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
