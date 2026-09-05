import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

export const ConsumptionView: React.FC = () => {
  const {
    currentCamp,
    currentCampResources,
    consumptionHistory,
    setIsRecordConsumptionModalOpen,
  } = useApp();

  // ============================================================
  // DEFAULT RESOURCE
  // ============================================================

  const defaultResource =
    currentCampResources.find(
      (resource) =>
        resource.category.toLowerCase() === 'water'
    ) || currentCampResources[0];

  const [selectedResourceId, setSelectedResourceId] =
    useState<string>(defaultResource?.id || '');

  // ============================================================
  // KEEP SELECTED RESOURCE VALID
  // ============================================================

  useEffect(() => {
    const resourceStillExists = currentCampResources.some(
      (resource) => resource.id === selectedResourceId
    );

    if (!resourceStillExists) {
      setSelectedResourceId(
        currentCampResources[0]?.id || ''
      );
    }
  }, [currentCampResources, selectedResourceId]);

  // ============================================================
  // CURRENT RESOURCE
  // ============================================================

  const currentRes = currentCampResources.find(
    (resource) => resource.id === selectedResourceId
  );

  // ============================================================
  // RESOURCE-SPECIFIC CONSUMPTION HISTORY
  // ============================================================

  const categoryHistory = currentRes
    ? consumptionHistory.filter((row) => {
        const sameResource =
          row.resourceName?.trim().toLowerCase() ===
          currentRes.name.trim().toLowerCase();

        const quantity = Number(row.quantity || 0);

        return sameResource && quantity > 0;
      })
    : [];

  // ============================================================
  // SORT HISTORY — LATEST FIRST
  // ============================================================

  const sortedHistory = [...categoryHistory].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

  // ============================================================
  // DAILY BASE BURN
  // ============================================================

  const dailyBaseBurn = currentRes
    ? currentRes.burnRatePerPersonPerDay *
      currentCamp.personnel
    : 0;

  // ============================================================
  // RUNWAY
  // ============================================================

  const runway =
    currentRes && dailyBaseBurn > 0
      ? Number(
          (
            currentRes.currentStock /
            dailyBaseBurn
          ).toFixed(1)
        )
      : currentRes
      ? 99
      : 0;

  // ============================================================
  // UNIT
  // ============================================================

  const unit = currentRes?.unit || 'Units';

  const hasConsumption = sortedHistory.length > 0;

  // ============================================================
  // TELEMETRY RESOURCES
  // ============================================================

  const telemetryResources = currentCampResources;

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>
          <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
            Consumption Telemetry
          </h1>

          <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
            HISTORICAL DEPLETION VECTORS & EMPIRICAL BURN METRICS
          </p>
        </div>

        <div className="flex items-center gap-3">

          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">
            Live telemetry
          </span>

          <button
            type="button"
            onClick={() =>
              setIsRecordConsumptionModalOpen(true)
            }
            className="flex items-center gap-2 bg-white text-black px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.16em] hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              add
            </span>

            <span>Record Consumption</span>
          </button>

        </div>
      </div>

      {/* ======================================================
          RESOURCE SELECTOR
      ====================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

        {telemetryResources.map((resource, index) => {

          const isSelected =
            selectedResourceId === resource.id;

          return (
            <button
              key={resource.id}
              type="button"
              onClick={() =>
                setSelectedResourceId(resource.id)
              }
              className={`p-5 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white text-black shadow-xl'
                  : 'bg-[#121212] border border-white/10 text-white hover:border-white/30'
              }`}
            >

              <div className="flex items-center justify-between mb-3">

                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                    isSelected
                      ? 'border-black/30 text-black'
                      : 'border-white/20 text-white/50'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-widest ${
                    isSelected
                      ? 'text-black/60'
                      : 'text-white/40'
                  }`}
                >
                  {resource.unit}
                </span>

              </div>

              <p
                className={`font-black uppercase tracking-tight text-base font-display ${
                  isSelected
                    ? 'text-black'
                    : 'text-white'
                }`}
              >
                {resource.name}
              </p>

              <p
                className={`mt-2 text-[9px] font-mono uppercase ${
                  isSelected
                    ? 'text-black/60'
                    : 'text-white/40'
                }`}
              >
                Stock:{' '}
                {resource.currentStock.toLocaleString()}{' '}
                {resource.unit}
              </p>

            </button>
          );
        })}

      </div>

      {/* ======================================================
          OPERATIONAL LOG + RUNWAY
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ====================================================
            OPERATIONAL LOG
        ==================================================== */}

        <div className="lg:col-span-8 bg-[#121212] border border-white/10 p-6">

          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">

            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">
              7-Day Operational Log //{' '}
              {currentRes?.name?.toUpperCase() ||
                'NO RESOURCE'}
            </h3>

            <span className="text-[10px] font-mono text-white/40 uppercase">
              DATA TRACE
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs font-mono">

              <thead className="bg-[#0a0a0a] text-white/40 font-bold uppercase text-[10px] tracking-[0.15em] border-b border-white/10">

                <tr>

                  <th className="px-4 py-3">
                    Date / Day
                  </th>

                  <th className="px-4 py-3">
                    Daily Consumed
                  </th>

                  <th className="px-4 py-3">
                    Headcount
                  </th>

                  <th className="px-4 py-3">
                    Per-Capita Rate
                  </th>

                  <th className="px-4 py-3">
                    Variance
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-white/10">

                {hasConsumption ? (

                  sortedHistory.map(
                    (row, index) => {

                      // IMPORTANT:
                      // Use exact resource quantity instead
                      // of old water/fuel/food/medical keys.
                      const val = Number(
                        row.quantity || 0
                      );

                      const rowHeadcount =
                        row.headcount ||
                        currentCamp.personnel;

                      const perCapita =
                        rowHeadcount > 0
                          ? (
                              val /
                              rowHeadcount
                            ).toFixed(2)
                          : '0.00';

                      const expected =
                        currentRes
                          ? currentRes
                              .burnRatePerPersonPerDay
                          : 0;

                      const actualPerCapita =
                        rowHeadcount > 0
                          ? val / rowHeadcount
                          : 0;

                      const variance =
                        expected > 0
                          ? (
                              ((actualPerCapita -
                                expected) /
                                expected) *
                              100
                            ).toFixed(1)
                          : '0.0';

                      const varianceNumber =
                        Number(variance);

                      const isAboveExpected =
                        varianceNumber > 0;

                      return (
                        <tr
                          key={`${row.date}-${selectedResourceId}-${index}`}
                          className="hover:bg-white/[0.03] transition-colors"
                        >

                          <td className="px-4 py-3 text-white font-bold uppercase">

                            {row.date}{' '}

                            <span className="text-white/50">
                              ({row.day})
                            </span>

                          </td>

                          <td className="px-4 py-3 font-bold text-white">

                            {val.toLocaleString()}{' '}
                            {unit}

                          </td>

                          <td className="px-4 py-3 text-white/50">

                            {rowHeadcount}{' '}
                            TROOPS

                          </td>

                          <td className="px-4 py-3 text-white/50">

                            {perCapita}{' '}
                            {unit} / T / DAY

                          </td>

                          <td className="px-4 py-3">

                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold ${
                                isAboveExpected
                                  ? 'text-alert-warning border border-alert-warning/40 bg-alert-warning/10'
                                  : 'text-alert-healthy border border-alert-healthy/40 bg-alert-healthy/10'
                              }`}
                            >

                              {varianceNumber > 0
                                ? '+'
                                : ''}

                              {variance}%

                            </span>

                          </td>

                        </tr>
                      );
                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center"
                    >

                      <div className="text-white/30 font-mono text-xs uppercase tracking-[0.15em]">

                        No consumption records
                        found for{' '}

                        {currentRes?.name ||
                          'this resource'}

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setIsRecordConsumptionModalOpen(
                            true
                          )
                        }
                        className="mt-4 px-4 py-2 border border-white/20 text-white text-[10px] font-mono uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-colors"
                      >
                        Record First Consumption
                      </button>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ====================================================
            RUNWAY ANALYTICS
        ==================================================== */}

        <div className="lg:col-span-4 space-y-4">

          <div className="bg-[#121212] border border-white/10 p-6 flex flex-col justify-between h-full">

            <div>

              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">

                <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white">
                  Runway Analytics
                </h4>

                <span className="text-[10px] font-mono text-white/40">
                  COMPUTE
                </span>

              </div>

              <div className="space-y-3 text-xs font-mono">

                {/* CURRENT STOCK */}

                <div className="flex justify-between pb-2 border-b border-white/10">

                  <span className="text-white/40 uppercase">
                    Current Stock:
                  </span>

                  <span className="font-bold text-white">

                    {currentRes
                      ? currentRes.currentStock.toLocaleString()
                      : '0'}{' '}

                    {currentRes?.unit || ''}

                  </span>

                </div>

                {/* DAILY BASE BURN */}

                <div className="flex justify-between pb-2 border-b border-white/10">

                  <span className="text-white/40 uppercase">
                    Daily Base Burn:
                  </span>

                  <span className="font-bold text-white">

                    {dailyBaseBurn.toLocaleString()}{' '}

                    {currentRes?.unit || ''}/DAY

                  </span>

                </div>

                {/* RUNWAY */}

                <div className="flex justify-between pb-2 border-b border-white/10">

                  <span className="text-white/40 uppercase">
                    Runway Buffer:
                  </span>

                  <span
                    className={`font-bold ${
                      runway <= 7
                        ? 'text-alert-critical'
                        : runway <= 14
                        ? 'text-alert-warning'
                        : 'text-white'
                    }`}
                  >
                    {runway} DAYS
                  </span>

                </div>

                {/* MIN THRESHOLD */}

                <div className="flex justify-between">

                  <span className="text-white/40 uppercase">
                    Min Buffer Threshold:
                  </span>

                  <span className="font-bold text-alert-critical">

                    {currentRes
                      ? currentRes.minLevel.toLocaleString()
                      : '0'}{' '}

                    {currentRes?.unit || ''}

                  </span>

                </div>

              </div>

            </div>

            {/* STATUS */}

            {currentRes && (

              <div className="mt-6 pt-4 border-t border-white/10">

                <div className="flex justify-between items-center">

                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    Inventory Status
                  </span>

                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-1 ${
                      currentRes.status === 'Critical'
                        ? 'text-alert-critical border border-alert-critical/40'
                        : currentRes.status === 'Warning'
                        ? 'text-alert-warning border border-alert-warning/40'
                        : 'text-alert-healthy border border-alert-healthy/40'
                    }`}
                  >
                    {currentRes.status}
                  </span>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};