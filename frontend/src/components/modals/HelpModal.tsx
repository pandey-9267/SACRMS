import React from 'react';
import { useApp } from '../../context/AppContext';

export const HelpModal: React.FC = () => {
  const { isHelpModalOpen, setIsHelpModalOpen } = useApp();

  if (!isHelpModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto font-mono">
      <div className="bg-[#121212] border border-white/20 max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white"></span>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Standard Operating Procedures</h3>
          </div>
          <button onClick={() => setIsHelpModalOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-4 text-xs text-white/70 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">1. Readiness Scoring</h4>
            <p className="mt-1 text-white/60">
              Composite index (0-100) factoring in Resource Availability (35%), Equipment Uptime (25%), Medical Stocks (20%), and Emergency Preparedness (20%).
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">2. Severity Thresholds</h4>
            <ul className="list-disc list-inside space-y-1 mt-1 text-white/60">
              <li><strong className="text-alert-critical">Critical / High:</strong> Stock &lt; 20% max capacity or &lt; 3 days runway.</li>
              <li><strong className="text-alert-warning">Warning / Medium:</strong> Stock &lt; 45% max capacity or &lt; 6 days runway.</li>
              <li><strong className="text-alert-healthy">Healthy / Optimal:</strong> Stock in optimal range with &gt; 7 days buffer.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-5 mt-4 border-t border-white/10">
          <button
            onClick={() => setIsHelpModalOpen(false)}
            className="px-5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-widest cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
