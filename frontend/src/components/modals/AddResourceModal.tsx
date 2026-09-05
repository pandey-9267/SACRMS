import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResourceCategory } from '../../types';

export const AddResourceModal: React.FC = () => {
  const { isAddResourceModalOpen, setIsAddResourceModalOpen, addResource, selectedCampId } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Water');
  const [currentStock, setCurrentStock] = useState(10000);
  const [unit, setUnit] = useState('L');
  const [minLevel, setMinLevel] = useState(5000);
  const [maxCapacity, setMaxCapacity] = useState(25000);
  const [burnRate, setBurnRate] = useState(10);
  const [location, setLocation] = useState('Storage Bay Sector-A');
  const [sku, setSku] = useState(`SUP-${Math.floor(100 + Math.random() * 900)}`);
  const [icon, setIcon] = useState('inventory_2');

  if (!isAddResourceModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addResource({
      name,
      category,
      currentStock,
      unit,
      minLevel,
      maxCapacity,
      burnRatePerPersonPerDay: burnRate,
      campId: selectedCampId,
      icon,
      lastRestocked: new Date().toISOString().split('T')[0],
      location,
      sku,
    });
    setIsAddResourceModalOpen(false);
    setName('');
  };

  const handleCategoryChange = (cat: ResourceCategory) => {
    setCategory(cat);
    switch (cat) {
      case 'Water':
        setUnit('L');
        setBurnRate(12);
        setIcon('water_drop');
        break;
      case 'Fuel':
        setUnit('L');
        setBurnRate(5);
        setIcon('local_gas_station');
        break;
      case 'Food':
        setUnit('Boxes');
        setBurnRate(0.2);
        setIcon('restaurant');
        break;
      case 'Medicine':
        setUnit('Units');
        setBurnRate(0.02);
        setIcon('medical_services');
        break;
      case 'Ammunition':
        setUnit('Rounds');
        setBurnRate(40);
        setIcon('shield');
        break;
      default:
        setUnit('Units');
        setIcon('inventory_2');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto font-mono">
      <div className="bg-[#121212] border border-white/20 max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white"></span>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Add Inventory Entry</h3>
          </div>
          <button
            onClick={() => setIsAddResourceModalOpen(false)}
            className="text-white/40 hover:text-white p-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Resource Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Potable Water Bladder B"
              className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ResourceCategory)}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white cursor-pointer"
              >
                <option value="Water" className="bg-[#121212]">Water</option>
                <option value="Fuel" className="bg-[#121212]">Fuel</option>
                <option value="Food" className="bg-[#121212]">Food</option>
                <option value="Medicine" className="bg-[#121212]">Medicine</option>
                <option value="Ammunition" className="bg-[#121212]">Ammunition</option>
                <option value="Supplies" className="bg-[#121212]">Supplies</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Unit of Measure</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Stock</label>
              <input
                type="number"
                required
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Min Threshold</label>
              <input
                type="number"
                required
                value={minLevel}
                onChange={(e) => setMinLevel(Number(e.target.value))}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Max Capacity</label>
              <input
                type="number"
                required
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">
                Burn / Trooper / Day
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={burnRate}
                onChange={(e) => setBurnRate(Number(e.target.value))}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">SKU / Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Storage Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Vault Alpha-3, Grid 14"
              className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddResourceModalOpen(false)}
              className="px-4 py-2 border border-white/20 text-xs text-white/60 hover:text-white hover:border-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-widest text-xs transition-all shadow-sm cursor-pointer"
            >
              Commit Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
