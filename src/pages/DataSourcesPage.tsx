import React from 'react';
import { Server } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/StatusBadge';

export const DataSourcesPage: React.FC = () => {
  const { sources } = useApp();
  const totalRows = sources.reduce((s, x) => s + (x.rowCount || 0), 0);
  const avgQuality = sources.length
    ? Math.round((sources.reduce((s, x) => s + (x.quality || 0), 0) / sources.length) * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Data Sources
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Configured ingestion sources. Unavailable sources show as Not configured.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            {sources.length} sources
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Sources
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{sources.length}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Configured ingestion sources</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Records
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalRows.toLocaleString()}</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across all sources</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Average Quality
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-600">{avgQuality}%</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Mean source quality score</span>
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Sources
          </h2>
          <span className="text-xs text-slate-500 font-mono">Last ingestion per source</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Data Source</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Coverage</th>
                <th className="py-2.5 px-3">Records</th>
                <th className="py-2.5 px-3">Quality</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sources.map(src => (
                <tr key={src.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-700">
                        <Server className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{src.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{src.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {src.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">{src.coverage}</td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-800">{src.rows}</td>
                  <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">{src.lastIngestion}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{src.quality}%</td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={src.status} type="quality" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
