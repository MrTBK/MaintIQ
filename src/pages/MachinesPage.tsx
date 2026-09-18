import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/StateModals';
import { HealthStatus, MachineCategory, LocationArea } from '../types';

export const MachinesPage: React.FC = () => {
  const navigate = useNavigate();
  const { machines } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'risk' | 'health' | 'lastReading' | 'operatingHours'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered and sorted machines
  const filteredMachines = useMemo(() => {
    return machines
      .filter(machine => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          machine.id.toLowerCase().includes(query) ||
          machine.name.toLowerCase().includes(query) ||
          machine.type.toLowerCase().includes(query) ||
          machine.location.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'All' || machine.status === statusFilter;
        const matchesType = typeFilter === 'All' || machine.category === typeFilter;
        const matchesLocation =
          locationFilter === 'All' ||
          machine.location.toLowerCase().includes(locationFilter.toLowerCase());

        return matchesQuery && matchesStatus && matchesType && matchesLocation;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'risk') {
          comparison = a.riskScore - b.riskScore;
        } else if (sortBy === 'health') {
          comparison = a.healthScore - b.healthScore;
        } else if (sortBy === 'operatingHours') {
          comparison = a.operatingHours - b.operatingHours;
        } else if (sortBy === 'lastReading') {
          comparison = a.lastReading.localeCompare(b.lastReading);
        }
        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [machines, searchQuery, statusFilter, typeFilter, locationFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredMachines.length / pageSize) || 1;
  const paginatedMachines = filteredMachines.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: 'risk' | 'health' | 'lastReading' | 'operatingHours') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Machines</h1>
            <p className="text-xs text-slate-600 mt-1">
              Fleet condition by machine.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Showing <strong className="text-slate-800">{filteredMachines.length}</strong> of{' '}
              <strong className="text-slate-800">{machines.length}</strong> units
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search machines..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              aria-label="Filter by health status"
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="All">Status: All</option>
              <option value="Healthy">Status: Healthy</option>
              <option value="Warning">Status: Warning</option>
              <option value="Critical">Status: Critical</option>
            </select>
          </div>

          {/* Machine Type Filter */}
          <div>
            <select
              aria-label="Filter by machine type"
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="All">Type: All</option>
              <option value="Motors">Motors</option>
              <option value="Pumps">Pumps</option>
              <option value="Compressors">Compressors</option>
              <option value="CNC">CNC</option>
              <option value="Robotics">Robotics</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              aria-label="Filter by plant location"
              value={locationFilter}
              onChange={e => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="All">Location: All</option>
              <option value="Production Line 1">Production Line 1</option>
              <option value="Production Line 2">Production Line 2</option>
              <option value="Assembly">Assembly</option>
              <option value="Cooling">Cooling</option>
              <option value="Packaging">Packaging</option>
            </select>
          </div>

          {/* Sort Control */}
          <div>
            <select
              aria-label="Sort machine fleet"
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [field, order] = e.target.value.split('-') as [any, any];
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
            >
              <option value="risk-desc">Sort: Highest Risk</option>
              <option value="risk-asc">Sort: Lowest Risk</option>
              <option value="health-asc">Sort: Lowest Health</option>
              <option value="health-desc">Sort: Highest Health</option>
              <option value="operatingHours-desc">Sort: Operating Hours</option>
              <option value="lastReading-asc">Sort: Last Reading</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {paginatedMachines.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No machines match your filters"
              description="Adjust the status, machine type, or search term to view fleet assets."
              actionText="Clear all filters"
              onAction={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setTypeFilter('All');
                setLocationFilter('All');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-4">Machine</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('health')}>
                    <div className="flex items-center gap-1">
                      Health
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('risk')}>
                    <div className="flex items-center gap-1">
                      Risk
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Temperature</th>
                  <th className="py-2.5 px-3">Vibration</th>
                  <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('operatingHours')}>
                    <div className="flex items-center gap-1">
                      Operating Hours
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3">Last Maint.</th>
                  <th className="py-2.5 px-3">Next Maint.</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedMachines.map(machine => (
                  <tr
                    key={machine.id}
                    onClick={() => navigate(`/machines/${machine.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-800 text-[11px]">
                          {machine.id.replace('M-', '')}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-slate-900 block text-xs">{machine.id}</span>
                          <span className="text-[11px] text-slate-600 block">{machine.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{machine.type}</td>
                    <td className="py-3 px-3 text-slate-600">{machine.location}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              machine.healthScore >= 75
                                ? 'bg-emerald-500'
                                : machine.healthScore >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${machine.healthScore}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs">{machine.healthScore}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={machine.riskLevel} type="risk" size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      <span className={machine.temperature > 75 ? 'text-rose-700 font-bold' : ''}>
                        {machine.temperature.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      <span className={machine.vibration > 5.5 ? 'text-rose-700 font-bold' : ''}>
                        {machine.vibration.toFixed(1)} mm/s
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {machine.operatingHours.toLocaleString()} h
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">{machine.lastMaintenance}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium text-[11px]">
                      {machine.nextMaintenance}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <StatusBadge status={machine.status} type="health" size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredMachines.length)} of {filteredMachines.length} machines
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
