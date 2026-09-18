import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileCheck2,
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { DATA_QUALITY_METRICS, DATASET_QUALITY_BREAKDOWN } from '../data/mockData';
import { DatasetQuality } from '../types';
import { api } from '../services/api';

export const DataQualityPage: React.FC = () => {
  const [reports, setReports] = useState<any[] | null>(null);
  useEffect(() => {
    api.quality().then((r: any) => { if (Array.isArray(r)) setReports(r); }).catch(() => undefined);
  }, []);
  const latest = reports && reports.length > 0 ? reports[0] : null;
  const quality = latest
    ? {
        overallQuality: Math.round(((latest.completeness + latest.validity + latest.consistency) / 3) * 10) / 10,
        completeness: latest.completeness, validity: latest.validity,
        outlierRecordsCount: latest.outliers,
      }
    : DATA_QUALITY_METRICS;
  const datasets: DatasetQuality[] = latest
    ? reports!.slice(0, 10).map((r: any) => ({
        dataset: r.dataset, records: String(r.records), completeness: r.completeness,
        validity: r.validity, consistency: r.consistency, outliers: r.outliers,
        status: r.completeness >= 95 && r.validity >= 95 ? 'Good' : 'Attention',
      }))
    : DATASET_QUALITY_BREAKDOWN;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Data Quality
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Completeness, validity, and outlier checks from ingestion runs.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            {latest ? `Latest: ${latest.dataset}` : 'Showing bundled data (API offline)'}
          </span>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          id="kpi-overall-quality"
          title="Overall Quality"
          metric={`${quality.overallQuality}%`}
          context="Mean of completeness, validity, consistency"
          status="healthy"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          id="kpi-completeness"
          title="Completeness"
          metric={`${quality.completeness}%`}
          context="Non-missing values"
          status="healthy"
          icon={<Activity className="w-4 h-4 text-blue-600" />}
        />
        <KpiCard
          id="kpi-validity"
          title="Validity"
          metric={`${quality.validity}%`}
          context="Values within physical limits"
          status="healthy"
          icon={<FileCheck2 className="w-4 h-4 text-slate-600" />}
        />
        <KpiCard
          id="kpi-outliers"
          title="Outliers"
          metric={`${quality.outlierRecordsCount}`}
          context="Flagged for review"
          status="warning"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* Dataset Quality Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Reports by Dataset
            </h2>
            <p className="text-xs text-slate-500">
              One row per ingestion run
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{datasets.length} reports</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Dataset</th>
                <th className="py-2.5 px-3">Records</th>
                <th className="py-2.5 px-3">Completeness</th>
                <th className="py-2.5 px-3">Validity</th>
                <th className="py-2.5 px-3">Consistency</th>
                <th className="py-2.5 px-3">Outliers</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {datasets.map((item: DatasetQuality) => (
                <tr key={item.dataset} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {item.dataset}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.records}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${item.completeness}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-slate-800">
                        {item.completeness}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800 font-semibold">
                    {item.validity}%
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{item.consistency}%</td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    <span className={item.outliers > 20 ? 'text-amber-700 font-bold' : ''}>
                      {item.outliers}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'Good'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Telemetry Validation Rules */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Validation Rules
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Enforced on every CSV upload</span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Physical Range Validation</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                <CheckCircle2 className="w-3 h-3" /> Enforced
              </span>
            </div>
            <p className="text-xs text-slate-600">Rejects temperature outside -50°C to 150°C.</p>
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Limit: <strong>-50°C to 150°C</strong></span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Vibration Range Check</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                <CheckCircle2 className="w-3 h-3" /> Enforced
              </span>
            </div>
            <p className="text-xs text-slate-600">Rejects vibration outside 0–25 mm/s.</p>
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Limit: <strong>0–25 mm/s</strong></span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Timestamp and Machine Check</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                <CheckCircle2 className="w-3 h-3" /> Enforced
              </span>
            </div>
            <p className="text-xs text-slate-600">Requires ISO datetimes and known machine IDs.</p>
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Format: <strong>ISO 8601</strong></span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Rejected Rows Reported</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                <CheckCircle2 className="w-3 h-3" /> Enforced
              </span>
            </div>
            <p className="text-xs text-slate-600">Bad rows are rejected with line-numbered reasons, never silently dropped.</p>
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Errors: <strong>returned per upload</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
