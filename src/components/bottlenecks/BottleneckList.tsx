import React, { useState } from 'react';
import { Patient, BottleneckInsight } from '../../types/hospital';
import { detectBottlenecks } from '../../utils/calculations';
import { BottleneckFormulaCard } from './BottleneckFormulaCard';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ArrowRight, Lightbulb, Activity, CheckCircle2 } from 'lucide-react';

interface BottleneckListProps {
  patients: Patient[];
  onNavigateToScenarios: () => void;
}

export const BottleneckList: React.FC<BottleneckListProps> = ({ patients, onNavigateToScenarios }) => {
  const [filterSeverity, setFilterSeverity] = useState<'All' | 'Critical' | 'High' | 'Moderate' | 'Nominal'>('All');

  // Compute live bottlenecks using documented statistical formula
  const bottlenecks = React.useMemo(() => detectBottlenecks(patients), [patients]);

  const filteredBottlenecks = React.useMemo(() => {
    if (filterSeverity === 'All') return bottlenecks;
    return bottlenecks.filter((b) => b.severity === filterSeverity);
  }, [bottlenecks, filterSeverity]);

  return (
    <div className="space-y-6">
      {/* Header card with summary stats */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Automated Bottleneck Detection &amp; Severity Scoring
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified process chokepoints derived from waiting time percentiles and throughput load
            </p>
          </div>

          {/* Severity filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['All', 'Critical', 'High', 'Moderate', 'Nominal'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterSeverity === sev
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Quick KPI count strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100">
            <span className="text-[11px] text-rose-700 block font-medium">Critical Bottlenecks</span>
            <span className="text-lg font-bold font-mono text-rose-800">
              {bottlenecks.filter((b) => b.severity === 'Critical').length}
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
            <span className="text-[11px] text-amber-700 block font-medium">High Delays</span>
            <span className="text-lg font-bold font-mono text-amber-800">
              {bottlenecks.filter((b) => b.severity === 'High').length}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-[11px] text-blue-700 block font-medium">Moderate Delays</span>
            <span className="text-lg font-bold font-mono text-blue-800">
              {bottlenecks.filter((b) => b.severity === 'Moderate').length}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="text-[11px] text-emerald-700 block font-medium">Nominal Stages</span>
            <span className="text-lg font-bold font-mono text-emerald-800">
              {bottlenecks.filter((b) => b.severity === 'Nominal').length}
            </span>
          </div>
        </div>
      </div>

      {/* Bottlenecks List */}
      <div className="space-y-4">
        {filteredBottlenecks.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No stages found in this severity category.
          </div>
        ) : (
          filteredBottlenecks.map((b) => {
            const isCritical = b.severity === 'Critical';
            const isHigh = b.severity === 'High';
            const isModerate = b.severity === 'Moderate';

            const badgeBg = isCritical
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : isHigh
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : isModerate
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200';

            const cardBorder = isCritical
              ? 'border-rose-300 ring-1 ring-rose-100'
              : isHigh
              ? 'border-amber-300'
              : 'border-slate-200';

            return (
              <div
                key={b.id}
                className={`bg-white rounded-lg border p-5 transition-shadow hover:shadow-sm ${cardBorder}`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900">{b.stage}</h4>
                    <span className="text-xs text-slate-400 font-mono">({b.workflowType})</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${badgeBg}`}>
                      {b.severity} Severity
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <span>Trend:</span>
                      {b.trend === 'worsening' && (
                        <span className="text-rose-600 flex items-center font-medium">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Worsening
                        </span>
                      )}
                      {b.trend === 'stable' && (
                        <span className="text-amber-600 flex items-center font-medium">
                          <Minus className="w-3.5 h-3.5 mr-0.5" /> Stable
                        </span>
                      )}
                      {b.trend === 'improving' && (
                        <span className="text-emerald-600 flex items-center font-medium">
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> Improving
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded font-mono font-semibold text-xs">
                      Score: {b.bottleneckScore}/100
                    </div>
                  </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded border border-slate-100 mb-3">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mean Wait Time</span>
                    <strong className="font-mono text-slate-900 text-sm">{b.avgWaitingTime} min</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">90th Percentile (P90)</span>
                    <strong className="font-mono text-rose-600 text-sm">{b.p90WaitingTime} min</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mean Service Duration</span>
                    <strong className="font-mono text-blue-700 text-sm">{b.avgProcessingTime} min</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Patient Encounters</span>
                    <strong className="font-mono text-slate-900 text-sm">{b.patientVolume}</strong>
                  </div>
                </div>

                {/* Grounded Explanation */}
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="leading-relaxed bg-slate-50/50 p-2.5 rounded border border-slate-100">
                    <strong className="text-slate-900">Analysis: </strong>
                    {b.reasonForFlagging}
                  </p>

                  <div className="p-2.5 bg-amber-50/60 rounded border border-amber-100 text-amber-900">
                    <strong className="font-semibold block mb-0.5">Observed Pattern:</strong>
                    <span>{b.possibleOperationalFactor}</span>
                  </div>

                  <div className="p-2.5 bg-blue-50/60 rounded border border-blue-100 text-blue-900 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-0.5">Recommended Operational Intervention:</strong>
                      <span>{b.recommendedIntervention}</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                {(isCritical || isHigh) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={onNavigateToScenarios}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                      <span>Simulate capacity expansion in Scenario Lab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Methodology and formula explanation card */}
      <BottleneckFormulaCard />
    </div>
  );
};
