import React, { ReactNode } from 'react';

export const PageHeader: React.FC<{ title: string; subtitle?: string; right?: ReactNode }> = ({
  title,
  subtitle,
  right,
}) => (
  <div className="bg-white border border-slate-200 rounded-md p-4">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string; right?: ReactNode }> = ({
  title,
  subtitle,
  right,
}) => (
  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
    <div>
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export const EmptyState: React.FC<{ message: string; hint?: string }> = ({ message, hint }) => (
  <div className="py-8 text-center" role="status">
    <p className="text-sm text-slate-700 font-medium">{message}</p>
    {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

// Note: StateModals.tsx also exports a richer EmptyState with icon + action;
// use that one when an action button is needed.
