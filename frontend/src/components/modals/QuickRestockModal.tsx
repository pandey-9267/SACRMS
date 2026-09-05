import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const QuickRestockModal: React.FC = () => {
  const { isQuickRestockModalOpen, setIsQuickRestockModalOpen, activeRestockResource, restockResource } = useApp();
  const [amount, setAmount] = useState(5000);
  const [notes, setNotes] = useState('Logistics Convoy Bravo arrival');

  if (!isQuickRestockModalOpen || !activeRestockResource) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    restockResource(activeRestockResource.id, amount, notes);
    setIsQuickRestockModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono">
      <div className="bg-[#121212] border border-white/20 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white"></span>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              Restock {activeRestockResource.name}
            </h3>
          </div>
          <button
            onClick={() => setIsQuickRestockModalOpen(false)}
            className="text-white/40 hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 p-3.5 mb-4 text-xs space-y-1.5">
          <p className="flex justify-between">
            <span className="text-white/40 uppercase">Current Balance:</span>
            <span className="font-bold text-white">
              {activeRestockResource.currentStock.toLocaleString()} {activeRestockResource.unit}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-white/40 uppercase">Max Tank Capacity:</span>
            <span className="text-white/60">
              {activeRestockResource.maxCapacity.toLocaleString()} {activeRestockResource.unit}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
              Quantity to Ingest ({activeRestockResource.unit})
            </label>
            <input
              type="number"
              required
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-sm font-bold text-white focus:border-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
              Logistics Delivery Reference / Batch
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Tanker Truck #441, Depot North"
              className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase focus:border-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsQuickRestockModalOpen(false)}
              className="px-4 py-2 border border-white/20 text-xs text-white/60 hover:text-white hover:border-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-widest text-xs transition-all shadow-sm cursor-pointer"
            >
              Confirm Restock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
