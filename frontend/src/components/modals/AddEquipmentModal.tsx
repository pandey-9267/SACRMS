import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EquipmentItem } from '../../types';

export const AddEquipmentModal: React.FC = () => {
  const {
    currentCamp,
    addEquipment,
    isAddEquipmentModalOpen,
    setIsAddEquipmentModalOpen,
  } = useApp();

  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] =
    useState<EquipmentItem['category']>('Generator');
  const [model, setModel] = useState('');
  const [status, setStatus] =
    useState<EquipmentItem['status']>('Operational');

  // Keep numeric input as string while typing
  const [operatingHours, setOperatingHours] = useState('0');

  const [location, setLocation] = useState(currentCamp.name);
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState('');

  if (!isAddEquipmentModalOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const numericOperatingHours =
      operatingHours.trim() === ''
        ? NaN
        : Number(operatingHours);

    if (
      !Number.isFinite(numericOperatingHours) ||
      numericOperatingHours < 0
    ) {
      return;
    }

    addEquipment({
      name,
      serialNumber,
      category,
      model,
      status,
      healthScore:
        status === 'Operational'
          ? 100
          : status === 'Service Due'
            ? 70
            : 40,

      operatingHours: numericOperatingHours,

      nextServiceDate: nextMaintenanceDate,
      location,
      lastMaintenanceDate,
      campId: currentCamp.id,
    });

    setIsAddEquipmentModalOpen(false);

    // Reset form
    setName('');
    setSerialNumber('');
    setModel('');
    setOperatingHours('0');
    setLocation(currentCamp.name);
    setLastMaintenanceDate('');
    setNextMaintenanceDate('');
    setCategory('Generator');
    setStatus('Operational');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto font-mono">
      <div className="bg-[#121212] border border-white/20 max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
        <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white"></span>

            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              Add Equipment
            </h3>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsAddEquipmentModalOpen(false)
            }
            className="text-white/40 hover:text-white p-1 cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Equipment Name */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">
              Equipment Name

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                required
                placeholder="Diesel Generator"
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
              />
            </label>

            {/* Equipment ID */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">
              Equipment ID

              <input
                value={serialNumber}
                onChange={(event) =>
                  setSerialNumber(event.target.value)
                }
                required
                placeholder="GEN-001"
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
              />
            </label>

            {/* Category */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">
              Category

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as EquipmentItem['category']
                  )
                }
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
              >
                <option>Generator</option>
                <option>Vehicle</option>
                <option>Water Purification</option>
                <option>Comms</option>
                <option>Medical</option>
                <option>Power System</option>
                <option>Storage</option>
                <option>Tools & Maintenance</option>
              </select>
            </label>

            {/* Model */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">
              Model

              <input
                value={model}
                onChange={(event) =>
                  setModel(event.target.value)
                }
                required
                placeholder="DG-250"
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
              />
            </label>

            {/* Status */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">
              Status

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as EquipmentItem['status']
                  )
                }
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
              >
                <option>Operational</option>
                <option>Service Due</option>
                <option>In Repair</option>
                <option>Decommissioned</option>
              </select>
            </label>

            {/* Operating Hours */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">
              Operating Hours

              <input
                type="number"
                min="0"
                step="1"
                value={operatingHours}
                onChange={(event) =>
                  setOperatingHours(event.target.value)
                }
                required
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white"
              />
            </label>

            {/* Location */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 sm:col-span-2">
              Location

              <input
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                required
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white"
              />
            </label>

            {/* Last Maintenance */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">
              Last Maintenance

              <input
                type="date"
                value={lastMaintenanceDate}
                onChange={(event) =>
                  setLastMaintenanceDate(event.target.value)
                }
                required
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white"
              />
            </label>

            {/* Next Maintenance */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50">
              Next Maintenance

              <input
                type="date"
                value={nextMaintenanceDate}
                onChange={(event) =>
                  setNextMaintenanceDate(event.target.value)
                }
                required
                className="mt-1 w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white"
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() =>
                setIsAddEquipmentModalOpen(false)
              }
              className="px-4 py-2 border border-white/20 text-xs text-white/60 hover:text-white hover:border-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-widest text-xs cursor-pointer"
            >
              Add Equipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};