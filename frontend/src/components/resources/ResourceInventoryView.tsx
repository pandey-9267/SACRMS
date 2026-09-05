import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useApp } from '../../context/AppContext';
import {
  ResourceItem,
  ResourceStatus,
} from '../../types';

export const ResourceInventoryView: React.FC = () => {
  const {
    currentCampResources,
    currentCamp,
    setIsAddResourceModalOpen,
    updateResource,
    deleteResource,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] =
    useState('');

  const [categoryFilter, setCategoryFilter] =
    useState<string>('');

  const [statusFilter, setStatusFilter] =
    useState<string>('');

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 6;

  const [activeMenuId, setActiveMenuId] =
    useState<string | null>(null);

  const menuRef =
    useRef<HTMLDivElement | null>(null);

  // ============================================================
  // EDIT RESOURCE
  // ============================================================

  const [editingResource, setEditingResource] =
    useState<ResourceItem | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    sku: '',
    category: '',
    currentStock: '',
    unit: '',
    minLevel: '',
    maxCapacity: '',
    burnRatePerPersonPerDay: '',
    location: '',
    icon: '',
  });

  // Close action menu when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditResource = (
    resource: ResourceItem
  ) => {
    setEditingResource(resource);

    setEditForm({
      name: resource.name || '',
      sku: resource.sku || '',
      category: resource.category || '',
      currentStock: String(
        resource.currentStock ?? 0
      ),
      unit: resource.unit || '',
      minLevel: String(
        resource.minLevel ?? 0
      ),
      maxCapacity: String(
        resource.maxCapacity ?? 0
      ),
      burnRatePerPersonPerDay: String(
        resource.burnRatePerPersonPerDay ?? 0
      ),
      location: resource.location || '',
      icon:
        resource.icon || 'inventory_2',
    });

    setActiveMenuId(null);
  };

  // ============================================================
  // HANDLE EDIT INPUT
  // ============================================================

  const handleEditChange = (
    field: keyof typeof editForm,
    value: string
  ) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // SAVE EDITED RESOURCE
  // ============================================================

  const handleSaveResource = () => {
    if (!editingResource) {
      return;
    }

    const name = editForm.name.trim();
    const sku = editForm.sku.trim();
    const category = editForm.category.trim();
    const unit = editForm.unit.trim();
    const location = editForm.location.trim();

    const icon =
      editForm.icon.trim() || 'inventory_2';

    // ----------------------------------------------------------
    // CONVERT NUMERIC VALUES ONLY WHEN SAVING
    // ----------------------------------------------------------

    const currentStock =
      editForm.currentStock.trim() === ''
        ? NaN
        : Number(editForm.currentStock);

    const minLevel =
      editForm.minLevel.trim() === ''
        ? NaN
        : Number(editForm.minLevel);

    const maxCapacity =
      editForm.maxCapacity.trim() === ''
        ? NaN
        : Number(editForm.maxCapacity);

    const burnRatePerPersonPerDay =
      editForm.burnRatePerPersonPerDay.trim() === ''
        ? NaN
        : Number(
            editForm.burnRatePerPersonPerDay
          );

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (
      !name ||
      !sku ||
      !category ||
      !unit ||
      !location
    ) {
      addToast(
        'warning',
        'Incomplete Resource Data',
        'Please fill in all required resource fields.'
      );
      return;
    }

    if (
      !Number.isFinite(currentStock) ||
      !Number.isFinite(minLevel) ||
      !Number.isFinite(maxCapacity) ||
      !Number.isFinite(
        burnRatePerPersonPerDay
      )
    ) {
      addToast(
        'warning',
        'Invalid Resource Values',
        'Please enter valid numeric values.'
      );
      return;
    }

    if (
      currentStock < 0 ||
      minLevel < 0 ||
      maxCapacity < 0 ||
      burnRatePerPersonPerDay < 0
    ) {
      addToast(
        'warning',
        'Invalid Resource Values',
        'Numeric resource values cannot be negative.'
      );
      return;
    }

    if (minLevel > maxCapacity) {
      addToast(
        'warning',
        'Invalid Threshold',
        'Minimum level cannot be greater than maximum capacity.'
      );
      return;
    }

    if (currentStock > maxCapacity) {
      addToast(
        'warning',
        'Stock Exceeds Capacity',
        'Current stock cannot be greater than maximum capacity.'
      );
      return;
    }

    // ----------------------------------------------------------
    // UPDATE RESOURCE
    // ----------------------------------------------------------

    updateResource(
      editingResource.id,
      {
        name,
        sku,
        category:
          category as ResourceItem['category'],
        currentStock,
        unit,
        minLevel,
        maxCapacity,
        burnRatePerPersonPerDay,
        location,
        icon,
      }
    );

    addToast(
      'success',
      'Resource Updated',
      `${name} has been updated successfully.`
    );

    setEditingResource(null);
  };

  // ============================================================
  // FILTERED RESOURCES
  // ============================================================

  const filteredResources = useMemo(() => {
    return currentCampResources.filter(
      (res) => {
        const search =
          searchTerm.toLowerCase();

        const matchesSearch =
          res.name
            .toLowerCase()
            .includes(search) ||
          res.sku
            .toLowerCase()
            .includes(search) ||
          res.location
            .toLowerCase()
            .includes(search);

        const matchesCategory =
          !categoryFilter ||
          res.category
            .toLowerCase() ===
            categoryFilter.toLowerCase();

        const matchesStatus =
          !statusFilter ||
          res.status
            .toLowerCase() ===
            statusFilter.toLowerCase();

        return (
          matchesSearch &&
          matchesCategory &&
          matchesStatus
        );
      }
    );
  }, [
    currentCampResources,
    searchTerm,
    categoryFilter,
    statusFilter,
  ]);

  const totalPages =
    Math.ceil(
      filteredResources.length /
        itemsPerPage
    ) || 1;

  const displayedResources =
    filteredResources.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage * itemsPerPage
    );

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (
    status: ResourceStatus
  ) => {
    switch (status) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-alert-healthy/40 bg-alert-healthy/10 text-alert-healthy">
            Optimal
          </span>
        );

      case 'Warning':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-alert-warning/40 bg-alert-warning/10 text-alert-warning">
            Warning
          </span>
        );

      case 'Critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-alert-critical/40 bg-alert-critical/10 text-alert-critical">
            Critical
          </span>
        );
    }
  };

  // ============================================================
  // CAPACITY BAR
  // ============================================================

  const getBarColor = (
    status: ResourceStatus
  ) => {
    switch (status) {
      case 'Healthy':
        return 'bg-white';

      case 'Warning':
        return 'bg-alert-warning';

      case 'Critical':
        return 'bg-alert-critical';
    }
  };

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCSV = () => {
    const headers = [
      'Resource Name',
      'SKU',
      'Category',
      'Current Stock',
      'Unit',
      'Min Level',
      'Max Capacity',
      'Est Days',
      'Status',
      'Location',
    ];

    const rows =
      filteredResources.map((r) => [
        `"${r.name}"`,
        r.sku,
        r.category,
        r.currentStock,
        r.unit,
        r.minLevel,
        r.maxCapacity,
        r.estDays,
        r.status,
        `"${r.location}"`,
      ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((e) =>
          e.join(',')
        ),
      ].join('\n');

    const encodedUri =
      encodeURI(csvContent);

    const link =
      document.createElement('a');

    link.setAttribute(
      'href',
      encodedUri
    );

    link.setAttribute(
      'download',
      `SACRMS_Manifest_${currentCamp.code}_${new Date()
        .toISOString()
        .split('T')[0]}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    addToast(
      'success',
      'Manifest Exported',
      'Inventory CSV generated successfully.'
    );
  };

  // ============================================================
  // INPUT CLASS
  // ============================================================

  const inputClass =
    'w-full h-10 px-3 border border-white/15 bg-[#0d0d0d] text-white font-mono text-xs uppercase tracking-wider focus:border-white outline-none placeholder:text-white/25';

  const labelClass =
    'block text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.18em] mb-2';

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      ref={menuRef}
      className="space-y-6"
    >
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black font-display text-white uppercase tracking-tight">
            Resource Manifest
          </h1>

          <p className="text-xs font-mono text-white/50 uppercase tracking-[0.2em] mt-1">
            TELEMETRY & INVENTORY AUDIT //{' '}
            {currentCamp.name.toUpperCase()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}

          <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[18px]">
              search
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(
                  e.target.value
                );
                setCurrentPage(1);
              }}
              placeholder="SEARCH SKU / ITEM..."
              className="w-full pl-9 pr-8 h-10 border border-white/15 bg-[#141414] text-white font-mono text-xs uppercase tracking-wider focus:border-white outline-none placeholder:text-white/30"
            />

            {searchTerm && (
              <button
                onClick={() =>
                  setSearchTerm('')
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Category Filter */}

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(
                e.target.value
              );
              setCurrentPage(1);
            }}
            aria-label="Filter by Resource Category"
            className="h-10 border border-white/15 bg-[#141414] text-white font-mono text-xs uppercase tracking-wider px-3 focus:border-white outline-none cursor-pointer"
          >
            <option
              value=""
              className="bg-[#121212]"
            >
              ALL CATEGORIES
            </option>

            <option
              value="water"
              className="bg-[#121212]"
            >
              WATER
            </option>

            <option
              value="food"
              className="bg-[#121212]"
            >
              FOOD
            </option>

            <option
              value="fuel"
              className="bg-[#121212]"
            >
              FUEL
            </option>

            <option
              value="medicine"
              className="bg-[#121212]"
            >
              MEDICINE
            </option>

            <option
              value="supplies"
              className="bg-[#121212]"
            >
              SUPPLIES
            </option>

            <option
              value="ammunition"
              className="bg-[#121212]"
            >
              AMMUNITION
            </option>

            <option
              value="power"
              className="bg-[#121212]"
            >
              POWER
            </option>
          </select>

          {/* Status Filter */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value
              );
              setCurrentPage(1);
            }}
            aria-label="Filter by Supply Status"
            className="h-10 border border-white/15 bg-[#141414] text-white font-mono text-xs uppercase tracking-wider px-3 focus:border-white outline-none cursor-pointer"
          >
            <option
              value=""
              className="bg-[#121212]"
            >
              ALL STATUSES
            </option>

            <option
              value="healthy"
              className="bg-[#121212]"
            >
              OPTIMAL
            </option>

            <option
              value="warning"
              className="bg-[#121212]"
            >
              WARNING
            </option>

            <option
              value="critical"
              className="bg-[#121212]"
            >
              CRITICAL
            </option>
          </select>

          {/* Export */}

          <button
            onClick={exportCSV}
            title="Export CSV"
            className="h-10 px-3 bg-transparent border border-white/20 hover:border-white text-white text-xs font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer hover:bg-white/5"
          >
            <span className="material-symbols-outlined text-[16px]">
              download
            </span>

            <span className="hidden sm:inline">
              CSV
            </span>
          </button>

          {/* Add Resource */}

          <button
            onClick={() =>
              setIsAddResourceModalOpen(
                true
              )
            }
            className="h-10 px-4 bg-white text-black font-bold uppercase tracking-[0.15em] text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span className="material-symbols-outlined text-[16px] text-black">
              add
            </span>

            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* ======================================================
          DATA TABLE
      ======================================================= */}

      <div className="bg-[#121212] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a0a0a] border-b border-white/10">
              <tr>
                <th className="px-6 py-3.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] sticky top-0">
                  Resource Name
                </th>

                <th className="px-6 py-3.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] sticky top-0">
                  Category
                </th>

                <th className="px-6 py-3.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] sticky top-0 w-1/4">
                  Capacity Meter
                </th>

                <th className="px-6 py-3.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] sticky top-0">
                  Min Level
                </th>

                <th className="px-6 py-3.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] sticky top-0">
                  Max Capacity
                </th>

                <th className="px-6 py-3.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] sticky top-0">
                  Runway
                </th>

                <th className="px-6 py-3.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] sticky top-0">
                  Status
                </th>

                <th className="px-6 py-3.5 text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] sticky top-0 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {displayedResources.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-white/40"
                  >
                    <div className="flex flex-col items-center justify-center font-mono">
                      <span className="material-symbols-outlined text-4xl text-white/20 mb-2">
                        inventory_2
                      </span>

                      <p className="font-bold text-white uppercase tracking-wider">
                        No matching inventory
                        records found.
                      </p>

                      <button
                        onClick={() => {
                          setSearchTerm(
                            ''
                          );
                          setCategoryFilter(
                            ''
                          );
                          setStatusFilter(
                            ''
                          );
                          setCurrentPage(1);
                        }}
                        className="mt-3 text-white font-bold uppercase tracking-widest text-xs border border-white/20 px-3 py-1.5 hover:bg-white/10 cursor-pointer"
                      >
                        Reset Filter
                        Parameters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedResources.map(
                  (res) => {
                    const percentage =
                      res.maxCapacity > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (res.currentStock /
                                res.maxCapacity) *
                                100
                            )
                          )
                        : 0;

                    const isMenuOpen =
                      activeMenuId ===
                      res.id;

                    return (
                      <tr
                        key={res.id}
                        className="hover:bg-white/[0.03] transition-colors group h-14"
                      >
                        {/* Resource */}

                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                              <span className="material-symbols-outlined text-[18px]">
                                {res.icon ||
                                  'inventory_2'}
                              </span>
                            </div>

                            <div>
                              <span className="text-xs font-bold text-white uppercase tracking-wide block">
                                {res.name}
                              </span>

                              <span className="text-[10px] text-white/40 font-mono">
                                {res.sku} //{' '}
                                {res.location}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}

                        <td className="px-6 py-3 text-xs font-mono uppercase text-white/60">
                          {res.category}
                        </td>

                        {/* Current Stock */}

                        <td className="px-6 py-3">
                          <div className="flex items-center justify-between mb-1 text-xs font-mono">
                            <span className="text-white font-bold">
                              {res.currentStock.toLocaleString()}{' '}
                              {res.unit}
                            </span>

                            <span className="text-white/40 text-[10px]">
                              {percentage}%
                            </span>
                          </div>

                          <div className="w-full bg-white/10 h-1">
                            <div
                              className={`${getBarColor(
                                res.status
                              )} h-full transition-all duration-500`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </td>

                        {/* Min */}

                        <td className="px-6 py-3 text-xs text-white/50 font-mono">
                          {res.minLevel.toLocaleString()}{' '}
                          {res.unit}
                        </td>

                        {/* Max */}

                        <td className="px-6 py-3 text-xs text-white/50 font-mono">
                          {res.maxCapacity.toLocaleString()}{' '}
                          {res.unit}
                        </td>

                        {/* Runway */}

                        <td className="px-6 py-3 text-xs font-mono font-bold">
                          <span
                            className={
                              res.estDays < 3
                                ? 'text-alert-critical font-black'
                                : 'text-white'
                            }
                          >
                            {res.estDays}{' '}
                            DAYS
                          </span>
                        </td>

                        {/* Status */}

                        <td className="px-6 py-3">
                          {getStatusBadge(
                            res.status
                          )}
                        </td>

                        {/* Actions */}

                        <td className="px-6 py-3 text-right relative">
                          <div className="inline-block text-left relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                setActiveMenuId(
                                  isMenuOpen
                                    ? null
                                    : res.id
                                );
                              }}
                              className="text-white/40 hover:text-white p-1 border border-transparent hover:border-white/20 transition-colors cursor-pointer"
                              title="Resource Actions"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                more_vert
                              </span>
                            </button>

                            {isMenuOpen && (
                              <div
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                                className="absolute right-0 top-full mt-1 w-44 bg-[#111111] border border-white/20 py-1 z-40 text-left shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                              >
                                {/* EDIT */}

                                <button
                                  onClick={() =>
                                    openEditResource(
                                      res
                                    )
                                  }
                                  className="w-full px-3 py-2 text-xs font-mono uppercase text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    edit
                                  </span>

                                  <span>
                                    Edit Resource
                                  </span>
                                </button>

                                {/* DELETE */}

                                <button
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        `Archive ${res.name}?`
                                      )
                                    ) {
                                      await deleteResource(
                                        res.id
                                      );

                                      setActiveMenuId(
                                        null
                                      );
                                    }
                                  }}
                                  className="w-full px-3 py-2 text-xs font-mono uppercase text-alert-critical hover:bg-alert-critical/10 flex items-center gap-2 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    delete
                                  </span>

                                  <span>
                                    Delete Record
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}

        <div className="bg-[#0a0a0a] border-t border-white/10 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
            Showing{' '}
            {filteredResources.length >
            0
              ? (currentPage - 1) *
                  itemsPerPage +
                1
              : 0}{' '}
            to{' '}
            {Math.min(
              currentPage *
                itemsPerPage,
              filteredResources.length
            )}{' '}
            of{' '}
            {filteredResources.length}{' '}
            records
          </span>

          <div className="flex items-center gap-1 font-mono">
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.max(1, p - 1)
                )
              }
              disabled={
                currentPage === 1
              }
              className="px-2.5 py-1 border border-white/15 text-xs uppercase text-white/60 hover:text-white hover:border-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              Prev
            </button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, i) => i + 1
            ).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() =>
                  setCurrentPage(
                    pageNum
                  )
                }
                className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  currentPage ===
                  pageNum
                    ? 'bg-white text-black'
                    : 'border border-white/15 text-white/60 hover:text-white'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(
                    totalPages,
                    p + 1
                  )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              className="px-2.5 py-1 border border-white/15 text-xs uppercase text-white/60 hover:text-white hover:border-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          EDIT RESOURCE MODAL
      ========================================================= */}

      {editingResource && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
          onMouseDown={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setEditingResource(null);
            }
          }}
        >
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111111] border border-white/20 shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0a0a0a]">
              <div>
                <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em]">
                  INVENTORY CONTROL // EDIT
                </p>

                <h2 className="text-xl font-black font-display text-white uppercase tracking-tight mt-1">
                  Edit Resource
                </h2>

                <p className="text-[10px] font-mono text-white/40 uppercase mt-1">
                  {editingResource.sku} //{' '}
                  {currentCamp.name}
                </p>
              </div>

              <button
                onClick={() =>
                  setEditingResource(
                    null
                  )
                }
                className="w-8 h-8 border border-white/15 text-white/50 hover:text-white hover:border-white/40 flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>

            {/* Modal Body */}

            <div className="p-6 space-y-6">
              {/* Identity */}

              <div>
                <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-3">
                  Resource Identity
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Resource Name
                    </label>

                    <input
                      value={
                        editForm.name
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'name',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="RESOURCE NAME"
                    />
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      SKU
                    </label>

                    <input
                      value={
                        editForm.sku
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'sku',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="RESOURCE SKU"
                    />
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Category
                    </label>

                    <select
                      value={
                        editForm.category
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'category',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="">
                        SELECT CATEGORY
                      </option>

                      <option value="Water">
                        WATER
                      </option>

                      <option value="Food">
                        FOOD
                      </option>

                      <option value="Fuel">
                        FUEL
                      </option>

                      <option value="Medicine">
                        MEDICINE
                      </option>

                      <option value="Supplies">
                        SUPPLIES
                      </option>

                      <option value="Ammunition">
                        AMMUNITION
                      </option>

                      <option value="Power">
                        POWER
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Unit
                    </label>

                    <input
                      value={
                        editForm.unit
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'unit',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="L / KG / UNITS / ROUNDS"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}

              <div>
                <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-3">
                  Inventory Parameters
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Current Stock */}

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Current Stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        editForm.currentStock
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'currentStock',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>

                  {/* Minimum Level */}

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Minimum Level
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        editForm.minLevel
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'minLevel',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>

                  {/* Maximum Capacity */}

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Maximum Capacity
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        editForm.maxCapacity
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'maxCapacity',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>

                  {/* Burn Rate */}

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Burn Rate / Person / Day
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        editForm.burnRatePerPersonPerDay
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'burnRatePerPersonPerDay',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </div>

                  {/* Location */}

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Location
                    </label>

                    <input
                      value={
                        editForm.location
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'location',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="STORAGE BAY"
                    />
                  </div>

                  {/* Icon */}

                  <div>
                    <label
                      className={
                        labelClass
                      }
                    >
                      Icon
                    </label>

                    <input
                      value={
                        editForm.icon
                      }
                      onChange={(e) =>
                        handleEditChange(
                          'icon',
                          e.target.value
                        )
                      }
                      className={
                        inputClass
                      }
                      placeholder="inventory_2"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity preview */}

              <div className="border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.18em]">
                    Capacity Preview
                  </span>

                  <span className="text-xs font-mono font-bold text-white">
                    {Number(
                      editForm.maxCapacity
                    ) > 0
                      ? Math.min(
                          100,
                          Math.round(
                            (Number(
                              editForm.currentStock
                            ) /
                              Number(
                                editForm.maxCapacity
                              )) *
                              100
                          )
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="w-full h-2 bg-white/10">
                  <div
                    className="h-full bg-white transition-all"
                    style={{
                      width: `${
                        Number(
                          editForm.maxCapacity
                        ) > 0
                          ? Math.min(
                              100,
                              Math.max(
                                0,
                                Math.round(
                                  (Number(
                                    editForm.currentStock
                                  ) /
                                    Number(
                                      editForm.maxCapacity
                                    )) *
                                    100
                                )
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}

            <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0a0a0a]">
              <button
                onClick={() =>
                  setEditingResource(
                    null
                  )
                }
                className="h-10 px-5 border border-white/20 text-white/60 hover:text-white hover:border-white font-mono text-xs font-bold uppercase tracking-widest cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleSaveResource
                }
                className="h-10 px-6 bg-white text-black hover:bg-neutral-200 font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  save
                </span>

                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};