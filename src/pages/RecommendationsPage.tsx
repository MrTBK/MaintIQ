import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/StateModals';
import { RecommendationItem } from '../types';

export const RecommendationsPage: React.FC = () => {
  const { recommendations, updateRecommendationStatus } = useApp();

  const [priorityFilter, setPriorityFilter] = useState('All');
  const [actionTypeFilter, setActionTypeFilter] = useState('All');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState<RecommendationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredRecs = recommendations.filter(rec => {
    const matchesPriority = priorityFilter === 'All' || rec.priority === priorityFilter;
    const matchesActionType =
      actionTypeFilter === 'All' ||
      rec.recommendation.toLowerCase().includes(actionTypeFilter.toLowerCase());
    return matchesPriority && matchesActionType;
  });

  const highPriorityCount = recommendations.filter(r => r.priority === 'High' && r.status === 'Pending').length;

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (rec: RecommendationItem) => {
    updateRecommendationStatus(rec.id, 'Approved');
    showNotification(`Recommendation ${rec.id} approved.`);
  };

  const handleDismiss = (rec: RecommendationItem) => {
    updateRecommendationStatus(rec.id, 'Rejected');
    showNotification(`Recommendation ${rec.id} dismissed.`);
  };

  const handleReview = (rec: RecommendationItem) => {
    setSelectedRec(rec);
    setReviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Recommendations
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Suggested maintenance actions based on machine condition and historical data.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            {recommendations.filter(r => r.status === 'Pending').length} pending
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <KpiCard
          id="kpi-total-recs"
          title="Pending"
          metric={recommendations.filter(r => r.status === 'Pending').length}
          context="Awaiting review"
          status="info"
          icon={<Lightbulb className="w-4 h-4 text-blue-600" />}
        />
        <KpiCard
          id="kpi-high-priority-recs"
          title="High Priority"
          metric={highPriorityCount}
          context="Pending high-priority items"
          status="critical"
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filters:
          </span>
          <select
            aria-label="Filter recommendations by priority"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            aria-label="Filter recommendations by action type"
            value={actionTypeFilter}
            onChange={e => setActionTypeFilter(e.target.value)}
            className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-800"
          >
            <option value="All">All Action Types</option>
            <option value="Inspect">Inspection</option>
            <option value="Lubricat">Lubrication</option>
            <option value="Calibrat">Calibration</option>
            <option value="Tighten">Tightening</option>
            <option value="Clean">Cleaning</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredRecs.length} recommendations
        </span>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-3">
        {filteredRecs.map(rec => (
          <div
            key={rec.id}
            className={`bg-white border rounded-lg p-5 shadow-2xs transition-all ${
              rec.status === 'Approved'
                ? 'border-emerald-300 bg-emerald-50/20'
                : rec.status === 'Rejected'
                ? 'border-slate-200 opacity-60'
                : rec.priority === 'High'
                ? 'border-l-4 border-l-rose-600 border-slate-200'
                : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{rec.id}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono font-bold text-slate-900">{rec.machineId}</span>
                  <span className="text-slate-600 text-xs font-medium">({rec.machineType})</span>
                  <StatusBadge status={rec.priority} type="risk" size="sm" />
                  {rec.status !== 'Pending' && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        rec.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {rec.status}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{rec.recommendation}</h3>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {rec.reason}
                </p>
              </div>

              <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-3 text-xs shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">
                    Suggested Timing
                  </span>
                  <span className="font-semibold text-slate-800">{rec.suggestedWindow}</span>
                </div>
                <div className="text-left lg:text-right">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">
                    Expected Impact
                  </span>
                  <span className="font-semibold text-slate-800">{rec.expectedImpact}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => handleReview(rec)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Review
                </button>

                {rec.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDismiss(rec)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-700 rounded transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(rec)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedRec && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Recommendation Review: ${selectedRec.id}`}
          subtitle={`Machine ${selectedRec.machineId} (${selectedRec.machineType})`}
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              {selectedRec.status === 'Pending' && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(selectedRec);
                    setReviewModalOpen(false);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Approve
                </button>
              )}
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Suggested Action
              </span>
              <p className="text-sm font-bold text-slate-900">{selectedRec.recommendation}</p>
              <p className="text-xs text-slate-600 mt-1">{selectedRec.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Suggested Timing</span>
                <span className="font-semibold text-slate-800 block mt-1">{selectedRec.suggestedWindow}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Expected Impact</span>
                <span className="font-semibold text-slate-800 block mt-1">{selectedRec.expectedImpact}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Basis
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rule-based recommendation from recorded machine condition. Approving marks it approved; it does not execute physical work.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
