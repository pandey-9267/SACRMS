/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ResourceInventoryView } from './components/resources/ResourceInventoryView';
import { CampsView } from './components/camps/CampsView';
import { ConsumptionView } from './components/consumption/ConsumptionView';
import { EquipmentView } from './components/equipment/EquipmentView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { UsersView } from './components/users/UsersView';
import { SettingsView } from './components/settings/SettingsView';
import { SupplyRequestsView } from './components/requests/SupplyRequestsView';

import { AddResourceModal } from './components/modals/AddResourceModal';
import { QuickRestockModal } from './components/modals/QuickRestockModal';
import { RecordConsumptionModal } from './components/modals/RecordConsumptionModal';
import { AddEquipmentModal } from './components/modals/AddEquipmentModal';
import { HelpModal } from './components/modals/HelpModal';
import { AppsDrawer } from './components/modals/AppsDrawer';
import { ToastContainer } from './components/modals/ToastContainer';

const MainAppContent: React.FC = () => {
  const { backendAvailable, retryBackendConnection, isAuthenticated, currentView, canAccessView, pendingCampRequests, currentUser, setCurrentView } = useApp();
  const [dismissedRequestIds, setDismissedRequestIds] = React.useState<string[]>([]);
  const hasRestoredView = React.useRef(false);
  React.useEffect(() => {
  if (!isAuthenticated) {
    hasRestoredView.current = false;
    return;
  }

  if (!hasRestoredView.current) {
    const savedView = localStorage.getItem('sacrms-active-view');

   if (savedView && canAccessView(savedView as typeof currentView)) {
      setCurrentView(savedView as typeof currentView);
    }

    hasRestoredView.current = true;
    return;
  }

  localStorage.setItem('sacrms-active-view', currentView);
}, [
  isAuthenticated,
  currentView,
  canAccessView,
  setCurrentView,
]);

  React.useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'Admin') {
      setDismissedRequestIds([]);
    }
  }, [isAuthenticated, currentUser?.role]);

  const activePendingRequest = pendingCampRequests.find((request) => !dismissedRequestIds.includes(request.id)) ?? null;

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  if (!backendAvailable) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md border border-white/15 bg-[#121212] p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-alert-warning">cloud_off</span>
          <h1 className="mt-4 text-xl font-black font-display uppercase tracking-tight">Backend Required</h1>
          <p className="mt-2 text-xs font-mono text-white/60">
            Start the SACRMS backend on port 4000 to load camp data and access the application.
          </p>
          <button
            type="button"
            onClick={retryBackendConnection}
            className="mt-6 bg-white px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-black hover:bg-neutral-200 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    if (!canAccessView(currentView)) {
      return <DashboardView />;
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'resources':
        return <ResourceInventoryView />;
      case 'camps':
        return <CampsView />;
      case 'consumption':
        return <ConsumptionView />;
      case 'equipment':
        return <EquipmentView />;
      case 'maintenance':
        return <MaintenanceView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      case 'requests':
        return <SupplyRequestsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="bg-main-bg text-on-surface flex min-h-screen w-full overflow-x-hidden font-sans">
      {/* Side Navigation Rail */}
      <Sidebar />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col lg:ml-64 w-full min-w-0 min-h-screen">
        <TopHeader />
        
        <main className="flex-1 p-4 sm:p-5 md:p-6 xl:p-8 max-w-[1440px] mx-auto w-full min-w-0">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <AddResourceModal />
      <QuickRestockModal />
        <RecordConsumptionModal />
        <AddEquipmentModal />
      <HelpModal />
      <AppsDrawer />
      <ToastContainer />

      {currentUser?.role === 'Admin' && activePendingRequest && (() => {
        const pendingCampRequest = activePendingRequest;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-[#121212] border border-white/20 max-w-lg w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                <div>
                  <p className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-alert-warning">HQ REQUIREMENT ALERT</p>
                  <h3 className="text-xl font-black font-display uppercase text-white mt-1">New Camp Request</h3>
                </div>
                <button
                  onClick={() => {
                    setDismissedRequestIds((prev) => (prev.includes(pendingCampRequest.id) ? prev : [...prev, pendingCampRequest.id]));
                  }}
                  className="text-white/40 hover:text-white cursor-pointer"
                  aria-label="Close alert"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-3 text-sm text-white/80">
                <p>
                  <span className="font-bold text-white">{pendingCampRequest.campName}</span> submitted a new requirement for{' '}
                  <span className="font-bold text-white">{pendingCampRequest.resourceName}</span>.
                </p>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-white/70">
                  <div className="bg-[#0d0d0d] border border-white/10 p-2">
                    <span className="block text-white/40 uppercase tracking-[0.2em] mb-1">Quantity</span>
                    {pendingCampRequest.quantity.toLocaleString()} {pendingCampRequest.unit}
                  </div>
                  <div className="bg-[#0d0d0d] border border-white/10 p-2">
                    <span className="block text-white/40 uppercase tracking-[0.2em] mb-1">Urgency</span>
                    {pendingCampRequest.urgency}
                  </div>
                </div>
                <div className="bg-[#0d0d0d] border border-white/10 p-3 text-[11px] font-mono text-white/70">
                  <span className="block text-white/40 uppercase tracking-[0.2em] mb-1">Justification</span>
                  {pendingCampRequest.reason}
                </div>
                <p className="text-[11px] font-mono text-white/50">
                  Requested by: {pendingCampRequest.requestedBy}
                </p>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setDismissedRequestIds((prev) => (prev.includes(pendingCampRequest.id) ? prev : [...prev, pendingCampRequest.id]));
                  }}
                  className="px-4 py-2 border border-white/20 text-white/80 hover:bg-white/5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] cursor-pointer"
                >
                  Review Later
                </button>
                <button
                  onClick={() => {
                    setDismissedRequestIds((prev) => (prev.includes(pendingCampRequest.id) ? prev : [...prev, pendingCampRequest.id]));
                    if (currentUser?.role === 'Admin') {
                      setCurrentView('requests');
                    }
                  }}
                  className="px-4 py-2 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-neutral-200"
                >
                  Review Request
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
