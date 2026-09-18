import React, { useEffect, useMemo, useState } from 'react';
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
  Calendar,
  Sliders,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from '../services/api';

const SENSORS = [
  { key: 'vibration', label: 'Vibration', unit: 'mm/s', color: '#2563eb' },
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#e11d48' },
  { key: 'pressure', label: 'Pressure', unit: 'bar', color: '#0d9488' },
  { key: 'rpm', label: 'Shaft Speed', unit: 'RPM', color: '#7c3aed' },
  { key: 'current', label: 'Current', unit: 'A', color: '#d97706' },
];

const bucketFor = (range: string) => (range === '24h' ? 'raw' : range === '7d' ? 'hour' : 'day');

export const SensorAnalyticsPage: React.FC = () => {
  const { machines } = useApp();

  const [selectedMachineId, setSelectedMachineId] = useState(machines[0]?.id ?? 'M-001');
  const [dateRange, setDateRange] = useState('24h');
  const [activeSensors, setActiveSensors] = useState<Record<string, boolean>>({
    vibration: true, temperature: true, pressure: false, rpm: false, current: false,
  });
  const [trends, setTrends] = useState<Record<string, any>>({});
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!machines.some(m => m.id === selectedMachineId)) setSelectedMachineId(machines[0]?.id ?? 'M-001');
  }, [machines, selectedMachineId]);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    const bucket = bucketFor(dateRange);
    Promise.all([
      Promise.all(SENSORS.map(s => api.trend(selectedMachineId, s.key, bucket).catch(() => null))),
      api.anomalies(selectedMachineId).catch(() => []),
    ]).then(([t, a]) => {
      if (cancelled) return;
      const map: Record<string, any> = {};
      SENSORS.forEach((s, i) => { if (t[i]) map[s.key] = t[i]; });
      setTrends(map);
      setAnomalies(Array.isArray(a) ? a : []);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [selectedMachineId, dateRange]);

  const selectedMachine = machines.find(m => m.id === selectedMachineId) || machines[0];

  const toggleSensor = (key: string) => {
    setActiveSensors(prev => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && activeCount === 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const chartData = useMemo(() => {
    const byTs = new Map<string, any>();
    for (const s of SENSORS) {
      const t = trends[s.key];
      if (!t) continue;
      for (const p of t.points) {
        const row = byTs.get(p.ts) ?? { ts: p.ts.slice(0, 16).replace('T', ' ') };
        row[s.key] = p.avg;
        byTs.set(p.ts, row);
      }
    }
    return [...byTs.entries()].sort().map(([, r]) => r);
  }, [trends]);

  const hasData = chartData.length > 0;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sensor Trends</h1>
            <p className="text-xs text-slate-600 mt-1">
              Aggregated sensor readings and rolling-z anomalies{loaded && !hasData ? ' — no readings yet for this machine.' : '.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              Bucket: {bucketFor(dateRange)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Machine:</span>
            </div>
            <select
              aria-label="Select machine for sensor analytics"
              value={selectedMachineId}
              onChange={e => setSelectedMachineId(e.target.value)}
              className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {machines.map(m => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.name} ({m.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Range:
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-xs font-semibold">
              {(['24h', '7d', '30d'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDateRange(r)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    dateRange === r ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === '24h' ? 'Last 24 Hours' : r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-slate-500" /> Toggle Sensors:
          </span>
          {SENSORS.map(cfg => {
            const isActive = activeSensors[cfg.key];
            return (
              <button
                key={cfg.key}
                type="button"
                onClick={() => toggleSensor(cfg.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span>{cfg.label} ({cfg.unit})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SENSORS.map(cfg => {
          const st = trends[cfg.key]?.stats;
          return (
            <div key={cfg.key} className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{cfg.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">{cfg.unit}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-slate-900">{st ? st.current : '—'}</span>
                <span className="text-[11px] text-slate-500 font-mono">Base: {st ? st.baseline : '—'}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 text-[10px] text-slate-500 text-center font-mono">
                <div>Min: {st ? st.min : '—'}</div>
                <div>Avg: {st ? st.avg : '—'}</div>
                <div>Max: {st ? st.max : '—'}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Trend ({selectedMachine?.id})
            </h2>
            <p className="text-xs text-slate-500">Bucketed averages from stored readings</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{chartData.length} buckets</span>
        </div>

        <div className="h-80 w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="ts" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {SENSORS.filter(s => activeSensors[s.key] && trends[s.key]).map(s => (
                  <Line key={s.key} type="monotone" dataKey={s.key} name={`${s.label} (${s.unit})`}
                    stroke={s.color} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              {loaded ? 'No readings yet — upload a CSV via POST /api/runs/ingest.' : 'Loading...'}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Anomalies</h2>
            <p className="text-xs text-slate-500">Rolling-z detections for {selectedMachine?.id}</p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded">
            {anomalies.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-3">Sensor</th>
                <th className="py-2.5 px-3">Observed</th>
                <th className="py-2.5 px-3">Baseline</th>
                <th className="py-2.5 px-3">Z-Score</th>
                <th className="py-2.5 px-4 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {anomalies.map((a: any) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">{String(a.ts).slice(0, 16).replace('T', ' ')}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{a.sensor}</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-700">{a.observed}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{a.baseline}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-rose-600">{a.deviation}</td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={a.severity} type="alert" size="sm" />
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
