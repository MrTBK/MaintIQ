import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  Check,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AlertItem } from '../types';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, updateAlertStatus } = useApp();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Unacknowledged' && alert.status === 'Detected') ||
      alert.status === statusFilter;
    const matchesSearch =
      alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.metric.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const activeCount = alerts.filter(a => a.status === 'Detected').length;
  const highSeverityCount = alerts.filter(a => a.severity === 'High' && a.status === 'Detected').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Alerts
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Detected events and threshold violations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded">
              {highSeverityCount} high severity detected
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <select
            aria-label="Filter alerts by severity"
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800"
          >
            <option value="All">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          <select
            aria-label="Filter alerts by status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800"
          >
            <option value="All">All Statuses</option>
            <option value="Unacknowledged">Unacknowledged (Detected)</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredAlerts.length} alerts
        </span>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Alert ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Machine</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-4">Event Description</th>
                <th className="py-2.5 px-3">Sensor / Metric</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAlerts.map(alert => (
                <tr
                  key={alert.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    alert.status === 'Resolved' ? 'opacity-60 bg-slate-50/50' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{alert.id}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                    {alert.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-semibold text-blue-700">{alert.machineId}</span>
                    <span className="text-[11px] text-slate-500 block">{alert.machineName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={alert.severity} type="alert" size="sm" />
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 max-w-sm">
                    {alert.event}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    {alert.metric}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.status === 'Detected'
                          ? 'bg-rose-100 text-rose-800'
                          : alert.status === 'Reviewed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {alert.status === 'Detected' && (
                        <button
                          type="button"
                          onClick={() => updateAlertStatus(alert.id, 'Reviewed')}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-2xs"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status === 'Reviewed' && (
                        <button
                          type="button"
                          onClick={() => updateAlertStatus(alert.id, 'Resolved')}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 shadow-2xs"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate(`/machines/${alert.machineId}`)}
                        className="px-2 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded"
                      >
                        Inspect
                      </button>
                    </div>
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
