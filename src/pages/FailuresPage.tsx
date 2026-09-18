import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  AlertOctagon,
  Clock,
  Wrench,
  Search,
  Filter,
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useApp } from '../context/AppContext';

export const FailuresPage: React.FC = () => {
  const { failures } = useApp();
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFailures = failures.filter(f => {
    const matchesSearch =
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.technician.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || f.failureType === filterType;
    return matchesSearch && matchesType;
  });

  const COLORS = ['#2563eb', '#e11d48', '#d97706', '#0d9488', '#7c3aed'];

  const stats = useMemo(() => {
    const total = failures.length;
    const downtime = failures.reduce((s, f) => s + (f.downtimeHours || 0), 0);
    const byTypeMap = new Map<string, number>();
    const byMachineMap = new Map<string, { failures: number; downtime: number }>();
    const byMonthMap = new Map<string, number>();
    for (const f of failures) {
      byTypeMap.set(f.failureType, (byTypeMap.get(f.failureType) ?? 0) + 1);
      const m = byMachineMap.get(f.machineType) ?? { failures: 0, downtime: 0 };
      m.failures += 1;
      m.downtime += f.downtimeHours || 0;
      byMachineMap.set(f.machineType, m);
      const month = (f.detectedDate || '').slice(0, 7);
      byMonthMap.set(month, (byMonthMap.get(month) ?? 0) + 1);
    }
    const byType = [...byTypeMap.entries()].map(([name, count]) => ({ name, count }));
    const top = byType[0];
    return {
      total, downtime,
      topName: top?.name ?? '—', topCount: top?.count ?? 0,
      byType,
      byMachine: [...byMachineMap.entries()].map(([type, v]) => ({ type, ...v })),
      overTime: [...byMonthMap.entries()].sort().map(([month, count]) => ({ month, count })),
    };
  }, [failures]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Failures
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Failure history and downtime.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            {stats.total} recorded failures
          </span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          id="kpi-total-failures"
          title="Total Failures"
          metric={stats.total}
          context="Recorded failures"
          status="warning"
          icon={<AlertOctagon className="w-4 h-4 text-amber-600" />}
        />
        <KpiCard
          id="kpi-total-downtime"
          title="Downtime Incurred"
          metric={`${stats.downtime} h`}
          context="Unplanned stoppage"
          status="critical"
          icon={<Clock className="w-4 h-4 text-rose-600" />}
        />
        <KpiCard
          id="kpi-common-failure"
          title="Most Common Failure"
          metric={stats.topName}
          context={`${stats.topCount} cases`}
          status="info"
          icon={<Wrench className="w-4 h-4 text-blue-600" />}
        />
      </div>

      {/* Analytical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Failures by Type */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Failures by Type
            </h2>
            <p className="text-xs text-slate-500">Root-cause failure mode frequency</p>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byType} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} occurrences`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Leading cause: {stats.topName}</span>
            <span className="font-semibold text-slate-700">{stats.topCount} incidents</span>
          </div>
        </div>

        {/* Failures by Machine Type */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Failures by Machine Type
            </h2>
            <p className="text-xs text-slate-500">Failure count & accumulated downtime</p>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byMachine} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'downtime' ? `${val} hours` : `${val} failures`,
                    name === 'downtime' ? 'Downtime' : 'Failures'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="failures" fill="#f59e0b" name="failures" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downtime" fill="#64748b" name="downtime" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{stats.byMachine.length} machine types affected</span>
            <span className="font-semibold text-rose-700">{stats.downtime} h downtime</span>
          </div>
        </div>

        {/* Failures Over Time */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Failures Over Time (Monthly)
            </h2>
            <p className="text-xs text-slate-500">6-month incident trajectory</p>
          </div>

          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.overTime} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'count' ? `${val} incidents` : `${val} downtime hours`,
                    name === 'count' ? 'Incident Count' : 'Downtime (h)'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="count"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>{stats.overTime.length} periods with failures</span>
            <span className="text-slate-700 font-semibold">{stats.total} total</span>
          </div>
        </div>
      </div>

      {/* Failure History Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Historical Incident Records
            </h2>
            <p className="text-xs text-slate-500">
              Verified failure event log with maintenance resolution and downtime audit
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search failure log..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              />
            </div>
            <select
              aria-label="Filter by failure type"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800"
            >
              <option value="All">All Types</option>
              <option value="Bearing">Bearing</option>
              <option value="Thermal Overload">Thermal Overload</option>
              <option value="Seal Degradation">Seal Degradation</option>
              <option value="Imbalance">Imbalance</option>
              <option value="Gear Wear">Gear Wear</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Failure ID</th>
                <th className="py-2.5 px-3">Machine</th>
                <th className="py-2.5 px-3">Failure Type</th>
                <th className="py-2.5 px-3">Detected Date</th>
                <th className="py-2.5 px-3">Downtime</th>
                <th className="py-2.5 px-4">Maintenance Resolution</th>
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">Cost Est.</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFailures.map(failure => (
                <tr key={failure.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{failure.id}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold text-blue-700">{failure.machineId}</span>
                    <span className="text-[11px] text-slate-500 block">{failure.machineName}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{failure.failureType}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{failure.detectedDate}</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-700">{failure.downtimeHours} h</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{failure.maintenanceAction}</td>
                  <td className="py-3 px-3 text-slate-600">{failure.technician}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{failure.costEstimate}</td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge status={failure.status} type="alert" size="sm" />
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
