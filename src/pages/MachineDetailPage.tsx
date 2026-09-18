import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Layers,
  Calendar,
  Activity,
  UserCheck,
  Check,
  Flame,
  Gauge
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/StateModals';
import { api } from '../services/api';
import {
  M042_SENSOR_HISTORY,
  M042_EVENTS,
  M042_MAINTENANCE_HISTORY
} from '../data/mockData';

export const MachineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMachineById, thresholds } = useApp();

  const machineId = id || 'M-001';
  const machine = getMachineById(machineId);
  const [detail, setDetail] = useState<any | null>(null);
  const [trend, setTrend] = useState<any | null>(null);
  const [anomalies, setAnomalies] = useState<any[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!machine) return;
    Promise.all([
      api.machine(machine.id).catch(() => null),
      api.trend(machine.id, 'vibration', 'raw').catch(() => null),
      api.anomalies(machine.id).catch(() => null),
    ]).then(([d, t, a]) => {
      if (cancelled) return;
      setDetail(d);
      setTrend(t);
      setAnomalies(Array.isArray(a) ? a : null);
    });
    return () => { cancelled = true; };
  }, [machine?.id]);

  if (!machine) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-600">
        Machine {machineId} not found. <button type="button" onClick={() => navigate('/machines')} className="text-blue-600 font-semibold">Back to machines</button>
      </div>
    );
  }

  const liveReadings: any[] = detail?.readings ?? [];
  const chartRows = liveReadings.length > 0
    ? liveReadings.map((r: any) => ({ ...r, timeLabel: String(r.ts).slice(0, 16).replace('T', ' ') }))
    : M042_SENSOR_HISTORY;
  const events = anomalies ?? M042_EVENTS.map(e => ({ id: e.id, ts: e.time, description: e.description, severity: e.severity }));
  const history = detail?.maintenance?.length > 0
    ? detail.maintenance.map((m: any) => ({ date: m.due_date ?? '', maintenance: m.type ?? '', technician: m.assigned_to ?? '', duration: m.est_downtime ?? '', result: m.status ?? '' }))
    : M042_MAINTENANCE_HISTORY;
  const evidence: string[] = (() => {
    try {
      const f = detail?.risk?.evidence ? JSON.parse(detail.risk.evidence) : null;
      if (Array.isArray(f) && f.length > 0) return f.map((x: any) => `${x.factor}: ${x.value} (baseline ${x.baseline})`);
    } catch { /* fallback below */ }
    return machine.evidence ?? [];
  })();

  const [activeSensorTab, setActiveSensorTab] = useState<'vibration' | 'temperature' | 'pressure' | 'rpm' | 'current'>('vibration');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledSuccess, setScheduledSuccess] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-09-20');
  const [assignedTeam, setAssignedTeam] = useState('Maintenance Team A');

  // Sensor tab configurations with exact thresholds
  const sensorConfigs = {
    vibration: {
      label: 'Vibration',
      unit: 'mm/s',
      current: machine.vibration,
      baseline: trend?.stats?.baseline ?? 4.9,
      warning: thresholds.vibWarning,
      critical: thresholds.vibCritical,
      dataKey: 'vibration',
      baselineKey: 'baselineVibration',
      warningKey: 'warningVibration',
      criticalKey: 'criticalVibration',
      min: 3.5,
      max: 8.0,
      color: '#2563eb'
    },
    temperature: {
      label: 'Temperature',
      unit: '°C',
      current: machine.temperature,
      baseline: 68.8,
      warning: thresholds.tempWarning,
      critical: thresholds.tempCritical,
      dataKey: 'temperature',
      baselineKey: 'baselineTemperature',
      warningKey: 'warningTemperature',
      criticalKey: 'criticalTemperature',
      min: 55,
      max: 95,
      color: '#e11d48'
    },
    pressure: {
      label: 'Discharge Pressure',
      unit: 'bar',
      current: machine.pressure,
      baseline: 8.0,
      warning: 9.5,
      critical: 11.0,
      dataKey: 'pressure',
      baselineKey: 'baselinePressure',
      warningKey: 'warningPressure',
      criticalKey: 'criticalPressure',
      min: 6,
      max: 12,
      color: '#0d9488'
    },
    rpm: {
      label: 'Shaft Speed',
      unit: 'RPM',
      current: machine.rpm,
      baseline: 3450,
      warning: 3550,
      critical: 3650,
      dataKey: 'rpm',
      baselineKey: 'rpm',
      warningKey: 'rpm',
      criticalKey: 'rpm',
      min: 3300,
      max: 3600,
      color: '#7c3aed'
    },
    current: {
      label: 'Phase Current',
      unit: 'Amps (A)',
      current: machine.current,
      baseline: 130,
      warning: 145,
      critical: 160,
      dataKey: 'current',
      baselineKey: 'current',
      warningKey: 'current',
      criticalKey: 'current',
      min: 110,
      max: 170,
      color: '#d97706'
    }
  };

  const currentConfig = sensorConfigs[activeSensorTab];
  const enrichedRows = chartRows.map((r: any) => ({
    ...r,
    [currentConfig.baselineKey]: currentConfig.baseline,
    [currentConfig.warningKey]: currentConfig.warning,
    [currentConfig.criticalKey]: currentConfig.critical,
  }));

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduledSuccess(true);
    setTimeout(() => {
      setScheduledSuccess(false);
      setScheduleModalOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/machines')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Fleet Machines
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-black text-slate-900 px-2 py-0.5 bg-slate-100 border border-slate-300 rounded">
                {machine.id}
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{machine.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mt-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{machine.type}</span>
              <span className="text-slate-300">•</span>
              <span>{machine.location}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono">Criticality: {machine.criticality}</span>
              <span className="text-slate-300">•</span>
              <span>Installed: {machine.installationDate}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Condition</span>
                <StatusBadge status={machine.status} type="health" size="md" />
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Level</span>
                <StatusBadge status={machine.riskLevel} type="risk" size="md" />
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Review Machine
              </button>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" /> Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs border-l-4 border-l-rose-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Health Score
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-rose-700">{machine.healthScore}</span>
            <span className="text-xs text-slate-500 font-medium">/ 100</span>
          </div>
          <span className="text-[11px] text-rose-700 font-medium mt-1 block">
            Degraded state (Threshold: 70)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs border-l-4 border-l-rose-600">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Risk Score
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900">{machine.riskScore}</span>
          </div>
          <span className="text-[11px] text-slate-600 font-medium mt-1 block">
            {detail?.risk?.primary_driver ?? machine.primaryDriver ?? 'No primary driver'}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs border-l-4 border-l-blue-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Operating Hours
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {machine.operatingHours.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">h</span>
          </div>
          <span className="text-[11px] text-slate-600 font-medium mt-1 block">
            Since commissioning in 2022
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs border-l-4 border-l-slate-400">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Last Maintenance
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-bold text-slate-900">{machine.lastMaintenance}</span>
          </div>
          <span className="text-[11px] text-slate-600 font-medium mt-1 block">
            Next scheduled: {machine.nextMaintenance}
          </span>
        </div>
      </div>

      {/* Main SENSOR HISTORY Chart with Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Sensor History
            </h2>
            <p className="text-xs text-slate-500">
              Stored readings against baseline and thresholds
            </p>
          </div>

          {/* Sensor Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-md">
            {(['vibration', 'temperature', 'pressure', 'rpm', 'current'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSensorTab(tab)}
                className={`px-3 py-1 text-xs font-semibold rounded capitalize transition-colors ${
                  activeSensorTab === tab
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Current Metric Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Observed</span>
            <span className="font-bold text-rose-700 text-sm font-mono">
              {currentConfig.current} {currentConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Normal Baseline</span>
            <span className="font-bold text-slate-800 text-sm font-mono">
              {currentConfig.baseline} {currentConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Warning Threshold</span>
            <span className="font-bold text-amber-700 text-sm font-mono">
              {currentConfig.warning} {currentConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Critical Threshold</span>
            <span className="font-bold text-rose-700 text-sm font-mono">
              {currentConfig.critical} {currentConfig.unit}
            </span>
          </div>
        </div>

        {/* Large Time Series Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={enrichedRows} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
              <YAxis
                domain={[currentConfig.min, currentConfig.max]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={val => `${val}`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any, name: any) => [`${val} ${currentConfig.unit}`, name]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey={currentConfig.baselineKey}
                name={`Baseline (${currentConfig.baseline} ${currentConfig.unit})`}
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={currentConfig.warningKey}
                name={`Warning Limit (${currentConfig.warning} ${currentConfig.unit})`}
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={currentConfig.criticalKey}
                name={`Critical Limit (${currentConfig.critical} ${currentConfig.unit})`}
                stroke="#e11d48"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={currentConfig.dataKey}
                name={`Observed ${currentConfig.label} (${currentConfig.unit})`}
                stroke={currentConfig.color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: currentConfig.color }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* WHY IS THIS MACHINE AT RISK? (Evidence Panel) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs border-l-4 border-l-rose-600">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Why is this machine at risk?
            </h2>
            <p className="text-xs text-slate-500">
              Contributing factors from the risk engine{detail ? '' : ' (bundled data — API offline)'}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Risk increased because:
            </h3>
            {evidence.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {evidence.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2 bg-rose-50 p-2.5 rounded border border-rose-200 text-rose-900 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0"></span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600">No contributing factors recorded — risk is low.</p>
            )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Detection Summary
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {(anomalies ?? []).length > 0
                  ? `${anomalies!.length} rolling-z anomalies on record. Latest: ${anomalies![0].sensor} observed ${anomalies![0].observed} vs baseline ${anomalies![0].baseline} (z=${anomalies![0].deviation}).`
                  : 'No anomalies on record for this machine.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Method: rolling-z (|z| ≥ 3)</span>
              <span className="font-mono font-semibold text-slate-700">{detail?.risk?.primary_driver ?? machine.primaryDriver ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Sensor Events Timeline + Maintenance History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sensor Events */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Recent Sensor Events
            </h2>
            <span className="text-xs text-slate-500 font-mono">Recorded events</span>
          </div>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {events.map((event: any) => (
              <div key={event.id} className="relative">
                <span
                  className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                    event.severity === 'Critical' || event.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-500'
                  }`}
                />
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">{String(event.ts ?? event.time).slice(0, 16).replace('T', ' ')}</span>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    {event.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-0.5">{event.description ?? `${event.sensor} anomaly: observed ${event.observed} vs baseline ${event.baseline}`}</p>
              </div>
            ))}
            {events.length === 0 && <p className="text-xs text-slate-500">No events on record.</p>}
          </div>
        </div>

        {/* Maintenance History Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Maintenance History
            </h2>
            <span className="text-xs text-slate-500">Service Record</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Maintenance</th>
                  <th className="pb-2">Technician</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-slate-700">{record.date}</td>
                    <td className="py-2.5 text-slate-900 font-medium">{record.maintenance}</td>
                    <td className="py-2.5 text-slate-600">{record.technician}</td>
                    <td className="py-2.5 text-slate-600 font-mono">{record.duration}</td>
                    <td className="py-2.5 text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {record.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs border-l-4 border-l-blue-600">
        {(detail?.recommendations ?? []).length > 0 ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 rounded uppercase">
                    {detail.recommendations[0].priority} priority
                  </span>
                  <span className="text-xs text-slate-500">Reference: {detail.recommendations[0].id}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  {detail.recommendations[0].recommendation}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Review Evidence
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  Schedule Maintenance
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reason</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {detail.recommendations[0].reason || 'Based on recorded machine condition.'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Suggested Window</span>
                <p className="text-slate-800 font-semibold">
                  {detail.recommendations[0].window || 'Next maintenance window'}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Estimated duration: {detail.recommendations[0].downtime || '—'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">No recommendation</h2>
              <p className="text-xs text-slate-500 mt-1">No pending recommendation for this machine.</p>
            </div>
            <button
              type="button"
              onClick={() => setScheduleModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-2xs"
            >
              Schedule Maintenance
            </button>
          </div>
        )}
      </div>

      {/* Review Machine Evidence Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review: ${machine.id} (${machine.name})`}
        subtitle="Recorded condition indicators"
        footer={
          <button
            type="button"
            onClick={() => setReviewModalOpen(false)}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
          >
            Close Review
          </button>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Machine Asset Metadata
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">Manufacturer:</span> <span className="font-medium text-slate-800">{machine.manufacturer}</span></div>
              <div><span className="text-slate-500">Installation:</span> <span className="font-medium text-slate-800">{machine.installationDate}</span></div>
              <div><span className="text-slate-500">Location:</span> <span className="font-medium text-slate-800">{machine.location}</span></div>
              <div><span className="text-slate-500">Criticality:</span> <span className="font-medium text-slate-800">{machine.criticality}</span></div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Recorded Indicators
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p>• <strong>Anomalies:</strong> {(anomalies ?? []).length} rolling-z detections on record.</p>
              <p>• <strong>Risk driver:</strong> {detail?.risk?.primary_driver ?? machine.primaryDriver ?? '—'}.</p>
              <p>• <strong>Operating hours:</strong> {machine.operatingHours.toLocaleString()} h logged.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title={`Schedule Maintenance for ${machine.id}`}
        subtitle="Create preventive work order for maintenance crew"
        footer={
          <>
            <button
              type="button"
              onClick={() => setScheduleModalOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleScheduleSubmit}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Confirm Schedule
            </button>
          </>
        }
      >
        {scheduledSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Maintenance noted</h4>
            <p className="text-xs text-slate-600">
              {machine.id} noted for {assignedTeam} on {scheduleDate} (local note — work orders are tracked under Maintenance).
            </p>
          </div>
        ) : (
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maintenance Scope</label>
              <input
                type="text"
                readOnly
                value="Bearing Inspection & Replacement"
                className="w-full text-xs p-2 bg-slate-100 border border-slate-200 rounded text-slate-800 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Team</label>
                <select
                  value={assignedTeam}
                  onChange={e => setAssignedTeam(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Maintenance Team A">Maintenance Team A</option>
                  <option value="Maintenance Team B">Maintenance Team B</option>
                  <option value="Heavy Mechanics Crew">Heavy Mechanics Crew</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Downtime Window</label>
              <input
                type="text"
                readOnly
                value="4.0 hours (Off-peak maintenance window)"
                className="w-full text-xs p-2 bg-slate-100 border border-slate-200 rounded text-slate-800"
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
