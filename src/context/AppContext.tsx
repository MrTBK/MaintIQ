import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../services/api';
import {
  Machine,
  MaintenanceTask,
  RecommendationItem,
  AlertItem,
  ThresholdSettings,
  UserItem,
  AuditEventItem,
  FailureRecord,
  RiskItem,
  DataSourceItem,
  AnalysisRunItem,
} from '../types';
import {
  MACHINES_DATA,
  INITIAL_MAINTENANCE_TASKS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_ALERTS,
  INITIAL_THRESHOLDS,
  USERS_DATA,
  AUDIT_EVENTS_DATA,
  FAILURES_DATA,
  RISKS_DATA,
  DATA_SOURCES_DATA,
  ANALYSIS_RUNS_DATA,
} from '../data/mockData';

interface AppContextType {
  authUser: { username: string; role: string } | null;
  authChecked: boolean;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  machines: Machine[];
  maintenanceTasks: MaintenanceTask[];
  recommendations: RecommendationItem[];
  alerts: AlertItem[];
  failures: FailureRecord[];
  risks: RiskItem[];
  sources: DataSourceItem[];
  runs: AnalysisRunItem[];
  thresholds: ThresholdSettings;
  users: UserItem[];
  auditEvents: AuditEventItem[];
  unreadAlertsCount: number;
  apiOnline: boolean;
  actionError: string | null;

