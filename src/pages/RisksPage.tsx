import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/StateModals';
import { useApp } from '../context/AppContext';
import { RiskItem } from '../types';

export const RisksPage: React.FC = () => {
  const { risks } = useApp();
  const navigate = useNavigate();
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [levelFilter, setLevelFilter] = useState('All');

  const filteredRisks = risks.filter(
    r => levelFilter === 'All' || r.riskLevel === levelFilter
  );
  const count = (lvl: string) => risks.filter(r => r.riskLevel === lvl).length;

  const handleInspect = (risk: RiskItem) => {
    setSelectedRisk(risk);
    setEvidenceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Risk
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Machines requiring attention.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
            {risks.length} machines scored
          </span>
        </div>
      </div>

      {/* 4 Risk Severity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          id="kpi-risk-critical"
          title="Critical Risk"
          metric={count('Critical')}
          context="Score above 80"
          status="critical"
          icon={<ShieldAlert className="w-4 h-4 text-rose-600" />}
        />
        <KpiCard
          id="kpi-risk-high"
          title="High Risk"
          metric={count('High')}
          context="Score 60–80"
          status="warning"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        />
        <KpiCard
          id="kpi-risk-medium"
          title="Medium Risk"
          metric={count('Medium')}
          context="Score 35–60"
          status="info"
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
        />
        <KpiCard
          id="kpi-risk-low"
          title="Low Risk"
          metric={count('Low')}
          context="Score below 35"
          status="healthy"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Risk Ranking
            </h2>
            <p className="text-xs text-slate-500">
              Risk score and contributing factors per machine
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600">Filter Level:</span>
            <select
              aria-label="Filter by risk level"
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded font-medium text-slate-800"
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical ({count('Critical')})</option>
              <option value="High">High ({count('High')})</option>
              <option value="Medium">Medium ({count('Medium')})</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Machine</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Primary Driver</th>
                <th className="py-2.5 px-4">Evidence</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRisks.map(risk => (
                <tr
                  key={risk.machineId}
                  onClick={() => handleInspect(risk)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{risk.machineId}</span>
                    <span className="text-[11px] text-slate-500 block">{risk.machineName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            risk.riskScore >= 80
                              ? 'bg-rose-600'
                              : risk.riskScore >= 65
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${risk.riskScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs text-slate-900">{risk.riskScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={risk.riskLevel} type="risk" size="sm" />
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{risk.primaryDriver}</td>
                  <td className="py-3 px-4">
                    {risk.supportingEvidence.length > 0 ? (
                      <ul className="space-y-1 text-[11px] text-slate-700">
                        {risk.supportingEvidence.slice(0, 3).map((ev, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-slate-400 mt-0.5">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleInspect(risk);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 ml-auto"
                    >
                      Factors <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Breakdown Modal */}
      {selectedRisk && (
        <Modal
          isOpen={evidenceModalOpen}
          onClose={() => setEvidenceModalOpen(false)}
          title={`Risk: ${selectedRisk.machineId}`}
          subtitle={`${selectedRisk.machineName} • Score ${selectedRisk.riskScore}/100`}
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => navigate(`/machines/${selectedRisk.machineId}`)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Open machine
              </button>
              <button
                type="button"
                onClick={() => setEvidenceModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Primary Driver
              </span>
              <p className="text-sm font-bold text-slate-900">{selectedRisk.primaryDriver}</p>
              <p className="text-xs text-slate-600 mt-1">{selectedRisk.recommendedAction}</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Risk factors
              </h4>
              <div className="space-y-2">
                {selectedRisk.factors.map((factor, i) => (
                  <div key={i} className="p-3 border border-slate-200 rounded-md bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{factor.factor}</span>
                      <span className="font-mono font-bold text-slate-800">
                        {factor.contribution}% Contribution
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${factor.contribution}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Observed: <strong className="text-slate-800">{factor.value}</strong></span>
                      <span>Baseline: <strong className="text-slate-600">{factor.baseline}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
