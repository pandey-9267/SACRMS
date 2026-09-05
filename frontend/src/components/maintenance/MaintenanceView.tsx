import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceTask } from '../../types';

export const MaintenanceView: React.FC = () => {
  const {
    maintenanceTasks,
    updateTaskStatus,
    addMaintenanceTask,
    equipment,
    currentCamp,
    currentUser,
    addToast,
  } = useApp();

  const [showNewTaskModal, setShowNewTaskModal] =
    useState(false);

  const visibleEquipment =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Maintenance Supervisor'
      ? equipment
      : equipment.filter(
          (item) =>
            item.campId === currentCamp.id
        );

  // ------------------------------------------------------------
  // MAINTENANCE TASK SCOPE
  // ------------------------------------------------------------

  const scopedTasks =
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Maintenance Supervisor'
      ? maintenanceTasks
      : maintenanceTasks.filter(
          (task) =>
            task.campId === currentCamp.id
        );

  // Active work orders only
  const visibleTasks =
    scopedTasks.filter(
      (task) =>
        task.status !== 'Completed'
    );

  // Completed work orders
  const completedTasks =
    scopedTasks.filter(
      (task) =>
        task.status === 'Completed'
    );

  // ------------------------------------------------------------
  // FORM STATE
  // ------------------------------------------------------------

  const [title, setTitle] =
    useState('');

  const [equipmentId, setEquipmentId] =
    useState(
      visibleEquipment[0]?.id || ''
    );

  const [priority, setPriority] =
    useState<
      'High' | 'Medium' | 'Low'
    >('Medium');

  const [assignedTo, setAssignedTo] =
    useState(
      'Chief Warrant Officer Alex Rivera'
    );

  const [dueDate, setDueDate] =
    useState('2026-08-30');

  const [description, setDescription] =
    useState('');

  // ------------------------------------------------------------
  // CREATE WORK ORDER
  // ------------------------------------------------------------

  const handleCreateTask = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const selectedEq =
      visibleEquipment.find(
        (item) =>
          item.id === equipmentId
      );

    if (!selectedEq) {
      addToast(
        'warning',
        'Equipment Required',
        'Select an assigned equipment asset before creating a work order.'
      );

      return;
    }

    addMaintenanceTask({
      title,
      equipmentId,
      equipmentName:
        selectedEq.name ||
        'General Machinery',
      priority,
      status: 'Pending',
      assignedTo,
      dueDate,
      description,
      campId: currentCamp.id,
    });

    setShowNewTaskModal(false);
    setTitle('');
    setDescription('');
  };

  // ------------------------------------------------------------
  // PRIORITY BADGE
  // ------------------------------------------------------------

  const getPriorityBadge = (
    p: MaintenanceTask['priority']
  ) => {
    switch (p) {
      case 'High':
        return (
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-alert-critical border border-alert-critical/40 bg-alert-critical/10 px-1.5 py-0.5">
            High
          </span>
        );

      case 'Medium':
        return (
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-alert-warning border border-alert-warning/40 bg-alert-warning/10 px-1.5 py-0.5">
            Medium
          </span>
        );

      case 'Low':
        return (
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/50 border border-white/20 px-1.5 py-0.5">
            Low
          </span>
        );

      default:
        return null;
    }
  };

  // ------------------------------------------------------------
  // STATUS BADGE
  // ------------------------------------------------------------

  const getStatusBadge = (
    status: MaintenanceTask['status']
  ) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-2 py-1 border border-white/20 bg-white/5 text-white/70">
            <span className="material-symbols-outlined text-[13px]">
              schedule
            </span>
            Pending
          </span>
        );

      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-2 py-1 border border-alert-warning/30 bg-alert-warning/10 text-alert-warning">
            <span className="material-symbols-outlined text-[13px]">
              engineering
            </span>
            In Progress
          </span>
        );

      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-2 py-1 border border-green-400/30 bg-green-400/10 text-green-300">
            <span className="material-symbols-outlined text-[13px]">
              check_circle
            </span>
            Completed
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
            Work Orders & Maintenance
          </h1>

          <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
            HARDWARE PREVENTIVE RUNTIMES & EMERGENCY OVERHAUL TICKETS //{' '}
            {currentCamp.name}
          </p>
        </div>

        <button
          onClick={() =>
            setShowNewTaskModal(true)
          }
          className="h-10 px-4 bg-white text-black font-bold uppercase tracking-[0.15em] text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <span className="material-symbols-outlined text-[16px] text-black">
            add_task
          </span>

          <span>
            Log Work Order
          </span>
        </button>
      </div>

      {/* ======================================================
          ACTIVE WORK ORDERS
      ====================================================== */}

      <div className="space-y-3">

        <div>
          <h2 className="text-sm font-black font-display text-white uppercase tracking-[0.15em]">
            Active Work Orders
          </h2>

          <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.15em] mt-1">
            Pending and active maintenance operations
          </p>
        </div>

        <div className="bg-[#121212] border border-white/10 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left font-mono text-xs">

              <thead className="bg-[#0a0a0a] border-b border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-3.5">
                    Work Order
                  </th>

                  <th className="px-6 py-3.5">
                    Equipment
                  </th>

                  <th className="px-6 py-3.5">
                    Priority
                  </th>

                  <th className="px-6 py-3.5">
                    Assigned Lead
                  </th>

                  <th className="px-6 py-3.5">
                    Due Date
                  </th>

                  <th className="px-6 py-3.5">
                    Status
                  </th>

                  <th className="px-6 py-3.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">

                {visibleTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-xs font-mono text-white/40 uppercase"
                    >
                      No active maintenance work orders assigned to this camp.
                    </td>
                  </tr>
                ) : (
                  visibleTasks.map(
                    (task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-white/[0.03] transition-colors"
                      >

                        {/* WORK ORDER */}
                        <td className="px-6 py-3.5">

                          <p className="font-bold text-white uppercase">
                            {task.title}
                          </p>

                          <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>

                        </td>

                        {/* EQUIPMENT */}
                        <td className="px-6 py-3.5 text-white/70 uppercase">
                          {task.equipmentName}
                        </td>

                        {/* PRIORITY */}
                        <td className="px-6 py-3.5">
                          {getPriorityBadge(
                            task.priority
                          )}
                        </td>

                        {/* ASSIGNED LEAD */}
                        <td className="px-6 py-3.5 text-white uppercase">
                          {task.assignedTo}
                        </td>

                        {/* DUE DATE */}
                        <td className="px-6 py-3.5 text-white/60">
                          {task.dueDate}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-3.5">

                          <select
                            value={
                              task.status
                            }
                            onChange={(e) =>
                              updateTaskStatus(
                                task.id,
                                e.target.value as MaintenanceTask['status']
                              )
                            }
                            aria-label={`Status for task ${task.title}`}
                            className="text-[10px] font-mono font-bold uppercase px-2 py-1 bg-[#181818] border border-white/15 text-white cursor-pointer outline-none focus:border-white"
                          >
                            <option
                              value="Pending"
                              className="bg-[#121212]"
                            >
                              Pending
                            </option>

                            <option
                              value="In Progress"
                              className="bg-[#121212]"
                            >
                              In Progress
                            </option>

                            <option
                              value="Completed"
                              className="bg-[#121212]"
                            >
                              Completed
                            </option>
                          </select>

                        </td>

                        {/* DONE */}
                        <td className="px-6 py-3.5 text-right">

                          <button
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                'Completed'
                              )
                            }
                            className="text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-wider cursor-pointer underline"
                          >
                            Done
                          </button>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ======================================================
          MAINTENANCE HISTORY
      ====================================================== */}

      {completedTasks.length > 0 && (
        <div className="space-y-3">

          <div>
            <h2 className="text-sm font-black font-display text-white uppercase tracking-[0.15em]">
              Maintenance History
            </h2>

            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.15em] mt-1">
              Completed work orders // retained for operational history
            </p>
          </div>

          <div className="bg-[#121212] border border-white/10 overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-left font-mono text-xs">

                <thead className="bg-[#0a0a0a] border-b border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">

                  <tr>

                    <th className="px-6 py-3.5">
                      Work Order
                    </th>

                    <th className="px-6 py-3.5">
                      Equipment
                    </th>

                    <th className="px-6 py-3.5">
                      Priority
                    </th>

                    <th className="px-6 py-3.5">
                      Assigned Lead
                    </th>

                    <th className="px-6 py-3.5">
                      Due Date
                    </th>

                    <th className="px-6 py-3.5">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-white/10">

                  {completedTasks.map(
                    (task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-white/[0.03] transition-colors"
                      >

                        {/* WORK ORDER */}
                        <td className="px-6 py-3.5">

                          <p className="font-bold text-white uppercase">
                            {task.title}
                          </p>

                          <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>

                        </td>

                        {/* EQUIPMENT */}
                        <td className="px-6 py-3.5 text-white/70 uppercase">
                          {task.equipmentName}
                        </td>

                        {/* PRIORITY */}
                        <td className="px-6 py-3.5">
                          {getPriorityBadge(
                            task.priority
                          )}
                        </td>

                        {/* ASSIGNED LEAD */}
                        <td className="px-6 py-3.5 text-white uppercase">
                          {task.assignedTo}
                        </td>

                        {/* DUE DATE */}
                        <td className="px-6 py-3.5 text-white/60">
                          {task.dueDate}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-3.5">
                          {getStatusBadge(
                            task.status
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          NEW TASK MODAL
      ====================================================== */}

      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">

          <div className="bg-[#121212] border border-white/20 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">

            {/* MODAL HEADER */}

            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">

              <h3 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-white">
                Log Work Order
              </h3>

              <button
                onClick={() =>
                  setShowNewTaskModal(false)
                }
                className="text-white/40 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleCreateTask}
              className="space-y-4"
            >

              {/* TASK TITLE */}

              <div>

                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 mb-1">
                  Task Title
                </label>

                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Inspect fuel filtration valve"
                  className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white font-mono uppercase outline-none focus:border-white"
                />

              </div>

              {/* TARGET EQUIPMENT */}

              <div>

                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 mb-1">
                  Target Equipment
                </label>

                <select
                  value={equipmentId}
                  onChange={(e) =>
                    setEquipmentId(
                      e.target.value
                    )
                  }
                  disabled={
                    visibleEquipment.length === 0
                  }
                  className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white font-mono uppercase outline-none focus:border-white cursor-pointer"
                >

                  {visibleEquipment.length === 0 ? (
                    <option
                      value=""
                      disabled
                    >
                      No equipment assigned
                    </option>
                  ) : (
                    visibleEquipment.map(
                      (eq) => (
                        <option
                          key={eq.id}
                          value={eq.id}
                          className="bg-[#121212]"
                        >
                          {eq.name} ({eq.serialNumber})
                        </option>
                      )
                    )
                  )}

                </select>

              </div>

              {/* PRIORITY + DUE DATE */}

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 mb-1">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target.value as
                          | 'High'
                          | 'Medium'
                          | 'Low'
                      )
                    }
                    className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white font-mono uppercase outline-none focus:border-white cursor-pointer"
                  >

                    <option
                      value="High"
                      className="bg-[#121212]"
                    >
                      High
                    </option>

                    <option
                      value="Medium"
                      className="bg-[#121212]"
                    >
                      Medium
                    </option>

                    <option
                      value="Low"
                      className="bg-[#121212]"
                    >
                      Low
                    </option>

                  </select>

                </div>

                <div>

                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 mb-1">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) =>
                      setDueDate(
                        e.target.value
                      )
                    }
                    className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white font-mono uppercase outline-none focus:border-white"
                  />

                </div>

              </div>

              {/* ASSIGNED LEAD */}

              <div>

                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 mb-1">
                  Assigned Lead
                </label>

                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) =>
                    setAssignedTo(
                      e.target.value
                    )
                  }
                  className="w-full h-10 px-3 bg-[#181818] border border-white/15 text-xs text-white font-mono uppercase outline-none focus:border-white"
                />

              </div>

              {/* PROCEDURE NOTES */}

              <div>

                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 mb-1">
                  Procedure Notes
                </label>

                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Replacement parts or safety protocols..."
                  className="w-full p-3 bg-[#181818] border border-white/15 text-xs text-white font-mono uppercase outline-none focus:border-white"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">

                <button
                  type="button"
                  onClick={() =>
                    setShowNewTaskModal(false)
                  }
                  className="px-4 py-2 border border-white/20 text-xs font-mono uppercase text-white/60 hover:text-white hover:border-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    visibleEquipment.length === 0
                  }
                  className="px-5 py-2 bg-white text-black text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-200"
                >
                  Create Work Order
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};