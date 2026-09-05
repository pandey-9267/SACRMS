import React from 'react';
import { useApp } from '../../context/AppContext';

export const DashboardView: React.FC = () => {
  const { camps, currentCamp, currentCampResources, currentUser, setSelectedCampId } = useApp();

  const totalStock = currentCampResources.reduce((sum, item) => sum + item.currentStock, 0);
  const criticalItems = currentCampResources.filter((item) => item.status === 'Critical').length;
  const warningItems = currentCampResources.filter((item) => item.status === 'Warning').length;

  return (
    <div className="space-y-6">
      <div className="bg-[#121212] border border-white/10 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-white/40">
              {currentUser?.role || 'HQ ADMIN'}
            </p>
            <h1 className="mt-2 text-3xl font-black font-display uppercase tracking-tight text-white">
              {currentCamp.name}
            </h1>
          </div>
          <div className="border border-white/20 bg-[#0d0d0d] px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white">
            {currentCamp.code}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Camp Type</p>
            <p className="mt-2 text-2xl font-black text-white">{currentCamp.type}</p>
          </div>
          <div className="border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Personnel</p>
            <p className="mt-2 text-2xl font-black text-white">{currentCamp.personnel}</p>
          </div>
          <div className="border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Readiness</p>
            <p className="mt-2 text-2xl font-black text-white">{currentCamp.readinessScore}%</p>
          </div>
          <div className="border border-white/10 bg-[#0d0d0d] p-4">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Stock Level</p>
            <p className="mt-2 text-2xl font-black text-white">{totalStock.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#121212] border border-white/10 p-5">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Camp Overview</p>
          <div className="mt-4 space-y-3 text-sm font-mono text-white/80">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Location</span>
              <span className="font-bold text-white">{currentCamp.location}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Commander</span>
              <span className="font-bold text-white">{currentCamp.commander}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-white/50">Weather</span>
              <span className="font-bold text-white">{currentCamp.weather}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Temperature</span>
              <span className="font-bold text-white">{currentCamp.temperature}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/10 p-5">
          <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Resource Status</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="border border-white/10 bg-[#0d0d0d] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Healthy</p>
              <p className="mt-2 text-2xl font-black text-white">{currentCampResources.length - criticalItems - warningItems}</p>
            </div>
            <div className="border border-white/10 bg-[#0d0d0d] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Warning</p>
              <p className="mt-2 text-2xl font-black text-alert-warning">{warningItems}</p>
            </div>
            <div className="border border-white/10 bg-[#0d0d0d] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Critical</p>
              <p className="mt-2 text-2xl font-black text-alert-critical">{criticalItems}</p>
            </div>
            <div className="border border-white/10 bg-[#0d0d0d] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Items</p>
              <p className="mt-2 text-2xl font-black text-white">{currentCampResources.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#121212] border border-white/10 p-5">
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Inventory Snapshot</p>
        <div className="mt-4 space-y-3">
          {currentCampResources.length === 0 ? (
            <div className="border border-dashed border-white/20 p-4 text-sm font-mono text-white/50">
              No inventory assigned to this camp yet.
            </div>
          ) : (
            currentCampResources.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-white/10 bg-[#0d0d0d] p-3">
                <div>
                  <p className="text-sm font-bold text-white uppercase">{item.name}</p>
                  <p className="text-[10px] font-mono text-white/40">{item.category} • {item.location}</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono uppercase text-white/70">
                  <span>{item.currentStock.toLocaleString()} {item.unit}</span>
                  <span className={item.status === 'Critical' ? 'text-alert-critical' : item.status === 'Warning' ? 'text-alert-warning' : 'text-white'}>
                    {item.status}
                  </span>
                  <span>{item.estDays} days</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {currentUser?.role === 'Admin' && (
        <div className="bg-[#121212] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">Existing Camps</p>
            <span className="text-[10px] font-mono text-white/50">{camps.length} total</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {camps.map((camp) => (
              <button
                key={camp.id}
                type="button"
                onClick={() => setSelectedCampId(camp.id)}
                className={`text-left border p-3 transition-colors cursor-pointer ${
                  currentCamp.id === camp.id
                    ? 'border-white bg-white text-black'
                    : 'border-white/10 bg-[#0d0d0d] text-white hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black uppercase tracking-tight">{camp.name}</p>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 ${currentCamp.id === camp.id ? 'bg-black text-white' : 'border border-white/20 text-white/60'}`}>
                    {camp.type}
                  </span>
                </div>
                <p className={`mt-2 text-[10px] font-mono uppercase ${currentCamp.id === camp.id ? 'text-black/70' : 'text-white/40'}`}>
                  {camp.code} • {camp.personnel} personnel
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
