import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  AlertOctagon,
  Wrench,
  ShieldAlert,
  Lightbulb,
  Bell,
  Database,
  CheckCheck,
  PlayCircle,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Radio,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadAlertsCount, alerts, recommendations, maintenanceTasks, machines, apiOnline, authUser, signOut, actionError } = useApp();
  const criticalCount = machines.filter(m => m.riskLevel === 'Critical').length;

  const pendingRecommendations = recommendations.filter(r => r.status === 'Pending').length;
  const overdueTasks = maintenanceTasks.filter(m => m.status === 'Overdue').length;

  const navGroups = [
    { section: null as string | null, items: [
      { to: '/overview', label: 'Overview', icon: LayoutDashboard },
    ]},
    { section: 'Assets', items: [
      { to: '/machines', label: 'Machines', icon: Cpu },
      { to: '/sensors', label: 'Sensor Analytics', icon: Activity },
    ]},
    { section: 'Maintenance', items: [
      { to: '/maintenance', label: 'Work Orders', icon: Wrench, badge: overdueTasks > 0 ? `${overdueTasks} overdue` : undefined, badgeColor: 'bg-rose-500' },
      { to: '/failures', label: 'Failures', icon: AlertOctagon },
      { to: '/alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined, badgeColor: 'bg-rose-600' },
    ]},
    { section: 'Analytics', items: [
      { to: '/risks', label: 'Risk', icon: ShieldAlert, badge: `${criticalCount}`, badgeColor: 'bg-rose-600' },
      { to: '/recommendations', label: 'Recommendations', icon: Lightbulb, badge: pendingRecommendations > 0 ? `${pendingRecommendations}` : undefined, badgeColor: 'bg-amber-500' },
    ]},
    { section: 'Data', items: [
      { to: '/data-sources', label: 'Data Sources', icon: Database },
      { to: '/data-quality', label: 'Data Quality', icon: CheckCheck },
      { to: '/runs', label: 'Analysis Runs', icon: PlayCircle },
    ]},
    { section: 'Administration', items: [
      { to: '/users', label: 'Users', icon: Users },
      { to: '/audit', label: 'Audit Log', icon: FileText },
      { to: '/settings', label: 'Settings', icon: Settings },
    ]},
  ];

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/machines/')) {
      return { section: 'Asset Condition', page: `Machine ${path.split('/')[2]}` };
    }
    switch (path) {
      case '/overview':
        return { section: 'Overview', page: 'Maintenance Overview' };
      case '/machines':
        return { section: 'Assets', page: 'Machines' };
      case '/sensors':
        return { section: 'Assets', page: 'Sensor Trends' };
      case '/failures':
        return { section: 'Maintenance', page: 'Failure History and Downtime' };
      case '/maintenance':
        return { section: 'Maintenance', page: 'Work Orders' };
      case '/risks':
        return { section: 'Analytics', page: 'Risk' };
      case '/recommendations':
        return { section: 'Analytics', page: 'Recommendations' };
      case '/alerts':
        return { section: 'Maintenance', page: 'Alerts' };
      case '/data-sources':
        return { section: 'Data', page: 'Data Sources' };
      case '/data-quality':
        return { section: 'Data', page: 'Data Quality' };
      case '/runs':
        return { section: 'Data', page: 'Analysis Runs' };
      case '/users':
        return { section: 'Administration', page: 'Users' };
      case '/audit':
        return { section: 'Administration', page: 'Audit Log' };
      case '/settings':
        return { section: 'Administration', page: 'Settings' };
      default:
        return { section: 'Operations', page: 'MaintIQ Platform' };
    }
  };

  const breadcrumb = getBreadcrumb();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-black text-white text-base tracking-wider shadow-inner shadow-blue-400">
            M
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              MaintIQ
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded">
                v2.6
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Industrial Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map(group => (
          <div key={group.section ?? 'top'} className={group.section ? 'pt-2 border-t border-slate-800' : undefined}>
            {group.section && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                {group.section}
              </p>
            )}
            <nav className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-white group-[.bg-blue-600]:text-white" />
                      <span>{item.label}</span>
                    </div>
                    {(item as any).badge && (
                      <span
                        className={`text-[10px] font-semibold text-white px-1.5 py-0.2 rounded-full ${(item as any).badgeColor}`}
                      >
                        {(item as any).badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Status Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px]">
        <div className="flex items-center justify-between text-slate-300 mb-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">{apiOnline ? 'API connected' : 'Demo snapshot'}</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center justify-between">
          <span>Historical data</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-800">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </div>

      <div className="flex flex-1 min-h-screen">
        {/* Desktop Persistent Left Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-0 h-screen z-20">
          <SidebarContent />
        </aside>

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Sticky Header */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-4 py-2.5 flex items-center justify-between gap-4">
            {/* Left: Mobile Hamburger & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center text-xs text-slate-500 font-medium">
                <span className="hover:text-slate-700">{breadcrumb.section}</span>
                <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400" />
                <span className="font-semibold text-slate-900">{breadcrumb.page}</span>
              </div>
            </div>

            {/* Right: Operational Context, Notifications, User */}
            <div className="flex items-center gap-3">
              {/* Context Tag: Tunis Production Plant & Snapshot */}
              <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Radio className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold text-slate-800">Tunis Production Plant</span>
                </div>
                <span className="text-slate-300">|</span>
                <span className="text-[11px] text-slate-500 font-medium bg-slate-200/60 px-1.5 py-0.5 rounded">
                  {apiOnline ? 'API data' : 'Historical data'}
                </span>
              </div>

              {/* Notifications Popover */}
              <div className="relative">
                <button
                  type="button"
                  id="notifications-button"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
                      <span className="text-xs font-bold text-slate-900">Alerts</span>
                      <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        {unreadAlertsCount} new
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {alerts.slice(0, 4).map(alert => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/alerts');
                          }}
                          className="p-2 text-xs rounded hover:bg-slate-50 cursor-pointer border-l-2 border-l-rose-500 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{alert.machineId}</span>
                            <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">{alert.event}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/alerts');
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto"
                      >
                        View all alerts <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Role */}
              <div className="relative">
                <button
                  type="button"
                  id="user-profile-button"
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2.5 p-1 pl-2 hover:bg-slate-100 rounded-md transition-colors text-left"
                >
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-bold text-slate-900 leading-none">{authUser?.username ?? 'Operator'}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {authUser?.role ?? 'Maintenance team'}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-semibold text-xs flex items-center justify-center border border-slate-300 shadow-2xs">
                    {(authUser?.username ?? 'OP').slice(0, 2).toUpperCase()}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in duration-100">
                    <div className="p-2 border-b border-slate-100 mb-1">
                      <div className="text-xs font-bold text-slate-900">{authUser?.username ?? 'Operator'}</div>
                      <div className="text-[11px] text-slate-500">{authUser?.role ?? 'Signed in via server session'}</div>
                    </div>
                    <div className="space-y-0.5 text-xs text-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-500" /> System Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/users');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-500" /> Team & Roles
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/audit');
                        }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" /> Audit Log
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut().finally(() => navigate('/login'));
                        }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-500" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            {!apiOnline && (
              <div className="mb-4 px-3 py-2 text-xs text-slate-700 bg-slate-100 border border-slate-200 rounded">
                API unavailable · showing demo snapshot
              </div>
            )}
            {actionError && (
              <div role="alert" className="mb-4 px-3 py-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded">
                {actionError}
              </div>
            )}
            {children}
          </main>

          {/* Persistent Footer */}
          <footer className="bg-white border-t border-slate-200 px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">MaintIQ</span>
              <span>— Maintenance analytics</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Tunis Production Plant</span>
              <span className="text-slate-300">•</span>
              <span>Historical data</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
