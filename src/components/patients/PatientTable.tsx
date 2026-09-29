import React, { useState } from 'react';
import { Patient } from '../../types/hospital';
import { ChevronLeft, ChevronRight, ArrowUpDown, Clock, ExternalLink } from 'lucide-react';

interface PatientTableProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

type SortField = 'patientId' | 'arrival' | 'waiting' | 'processing' | 'duration' | 'department';

export const PatientTable: React.FC<PatientTableProps> = ({ patients, onSelectPatient }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<SortField>('arrival');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedPatients = React.useMemo(() => {
    return [...patients].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'patientId') {
        comparison = a.patientId.localeCompare(b.patientId);
      } else if (sortField === 'arrival') {
        comparison = new Date(a.firstArrivalTime).getTime() - new Date(b.firstArrivalTime).getTime();
      } else if (sortField === 'waiting') {
        comparison = a.totalWaitingTime - b.totalWaitingTime;
      } else if (sortField === 'processing') {
        comparison = a.totalProcessingTime - b.totalProcessingTime;
      } else if (sortField === 'duration') {
        comparison = a.totalDuration - b.totalDuration;
      } else if (sortField === 'department') {
        comparison = a.department.localeCompare(b.department);
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [patients, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedPatients.length / pageSize) || 1;
  const paginatedPatients = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPatients.slice(start, start + pageSize);
  }, [sortedPatients, currentPage, pageSize]);

  const formatArrival = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Header controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Patient Journey Explorer</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual encounter flow records with programmatic queue and service intervals
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-mono"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* High-density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border-collapse">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
            <tr>
              <th
                onClick={() => handleSort('patientId')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Patient ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('department')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Department</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 whitespace-nowrap">Workflow</th>
              <th
                onClick={() => handleSort('arrival')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Arrival Time</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 whitespace-nowrap">Current / Final Stage</th>
              <th
                onClick={() => handleSort('waiting')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Wait</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('processing')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Service Time</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('duration')}
                className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Duration</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 whitespace-nowrap">Status</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Timeline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  No patient flow records found matching active filters.
                </td>
              </tr>
            ) : (
              paginatedPatients.map((p) => {
                const isDelayed = p.totalWaitingTime > 40;
                return (
                  <tr
                    key={p.patientId}
                    onClick={() => onSelectPatient(p)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-600 font-semibold">{p.patientId}</span>
                        <span className="text-slate-400 text-[11px] truncate max-w-[120px]">
                          ({p.anonymizedName.split(' ')[0]})
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {p.department}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {p.workflowType}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatArrival(p.firstArrivalTime)}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 max-w-[200px] truncate">
                      {p.currentStage}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className={isDelayed ? 'text-rose-600 font-semibold' : 'text-slate-800'}>
                        {p.totalWaitingTime} min
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                      {p.totalProcessingTime} min
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                      {p.totalDuration} min
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block text-[11px] font-medium ${
                          p.status === 'Completed'
                            ? 'text-emerald-700'
                            : p.status === 'In Progress'
                            ? 'text-blue-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPatient(p);
                        }}
                        className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden group-hover:inline text-[11px] font-medium">View</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
        <div>
          Showing{' '}
          <strong className="font-mono text-slate-800">
            {sortedPatients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{' '}
          to{' '}
          <strong className="font-mono text-slate-800">
            {Math.min(currentPage * pageSize, sortedPatients.length)}
          </strong>{' '}
          of <strong className="font-mono text-slate-800">{sortedPatients.length}</strong> records
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
