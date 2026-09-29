import React from 'react';
import { FilterState } from '../../types/hospital';
import { Search, RotateCcw, Filter, Calendar } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalAllCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount,
  totalAllCount,
}) => {
  const departments = [
    'All Departments',
    'General Medicine',
    'Cardiology',
    'Orthopedics',
    'Pediatrics',
    'Laboratory',
    'Radiology',
  ];

  const workflowTypes = [
    { label: 'All Workflows', value: 'all' },
    { label: 'Outpatient (OPD)', value: 'OPD' },
    { label: 'Laboratory', value: 'Laboratory' },
    { label: 'Admission', value: 'Admission' },
    { label: 'Discharge', value: 'Discharge' },
  ];

  const statuses = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Completed', value: 'Completed' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Delayed (>Benchmark)', value: 'Delayed' },
  ];

  const stages = [
    { label: 'All Stages', value: 'all' },
    { label: 'Registration & Desk Check-in', value: 'Registration & Desk Check-in' },
    { label: 'Doctor Consultation', value: 'Doctor Consultation' },
    { label: 'Sample Collection', value: 'Sample Collection' },
    { label: 'Laboratory Testing', value: 'Laboratory Testing' },
    { label: 'Report Preparation', value: 'Report Preparation' },
    { label: 'Billing & Insurance Clearance', value: 'Billing & Insurance Clearance' },
    { label: 'Pharmacy Dispensation', value: 'Pharmacy Dispensation' },
    { label: 'Bed Assignment & Prep', value: 'Bed Assignment & Prep' },
    { label: 'Clinical Clearance', value: 'Clinical Clearance' },
  ];

  const isFiltered =
    filters.dateRange !== 'all' ||
    filters.department !== 'all' ||
    filters.workflowType !== 'all' ||
    filters.stage !== 'all' ||
    filters.status !== 'all' ||
    Boolean(filters.searchQuery.trim());

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Quick search and selects */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Patient ID / Name..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value as any })}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Dates (14 Days)</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last14days">Last 14 Days</option>
            </select>
          </div>

          {/* Department selector */}
          <select
            value={filters.department}
            onChange={(e) => onFilterChange({ department: e.target.value })}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept === 'All Departments' ? 'all' : dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Workflow selector */}
          <select
            value={filters.workflowType}
            onChange={(e) => onFilterChange({ workflowType: e.target.value })}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {workflowTypes.map((wf) => (
              <option key={wf.value} value={wf.value}>
                {wf.label}
              </option>
            ))}
          </select>

          {/* Stage selector */}
          <select
            value={filters.stage}
            onChange={(e) => onFilterChange({ stage: e.target.value })}
            className="hidden sm:inline-block px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {stages.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="hidden md:inline-block px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Record count and Reset */}
        <div className="flex items-center gap-3 justify-between lg:justify-end text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Showing <strong className="font-mono text-slate-800">{totalFilteredCount}</strong> of{' '}
              <span className="font-mono text-slate-600">{totalAllCount}</span> patient visits
            </span>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
