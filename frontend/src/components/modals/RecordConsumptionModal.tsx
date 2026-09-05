import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResourceCategory } from '../../types';

export const RecordConsumptionModal: React.FC = () => {
  const {
    currentCampResources,
    currentCamp,
    recordConsumption,
    isRecordConsumptionModalOpen,
    setIsRecordConsumptionModalOpen,
  } = useApp();

  const [resourceId, setResourceId] = useState(
    currentCampResources[0]?.id || ''
  );

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

const [quantity, setQuantity] = useState('');

const [headcount, setHeadcount] = useState(
  String(currentCamp.personnel)
);

  const [purpose, setPurpose] = useState(
    'Daily Personnel Consumption'
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /*
   * ----------------------------------------------------------
   * KEEP FORM IN SYNC WITH CURRENT CAMP RESOURCES
   * ----------------------------------------------------------
   */

  useEffect(() => {
    if (
      !currentCampResources.some(
        (resource) => resource.id === resourceId
      )
    ) {
      setResourceId(
        currentCampResources[0]?.id || ''
      );
    }
  }, [currentCampResources, resourceId]);

  /*
   * Update headcount whenever the selected camp changes.
   */

  useEffect(() => {
    setHeadcount(currentCamp.personnel);
  }, [currentCamp.personnel]);

  /*
   * Reset the form whenever the modal opens.
   */

  useEffect(() => {
    if (isRecordConsumptionModalOpen) {
      setDate(
        new Date().toISOString().slice(0, 10)
      );

  setQuantity('');

setHeadcount(
  String(currentCamp.personnel)
);

      setPurpose(
        'Daily Personnel Consumption'
      );

      setIsSubmitting(false);
    }
  }, [
    isRecordConsumptionModalOpen,
    currentCamp.personnel,
  ]);

  if (!isRecordConsumptionModalOpen) {
    return null;
  }

  /*
   * ----------------------------------------------------------
   * SELECTED RESOURCE
   * ----------------------------------------------------------
   */

  const selectedResource =
    currentCampResources.find(
      (resource) =>
        resource.id === resourceId
    ) || currentCampResources[0];

  /*
   * ----------------------------------------------------------
   * LIVE CALCULATIONS
   * ----------------------------------------------------------
   */

  const availableStock =
    selectedResource?.currentStock || 0;

const safeQuantity = Math.max(
  0,
  Number(quantity) || 0
);

const safeHeadcount = Math.max(
  0,
  Number(headcount) || 0
);

  const remainingStock = Math.max(
    0,
    availableStock - safeQuantity
  );

const perCapitaConsumption =
  safeHeadcount > 0
    ? Number(
      (safeQuantity / safeHeadcount).toFixed(2)
    )
    : 0;

  const exceedsStock =
    safeQuantity > availableStock;

  const invalidQuantity =
    safeQuantity <= 0;

const invalidHeadcount =
  safeHeadcount <= 0;

  const canSubmit =
    !!selectedResource &&
    !isSubmitting &&
    !invalidQuantity &&
    !exceedsStock &&
    !invalidHeadcount &&
    !!date;

  /*
   * ----------------------------------------------------------
   * SUBMIT
   * ----------------------------------------------------------
   */

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!selectedResource) {
      return;
    }

    if (safeQuantity <= 0) {
      return;
    }

    if (safeQuantity > availableStock) {
      return;
    }

 if (safeHeadcount <= 0) {
  return;
}

    if (!date) {
      return;
    }

    setIsSubmitting(true);

    try {
      await recordConsumption({
        resourceName:
          selectedResource.name,

        category:
          selectedResource.category as ResourceCategory,

        date,

        quantity: safeQuantity,

       headcount: safeHeadcount,

        purpose:
          purpose.trim() ||
          'Daily Personnel Consumption',

        unit:
          selectedResource.unit,
      });

      /*
       * Close only after recordConsumption completes.
       */

      setIsRecordConsumptionModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ----------------------------------------------------------
   * CLOSE
   * ----------------------------------------------------------
   */

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setIsRecordConsumptionModalOpen(false);
  };

  /*
   * ----------------------------------------------------------
   * UI
   * ----------------------------------------------------------
   */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto font-mono">
      <div className="bg-[#121212] border border-white/20 max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-white" />

            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
              Record Consumption
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-white/40 hover:text-white disabled:opacity-30 p-1 cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[18px]">
              close
            </span>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* ==================================================
              RESOURCE
          ================================================== */}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
              Resource
            </label>

            <select
              value={resourceId}
              onChange={(event) => {
                setResourceId(
                  event.target.value
                );

                /*
                 * Reset quantity when changing
                 * resource so an old quantity doesn't
                 * accidentally exceed the new stock.
                 */
                setQuantity(0);
              }}
              required
              disabled={isSubmitting}
              className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white disabled:opacity-50"
            >
              {currentCampResources.length === 0 ? (
                <option value="">
                  No resources available
                </option>
              ) : (
                currentCampResources.map(
                  (resource) => (
                    <option
                      key={resource.id}
                      value={resource.id}
                    >
                      {resource.name}
                    </option>
                  )
                )
              )}
            </select>
          </div>

          {/* ==================================================
              STOCK INFORMATION
          ================================================== */}

          {selectedResource && (
            <div className="grid grid-cols-2 gap-3">

              <div className="border border-white/10 bg-[#0d0d0d] p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                  Available Stock
                </p>

                <p className="text-sm font-bold text-white mt-1">
                  {availableStock.toLocaleString()}{' '}
                  {selectedResource.unit}
                </p>
              </div>

              <div
                className={`border p-3 ${exceedsStock
                    ? 'border-red-500/50 bg-red-500/5'
                    : 'border-white/10 bg-[#0d0d0d]'
                  }`}
              >
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                  After Consumption
                </p>

                <p
                  className={`text-sm font-bold mt-1 ${exceedsStock
                      ? 'text-red-400'
                      : 'text-white'
                    }`}
                >
                  {remainingStock.toLocaleString()}{' '}
                  {selectedResource.unit}
                </p>
              </div>

            </div>
          )}

          {/* ==================================================
              DATE + QUANTITY
          ================================================== */}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                required
                disabled={isSubmitting}
                className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
                Quantity Used
              </label>

              <div className="relative">
                <input
  type="number"
  min="0"
  max={availableStock}
  step="any"
  value={quantity}
  onChange={(event) => {
    setQuantity(event.target.value);
  }}
  placeholder="0"
  required
  disabled={
    !selectedResource ||
    isSubmitting
  }
  className={`w-full h-10 px-3 pr-14 bg-[#181818] border text-xs text-white outline-none focus:border-white disabled:opacity-50 ${
    exceedsStock
      ? 'border-red-500'
      : 'border-white/15'
  }`}
