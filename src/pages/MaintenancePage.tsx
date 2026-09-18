import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Calendar,
  User,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/StateModals';
import { MaintenanceTask } from '../types';

export const MaintenancePage: React.FC = () => {
  const { maintenanceTasks, updateMaintenanceStatus } = useApp();

  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'In Progress' | 'Completed' | 'Overdue'>('Upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter tasks
  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesTab = activeTab === 'All' || task.status === activeTab;
    const matchesSearch =
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.machineId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.maintenanceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

    return matchesTab && matchesSearch && matchesPriority;
  });

  const dueThisWeekCount = maintenanceTasks.filter(t => t.daysRemaining >= 0 && t.daysRemaining <= 7).length;
  const overdueCount = maintenanceTasks.filter(t => t.status === 'Overdue').length;
  const inProgressCount = maintenanceTasks.filter(t => t.status === 'In Progress').length;
  const completedCount = maintenanceTasks.filter(t => t.status === 'Completed').length;

  const handleOpenDrawer = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleStatusChange = (newStatus: 'Upcoming' | 'In Progress' | 'Completed' | 'Overdue') => {
    if (selectedTask) {
      updateMaintenanceStatus(selectedTask.id, newStatus);
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Maintenance</h1>
            <p className="text-xs text-slate-600 mt-1">
              Preventive maintenance work orders and execution tracking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              Work Orders
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          id="kpi-due"
          title="Due"
          metric={maintenanceTasks.filter(t => t.status === 'Upcoming').length}
          context="Upcoming work orders"
          status="info"
          icon={<Calendar className="w-4 h-4 text-blue-600" />}
        />
        <KpiCard
          id="kpi-overdue"
          title="Overdue"
          metric={maintenanceTasks.filter(t => t.status === 'Overdue').length}
          context="Past due date"
          status="critical"
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
        />
        <KpiCard
          id="kpi-in-progress"
          title="In Progress"
          metric={maintenanceTasks.filter(t => t.status === 'In Progress').length}
          context="Currently being worked"
          status="warning"
          icon={<Wrench className="w-4 h-4 text-amber-500" />}
        />
        <KpiCard
          id="kpi-completed"
          title="Completed"
          metric={maintenanceTasks.filter(t => t.status === 'Completed').length}
          context="Finished work orders"
          status="healthy"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-md text-xs font-semibold">
            {(['All', 'Upcoming', 'In Progress', 'Completed', 'Overdue'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === 'Overdue' && overdueCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                    {overdueCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search and Priority Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search work orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
              />
            </div>
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800"
            >
              <option value="All">Priority: All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Main Maintenance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Machine</th>
                <th className="py-2.5 px-3">Maintenance Type</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Assigned To</th>
                <th className="py-2.5 px-3">Est. Downtime</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTasks.map(task => (
                <tr
                  key={task.id}
                  onClick={() => handleOpenDrawer(task)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{task.machineId}</span>
                    <span className="text-[11px] text-slate-500 block">{task.machineName}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{task.maintenanceType}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={task.priority} type="risk" size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    <div>{task.dueDate}</div>
                    {task.status === 'Overdue' && (
                      <span className="text-[10px] text-rose-600 font-bold">Overdue</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{task.assignedTo}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-slate-800">
                    {task.estimatedDowntime}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={task.status} type="maintenance" size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenDrawer(task);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Details Modal / Drawer */}
      {selectedTask && (
        <Modal
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={`Work Order ${selectedTask.id}: ${selectedTask.maintenanceType}`}
          subtitle={`Machine ${selectedTask.machineId} • Location: ${selectedTask.location}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500">Update Status:</span>
                <button
                  type="button"
                  onClick={() => handleStatusChange('In Progress')}
                  className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-semibold hover:bg-amber-100"
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange('Completed')}
                  className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold hover:bg-emerald-100"
                >
                  Mark Completed
                </button>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Machine</span>
                <span className="font-bold text-slate-900">{selectedTask.machineId} — {selectedTask.machineName}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Priority</span>
                <StatusBadge status={selectedTask.priority} type="risk" size="sm" />
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Due Date</span>
                <span className="font-mono font-medium text-slate-800">{selectedTask.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Assigned Team</span>
                <span className="font-medium text-slate-800">{selectedTask.assignedTo}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Estimated Downtime</span>
                <span className="font-mono font-bold text-slate-900">{selectedTask.estimatedDowntime}</span>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Current Status</span>
                <StatusBadge status={selectedTask.status} type="maintenance" size="sm" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 uppercase text-[11px] mb-1">Work Description</h4>
              <p className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 leading-relaxed">
                {selectedTask.description}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
