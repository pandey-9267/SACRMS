import React from 'react';
import { useApp } from '../../context/AppContext';

export const AppsDrawer: React.FC = () => {
  const {
    isAppsDrawerOpen,
    setIsAppsDrawerOpen,
    setCurrentView,
    setIsAddResourceModalOpen,
  } = useApp();

  if (!isAppsDrawerOpen) return null;

  const appShortcuts = [
    {
      title: 'Add Resource',
      desc: 'Create inventory item',
      icon: 'add_box',
      code: 'INV-02',
      action: () => {
        setIsAddResourceModalOpen(true);
      },
    },
    {
      title: 'Machinery Fleets',
      desc: 'Hardware telemetry',
      icon: 'construction',
      code: 'EQP-04',
      action: () => {
        setCurrentView('equipment');
      },
    },
    {
      title: 'Logistics Manifest',
      desc: 'Print / export audit',
      icon: 'description',
      code: 'AUD-05',
      action: () => {
        setCurrentView('reports');
      },
    },
    {
      title: 'Tactical Base Grid',
      desc: 'Camp status overview',
      icon: 'domain',
      code: 'GRD-06',
      action: () => {
        setCurrentView('camps');
      },
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-xs p-4 sm:p-6 font-mono"
      onClick={() => setIsAppsDrawerOpen(false)}
    >
      <div
        className="bg-[#121212] border border-white/20 max-w-sm w-full p-6 shadow-2xl mt-12 animate-in fade-in slide-in-from-top-4 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-white"></span>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">System Utilities</h3>
          </div>
          <button onClick={() => setIsAppsDrawerOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {appShortcuts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.action();
                setIsAppsDrawerOpen(false);
              }}
              className="flex flex-col items-start p-3 bg-[#181818] border border-white/10 hover:border-white text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[9px] font-bold text-white/40 group-hover:text-white">{item.code}</span>
                <span className="material-symbols-outlined text-[16px] text-white/50 group-hover:text-white">{item.icon}</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-tight text-white leading-tight">
                {item.title}
              </span>
              <span className="text-[9px] text-white/40 mt-1 line-clamp-1">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
