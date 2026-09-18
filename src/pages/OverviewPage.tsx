import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Cpu,
  AlertTriangle,
  Wrench,
  AlertOctagon,
  Clock,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useApp } from '../context/AppContext';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { machines, maintenanceTasks, failures, alerts, apiOnline } = useApp();

  const healthy = machines.filter(m => m.status === 'Healthy').length;
  const warning = machines.filter(m => m.status === 'Warning').length;
  const critical = machines.filter(m => m.status === 'Critical').length;
  const openFail = failures.filter(f => f.status !== 'Closed').length;
  const upcoming = maintenanceTasks.filter(t => t.status === 'Upcoming' || t.status === 'Overdue').length;

  // Health distribution data for donut
  const healthDistributionData = [
    { name: 'Healthy', value: healthy, color: '#10b981' },
    { name: 'Warning', value: warning, color: '#f59e0b' },
    { name: 'Critical', value: critical, color: '#e11d48' }
  ];

  // Key machines for risk table
  const riskMachines = machines.filter(m => m.riskLevel === 'Critical' || m.riskLevel === 'High' || m.riskLevel === 'Medium');

  const riskDist = ['Critical', 'High', 'Medium', 'Low'].map(lvl => ({
    level: lvl,
    count: machines.filter(m => m.riskLevel === lvl).length,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header with Context */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Overview
              </h1>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                Historical data
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Historical analysis of machine condition and maintenance activity.
            </p>
          </div>

          {/* Plant Context Details */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-md">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Plant</span>
              <span className="font-semibold text-slate-800">Tunis Production Plant</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Source</span>
              <span className="font-medium text-slate-800">{apiOnline ? 'API' : 'Bundled data'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          id="kpi-machines"
          title="Machines"
          metric={machines.length}
          subMetric={healthy}
          subLabel="Healthy"
          status="healthy"
          icon={<Cpu className="w-4 h-4 text-emerald-600" />}
        />
        <KpiCard
          id="kpi-at-risk"
          title="At Risk"
          metric={warning + critical}
          context="Warning or critical condition"
          status="warning"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        />
        <KpiCard
          id="kpi-open-failures"
          title="Open Failures"
          metric={openFail}
          context="Failures under review"
          status="warning"
          icon={<AlertOctagon className="w-4 h-4 text-amber-600" />}
        />
        <KpiCard
          id="kpi-upcoming-maintenance"
          title="Upcoming Maintenance"
          metric={upcoming}
          context="Upcoming or overdue work orders"
          status="info"
          icon={<Wrench className="w-4 h-4 text-blue-600" />}
        />
      </div>

      {/* Health Distribution & Sensor Trend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Machine Health Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Machine Health
              </h2>
              <p className="text-xs text-slate-500">Share of healthy, warning, and critical machines</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600">
              {machines.length} Total
            </span>
          </div>

          <div className="h-56 mt-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {healthDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} machines (${machines.length ? ((Number(val) / machines.length) * 100).toFixed(1) : '0.0'}%)`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 leading-none">
                {healthy}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">
                Healthy
              </span>
            </div>
          </div>

          {/* Breakdown Table/Legend */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded">
              <span className="text-[11px] font-medium text-emerald-800 block">Healthy</span>
              <span className="text-lg font-bold text-emerald-950">{healthy}</span>
                          </div>
            <div className="p-2 bg-amber-50/70 border border-amber-200 rounded">
              <span className="text-[11px] font-medium text-amber-800 block">Warning</span>
              <span className="text-lg font-bold text-amber-950">{warning}</span>
                          </div>
            <div className="p-2 bg-rose-50/70 border border-rose-200 rounded">
              <span className="text-[11px] font-medium text-rose-800 block">Critical</span>
              <span className="text-lg font-bold text-rose-950">{critical}</span>
                          </div>
          </div>
        </div>

        {/* Risk distribution */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Machines by Risk Level
              </h2>
              <p className="text-xs text-slate-500">
                Counts from the current machine list
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/risks')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Risk detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDist} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} machines`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Large Risk Overview Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Risk and Attention
            </h2>
            <p className="text-xs text-slate-500">Machines requiring attention</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/machines')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
          >
            View all {machines.length} machines <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Machine</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-4">Main Issue</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {riskMachines.slice(0, 6).map(machine => (
                <tr
                  key={machine.id}
                  onClick={() => navigate(`/machines/${machine.id}`)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-blue-700">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-900">{machine.id}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-700 font-normal">{machine.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{machine.type}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={machine.riskLevel} type="risk" size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium max-w-xs truncate">
                    {machine.primaryDriver}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium max-w-xs truncate">
                    {machine.recommendedAction}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failure & Maintenance Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Maintenance */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Upcoming Maintenance
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/maintenance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Full schedule <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {maintenanceTasks.slice(0, 3).map(t => (
              <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">Machine {t.machineId}</span>
                    <span className="text-[10px] text-slate-500">{t.machineType}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 mt-0.5">{t.maintenanceType}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded">
                    {t.status}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">{t.dueDate}</span>
                </div>
              </div>
            ))}
            {maintenanceTasks.length === 0 && <p className="text-xs text-slate-500">No work orders.</p>}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Recent Events
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/alerts')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              All alerts <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {alerts.slice(0, 3).map(a => (
              <div key={a.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{a.machineId} — {a.event}</span>
                    <span className="text-[10px] font-mono text-slate-500">{a.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{a.status}{a.metric ? ` · ${a.metric}` : ''}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && <p className="text-xs text-slate-500">No alerts.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
