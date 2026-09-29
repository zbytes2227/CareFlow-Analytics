import React, { useState } from 'react';
import { Patient, ScenarioSimulationResult } from '../../types/hospital';
import { simulateScenario } from '../../utils/calculations';
import { QueuingTheoryCard } from './QueuingTheoryCard';
import { 
  FlaskConical, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  Play, 
  Sliders, 
  Check, 
  Sparkles,
  Layers,
  Clock,
  Users
} from 'lucide-react';

interface ScenarioSimulatorProps {
  patients: Patient[];
}

type ScenarioPreset = 'counters' | 'lab_capacity' | 'billing_speed' | 'peak_redistribution' | 'custom';

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ patients }) => {
  const [selectedPreset, setSelectedPreset] = useState<ScenarioPreset>('counters');

  // Custom scenario state
  const [customStage, setCustomStage] = useState('Registration & Desk Check-in');
  const [customCapacity, setCustomCapacity] = useState(30);
  const [customSpeed, setCustomSpeed] = useState(20);

  // Compute live simulation result
  const simulation: ScenarioSimulationResult = React.useMemo(() => {
    return simulateScenario(selectedPreset, patients, {
      stageName: customStage,
      capacityIncreasePercent: customCapacity,
      speedupPercent: customSpeed,
    });
  }, [selectedPreset, patients, customStage, customCapacity, customSpeed]);

  const presetOptions = [
    {
      id: 'counters' as const,
      title: 'Scenario 1: Increase Registration Counters',
      badge: '2 → 3 Desks (+50%)',
      summary: 'Expands front-desk reception service capacity during high-volume morning triage window.',
    },
    {
      id: 'lab_capacity' as const,
      title: 'Scenario 2: Increase Laboratory Capacity by 20%',
      badge: '+20% Testing Throughput',
      summary: 'Automates analyzer batching and expands phlebotomy bays to reduce testing turnaround times.',
    },
    {
      id: 'billing_speed' as const,
      title: 'Scenario 3: Accelerate Billing Clearance by 15%',
      badge: '-15% Service Time',
      summary: 'Deploys digital insurer pre-adjudication and express payment kiosks.',
    },
    {
      id: 'peak_redistribution' as const,
      title: 'Scenario 4: Peak-Hour Surge Smoothing',
      badge: 'Level 25% Morning Peak',
      summary: 'Incentivizes staggered appointment booking to eliminate the 08:30–11:00 AM queue crest.',
    },
    {
      id: 'custom' as const,
      title: 'Custom Scenario Builder',
      badge: 'Parametric Simulation',
      summary: 'Manually configure capacity expansion and processing speedup for any hospital stage.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and selector grid */}
      <div className="bg-white rounded-lg border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            What-If Scenario Simulation Laboratory
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Simulate operational interventions before committing physical clinical staff or counter resources.
          Calculates expected waiting time reduction and throughput gains using calibrated queuing theory.
        </p>

        {/* Preset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presetOptions.map((opt) => {
            const isSelected = selectedPreset === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedPreset(opt.id)}
                className={`text-left p-3.5 rounded-lg border transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                      {opt.badge}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{opt.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{opt.summary}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Scenario Builder Controls (if custom selected) */}
      {selectedPreset === 'custom' && (
        <div className="bg-white rounded-lg border border-blue-200 p-5 space-y-4 bg-blue-50/20">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-900">Configure Custom Scenario Parameters</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Workflow Stage
              </label>
              <select
                value={customStage}
                onChange={(e) => setCustomStage(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Registration & Desk Check-in">Registration &amp; Desk Check-in</option>
                <option value="Doctor Consultation">Doctor Consultation</option>
                <option value="Sample Collection">Sample Collection</option>
                <option value="Laboratory Testing">Laboratory Testing</option>
                <option value="Billing & Insurance Clearance">Billing &amp; Insurance Clearance</option>
                <option value="Pharmacy Dispensation">Pharmacy Dispensation</option>
                <option value="Bed Assignment & Prep">Bed Assignment &amp; Prep</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Capacity Expansion (+{customCapacity}%)</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={customCapacity}
                onChange={(e) => setCustomCapacity(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">e.g. adding desks, booths, or parallel servers</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Service Acceleration (+{customSpeed}%)</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={customSpeed}
                onChange={(e) => setCustomSpeed(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">e.g. digital automation, barcode scanning, express routing</span>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Results Display: Current vs Simulated */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-blue-600 font-semibold block mb-0.5">
              Simulation Evaluation
            </span>
            <h3 className="text-base font-bold text-slate-900">{simulation.scenarioName}</h3>
            <p className="text-xs text-slate-500 mt-1">{simulation.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-mono text-xs font-bold">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              {simulation.deltaWaitPercentage}% Avg Wait Reduction
            </span>
          </div>
        </div>

        {/* Comparative KPI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Average Waiting Time */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-2">Hospital-wide Avg Wait</span>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs text-slate-400 block">Baseline</span>
                <span className="text-lg font-bold font-mono text-slate-500 line-through">
                  {simulation.baseline.avgWaitingTime}m
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-emerald-700 font-medium block">Simulated</span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {simulation.simulated.avgWaitingTime}m
                </span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-slate-200 flex items-center justify-between">
              <span>Expected savings:</span>
              <strong className="font-mono">
                {Math.round((simulation.baseline.avgWaitingTime - simulation.simulated.avgWaitingTime) * 10) / 10} min/patient
              </strong>
            </div>
          </div>

          {/* Card 2: Average Journey Duration */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-2">Avg Patient Journey</span>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs text-slate-400 block">Baseline</span>
                <span className="text-lg font-bold font-mono text-slate-500 line-through">
                  {simulation.baseline.avgJourneyDuration}m
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-emerald-700 font-medium block">Simulated</span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {simulation.simulated.avgJourneyDuration}m
                </span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-slate-200 flex items-center justify-between">
              <span>Duration delta:</span>
              <strong className="font-mono">{simulation.deltaDurationMinutes} min</strong>
            </div>
          </div>

          {/* Card 3: Target Stage Wait Time */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-2">Intervention Stage Wait</span>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs text-slate-400 block">Current</span>
                <span className="text-lg font-bold font-mono text-slate-500 line-through">
                  {simulation.baseline.stageWaitTime}m
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-emerald-700 font-medium block">Simulated</span>
                <span className="text-xl font-bold font-mono text-emerald-700">
                  {simulation.simulated.stageWaitTime}m
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-200 flex items-center justify-between">
              <span>Estimated queue drop:</span>
              <strong className="font-mono text-emerald-700">-{simulation.estimatedQueueReduction}%</strong>
            </div>
          </div>

          {/* Card 4: Hourly Throughput */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-2">Throughput Capacity</span>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <span className="text-xs text-slate-400 block">Current</span>
                <span className="text-lg font-bold font-mono text-slate-500">
                  {simulation.baseline.throughputPerHour}/hr
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-xs text-blue-700 font-medium block">Simulated</span>
                <span className="text-xl font-bold font-mono text-blue-700">
                  {simulation.simulated.throughputPerHour}/hr
                </span>
              </div>
            </div>
            <div className="text-[11px] text-blue-700 font-medium pt-2 border-t border-slate-200 flex items-center justify-between">
              <span>Peak queue size:</span>
              <strong className="font-mono">
                {simulation.simulated.peakQueueSize} (was {simulation.baseline.peakQueueSize})
              </strong>
            </div>
          </div>
        </div>

        {/* Visual Before vs After comparison bar */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <h4 className="text-xs font-semibold text-slate-900">
            Visual Comparison: Stage Waiting Time Impact
          </h4>

          {/* Baseline bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Baseline Observed Wait:</span>
              <span className="font-mono font-bold">{simulation.baseline.stageWaitTime} min</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Simulated bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Simulated Operational Wait:</span>
              <span className="font-mono font-bold text-emerald-700">
                {simulation.simulated.stageWaitTime} min ({Math.round((simulation.simulated.stageWaitTime / (simulation.baseline.stageWaitTime || 1)) * 100)}% of baseline)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(10, Math.round((simulation.simulated.stageWaitTime / (simulation.baseline.stageWaitTime || 1)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Transparent Mathematical Assumptions */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-900 block">
            Transparent Mathematical Assumptions &amp; Invariants:
          </span>
          <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
            {simulation.assumptions.map((assump, i) => (
              <li key={i}>{assump}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Queuing Theory Educational Panel */}
      <QueuingTheoryCard />
    </div>
  );
};
