import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Layers,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/StateModals';
import { ANALYSIS_RUNS_DATA } from '../data/mockData';
import { AnalysisRunItem } from '../types';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const RunsPage: React.FC = () => {
  const { runs: ctxRuns, apiOnline } = useApp();
  const [runs, setRuns] = useState<AnalysisRunItem[]>(ctxRuns.length > 0 ? ctxRuns : ANALYSIS_RUNS_DATA);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerStep, setTriggerStep] = useState<'idle' | 'running' | 'completed'>('idle');
  const [modalOpen, setModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState<{ run_id: string; anomalies_found: number } | null>(null);

  const handleTriggerRun = async () => {
    setModalOpen(true);
    setTriggerStep('running');
    setIsTriggering(true);
    try {
      const res: any = await api.detectRun();
      setLastResult({ run_id: res.run_id, anomalies_found: res.anomalies_found });
      const newRun: AnalysisRunItem = {
        id: res.run_id, started: 'Just now', completed: 'Just now', dataset: 'sensor_readings',
        records: '', status: 'Completed', duration: '', trigger: 'Manual',
        findings: `${res.anomalies_found} anomalies`,
      };
      setRuns(prev => [newRun, ...prev]);
    } catch {
      setLastResult(null);
    } finally {
      setTriggerStep('completed');
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Analysis Runs</h1>
            <p className="text-xs text-slate-600 mt-1">
              Ingestion, anomaly detection, and model training runs.{!apiOnline && ' Showing bundled data (API offline).'}
            </p>
          </div>

          <button
            type="button"
            disabled={isTriggering}
            onClick={handleTriggerRun}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1.5 self-start md:self-auto disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run Detection
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <KpiCard
          id="kpi-total-runs"
          title="Total Runs"
          metric={runs.length}
          context="Recorded runs"
          status="info"
          icon={<Layers className="w-4 h-4 text-blue-600" />}
        />
        <KpiCard
          id="kpi-success-rate"
          title="Completed"
          metric={runs.filter(r => r.status === 'Completed').length}
          context="Runs with Completed status"
          status="healthy"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          id="kpi-failed-runs"
          title="Failed"
          metric={runs.filter(r => r.status === 'Failed').length}
          context="Runs needing review"
          status={runs.some(r => r.status === 'Failed') ? 'warning' : 'healthy'}
          icon={<ShieldAlert className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* Main Runs Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Run Log
          </h2>
          <span className="text-xs text-slate-500 font-mono">{runs.length} runs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Run ID</th>
                <th className="py-2.5 px-3">Execution Time</th>
                <th className="py-2.5 px-3">Dataset Source</th>
                <th className="py-2.5 px-3">Records</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Trigger Type</th>
                <th className="py-2.5 px-4">Key Findings</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {runs.map((run: AnalysisRunItem) => (
                <tr key={run.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{run.id}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                    {run.started}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{run.dataset}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{run.records}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{run.duration}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {run.trigger}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium max-w-xs">{run.findings}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        run.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : run.status === 'Running'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Anomaly Detection Run"
        subtitle="Rolling-z scan across machines and sensors"
        footer={
          triggerStep === 'completed' ? (
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800"
            >
              Done
            </button>
          ) : undefined
        }
      >
        <div className="py-4 text-center space-y-3">
          {triggerStep === 'running' ? (
            <div className="space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                Running detection...
              </h4>
              <p className="text-xs text-slate-600">
                Scanning stored sensor readings with the rolling-z method.
              </p>
            </div>
          ) : lastResult ? (
            <div className="space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">
                Run completed
              </h4>
              <p className="text-xs text-slate-600">
                Run {lastResult.run_id}: {lastResult.anomalies_found} anomalies found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">
                Run failed
              </h4>
              <p className="text-xs text-slate-600">
                Could not reach the API. Check that the backend is running.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