  updateAlertStatus: (alertId: string, status: 'Reviewed' | 'Resolved') => void;
  updateRecommendationStatus: (recId: string, status: 'Approved' | 'Rejected') => void;
  updateMaintenanceStatus: (taskId: string, status: 'Upcoming' | 'In Progress' | 'Completed' | 'Overdue') => void;
  updateThresholds: (newThresholds: ThresholdSettings) => void;
  addUser: (user: Omit<UserItem, 'id' | 'created'> & { username?: string; password?: string }) => void;
  deactivateUser: (id: string) => void;
  getMachineById: (id: string) => Machine | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const toRole = (r: string): UserItem['role'] =>
  r === 'ADMIN' ? 'Administrator' : r === 'MAINTENANCE_MANAGER' ? 'Maintenance Manager'
  : r === 'RELIABILITY_ENGINEER' ? 'Reliability Engineer' : r === 'ANALYST' ? 'Analyst' : 'Viewer';
const fromRole = (r: UserItem['role']): string =>
  r === 'Administrator' ? 'ADMIN' : r === 'Maintenance Manager' ? 'MAINTENANCE_MANAGER'
  : r === 'Reliability Engineer' ? 'RELIABILITY_ENGINEER' : r === 'Analyst' ? 'ANALYST' : 'VIEWER';
const asList = (v: any): any[] => (v && Array.isArray(v.items) ? v.items : Array.isArray(v) ? v : []);

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? String(iso ?? '') : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<{ username: string; role: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const refreshAuth = async () => {
    try {
      const me: any = await api.me();
      setAuthUser({ username: me.username, role: me.role });
    } catch {
      setAuthUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  const signOut = async () => {
    try {
      await api.logout();
    } catch { /* already signed out server-side */ }
    setAuthUser(null);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const [machines, setMachines] = useState<Machine[]>(MACHINES_DATA);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(INITIAL_MAINTENANCE_TASKS);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(INITIAL_RECOMMENDATIONS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [failures, setFailures] = useState<FailureRecord[]>(FAILURES_DATA);
  const [risks, setRisks] = useState<RiskItem[]>(RISKS_DATA);
  const [sources, setSources] = useState<DataSourceItem[]>(DATA_SOURCES_DATA);
  const [runs, setRuns] = useState<AnalysisRunItem[]>(ANALYSIS_RUNS_DATA);
  const [thresholds, setThresholds] = useState<ThresholdSettings>(INITIAL_THRESHOLDS);
  const [users, setUsers] = useState<UserItem[]>(USERS_DATA);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>(AUDIT_EVENTS_DATA);
  const [apiOnline, setApiOnline] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const failNotice = () => {
    setActionError('Action not saved · API unavailable');
  };

  useEffect(() => {
    let cancelled = false;
    if (!authUser) return () => { cancelled = true; };
    (async () => {
      try {
        const t: any = await api.getThresholds();
        if (!cancelled && t && typeof t.vibWarning === 'number') setThresholds(prev => ({ ...prev, ...t }));
      } catch { /* keep bundled defaults offline */ }
    })();
    return () => { cancelled = true; };
  }, [authUser]);

  useEffect(() => {
    let cancelled = false;
    if (!authUser) {
      setApiOnline(false);
      return () => { cancelled = true; };
    }
    (async () => {
      try {
        const [m, maint, recs, al, fail, risk, src, rn, us, au] = await Promise.all([
          api.machines(1, 100), api.maintenance(), api.recommendations(), api.alerts(),
          api.failures(), api.risks(), api.sources(), api.runs(), api.users().catch(() => []), api.audit().catch(() => []),
        ]);
        if (cancelled) return;
        const items = (m as any).items ?? m;
        const byId = new Map<string, any>((Array.isArray(items) ? items : []).map((x: any) => [x.id, x]));
        const mname = (id: string) => byId.get(id)?.name ?? id;
        if (Array.isArray(items) && items.length > 0) {
          setMachines(items.map((x: any) => ({
            id: x.id, name: x.name, type: x.type, category: x.category ?? 'Motors',
            location: x.location, healthScore: x.health_score ?? 90, riskLevel: x.risk_level ?? 'Low',
            riskScore: x.risk_score ?? 0, status: x.status ?? 'Healthy', failureProbability: 0,
            temperature: 0, vibration: 0, pressure: 0, rpm: 0, current: 0,
            operatingHours: x.operating_hours ?? 0, lastMaintenance: '', nextMaintenance: '',
            lastReading: '', recommendedAction: '', primaryDriver: '', evidence: [],
            manufacturer: x.manufacturer ?? '', installationDate: '', criticality: x.criticality ?? 'B (Medium Impact)',
          })));
        }
        const maintList = asList(maint);
        if (maintList.length > 0) setMaintenanceTasks(maintList.map((t: any) => ({
          id: t.id, machineId: t.machine_id, machineName: mname(t.machine_id), machineType: byId.get(t.machine_id)?.type ?? '',
          location: byId.get(t.machine_id)?.location ?? '', maintenanceType: t.type, priority: t.priority,
          dueDate: fmtDate(t.due_date), daysRemaining: Math.ceil((new Date(t.due_date).getTime() - Date.now()) / 86400000),
          assignedTo: t.assigned_to ?? '', estimatedDowntime: t.est_downtime ?? '', status: t.status, description: t.description ?? '',
        })));
        const recsList = asList(recs);
        if (recsList.length > 0) setRecommendations(recsList.map((r: any) => ({
          id: r.id, machineId: r.machine_id, machineName: mname(r.machine_id), machineType: byId.get(r.machine_id)?.type ?? '',
          priority: r.priority === 'High' ? 'High' : r.priority === 'Low' ? 'Low' : 'Medium',
          recommendation: r.recommendation, reason: r.reason ?? '', expectedImpact: r.impact ?? '',
          status: ['Pending', 'Approved', 'Rejected'].includes(r.status) ? r.status : 'Pending',
          suggestedWindow: r.window ?? '', estimatedDowntime: r.downtime ?? '', generatedDate: fmtDate(r.generated_at),
        })));
        const alList = asList(al);
        if (alList.length > 0) setAlerts(alList.map((a: any) => ({
          id: a.id, severity: a.severity, machineId: a.machine_id, machineName: mname(a.machine_id),
          location: byId.get(a.machine_id)?.location ?? '', event: a.event, timestamp: fmtDate(a.timestamp),
          status: a.status, action: '', metric: a.metric ?? '', details: a.details ?? '',
        })));
        const failList = asList(fail);
        if (failList.length > 0) setFailures(failList.map((f: any) => ({
          id: f.id, machineId: f.machine_id, machineName: mname(f.machine_id), machineType: byId.get(f.machine_id)?.type ?? '',
          failureType: f.failure_type, detectedDate: fmtDate(f.detected_at), downtimeHours: f.downtime_hours ?? 0,
          maintenanceAction: f.action ?? '', technician: f.technician ?? '', costEstimate: '', status: f.status,
        })));
        if (Array.isArray(risk)) setRisks(risk.map((x: any) => {
          let factors: RiskItem['factors'] = [];
          let supporting: string[] = [];
          try {
            const parsed = JSON.parse(x.evidence ?? '[]');
            if (Array.isArray(parsed)) {
              factors = parsed.map((f: any) => ({
                factor: String(f.factor ?? ''), contribution: Number(f.contribution ?? 0),
                value: String(f.value ?? ''), baseline: String(f.baseline ?? ''),
                status: f.status === 'critical' ? 'critical' : f.status === 'elevated' ? 'elevated' : 'normal',
              }));
              supporting = factors.map(f => `${f.factor}: ${f.value} (baseline ${f.baseline})`);
            }
          } catch { /* keep empty */ }
          return {
            machineId: x.machine_id, machineName: mname(x.machine_id), machineType: byId.get(x.machine_id)?.type ?? '',
            location: byId.get(x.machine_id)?.location ?? '', riskScore: x.risk_score, riskLevel: x.risk_level,
            primaryDriver: x.primary_driver ?? '', supportingEvidence: supporting, recommendedAction: '', factors,
          };
        }));
        if (Array.isArray(src)) setSources(src.map((s: any) => ({
          id: s.id, name: s.name, status: s.status === 'Connected' ? 'Connected' : s.status === 'Degraded' ? 'Degraded' : 'Syncing',
          lastIngestion: s.last_ingestion ?? '', rows: String(s.rows ?? ''), rowCount: s.rows ?? 0,
          coverage: s.coverage ?? '', quality: s.quality ?? 0, frequency: '', type: s.type ?? '',
        })));
        const rnList = asList(rn);
        if (rnList.length > 0) setRuns(rnList.map((x: any) => ({
          id: x.id, started: fmtDate(x.started), completed: x.completed ? fmtDate(x.completed) : '',
          dataset: x.dataset ?? '', records: String(x.rows ?? ''), status: x.status,
          duration: x.duration ?? '', trigger: x.trigger === 'Manual' ? 'Manual' : x.trigger === 'Scheduled (Cron)' ? 'Scheduled (Cron)' : 'Threshold Event',
          findings: x.findings ?? '',
        })));
        if (Array.isArray(us) && us.length > 0) setUsers(us.map((u: any) => ({
          id: String(u.id), name: u.display_name || u.username, email: u.email || '',
          role: toRole(u.role), status: u.active ? 'Active' : 'Inactive',
          lastActive: '', created: '',
        })));
        const auList = asList(au);
        if (auList.length > 0) setAuditEvents(auList.map((e: any, i: number) => ({
          id: `AUD-${e.id ?? i}`, timestamp: fmtDate(e.ts), user: e.user, role: e.role,
          action: e.action, resource: e.resource, result: e.result === 'Success' ? 'Success' : e.result === 'Warning' ? 'Warning' : 'Failed',
          details: e.details ?? '',
        })));
        setApiOnline(true);
      } catch {
        if (!cancelled) setApiOnline(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authUser]);

  const unreadAlertsCount = alerts.filter(a => a.status === 'Detected').length;

  const patchLocal = {
    alert: (id: string, status: AlertItem['status']) => setAlerts(prev => prev.map(a => (a.id === id ? { ...a, status } : a))),
    reco: (id: string, status: RecommendationItem['status']) => setRecommendations(prev => prev.map(r => (r.id === id ? { ...r, status } : r))),
    maint: (id: string, status: MaintenanceTask['status']) => setMaintenanceTasks(prev => prev.map(t => (t.id === id ? { ...t, status } : t))),
  };

  const updateAlertStatus = (alertId: string, status: 'Reviewed' | 'Resolved') => {
    patchLocal.alert(alertId, status);
    (status === 'Reviewed' ? api.reviewAlert(alertId) : api.resolveAlert(alertId)).catch(failNotice);
  };

  const updateRecommendationStatus = (recId: string, status: 'Approved' | 'Rejected') => {
    patchLocal.reco(recId, status);
    api.updateRecommendation(recId, status).catch(failNotice);
  };

  const updateMaintenanceStatus = (taskId: string, status: 'Upcoming' | 'In Progress' | 'Completed' | 'Overdue') => {
    patchLocal.maint(taskId, status);
    api.updateMaintenance(taskId, status).catch(failNotice);
  };

  const updateThresholds = (newThresholds: ThresholdSettings) => {
    setThresholds(newThresholds);
    api.saveThresholds({ ...newThresholds } as unknown as Record<string, number>).catch(() => undefined);
  };

  const addUser = (userData: Omit<UserItem, 'id' | 'created'> & { username?: string; password?: string }) => {
    const username = userData.username ?? userData.email.split('@')[0];
    api.createUser({
      username, password: userData.password ?? 'changeme-123',
      role: fromRole(userData.role), display_name: userData.name, email: userData.email,
    }).then((u: any) => {
      setUsers(prev => [...prev, {
        id: String(u.id), name: u.display_name || u.username, email: u.email || '',
        role: toRole(u.role), status: 'Active', lastActive: '', created: 'Just now',
      }]);
    }).catch(() => {
      failNotice();
      setUsers(prev => [...prev, { id: `USR-0${users.length + 1}`, ...userData, created: 'Today' } as UserItem]);
    });
  };

  const deactivateUser = (id: string) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status: 'Inactive' as const } : u)));
    if (/^\d+$/.test(id)) api.updateUser(id, { active: false }).catch(failNotice);
  };

  const getMachineById = (id: string) => machines.find(m => m.id.toLowerCase() === id.toLowerCase());

  return (
    <AppContext.Provider
      value={{
        authUser, authChecked, refreshAuth, signOut,
        machines, maintenanceTasks, recommendations, alerts, failures, risks, sources, runs,
        thresholds, users, auditEvents, unreadAlertsCount, apiOnline, actionError,
        updateAlertStatus, updateRecommendationStatus, updateMaintenanceStatus,
        updateThresholds, addUser, deactivateUser, getMachineById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
