import React, { useEffect, useState } from 'react';
import {
  useApp,
  apiRequest,
} from '../../context/AppContext';

export const SettingsView: React.FC = () => {
 const {
  addToast,
  currentCamp,
  camps,
} = useApp();

  const [warningThreshold, setWarningThreshold] =
    useState('');

  const [criticalThreshold, setCriticalThreshold] =
    useState('');

  const [autoAlerts, setAutoAlerts] =
    useState(true);

  const [audioPings, setAudioPings] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  // Load settings whenever the selected camp changes
  useEffect(() => {
    if (!currentCamp) return;

    setWarningThreshold(
      String(
        currentCamp.warningThreshold ?? 45
      )
    );

    setCriticalThreshold(
      String(
        currentCamp.criticalThreshold ?? 20
      )
    );

    setAutoAlerts(
      currentCamp.autoAlerts ?? true
    );

    setAudioPings(
      currentCamp.audioPings ?? false
    );
  }, [currentCamp]);

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!currentCamp?.id) {
      addToast(
        'warning',
        'No Camp Selected',
        'Please select a camp before saving settings.'
      );
      return;
    }

    const numericWarningThreshold =
      warningThreshold.trim() === ''
        ? NaN
        : Number(warningThreshold);

    const numericCriticalThreshold =
      criticalThreshold.trim() === ''
        ? NaN
        : Number(criticalThreshold);

    // Validate numbers
    if (
      !Number.isFinite(
        numericWarningThreshold
      ) ||
      !Number.isFinite(
        numericCriticalThreshold
      )
    ) {
      addToast(
        'warning',
        'Invalid Threshold',
        'Please enter valid warning and critical threshold values.'
      );
      return;
    }

    // Validate range
    if (
      numericWarningThreshold < 0 ||
      numericWarningThreshold > 100 ||
      numericCriticalThreshold < 0 ||
      numericCriticalThreshold > 100
    ) {
      addToast(
        'warning',
        'Invalid Threshold',
        'Threshold values must be between 0 and 100.'
      );
      return;
    }

    // Critical must be lower than Warning
    if (
      numericCriticalThreshold >=
      numericWarningThreshold
    ) {
      addToast(
        'warning',
        'Invalid Threshold',
        'Critical threshold must be lower than the warning threshold.'
      );
      return;
    }

    try {
      setSaving(true);

  const data = await apiRequest<{
  message: string;
  camp: {
    _id: string;
    warningThreshold: number;
    criticalThreshold: number;
    autoAlerts: boolean;
    audioPings: boolean;
  };
}>(
  `/camps/${currentCamp.id}/settings`,
  {
    method: 'PATCH',

    body: JSON.stringify({
      warningThreshold:
        numericWarningThreshold,

      criticalThreshold:
        numericCriticalThreshold,

      autoAlerts,

      audioPings,
    }),
  }
);

      const updatedCamp =
        data.camp;

    

      addToast(
        'success',
        'Settings Saved',
        `${currentCamp.name} settings updated successfully.`
      );
    } catch (error) {
      console.error(
        'SAVE CAMP SETTINGS ERROR:',
        error
      );

      addToast(
        'error',
        'Save Failed',
        error instanceof Error
          ? error.message
          : 'Failed to save camp settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!currentCamp) {
    return (
      <div className="text-white/60 font-mono text-sm">
        No camp selected.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
          Camp Settings
        </h1>

        <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
          CAMP-SPECIFIC OPERATIONAL CONFIGURATION
        </p>
      </div>

      {/* CURRENT CAMP */}
      <div className="bg-[#121212] border border-white/10 p-5 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Current Camp
            </p>

            <p className="text-sm text-white font-bold mt-1">
              {currentCamp.name}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Camp ID
            </p>

            <p className="text-xs text-white/70 mt-1 break-all">
              {currentCamp.id}
            </p>
          </div>

        </div>
      </div>

      {/* SETTINGS FORM */}
      <form
        onSubmit={handleSave}
        className="bg-[#121212] border border-white/10 p-6 sm:p-8 space-y-6 font-mono"
      >

        {/* THRESHOLDS */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-1">
            Safety Threshold Limits
          </h3>

          <p className="text-xs text-white/50 mb-4">
            Define supply percentage levels that trigger tactical alerts for this camp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* WARNING */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">
                Warning Threshold (%)
              </label>

              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={warningThreshold}
                onChange={(e) =>
                  setWarningThreshold(
                    e.target.value
                  )
                }
                className="w-full h-10 px-3.5 bg-[#181818] border border-white/15 text-xs text-white focus:border-white outline-none"
              />

              <span className="text-[10px] text-white/40 mt-1 block">
                Triggers amber advisory notification
              </span>
            </div>

            {/* CRITICAL */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">
                Critical Threshold (%)
              </label>

              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={criticalThreshold}
                onChange={(e) =>
                  setCriticalThreshold(
                    e.target.value
                  )
                }
                className="w-full h-10 px-3.5 bg-[#181818] border border-white/15 text-xs text-white focus:border-white outline-none"
              />

              <span className="text-[10px] text-white/40 mt-1 block">
                Triggers high-priority emergency alert
              </span>
            </div>

          </div>
        </div>

        <div className="h-[1px] bg-white/10" />

        {/* AUTOMATION */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-1">
            Automated Telemetry Dispatch
          </h3>

          <div className="space-y-3 mt-4 text-xs">

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAlerts}
                onChange={(e) =>
                  setAutoAlerts(
                    e.target.checked
                  )
                }
                className="w-3.5 h-3.5 bg-[#181818] border-white/30 checked:bg-white text-black"
              />

              <span className="text-white/80">
                Automatically generate emergency restock tickets when stock falls below critical
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={audioPings}
                onChange={(e) =>
                  setAudioPings(
                    e.target.checked
                  )
                }
                className="w-3.5 h-3.5 bg-[#181818] border-white/30 checked:bg-white text-black"
              />

              <span className="text-white/80">
                Audio telemetry alerts on priority incident creation
              </span>
            </label>

          </div>
        </div>

        {/* SAVE */}
        <div className="pt-4 border-t border-white/10 flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-neutral-200 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? 'Saving...'
              : 'Save Configuration'}
          </button>

        </div>

      </form>
    </div>
  );
};