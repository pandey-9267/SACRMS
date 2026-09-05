import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EquipmentItem } from '../../types';

export const EquipmentView: React.FC = () => {
  const {
    equipment,
    updateEquipmentStatus,
    setIsAddEquipmentModalOpen,
    currentCamp,
    currentUser,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('');

  const campEquipment =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Maintenance Supervisor'
      ? equipment
      : equipment.filter((item) => item.campId === currentCamp.id);

  const filteredEquipment = campEquipment.filter((e) => {
    if (!filterCategory) return true;

    const category = e.category.toLowerCase();

    switch (filterCategory) {
      case 'generator':
        return (
          category.includes('generator') ||
          category.includes('power')
        );

      case 'vehicle':
        return category.includes('vehicle');

      case 'water purification':
        return (
          category.includes('water') ||
          category.includes('purification')
        );

      case 'comms':
        return (
          category.includes('comms') ||
          category.includes('communication') ||
          category.includes('radar')
        );

      default:
        return category === filterCategory.toLowerCase();
    }
  });

  const getStatusBadge = (
    status: EquipmentItem['status']
  ) => {
    switch (status) {
      case 'Operational':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border border-alert-healthy/40 bg-alert-healthy/10 text-alert-healthy">
            Operational
          </span>
        );

      case 'Service Due':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border border-alert-warning/40 bg-alert-warning/10 text-alert-warning">
            Service Due
          </span>
        );

      case 'In Repair':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border border-alert-critical/40 bg-alert-critical/10 text-alert-critical">
            In Repair
          </span>
        );

      case 'Decommissioned':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest border border-white/20 text-white/50">
            Decom
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
            Machinery Fleet
          </h1>

          <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
            HARDWARE TELEMETRY, OPERATING HOURS & RUNTIME DIAGNOSTICS
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value)
            }
            aria-label="Filter equipment by type"
            className="h-10 border border-white/15 bg-[#141414] text-white font-mono text-xs uppercase tracking-wider px-3 focus:border-white outline-none cursor-pointer"
          >
            <option
              value=""
              className="bg-[#121212]"
            >
              ALL EQUIPMENT
            </option>

            <option
              value="generator"
              className="bg-[#121212]"
            >
              GENERATOR
            </option>

            <option
              value="vehicle"
              className="bg-[#121212]"
            >
              TACTICAL VEHICLES
            </option>

            <option
              value="water purification"
              className="bg-[#121212]"
            >
              PURIFICATION
            </option>

            <option
              value="comms"
              className="bg-[#121212]"
            >
              COMMS & RADAR
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              setIsAddEquipmentModalOpen(true)
            }
            className="flex items-center gap-2 h-10 bg-white text-black px-3 text-[10px] font-mono font-bold uppercase tracking-[0.16em] hover:bg-neutral-200 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              add
            </span>

            <span>Add Equipment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item) => (
          <div
            key={item.id}
            className="bg-[#121212] border border-white/10 p-5 hover:border-white/25 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/50 border border-white/10 px-1.5 py-0.5">
                  {item.category}
                </span>

                <h3 className="font-black font-display text-white uppercase text-base mt-2 leading-snug">
                  {item.name}
                </h3>

                <p className="text-[10px] font-mono text-white/40">
                  {item.serialNumber}
                </p>
              </div>

              {getStatusBadge(item.status)}
            </div>

            <div className="space-y-1.5 text-xs font-mono border-t border-white/10 pt-3 mb-4">
              <div className="flex justify-between">
                <span className="text-white/40 uppercase">
                  Health Index:
                </span>

                <span className="font-bold text-white">
                  {item.healthScore}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-white/40 uppercase">
                  Operating Hours:
                </span>

                <span className="text-white">
                  {item.operatingHours.toLocaleString()} HRS
                </span>
              </div>

              {item.fuelConsumptionPerHour && (
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase">
                    Fuel Burn Rate:
                  </span>

                  <span className="text-white">
                    {item.fuelConsumptionPerHour} L/HR
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-white/40 uppercase">
                  Next Service:
                </span>

                <span className="text-white font-medium">
                  {item.nextServiceDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <select
                value={item.status}
                onChange={(e) =>
                  updateEquipmentStatus(
                    item.id,
                    e.target.value as EquipmentItem['status']
                  )
                }
                aria-label={`Update status for ${item.name}`}
                className="w-full text-xs font-mono uppercase bg-[#181818] border border-white/15 text-white px-2 py-1.5 cursor-pointer outline-none focus:border-white"
              >
                <option
                  value="Operational"
                  className="bg-[#121212]"
                >
                  Operational
                </option>

                <option
                  value="Service Due"
                  className="bg-[#121212]"
                >
                  Service Due
                </option>

                <option
                  value="In Repair"
                  className="bg-[#121212]"
                >
                  In Repair
                </option>

                <option
                  value="Decommissioned"
                  className="bg-[#121212]"
                >
                  Decommissioned
                </option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};