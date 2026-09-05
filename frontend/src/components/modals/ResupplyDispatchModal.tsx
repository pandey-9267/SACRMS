import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const ResupplyDispatchModal: React.FC = () => {
  const { isDispatchModalOpen, setIsDispatchModalOpen, camps, currentCampResources, addToast } = useApp();

  const [targetCamp, setTargetCamp] = useState(camps[0]?.id || 'camp-alpha');
  const [selectedResource, setSelectedResource] = useState(currentCampResources[0]?.id || '');
  const [quantity, setQuantity] = useState(10000);
  const [transportMethod, setTransportMethod] = useState<'HEMTT Ground Convoy' | 'C-130 Tactical Airlift' | 'Autonomous Cargo Drone'>('HEMTT Ground Convoy');
  const [priority, setPriority] = useState<'Standard' | 'Urgent' | 'Flash Priority'>('Urgent');

  if (!isDispatchModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const campObj = camps.find((c) => c.id === targetCamp);
    const resObj = currentCampResources.find((r) => r.id === selectedResource) || currentCampResources[0];
    
    addToast(
      'success',
      'Logistics Dispatch Authorized',
      `Dispatched ${quantity.toLocaleString()} ${resObj?.unit || 'units'} to ${campObj?.name} via ${transportMethod}.`
    );
    setIsDispatchModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto font-mono">
      <div className="bg-[#121212] border border-white/20 max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white"></span>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Authorize Convoy Dispatch</h3>
          </div>
          <button onClick={() => setIsDispatchModalOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Destination Camp</label>
            <select
              value={targetCamp}
              onChange={(e) => setTargetCamp(e.target.value)}
              className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white cursor-pointer"
            >
              {camps.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#121212]">
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Supply Cargo</label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white cursor-pointer"
              >
                {currentCampResources.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#121212]">
                    {r.name} ({r.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Quantity</label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Transport Carrier</label>
            <select
              value={transportMethod}
              onChange={(e) => setTransportMethod(e.target.value as any)}
              className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white cursor-pointer"
            >
              <option value="HEMTT Ground Convoy" className="bg-[#121212]">HEMTT Ground Convoy (ETA: 4 hrs)</option>
              <option value="C-130 Tactical Airlift" className="bg-[#121212]">C-130 Tactical Airlift (ETA: 45 min)</option>
              <option value="Autonomous Cargo Drone" className="bg-[#121212]">Autonomous Cargo Drone Swarm (ETA: 20 min)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">Dispatch Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Standard', 'Urgent', 'Flash Priority'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    priority === p
                      ? 'bg-white text-black border-white'
                      : 'border-white/15 text-white/60 hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2 border border-white/20 text-xs text-white/60 hover:text-white hover:border-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-widest text-xs transition-all shadow-sm cursor-pointer"
            >
              Authorize Dispatch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