/>

                {selectedResource && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-white/40 uppercase">
                    {selectedResource.unit}
                  </span>
                )}
              </div>

              {exceedsStock && (
                <p className="mt-1 text-[9px] font-bold uppercase text-red-400">
                  Exceeds available stock
                </p>
              )}
            </div>

          </div>

          {/* ==================================================
              HEADCOUNT
          ================================================== */}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
              Headcount
            </label>

           <input
  type="number"
  min="1"
  step="1"
  value={headcount}
  onChange={(event) => {
    setHeadcount(event.target.value);
  }}
  required
  disabled={isSubmitting}
  className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white outline-none focus:border-white disabled:opacity-50"
/>
            <p className="mt-1 text-[9px] text-white/30 uppercase">
              Camp strength: {currentCamp.personnel.toLocaleString()} troops
            </p>
          </div>

          {/* ==================================================
              PER CAPITA PREVIEW
          ================================================== */}

          <div className="border border-white/10 bg-[#0d0d0d] px-3 py-2 flex justify-between items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
              Per-Capita Consumption
            </span>

            <span className="text-xs font-bold text-white">
              {perCapitaConsumption.toLocaleString()}{' '}
              {selectedResource?.unit || ''}{' '}
              / TROOP
            </span>
          </div>

          {/* ==================================================
              PURPOSE
          ================================================== */}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
              Purpose
            </label>

            <input
              value={purpose}
              onChange={(event) =>
                setPurpose(
                  event.target.value
                )
              }
              required
              disabled={isSubmitting}
              placeholder="Daily Personnel Consumption"
              className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white uppercase outline-none focus:border-white disabled:opacity-50"
            />
          </div>

          {/* ==================================================
              WARNING
          ================================================== */}

          {selectedResource &&
            selectedResource.minLevel > 0 &&
            remainingStock <=
            selectedResource.minLevel &&
            safeQuantity > 0 && (
              <div className="border border-red-500/30 bg-red-500/5 px-3 py-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-400">
                  Warning: Consumption will bring
                  inventory to or below the minimum
                  buffer threshold.
                </p>
              </div>
            )}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-white/20 text-xs text-white/60 hover:text-white hover:border-white disabled:opacity-30 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2 bg-white hover:bg-neutral-200 disabled:opacity-40 text-black font-bold uppercase tracking-widest text-xs transition-all cursor-pointer"
            >
              {isSubmitting
                ? 'Recording...'
                : 'Record'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};