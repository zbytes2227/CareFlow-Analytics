import React from 'react';
import { HelpCircle, Calculator, ShieldCheck } from 'lucide-react';

export const BottleneckFormulaCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Calculator className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">
          Statistical Bottleneck Detection Methodology
        </h3>
      </div>

      <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
        <p>
          In healthcare operations research, transparent mathematical formulas are essential so clinical
          directors understand <em>why</em> an operational stage was flagged. Rather than using an uninterpretable
          black-box model, this system computes a normalized <strong>Bottleneck Index ($S \in [0, 100]$)</strong> from
          empirical patient timestamps:
        </p>

        {/* Formula Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-[11px] text-slate-800 space-y-1">
          <div className="font-semibold text-blue-900">
            Bottleneck Score = (0.40 &times; W_norm) + (0.25 &times; P90_norm) + (0.20 &times; Vol_stress) + (0.15 &times; Delay_rate)
          </div>
          <div className="text-slate-500 text-[10px] pt-1">
            Where W_norm = Wait / (2 &times; Benchmark), P90_norm = 90th percentile wait / (2.5 &times; Benchmark),
            Vol_stress = Stage Volume / Max Volume, Delay_rate = % patients waiting &gt; Benchmark.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="font-semibold text-slate-900 block mb-0.5">Threshold Classifications</span>
            <ul className="space-y-1 text-slate-600">
              <li>&bull; <strong className="text-rose-600">Critical (Score &ge; 70)</strong>: Severe bottleneck causing downstream starvation.</li>
              <li>&bull; <strong className="text-amber-600">High (Score 50–69)</strong>: Prolonged queues during peak hours.</li>
              <li>&bull; <strong className="text-blue-600">Moderate (Score 35–49)</strong>: Occasional accumulation near benchmark.</li>
              <li>&bull; <strong className="text-emerald-600">Nominal (Score &lt; 35)</strong>: Flow within standard operational variance.</li>
            </ul>
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
            <span className="font-semibold text-slate-900 block mb-0.5">Clinical Governance Rigor</span>
            <p className="text-slate-600">
              In accordance with operational guidelines, all findings are labeled as{' '}
              <em>&quot;Possible operational factors&quot;</em>. The system avoids unsupported causal assertions and
              strictly refrains from medical diagnostic or clinical triage predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
