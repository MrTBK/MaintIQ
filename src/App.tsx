import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Shell } from './components/layout/Shell';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { MachinesPage } from './pages/MachinesPage';
import { MachineDetailPage } from './pages/MachineDetailPage';
import { SensorAnalyticsPage } from './pages/SensorAnalyticsPage';
import { FailuresPage } from './pages/FailuresPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { RisksPage } from './pages/RisksPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { AlertsPage } from './pages/AlertsPage';
import { DataSourcesPage } from './pages/DataSourcesPage';
import { DataQualityPage } from './pages/DataQualityPage';
import { RunsPage } from './pages/RunsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { authUser, authChecked } = useApp();
  const location = useLocation();
  if (!authChecked) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500">
        Checking session...
      </div>
    );
  }
  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function ProtectedApp() {
  return (
    <RequireAuth>
      <Shell>
        <Routes>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/machines/:id" element={<MachineDetailPage />} />
          <Route path="/sensors" element={<SensorAnalyticsPage />} />
          <Route path="/failures" element={<FailuresPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/risks" element={<RisksPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} />
          <Route path="/data-quality" element={<DataQualityPage />} />
          <Route path="/runs" element={<RunsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </Shell>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
