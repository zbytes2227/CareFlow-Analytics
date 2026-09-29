import React, { useState } from 'react';
import { Patient, StagePerformance, WorkflowType } from '../../types/hospital';
import { computeStagePerformances } from '../../utils/calculations';
import { ArrowRight, Clock, Users, ShieldAlert, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

interface WorkflowVisualizerProps {
  patients: Patient[];
}

export const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ patients }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('OPD');
  const [selectedStageName, setSelectedStageName] = useState<string | null>(null);

  // Compute live stage metrics from currently filtered patients
  const allStages = React.useMemo(() => computeStagePerformances(patients), [patients]);

  const activeWorkflowStages = React.useMemo(() => {
    return allStages.filter((s) => s.workflowType === selectedWorkflow);
  }, [allStages, selectedWorkflow]);

  // Selected stage details
  const activeStageDetail = React.useMemo(() => {
    if (!selectedStageName) return activeWorkflowStages[0] || null;
    return activeWorkflowStages.find((s) => s.stage === selectedStageName) || activeWorkflowStages[0] || null;
  }, [activeWorkflowStages, selectedStageName]);

  const workflows: { id: WorkflowType; label: string; description: string }[] = [
    {
      id: 'OPD',
      label: 'Outpatient (OPD) Flow',
      description: 'End-to-end outpatient journey from desk registration through doctor consultation, tests, and dispensation.',
    },
    {
      id: 'Laboratory',
      label: 'Laboratory Diagnostics',
      description: 'Specimen intake, pre-analytical phlebotomy, auto-analyzer runs, and pathologist review.',
    },
    {
      id: 'Admission',
      label: 'Inpatient Admission',
      description: 'Emergency/elective intake, bed coordination, inpatient prep, and clinical clearance.',
    },
    {
      id: 'Discharge',
      label: 'Discharge Clearance',
      description: 'Doctor sign-off, billing/insurance reconciliation, take-home medication, and release.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Workflow Selector Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Hospital Process Flow Diagram</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live sequential flow nodes with calculated wait times and delay classification
            </p>
          </div>

          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => {
                  setSelectedWorkflow(wf.id);
                  setSelectedStageName(null);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  selectedWorkflow === wf.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {wf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span className="font-medium text-slate-700">Calculated Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal (&le; Benchmark)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Moderate Delay (1.2x–1.6x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>High Delay (&ge;1.6x or P90 Spike)</span>
          </div>
        </div>
      </div>

      {/* Process Flow Interactive Canvas */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 overflow-x-auto">
        <div className="min-w-[840px]">
          <div className="flex items-center justify-between relative py-4">
            {activeWorkflowStages.map((stage, index) => {
              const isSelected = activeStageDetail?.stage === stage.stage;
              const isLast = index === activeWorkflowStages.length - 1;

              const borderStyle =
                stage.severity === 'high'
                  ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-100'
                  : stage.severity === 'moderate'
                  ? 'border-amber-400 bg-amber-50/40'
                  : 'border-slate-200 bg-white hover:border-blue-300';

              const indicatorColor =
                stage.severity === 'high'
                  ? 'bg-rose-500'
                  : stage.severity === 'moderate'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500';

              return (
                <React.Fragment key={stage.stage}>
                  {/* Stage Node Box */}
                  <div
                    onClick={() => setSelectedStageName(stage.stage)}
                    className={`flex-1 max-w-[210px] min-w-[170px] rounded-lg border p-3.5 cursor-pointer transition-all duration-150 relative ${borderStyle} ${
                      isSelected ? 'ring-2 ring-blue-600 shadow-md' : 'shadow-xs hover:shadow-sm'
                    }`}
                  >
                    {/* Top status indicator & order */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        Stage 0{index + 1}
                      </span>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className={`w-2 h-2 rounded-full ${indicatorColor}`} />
                        <span className="capitalize font-medium text-slate-600">
                          {stage.severity}
                        </span>
                      </div>
                    </div>

                    {/* Stage Name */}
                    <h4 className="text-xs font-semibold text-slate-900 mb-3 h-8 line-clamp-2">
                      {stage.stage}
                    </h4>

                    {/* Stage Metrics */}
                    <div className="space-y-1.5 text-[11px] border-t border-slate-100 pt-2">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Patients:</span>
                        <strong className="font-mono text-slate-800">{stage.patientCount}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Avg Wait:</span>
                        <strong
                          className={`font-mono ${
                            stage.severity === 'high'
                              ? 'text-rose-600 font-bold'
                              : stage.severity === 'moderate'
                              ? 'text-amber-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {stage.avgWaitingTime} min
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Service:</span>
                        <strong className="font-mono text-slate-800">{stage.avgProcessingTime} min</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Total:</span>
                        <strong className="font-mono text-slate-900">{stage.avgStageDuration} min</strong>
                      </div>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  {!isLast && (
                    <div className="px-2 text-slate-400 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage Detail Inspector Panel */}
      {activeStageDetail && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {activeStageDetail.stage}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    activeStageDetail.severity === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : activeStageDetail.severity === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeStageDetail.severity.toUpperCase()} DELAY
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Detailed stage analytics calculated from {activeStageDetail.patientCount} patient visits
              </p>
            </div>

            <div className="text-xs text-slate-500">
              Target Operational Benchmark:{' '}
              <strong className="font-mono text-slate-800">
                {activeStageDetail.benchmarkWaitTime} min
              </strong>
            </div>
          </div>

          {/* Metric cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Average Queue Wait</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {activeStageDetail.avgWaitingTime}{' '}
                <span className="text-xs font-normal text-slate-500">min</span>
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Median:{' '}
                <strong className="font-mono">{activeStageDetail.medianWaitingTime}m</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">90th Percentile (P90)</span>
              <span className="text-xl font-bold font-mono text-rose-600">
                {activeStageDetail.p90WaitingTime}{' '}
                <span className="text-xs font-normal text-slate-500">min</span>
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                90% of patients waited &le; this time
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Mean Service Time</span>
              <span className="text-xl font-bold font-mono text-blue-600">
                {activeStageDetail.avgProcessingTime}{' '}
                <span className="text-xs font-normal text-slate-500">min</span>
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Total stage mean:{' '}
                <strong className="font-mono">{activeStageDetail.avgStageDuration}m</strong>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 block">Delayed Encounters</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {activeStageDetail.delayRate}%
              </span>
              <div className="text-[11px] text-slate-500 mt-1">
                Exceeded {activeStageDetail.benchmarkWaitTime}m benchmark
              </div>
            </div>
          </div>

          {/* Operational Insights */}
          <div className="mt-4 p-3.5 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-slate-700 space-y-1">
            <div className="font-semibold text-blue-900 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Operational Analysis for {activeStageDetail.stage}</span>
            </div>
            <p className="leading-relaxed">
              Queue waiting time constitutes approximately{' '}
              <strong className="font-mono">
                {Math.round(
                  (activeStageDetail.avgWaitingTime / (activeStageDetail.avgStageDuration || 1)) * 100
                )}
                %
              </strong>{' '}
              of total stage elapsed time. Patients experience an estimated service utilization rate of{' '}
              <strong className="font-mono">{activeStageDetail.resourceUtilization}%</strong>.
              {activeStageDetail.severity === 'high' && (
                <span className="text-rose-700 block mt-1 font-medium">
                  Recommendation: Consider adjusting counter allocations or testing the &quot;Scenario Lab&quot; to
                  model capacity expansion for this stage.
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
