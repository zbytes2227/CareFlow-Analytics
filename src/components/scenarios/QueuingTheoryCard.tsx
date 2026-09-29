import React from 'react';
import { BookOpen, Scale, AlertCircle } from 'lucide-react';

export const QueuingTheoryCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Scale className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">
          Mathematical Formulation: M/M/c Queuing &amp; Discrete Event Modeling
        </h3>
      </div>

      <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
        <p>
          Hospital patient flow simulations in this laboratory are grounded in classical operations research
          and Kendall's <strong>$M/M/c$ multi-server queuing theory</strong>, coupled with empirical timestamp
          adjustment models.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 font-mono text-[11px]">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-blue-900 block mb-1">Little&apos;s Law</span>
            <div className="text-slate-800 text-xs">L = &lambda; &times; W</div>
            <div className="text-[10px] text-slate-500 mt-1">
              Average queue inventory ($L$) equals mean arrival rate (&lambda;) multiplied by average time in system ($W$).
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-blue-900 block mb-1">Traffic Intensity (&rho;)</span>
            <div className="text-slate-800 text-xs">&rho; = &lambda; / (c &times; &mu;)</div>
            <div className="text-[10px] text-slate-500 mt-1">
              Where $c$ is active parallel service desks, and &mu; is the mean service rate per counter.
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="font-bold text-blue-900 block mb-1">Expected Wait ($W_q$)</span>
            <div className="text-slate-800 text-xs">W_q = C(c, &rho;) / (c&mu; - &lambda;)</div>
            <div className="text-[10px] text-slate-500 mt-1">
              Erlang C probability of queuing determines non-linear delay reduction when capacity is expanded.
            </div>
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md text-amber-900 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold block">Academic &amp; Operational Disclaimer:</strong>
            Scenario results are estimates based on deterministic queuing models ($M/M/c$ service rate adjustments)
            and historical arrival distributions. Real-world hospital results may vary due to patient clinical
            acuity, doctor rounds, emergency STAT disruptions, and staff shift overlaps.
          </div>
        </div>
      </div>
    </div>
  );
};
