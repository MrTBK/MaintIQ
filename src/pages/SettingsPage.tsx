import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
  Sliders,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { thresholds, updateThresholds } = useApp();
  const [plantName, setPlantName] = useState('Tunis Production Plant');
  const [vibrationWarning, setVibrationWarning] = useState(String(thresholds.vibWarning));
  const [vibrationCritical, setVibrationCritical] = useState(String(thresholds.vibCritical));
  const [tempWarning, setTempWarning] = useState(String(thresholds.tempWarning));
  const [tempCritical, setTempCritical] = useState(String(thresholds.tempCritical));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateThresholds({
      tempWarning: Number(tempWarning) || thresholds.tempWarning,
      tempCritical: Number(tempCritical) || thresholds.tempCritical,
      vibWarning: Number(vibrationWarning) || thresholds.vibWarning,
      vibCritical: Number(vibrationCritical) || thresholds.vibCritical,
      pressureWarning: thresholds.pressureWarning,
      pressureCritical: thresholds.pressureCritical,
      rpmWarning: thresholds.rpmWarning,
      rpmCritical: thresholds.rpmCritical,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved for this session.</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Settings
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Display labels and local alert thresholds.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Plant Label
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Plant name (display only)</label>
              <input
                type="text"
                value={plantName}
                onChange={e => setPlantName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Alert Thresholds
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            These thresholds are stored on the server and apply to every session.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Vibration warning (mm/s)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={vibrationWarning}
                onChange={e => setVibrationWarning(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Vibration critical (mm/s)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={vibrationCritical}
                onChange={e => setVibrationCritical(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Temperature warning (°C)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={tempWarning}
                onChange={e => setTempWarning(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Temperature critical (°C)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={tempCritical}
                onChange={e => setTempCritical(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 text-slate-900 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </form>
    </div>
  );
};
