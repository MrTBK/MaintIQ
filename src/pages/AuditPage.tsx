import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Download,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditEventItem } from '../types';

export const AuditPage: React.FC = () => {
  const { auditEvents } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredLogs = auditEvents.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === 'All' || log.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Audit Log
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Recorded user and system actions.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            Newest first
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search audit records..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <select
            aria-label="Filter audit records by role"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800"
          >
            <option value="All">All Roles</option>
            <option value="Maintenance Manager">Maintenance Manager</option>
            <option value="Reliability Engineer">Reliability Engineer</option>
            <option value="Administrator">Administrator</option>
            <option value="System Cron">System Cron</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredLogs.length} audit entries
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Audit ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource / Entity</th>
                <th className="py-2.5 px-4">Details / Delta</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log: AuditEventItem) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.id}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{log.user}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">{log.role}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">{log.resource}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium max-w-md">{log.details}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.result === 'Success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.result}
                    </span>
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
