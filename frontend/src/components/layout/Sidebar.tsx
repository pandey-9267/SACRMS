import React from 'react';
import { useApp, ActiveView } from '../../context/AppContext';
import hqAdminPhoto from '../../../assets/phot.jpeg';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    canAccessView,
    alerts,
    supplyRequests,
    currentUser,
    currentCamp,
    logout,
  } = useApp();

  const unacknowledgedAlerts =
    alerts.filter((a) => !a.acknowledged).length;

  const pendingSupplyRequests =
    currentUser?.role === 'Admin'
      ? supplyRequests.filter(
          (request) => request.status === 'Submitted'
        ).length
      : 0;

  const navItems: {
    id: ActiveView;
    label: string;
    icon: string;
    code: string;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      code: '01',
    },
    {
      id: 'camps',
      label: 'Camp Access',
      icon: 'domain',
      code: '02',
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: 'inventory_2',
      code: '03',
    },
    {
      id: 'consumption',
      label: 'Consumption',
      icon: 'analytics',
      code: '04',
    },
    {
      id: 'equipment',
      label: 'Equipment',
      icon: 'construction',
      code: '05',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: 'engineering',
      code: '06',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: 'notifications_active',
      code: '07',
      badge: unacknowledgedAlerts,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'description',
      code: '08',
    },
    {
      id: 'users',
      label: 'Users',
      icon: 'group',
      code: '09',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      code: '10',
    },
    {
      id: 'requests',
      label: 'Supply Requests',
      icon: 'assignment_turned_in',
      code: '11',
      badge: pendingSupplyRequests,
    },
  ];

  const campNavItems: {
    id: ActiveView;
    label: string;
    icon: string;
    code: string;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      code: '01',
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: 'inventory_2',
      code: '02',
    },
    {
      id: 'consumption',
      label: 'Consumption',
      icon: 'analytics',
      code: '03',
    },
    {
      id: 'equipment',
      label: 'Equipment',
      icon: 'construction',
      code: '04',
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: 'engineering',
      code: '05',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: 'notifications_active',
      code: '06',
      badge: unacknowledgedAlerts,
    },
    {
      id: 'requests',
      label: 'Supply Requests',
      icon: 'assignment_turned_in',
      code: '07',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'description',
      code: '08',
    },
    {
      id: 'settings',
      label: 'Camp Settings',
      icon: 'settings',
      code: '09',
    },
  ];

  const visibleNavItems =
    currentUser?.role === 'Logistics'
      ? campNavItems
      : navItems;

  return (
    <nav className="bg-[#0a0a0a] flex flex-col h-screen fixed left-0 top-0 overflow-y-auto w-64 z-20 hidden md:flex border-r border-white/10">

      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-white"></span>

              <h1 className="text-xl font-black font-display text-white tracking-tighter uppercase">
                SACRMS
              </h1>
            </div>

            <p className="text-[9px] text-white/40 uppercase tracking-[0.25em] font-bold mt-1 font-mono">
              FIELD COMMAND // V4
            </p>
          </div>

          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-white/20 text-white/70">
            SYS
          </span>

        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 px-3 py-4 space-y-1.5">

        <div className="px-3 pb-2">
          <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-white/30 font-mono">
            {currentUser?.role === 'Logistics'
              ? currentCamp.name
              : 'Navigation Index'}
          </span>
        </div>

        {visibleNavItems
          .filter((item) => canAccessView(item.id))
          .map((item, index) => {

            const isActive =
              currentView === item.id;

            const displayCode =
              String(index + 1).padStart(2, '0');

            return (
              <button
                key={item.id}
                onClick={() =>
                  setCurrentView(item.id)
                }
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >

                <div className="flex items-center gap-3">

                  <span
                    className={`text-[10px] font-mono ${
                      isActive
                        ? 'text-black/50'
                        : 'text-white/30'
                    }`}
                  >
                    {displayCode}
                  </span>

                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isActive
                        ? 'text-black'
                        : 'text-white/70'
                    }`}
                    style={{
                      fontVariationSettings: isActive
                        ? "'FILL' 1"
                        : "'FILL' 0",
                    }}
                  >
                    {item.icon}
                  </span>

                  <span
                    className={`text-xs uppercase tracking-[0.1em] font-bold ${
                      isActive ? 'text-black' : ''
                    }`}
                  >
                    {item.label}
                  </span>

                </div>

                {item.badge && item.badge > 0 ? (
                  <span
                    className={`text-[10px] font-mono font-black px-1.5 py-0.2 border ${
                      isActive
                        ? 'bg-black text-white border-black'
                        : 'bg-alert-critical text-white border-alert-critical'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}

              </button>
            );
          })}

      </div>

      {/* Bottom User Profile Card */}
      <div className="p-4 mt-auto border-t border-white/10 bg-[#0d0d0d]">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3 overflow-hidden">

            <div className="w-8 h-8 rounded-none border border-white/20 bg-white/10 shrink-0 overflow-hidden">

              {currentUser?.role === 'Admin' ? (
                <img
                  src={hqAdminPhoto}
                  alt={
                    currentUser?.name ||
                    'HQ Admin'
                  }
                  className="w-full h-full object-cover grayscale"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#111111] text-white font-mono font-bold text-sm">
                  CL
                </div>
              )}

            </div>

            <div className="truncate">

              <p className="text-xs font-bold text-white uppercase tracking-tight truncate">
                {currentUser?.name ||
                  'Col. Abhishek Pandey'}
              </p>

              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest truncate">
                {currentUser?.role || 'Admin'} •{' '}
                {currentUser?.serviceId ||
                  'SVC-7709'}
              </p>

            </div>

          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="text-white/40 hover:text-white p-1.5 border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              logout
            </span>
          </button>

        </div>

      </div>

    </nav>
  );
};