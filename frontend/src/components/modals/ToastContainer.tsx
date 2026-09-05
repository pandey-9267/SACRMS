import React from 'react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none font-mono">
      {toasts.map((toast) => {
        const getToastStyles = () => {
          switch (toast.type) {
            case 'success':
              return { tag: 'OK', border: 'border-white', bg: 'bg-white text-black' };
            case 'warning':
              return { tag: 'WARN', border: 'border-alert-warning', bg: 'bg-[#1a1505] text-white border border-alert-warning' };
            case 'error':
              return { tag: 'ERR', border: 'border-alert-critical', bg: 'bg-[#1f0d0d] text-white border border-alert-critical' };
            default:
              return { tag: 'INFO', border: 'border-white/20', bg: 'bg-[#141414] text-white border border-white/20' };
          }
        };

        const style = getToastStyles();

        return (
          <div
            key={toast.id}
            className={`${style.bg} shadow-2xl p-4 flex items-start gap-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-200`}
          >
            <span className="text-[9px] font-black px-1.5 py-0.5 border border-current shrink-0 mt-0.5">
              {style.tag}
            </span>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black uppercase tracking-wider leading-tight">{toast.title}</p>
              <p className="text-[11px] opacity-75 mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-50 hover:opacity-100 p-0.5 shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
