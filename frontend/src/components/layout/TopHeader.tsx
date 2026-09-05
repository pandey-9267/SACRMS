import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  useApp,
  ActiveView,
} from '../../context/AppContext';

import hqAdminPhoto from '../../../assets/phot.jpeg';

export const TopHeader: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    canAccessView,
    camps,
    selectedCampId,
    setSelectedCampId,
    alerts,
    acknowledgeAlert,
    currentUser,
    theme,
    setTheme,
    logout,
    setIsHelpModalOpen,
    setIsAppsDrawerOpen,
  } = useApp();

  const [isAlertsOpen, setIsAlertsOpen] =
    useState(false);

  const [isProfileMenuOpen, setIsProfileMenuOpen] =
    useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const alertsRef =
    useRef<HTMLDivElement>(null);

  const profileRef =
    useRef<HTMLDivElement>(null);

  const unreadAlerts = alerts.filter(
    (a) => !a.acknowledged
  );

  useEffect(() => {
    const handleClickOutside = (
      e: MouseEvent
    ) => {
      if (
        alertsRef.current &&
        !alertsRef.current.contains(
          e.target as Node
        )
      ) {
        setIsAlertsOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          e.target as Node
        )
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  return (
    <>
      <header className="bg-[#0a0a0a] flex items-center w-full min-w-0 h-16 px-3 sm:px-4 md:px-6 xl:px-8 sticky top-0 z-30 border-b border-white/10">

        {/* LEFT SECTION */}

        <div className="flex items-center shrink-0">

          {/* Mobile menu trigger */}

          <button
            onClick={() =>
              setIsMobileMenuOpen(
                !isMobileMenuOpen
              )
            }
            className="lg:hidden text-white/70 p-1.5 mr-2 sm:mr-3 border border-white/15 hover:bg-white/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">
              menu
            </span>
          </button>

          {/* FIELD COMMAND */}

          <h2 className="text-sm sm:text-base font-black font-display text-white uppercase tracking-tighter whitespace-nowrap">
            FIELD COMMAND
          </h2>

        </div>

        {/* SPACER */}

        <div className="flex-1" />

        {/* RIGHT SECTION */}

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">

          {/* CAMP SELECTOR */}

          <div className="relative flex items-center">

            <select
              value={selectedCampId}
              onChange={(e) =>
                setSelectedCampId(
                  e.target.value
                )
              }
              disabled={
                currentUser?.role !== 'Admin' &&
                currentUser?.role !==
                  'Maintenance Supervisor'
              }
              aria-label="Operational Camp Selection"
              className="appearance-none bg-[#141414] border border-white/15 text-white font-mono text-[10px] sm:text-xs uppercase tracking-wider rounded-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1.5 max-w-[118px] sm:max-w-none focus:outline-none focus:border-white cursor-pointer hover:bg-white/5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {camps.map((camp) => (
                <option
                  key={camp.id}
                  value={camp.id}
                  className="bg-[#121212] text-white"
                >
                  {camp.name.toUpperCase()}
                </option>
              ))}
            </select>

            <span className="material-symbols-outlined absolute right-2 text-white/50 pointer-events-none text-[16px]">
              unfold_more
            </span>

          </div>

          {/* NOTIFICATIONS */}

          <div
            className="relative"
            ref={alertsRef}
          >

            <button
              onClick={() =>
                setIsAlertsOpen(
                  !isAlertsOpen
                )
              }
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10 hover:border-white/30 hover:bg-white/5 relative cursor-pointer"
              title="Operational Alerts"
            >
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>

              {unreadAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-alert-critical ring-2 ring-black" />
              )}
            </button>

            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111111] border border-white/20 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">

                <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <span className="font-bold text-xs uppercase tracking-widest text-white">
                      Active Alerts
                    </span>

                    <span className="bg-alert-critical text-white text-[10px] font-mono font-bold px-1.5 py-0.5">
                      {unreadAlerts.length}
                    </span>

                  </div>

                  <button
                    onClick={() => {
                      setCurrentView(
                        'alerts'
                      );

                      setIsAlertsOpen(
                        false
                      );
                    }}
                    className="text-[10px] uppercase font-bold tracking-widest text-white/60 hover:text-white cursor-pointer"
                  >
                    View All [→]
                  </button>

                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-white/10">

                  {alerts.length === 0 ? (

                    <div className="p-4 text-center text-white/40 text-xs font-mono">
                      No active system alerts
                    </div>

                  ) : (

                    alerts
                      .slice(0, 4)
                      .map((alert) => (

                        <div
                          key={alert.id}
                          className={`p-3 text-xs hover:bg-white/5 transition-colors ${
                            !alert.acknowledged
                              ? 'bg-white/[0.03]'
                              : ''
                          }`}
                        >

                          <div className="flex items-start justify-between gap-2 mb-1">

                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase tracking-widest border ${
                                alert.severity ===
                                'High'
                                  ? 'border-alert-critical text-alert-critical bg-alert-critical/10'
                                  : 'border-alert-warning text-alert-warning bg-alert-warning/10'
                              }`}
                            >
                              {alert.severity}
                            </span>

                            <span className="text-[10px] font-mono text-white/40">
                              {alert.timestamp}
                            </span>

                          </div>

                          <p className="font-bold text-white leading-snug">
                            {alert.title}
                          </p>

                          <p className="text-white/50 text-[11px] mt-0.5 line-clamp-2">
                            {alert.description}
                          </p>

                          {!alert.acknowledged && (
                            <div className="mt-2 flex gap-2">

                              <button
                                onClick={() =>
                                  acknowledgeAlert(
                                    alert.id
                                  )
                                }
                                className="text-[10px] uppercase font-mono bg-transparent border border-white/20 hover:border-white text-white/80 px-2 py-1 cursor-pointer"
                              >
                                ACK
                              </button>

                            </div>
                          )}

                        </div>

                      ))

                  )}

                </div>

              </div>
            )}

          </div>

          {/* QUICK APPS */}

          <button
            onClick={() =>
              setIsAppsDrawerOpen(
                true
              )
            }
            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10 hover:border-white/30 hover:bg-white/5 cursor-pointer"
            title="Logistics Utilities"
          >
            <span className="material-symbols-outlined text-[20px]">
              apps
            </span>
          </button>

          {/* HELP */}

          <button
            onClick={() =>
              setIsHelpModalOpen(
                true
              )
            }
            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/10 hover:border-white/30 hover:bg-white/5 cursor-pointer"
            title="System Documentation & SOP"
          >
            <span className="material-symbols-outlined text-[20px]">
              help_outline
            </span>
          </button>

          {/* PROFILE */}

          <div
            className="relative"
            ref={profileRef}
          >

            <button
              onClick={() =>
                setIsProfileMenuOpen(
                  !isProfileMenuOpen
                )
              }
              className="w-10 h-10 bg-neutral-900 border border-white/30 hover:border-white transition-all cursor-pointer overflow-hidden flex items-center justify-center"
            >

              {currentUser?.role === 'Admin' ? (
                <img
                  src={hqAdminPhoto}
                  alt={
                    currentUser.name ||
                    'HQ Admin'
                  }
                  className="w-full h-full object-cover grayscale"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#111111] text-white font-mono font-bold text-sm">
                  CL
                </div>
              )}

            </button>

            {isProfileMenuOpen && (

              <div className="absolute right-0 mt-2 w-64 bg-[#111111] border border-white/20 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">

                {/* User Information */}

                <div className="px-4 py-3 border-b border-white/10">

                  <p className="font-bold text-white text-xs uppercase tracking-wider">
                    {currentUser?.name ||
                      'Col. Abhishek Pandey'}
                  </p>

                  <p className="text-white/40 text-[10px] font-mono mt-0.5">
                    {currentUser?.email ||
                      'commander@logistics.node'}
                  </p>

                  <span className="inline-block mt-2 bg-white text-black font-mono font-black text-[9px] uppercase px-1.5 py-0.5">
                    {currentUser?.role ||
                      'Admin'}{' '}
                    Profile
                  </span>

                </div>

                {/* Branch Identity */}

                <div className="px-4 py-2 border-b border-white/10">

                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5">
                    Branch Identity
                  </p>

                  <p className="text-xs text-white/70 font-mono">
                    HQ command controls branch access. Sign out before switching to another camp identity.
                  </p>

                </div>

                <div className="pt-1">

                  {/* Army Mode */}

                  <button
                    onClick={() =>
                      setTheme(
                        theme === 'army'
                          ? 'plain'
                          : 'army'
                      )
                    }
                    className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center justify-between cursor-pointer font-mono uppercase tracking-wider"
                  >

                    <span className="flex items-center gap-2">

                      <span className="material-symbols-outlined text-[16px]">
                        military_tech
                      </span>

                      <span>
                        Army Mode
                      </span>

                    </span>

                    <span className="text-[10px] font-bold">
                      {theme === 'army'
                        ? '[ON]'
                        : '[OFF]'}
                    </span>

                  </button>

                  {/* Settings */}

                  <button
                    onClick={() => {
                      setCurrentView(
                        'settings'
                      );

                      setIsProfileMenuOpen(
                        false
                      );
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
                  >

                    <span className="material-symbols-outlined text-[16px]">
                      settings
                    </span>

                    <span>
                      Camp Settings
                    </span>

                  </button>

                  {/* Logout */}

                  <button
                    onClick={() => {
                      logout();

                      setIsProfileMenuOpen(
                        false
                      );
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-alert-critical hover:bg-alert-critical/10 flex items-center gap-2 cursor-pointer font-mono uppercase tracking-wider"
                  >

                    <span className="material-symbols-outlined text-[16px]">
                      logout
                    </span>

                    <span>
                      Sign Out
                    </span>

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </header>

      {/* MOBILE DRAWER */}

      {isMobileMenuOpen && (

        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/80 backdrop-blur-xs"
          onClick={() =>
            setIsMobileMenuOpen(
              false
            )
          }
        >

          <div
            className="bg-[#0a0a0a] w-64 h-full p-6 flex flex-col text-white border-r border-white/20"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">

              <h2 className="text-lg font-black font-display text-white uppercase tracking-tighter">
                SACRMS
              </h2>

              <button
                onClick={() =>
                  setIsMobileMenuOpen(
                    false
                  )
                }
                className="text-white/60 hover:text-white"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>

            </div>

            <div className="space-y-1 flex-1">

              {(currentUser?.role ===
                'Logistics'
                ? [
                    [
                      'dashboard',
                      'Overview',
                    ],
                    [
                      'resources',
                      'Resources',
                    ],
                    [
                      'consumption',
                      'Consumption',
                    ],
                    [
                      'equipment',
                      'Equipment',
                    ],
                    [
                      'maintenance',
                      'Maintenance',
                    ],
                    [
                      'alerts',
                      'Alerts',
                    ],
                    [
                      'requests',
                      'Supply Requests',
                    ],
                    [
                      'reports',
                      'Reports',
                    ],
                    [
                      'settings',
                      'Camp Settings',
                    ],
                  ]
                : [
                    [
                      'dashboard',
                      'Dashboard',
                    ],
                    [
                      'camps',
                      'Camp Access',
                    ],
                    [
                      'resources',
                      'Resources',
                    ],
                    [
                      'consumption',
                      'Consumption',
                    ],
                    [
                      'equipment',
                      'Equipment',
                    ],
                    [
                      'maintenance',
                      'Maintenance',
                    ],
                    [
                      'alerts',
                      'Alerts',
                    ],
                    [
                      'reports',
                      'Reports',
                    ],
                    [
                      'users',
                      'Users',
                    ],
                    [
                      'settings',
                      'Camp Settings',
                    ],
                    [
                      'requests',
                      'Supply Requests',
                    ],
                  ]
              )
                .filter(
                  ([view]) =>
                    canAccessView(
                      view as ActiveView
                    )
                )
                .map(
                  ([
                    view,
                    label,
                  ]) => (

                    <button
                      key={view}
                      onClick={() => {
                        setCurrentView(
                          view as ActiveView
                        );

                        setIsMobileMenuOpen(
                          false
                        );
                      }}
                      className={`w-full text-left px-4 py-2.5 uppercase text-xs font-bold tracking-widest ${
                        currentView ===
                        view
                          ? 'bg-white text-black'
                          : 'text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>

                  )
                )}

            </div>

          </div>

        </div>

      )}

    </>
  );
};