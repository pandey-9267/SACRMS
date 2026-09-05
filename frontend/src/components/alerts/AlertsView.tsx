import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
  } = useApp();

  const [filterSeverity, setFilterSeverity] =
    useState<string>('');

  // ============================================================
  // ACTIVE ALERTS ONLY
  // Acknowledged alerts are removed from the active list.
  // ============================================================

  const filteredAlerts = alerts.filter(
    (alert) =>
      !alert.acknowledged &&
      (!filterSeverity ||
        alert.severity.toLowerCase() ===
        filterSeverity.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>

          <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
            Incident Telemetry
          </h1>

          <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
            THRESHOLD BREACHES, LOGISTICAL STRAIN & SENSOR ALARMS
          </p>

        </div>

        <div className="flex gap-2">

          <select
            value={filterSeverity}
            onChange={(e) =>
              setFilterSeverity(e.target.value)
            }
            aria-label="Filter alerts by severity"
            className="h-10 border border-white/15 bg-[#141414] text-white font-mono text-xs uppercase tracking-wider px-3 focus:border-white outline-none cursor-pointer"
          >

            <option
              value=""
              className="bg-[#121212]"
            >
              ALL SEVERITIES
            </option>

            <option
              value="high"
              className="bg-[#121212]"
            >
              HIGH PRIORITY
            </option>

            <option
              value="medium"
              className="bg-[#121212]"
            >
              MEDIUM PRIORITY
            </option>

            <option
              value="low"
              className="bg-[#121212]"
            >
              LOW PRIORITY
            </option>

          </select>

        </div>

      </div>

      {/* ======================================================
          ALERT LIST
      ====================================================== */}

      <div className="space-y-3">

        {filteredAlerts.length === 0 ? (

          <div className="bg-[#121212] border border-white/10 p-12 text-center text-white/40 font-mono">

            <span className="material-symbols-outlined text-4xl text-white/20 mb-2">
              check_circle
            </span>

            <h3 className="font-bold text-white uppercase tracking-wider">
              No active operational alerts.
            </h3>

            <p className="text-xs mt-1">
              All telemetry thresholds and supply levels are operating within standard parameters.
            </p>

          </div>

        ) : (

          filteredAlerts.map((alert) => {

            const isMaintenanceCompleted =
              alert.title === 'Maintenance Completed';

            return (

              <div
                key={alert.id}
                className="p-5 transition-all font-mono bg-[#181212] border border-alert-critical/40"
              >

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                  <div className="flex items-start gap-4">

                    {/* ==================================================
                        ALERT ICON
                    ================================================== */}

                    <div
                      className={`w-8 h-8 flex items-center justify-center shrink-0 text-xs font-bold ${alert.severity === 'High'
                          ? 'bg-alert-critical text-white'
                          : alert.severity === 'Medium'
                            ? 'bg-alert-warning text-black'
                            : 'bg-white/20 text-white'
                        }`}
                    >
                      {isMaintenanceCompleted
                        ? '✓'
                        : '!'}
                    </div>

                    <div>

                      {/* ==================================================
                          META INFORMATION
                      ================================================== */}

                      <div className="flex flex-wrap items-center gap-2 mb-1.5 text-[10px]">

                        <span
                          className={`font-bold uppercase px-1.5 py-0.5 border ${alert.severity === 'High'
                              ? 'border-alert-critical/60 text-alert-critical bg-alert-critical/10'
                              : alert.severity === 'Medium'
                                ? 'border-alert-warning/60 text-alert-warning bg-alert-warning/10'
                                : 'border-white/30 text-white/60 bg-white/5'
                            }`}
                        >
                          {alert.severity} PRIORITY
                        </span>

                        <span className="font-bold text-white uppercase">
                          {alert.campName}
                        </span>

                        <span className="text-white/40">
                          // {alert.timestamp}
                        </span>

                        {/* ==================================================
                            STATUS LABEL
                        ================================================== */}

                        {isMaintenanceCompleted ? (

                          <span className="text-alert-warning font-black">
                            [● ACKNOWLEDGEMENT REQUIRED]
                          </span>

                        ) : (

                          <span className="text-alert-critical font-black">
                            [● REQUIRES ACTION]
                          </span>

                        )}

                      </div>

                      {/* ==================================================
                          TITLE
                      ================================================== */}

                      <h3 className="text-sm font-black font-display text-white uppercase tracking-wide">
                        {alert.title}
                      </h3>

                      {/* ==================================================
                          DESCRIPTION
                      ================================================== */}

                      <p className="text-xs text-white/60 mt-1 max-w-2xl">
                        {alert.description}
                      </p>

                      {/* ==================================================
                          ACTION / ACKNOWLEDGEMENT
                      ================================================== */}

                      <div className="mt-3 bg-[#0a0a0a] p-2.5 border border-white/10 text-xs flex items-center gap-2">

                        <span className="text-white/40 uppercase">
                          {isMaintenanceCompleted
                            ? 'Acknowledgement:'
                            : 'Action Needed:'}
                        </span>

                        <span className="text-white font-bold">
                          {alert.actionRequired}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* ====================================================
                      ACKNOWLEDGE BUTTON
                  ==================================================== */}

                  <div className="flex sm:flex-col items-end gap-2 shrink-0">

                    {!alert.id.startsWith('auto-resource-') && (
                      <button
                        type="button"
                        onClick={() =>
                          acknowledgeAlert(alert.id)
                        }
                        className="px-3 py-1.5 bg-transparent border border-white/20 hover:border-white text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}

                  </div>

                </div>

              </div>

            );
          })

        )}

      </div>

    </div>
  );
};