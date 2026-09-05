import React from 'react';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { currentCamp, currentCampResources, alerts, addToast } = useApp();

  const handlePrintAudit = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      camp: currentCamp,
      inventorySummary: currentCampResources,
      activeAlerts: alerts,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SACRMS_Logistics_Audit_${currentCamp.code}.json`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Report Exported', 'JSON logistics manifest saved.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
            Logistics Audits & Reports
          </h1>
          <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
            STANDARDIZED OPERATIONAL MANIFESTS & TELEMETRY ARCHIVES
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrintAudit}
            className="h-10 px-3.5 bg-transparent border border-white/20 hover:border-white text-white text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Audit</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="h-10 px-4 bg-white text-black font-bold uppercase tracking-[0.15em] text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[16px] text-black">file_download</span>
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Manifest Summary Paper Card */}
      <div className="bg-[#121212] border border-white/15 p-8 shadow-2xl print:bg-white print:text-black font-mono">
        <div className="border-b-2 border-white pb-4 mb-6 flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 block">
              SACRMS OPERATIONAL MANIFEST // DOC-ID #9042
            </span>
            <h2 className="text-2xl font-black font-display text-white uppercase mt-1">
              Readiness Audit: {currentCamp.name}
            </h2>
            <p className="text-xs text-white/50 mt-1 uppercase">
              TIMESTAMP: {new Date().toLocaleDateString()} // OFFICER: {currentCamp.commander}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-white text-black font-mono text-xs font-black px-3 py-1 uppercase tracking-widest">
              SCORE: {currentCamp.readinessScore}/100
            </span>
          </div>
        </div>

        {/* Camp Status Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-[#0a0a0a] border border-white/10">
          <div>
            <p className="text-[9px] uppercase text-white/40 font-bold tracking-widest">Base Code</p>
            <p className="text-xs font-bold text-white uppercase mt-0.5">{currentCamp.code}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase text-white/40 font-bold tracking-widest">Troops Headcount</p>
            <p className="text-xs font-bold text-white uppercase mt-0.5">{currentCamp.personnel} TROOPS</p>
          </div>
          <div>
            <p className="text-[9px] uppercase text-white/40 font-bold tracking-widest">Status Matrix</p>
            <p className="text-xs font-bold text-alert-healthy uppercase mt-0.5">{currentCamp.status}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase text-white/40 font-bold tracking-widest">Incident Alarms</p>
            <p className="text-xs font-bold text-alert-critical uppercase mt-0.5">{alerts.length} ACTIVE</p>
          </div>
        </div>

        {/* Table in Report */}
        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-white mb-3">Supply Inventory Manifest</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-white/10 mb-6">
            <thead className="bg-[#0a0a0a] text-white/40 uppercase text-[10px] font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="p-3">Resource</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Stock</th>
                <th className="p-3">Safety Min</th>
                <th className="p-3">Runway</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentCampResources.map((res) => (
                <tr key={res.id} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-bold text-white uppercase">{res.name}</td>
                  <td className="p-3 text-white/60 uppercase">{res.category}</td>
                  <td className="p-3 font-bold text-white">{res.currentStock.toLocaleString()} {res.unit}</td>
                  <td className="p-3 text-white/50">{res.minLevel.toLocaleString()} {res.unit}</td>
                  <td className="p-3 font-bold">{res.estDays} DAYS</td>
                  <td className="p-3 font-bold uppercase">{res.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between text-[10px] text-white/40 gap-2">
          <span>CLASSIFICATION: RESTRICTED // TACTICAL NODE ISOLATION</span>
          <span>AUTH-TOKEN: SACRMS-SEC-{Date.now().toString(36).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};
