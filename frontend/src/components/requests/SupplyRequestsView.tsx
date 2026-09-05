import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResourceCategory,
  SupplyRequestStatus,
} from '../../types';

const statusStyles: Record<
  SupplyRequestStatus,
  string
> = {
  Submitted:
    'border-alert-warning text-alert-warning bg-alert-warning/10',

  Approved:
    'border-blue-400 text-blue-400 bg-blue-400/10',

  'In Transit':
    'border-alert-healthy text-alert-healthy bg-alert-healthy/10',

  Received:
    'border-alert-healthy text-alert-healthy bg-alert-healthy/10',

  Rejected:
    'border-alert-critical text-alert-critical bg-alert-critical/10',
};

export const SupplyRequestsView: React.FC = () => {
  const {
    currentCamp,
    currentUser,
    currentCampResources,
    supplyRequests,
    submitSupplyRequest,
    updateSupplyRequestStatus,
  } = useApp();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [category, setCategory] =
    useState<ResourceCategory>('Water');

  const [resourceName, setResourceName] =
    useState('');

const [quantity, setQuantity] =
  useState('1000');

  const [unit, setUnit] =
    useState('L');

  const [urgency, setUrgency] =
    useState<
      'Routine' | 'Urgent' | 'Critical'
    >('Urgent');

  const [reason, setReason] =
    useState(
      'Stock below operational requirement.'
    );

  // ============================================================
  // RESOURCES FOR SELECTED CATEGORY
  // ============================================================

  const categoryResources =
    currentCampResources.filter(
      (resource) =>
        resource.category === category
    );

  // ============================================================
  // KEEP RESOURCE SELECTION VALID
  // ============================================================

  useEffect(() => {
    const selectedResource =
      categoryResources.find(
        (resource) =>
          resource.name === resourceName
      );

    if (!selectedResource) {
      const firstResource =
        categoryResources[0];

      setResourceName(
        firstResource?.name || ''
      );

      setUnit(
        firstResource?.unit || 'Units'
      );
    }
  }, [
    category,
    currentCampResources,
    resourceName,
  ]);

  // ============================================================
  // WHEN RESOURCE CHANGES, SYNC UNIT
  // ============================================================

  useEffect(() => {
    const selectedResource =
      categoryResources.find(
        (resource) =>
          resource.name === resourceName
      );

    if (selectedResource) {
      setUnit(selectedResource.unit);
    }
  }, [
    resourceName,
    categoryResources,
  ]);

  // ============================================================
  // ROLE / REQUEST FILTERING
  // ============================================================

  const campRequests =
    supplyRequests.filter(
      (request) =>
        request.campId === currentCamp.id
    );

  const isCentralAdmin =
    currentUser?.role === 'Admin';

  const visibleRequests =
    isCentralAdmin
      ? supplyRequests
      : campRequests;

  // ============================================================
  // SUBMIT CAMP REQUEST
  // ============================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const selectedResource =
      categoryResources.find(
        (resource) =>
          resource.name === resourceName
      );

 if (!selectedResource) {
  return;
}

const numericQuantity = Number(quantity);

if (
  !Number.isFinite(numericQuantity) ||
  numericQuantity <= 0
) {
  return;
}

await submitSupplyRequest({
      category:
        selectedResource.category,

      resourceName:
        selectedResource.name,

      quantity,

      unit:
        selectedResource.unit,

      urgency,

      reason,
    });
  };

  // ============================================================
  // APPROVE REQUEST
  // ============================================================

  const handleApprove = (
    requestId: string
  ) => {
    updateSupplyRequestStatus(
      requestId,
      'Approved'
    );
  };

  // ============================================================
  // REJECT REQUEST
  // ============================================================

  const handleReject = (
    requestId: string
  ) => {
    const rejectionReason =
      window.prompt(
        'Reason for rejection:'
      );

    if (!rejectionReason?.trim()) {
      return;
    }

    updateSupplyRequestStatus(
      requestId,
      'Rejected',
      {
        reason:
          rejectionReason.trim(),
      }
    );
  };

  // ============================================================
  // DISPATCH REQUEST
  // ============================================================

  const handleDispatch = (
    requestId: string
  ) => {
    const carrier =
      window.prompt(
        'Enter carrier / transport details:',
        'Central Logistics Convoy'
      );

    if (!carrier?.trim()) {
      return;
    }

    const eta =
      window.prompt(
        'Enter ETA:',
        '24 hours'
      );

    if (!eta?.trim()) {
      return;
    }

    updateSupplyRequestStatus(
      requestId,
      'In Transit',
      {
        carrier:
          carrier.trim(),

        eta:
          eta.trim(),
      }
    );
  };

  // ============================================================
  // CONFIRM RECEIPT
  // ============================================================

  const handleConfirmReceipt = (
    requestId: string
  ) => {
    const confirmed =
      window.confirm(
        'Confirm that the requested supply has physically arrived at this camp?'
      );

    if (!confirmed) {
      return;
    }

    updateSupplyRequestStatus(
      requestId,
      'Received'
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
          Supply Requests
        </h1>

        <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
          CAMP REQUIREMENTS // CENTRAL LOGISTICS REVIEW QUEUE
        </p>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ====================================================
            CAMP REQUEST FORM
        ==================================================== */}

        {currentUser?.role ===
        'Logistics' ? (

          <form
            onSubmit={handleSubmit}
            className="bg-[#121212] border border-white/10 p-6 space-y-4"
          >

            <div className="border-b border-white/10 pb-3">

              <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em]">
                New Camp Requirement
              </p>

              <h2 className="text-lg font-black font-display text-white uppercase mt-1">
                Send To Centre
              </h2>

              <p className="text-[11px] font-mono text-white/50 mt-1">
                Origin: {currentCamp.name}
              </p>

            </div>

            {/* ==================================================
                CATEGORY
            ================================================== */}

            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider">

              Category

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as ResourceCategory
                  )
                }
                className="mt-1 w-full h-10 bg-[#181818] border border-white/15 px-3 text-xs text-white uppercase outline-none"
              >

                {[
                  'Water',
                  'Fuel',
                  'Food',
                  'Medicine',
                  'Supplies',
                  'Ammunition',
                  'Power',
                ].map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </label>

            {/* ==================================================
                SUPPLY NAME
            ================================================== */}

            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider">

              Supply Name

              <select
                value={resourceName}
                onChange={(event) =>
                  setResourceName(
                    event.target.value
                  )
                }
                required
                disabled={
                  categoryResources.length === 0
                }
                className="mt-1 w-full h-10 bg-[#181818] border border-white/15 px-3 text-xs text-white uppercase outline-none cursor-pointer disabled:opacity-50"
              >

                {categoryResources.length === 0 ? (

                  <option value="">
                    No resource available
                  </option>

                ) : (

                  categoryResources.map(
                    (resource) => (
                      <option
                        key={resource.id}
                        value={resource.name}
                      >
                        {resource.name}
                      </option>
                    )
                  )

                )}

              </select>

            </label>

            {/* ==================================================
                QUANTITY + UNIT
            ================================================== */}

            <div className="grid grid-cols-2 gap-3">

              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider">

                Quantity

              <input
  type="number"
  min="1"
  step="1"
  value={quantity}
  onChange={(event) =>
    setQuantity(event.target.value)
  }
  required
  className="mt-1 w-full h-10 bg-[#181818] border border-white/15 px-3 text-xs text-white outline-none"
/>

              </label>

              <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider">

                Unit

                <input
                  value={unit}
                  readOnly
                  className="mt-1 w-full h-10 bg-[#181818] border border-white/15 px-3 text-xs text-white uppercase outline-none opacity-80"
                />

              </label>

            </div>

            {/* ==================================================
                URGENCY
            ================================================== */}

            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider">

              Urgency

              <select
                value={urgency}
                onChange={(event) =>
                  setUrgency(
                    event.target.value as typeof urgency
                  )
                }
                className="mt-1 w-full h-10 bg-[#181818] border border-white/15 px-3 text-xs text-white uppercase outline-none"
              >

                <option value="Routine">
                  Routine
                </option>

                <option value="Urgent">
                  Urgent
                </option>

                <option value="Critical">
                  Critical
                </option>

              </select>

            </label>

            {/* ==================================================
                OPERATIONAL REASON
            ================================================== */}

            <label className="block text-[10px] font-mono font-bold text-white/50 uppercase tracking-wider">

              Operational Reason

              <textarea
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value
                  )
                }
                required
                rows={3}
                className="mt-1 w-full bg-[#181818] border border-white/15 p-3 text-xs text-white outline-none resize-none"
              />

            </label>

            {/* ==================================================
                SUBMIT
            ================================================== */}

            <button
              type="submit"
              disabled={
                categoryResources.length === 0
              }
              className="w-full py-2.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              Submit Requirement
            </button>

          </form>

        ) : (

          /* ==================================================
             HQ ADMIN INFORMATION PANEL
          ================================================== */

          <div className="bg-[#121212] border border-white/10 p-6 flex flex-col justify-between min-h-[260px]">

            <div>

              <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em]">
                Central Command Role
              </p>

              <h2 className="text-lg font-black font-display text-white uppercase mt-1">
                Review & Dispatch
              </h2>

              <p className="text-xs font-mono text-white/60 mt-3">
                Admin receives requirements
                from camp Logistics cells.
                Use the queue to approve
                valid requirements and
                dispatch the authorized
                supply.
              </p>

            </div>

            <div className="border-t border-white/10 pt-3 text-[10px] font-mono text-white/40 uppercase tracking-wider">
              Camp-side users submit
              requirements. Central Admin
              does not create them.
            </div>

          </div>
        )}

        {/* ====================================================
            REQUEST QUEUE
        ==================================================== */}

        <div className="xl:col-span-2 space-y-3">

          {/* QUEUE HEADER */}

          <div className="flex items-center justify-between border-b border-white/10 pb-3">

            <div>

              <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em]">
                Central Queue
              </h2>

              <p className="text-[10px] font-mono text-white/40 mt-1">
                {visibleRequests.length}{' '}
                REQUIREMENTS //{' '}
                {isCentralAdmin
                  ? 'ALL CAMPS'
                  : currentCamp.name.toUpperCase()}
              </p>

            </div>

            <span className="text-[10px] font-mono text-alert-warning uppercase">

              {
                visibleRequests.filter(
                  (request) =>
                    request.status ===
                    'Submitted'
                ).length
              }{' '}

              Awaiting Review

            </span>

          </div>

          {/* EMPTY STATE */}

          {visibleRequests.length ===
          0 ? (

            <div className="bg-[#121212] border border-white/10 p-10 text-center text-white/40 font-mono text-xs">
              No requirements in queue.
            </div>

          ) : (

            /* ==================================================
               REQUEST CARDS
            ================================================== */

            visibleRequests.map(
              (request) => (

                <div
                  key={request.id}
                  className="bg-[#121212] border border-white/10 p-5"
                >

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                    {/* REQUEST INFORMATION */}

                    <div className="min-w-0">

                      {/* STATUS */}

                      <div className="flex flex-wrap items-center gap-2">

                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                            statusStyles[
                              request.status
                            ]
                          }`}
                        >
                          {request.status}
                        </span>

                        <span className="text-[10px] font-mono text-white/40 uppercase">
                          {request.urgency}
                          {' // '}
                          {request.category}
                        </span>

                      </div>

                      {/* RESOURCE */}

                      <h3 className="text-base font-black font-display text-white uppercase mt-2">

                        {request.resourceName}

                        <span className="text-white/50">
                          {' // '}
                          {request.quantity.toLocaleString()}{' '}
                          {request.unit}
                        </span>

                      </h3>

                      {/* CAMP */}

                      <p className="text-xs font-mono text-white/60 mt-1">

                        {request.campName}

                        {' // '}

                        Requested by{' '}

                        {request.requestedBy}

                      </p>

                      {/* REASON */}

                      <p className="text-xs text-white/50 mt-3">
                        {request.reason}
                      </p>

                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">

                      {/* ===============================================
                          HQ: SUBMITTED → APPROVED
                      =============================================== */}

                      {isCentralAdmin &&
                        request.status ===
                          'Submitted' && (

                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(
                                request.id
                              )
                            }
                            className="px-3 py-1.5 border border-blue-400/60 text-blue-400 hover:bg-blue-400/10 text-[10px] font-mono font-bold uppercase cursor-pointer"
                          >
                            Approve
                          </button>

                        )}

                      {/* ===============================================
                          HQ: SUBMITTED / APPROVED → REJECTED
                      =============================================== */}

                      {isCentralAdmin &&
                        (
                          request.status ===
                            'Submitted' ||
                          request.status ===
                            'Approved'
                        ) && (

                          <button
                            type="button"
                            onClick={() =>
                              handleReject(
                                request.id
                              )
                            }
                            className="px-3 py-1.5 border border-alert-critical/60 text-alert-critical hover:bg-alert-critical/10 text-[10px] font-mono font-bold uppercase cursor-pointer"
                          >
                            Reject
                          </button>

                        )}

                      {/* ===============================================
                          HQ: APPROVED → IN TRANSIT
                      =============================================== */}

                      {isCentralAdmin &&
                        request.status ===
                          'Approved' && (

                          <button
                            type="button"
                            onClick={() =>
                              handleDispatch(
                                request.id
                              )
                            }
                            className="px-3 py-1.5 bg-alert-healthy text-black hover:opacity-90 text-[10px] font-mono font-bold uppercase cursor-pointer"
                          >
                            Dispatch
                          </button>

                        )}

                      {/* ===============================================
                          CAMP: IN TRANSIT → RECEIVED
                      =============================================== */}

                      {!isCentralAdmin &&
                        currentUser?.role ===
                          'Logistics' &&
                        request.status ===
                          'In Transit' && (

                          <button
                            type="button"
                            onClick={() =>
                              handleConfirmReceipt(
                                request.id
                              )
                            }
                            className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-[10px] font-mono font-bold uppercase cursor-pointer"
                          >
                            Confirm Received
                          </button>

                        )}

                    </div>

                  </div>

                  {/* ==================================================
                      LOGISTICS DETAILS
                  ================================================== */}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-white/40 uppercase mt-3">

                    {request.carrier && (
                      <span>
                        Carrier:{' '}
                        {request.carrier}
                      </span>
                    )}

                    {request.eta && (
                      <span>
                        ETA:{' '}
                        {request.eta}
                      </span>
                    )}

                    {request.receivedAt && (
                      <span>
                        Received:{' '}
                        {request.receivedAt}
                      </span>
                    )}

                    {request.rejectionReason && (
                      <span>
                        Rejection:{' '}
                        {request.rejectionReason}
                      </span>
                    )}

                  </div>

                  {/* ==================================================
                      PROCESSED BY
                  ================================================== */}

                  {request.reviewedBy && (
                    <p className="text-[10px] font-mono text-white/30 uppercase mt-3 border-t border-white/10 pt-2">
                      Processed by{' '}
                      {request.reviewedBy}
                    </p>
                  )}

                  {/* ==================================================
                      REQUEST HISTORY
                  ================================================== */}

                  {request.auditLog &&
                    request.auditLog.length >
                      1 && (

                      <p className="text-[10px] font-mono text-white/30 uppercase mt-2">

                        History:{' '}

                        {request.auditLog
                          .map(
                            (entry) =>
                              `${entry.action} by ${entry.actor} (${entry.timestamp})`
                          )
                          .join(
                            ' → '
                          )}

                      </p>

                    )}

                </div>

              )
            )

          )}

        </div>

      </div>

      {/* ========================================================
          WORKFLOW
      ======================================================== */}

      <div className="border border-white/10 p-4 text-[11px] font-mono text-white/50 uppercase tracking-wider">

        Workflow:{' '}

        <span className="text-white/70">
          Camp submits
        </span>

        {' → '}

        <span className="text-white/70">
          Centre reviews
        </span>

        {' → '}

        <span className="text-white/70">
          Approve or Reject
        </span>

        {' → '}

        <span className="text-white/70">
          Dispatch
        </span>

        {' → '}

        <span className="text-white/70">
          Camp confirms receipt
        </span>

        {' → '}

        <span className="text-white/70">
          Resource updated
        </span>

      </div>

    </div>
  );
};