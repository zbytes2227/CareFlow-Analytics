import React, { useState } from 'react';
import { 
  GraduationCap, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Code, 
  Binary, 
  Workflow, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

export const CollegeProjectDocs: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const examinerQas = [
    {
      q: '1. What makes this an operational analytics system rather than a clinical AI diagnostic tool?',
      a: 'The system strictly tracks operational timestamps (Queue Entry, Service Start, Service End) and spatial resource assignments (Counter 1, Phlebotomy Bay 2). It answers hospital throughput and scheduling questions (waiting times, queue bottlenecks, staff utilization) without inspecting medical history, laboratory analyte values, or making diagnostic assertions, ensuring full compliance with healthcare operational analytics boundaries.',
    },
    {
      q: '2. How are waiting times and processing times calculated from the data?',
      a: 'Calculations are performed deterministically from timestamped event records rather than stored fake numbers: Waiting Time = Service Start Time - Queue Entry Time; Processing Time = Service End Time - Service Start Time; Stage Duration = Service End Time - Queue Entry Time; and Total Visit Duration = Final Stage Completion - First Stage Arrival.',
    },
    {
      q: '3. What mathematical formula is used to identify bottlenecks?',
      a: 'We implement a documented weighted multi-factor formula: S = 0.40(W_norm) + 0.25(P90_norm) + 0.20(Vol_stress) + 0.15(Delay_rate), where W_norm is mean wait relative to double benchmark, P90_norm is 90th percentile wait, Vol_stress is stage load relative to maximum throughput, and Delay_rate is the percentage of visits exceeding target service times.',
    },
    {
      q: '4. Why is M/M/c queuing theory used in the Scenario / What-If Laboratory?',
      a: 'In hospital departments like registration and phlebotomy, arrivals follow Poisson distributions (M) and service times follow exponential distributions (M) across multiple parallel desks or stations (c). By modeling traffic intensity rho = lambda / (c * mu), administrators can evaluate how adding a desk (c -> c + 1) non-linearly reduces waiting times (W_q) before committing physical resources.',
    },
    {
      q: '5. How does the synthetic dataset generator simulate realistic hospital patterns?',
      a: 'It uses a deterministic Seeded Random generator producing ~820 patient visits across a 14-day calendar window. It embeds empirical hospital phenomena: heavy morning intake surges (08:30-11:00 AM) that saturate registration desks, centrifuge batch loading in diagnostics, and afternoon discharge clearance peaks in billing.',
    },
    {
      q: '6. How is patient privacy and HIPAA compliance maintained in the architecture?',
      a: 'All records utilize synthetic de-identified pseudonyms (e.g., PT-01042, Case #1042 - P. Miller) paired with general categorical age groups (e.g., 36-50) rather than birthdates, Social Security numbers, or clinical notes. No protected health information (PHI) is captured or transmitted.',
    },
    {
      q: '7. How does the global filter bar propagate state through the system?',
      a: 'The application employs a unified unidirectional data flow. When filters (date range, department, workflow type, status, or search query) change, the state propagates through computeStagePerformances, detectBottlenecks, and chart aggregations in real-time, updating all KPI cards and visual nodes simultaneously.',
    },
    {
      q: '8. How could this system be deployed in a real-world hospital EHR environment?',
      a: 'It can interface directly with HL7 FHIR or ADT (Admission, Discharge, Transfer) event streams. By subscribing to event hooks (such as Encounter-start, Service-order, and Observation-ready), the system converts live hospital transactional events into real-time operational optimization dashboards.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* College Project Abstract Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              College Final-Year Project: Hospital Workflow Analysis &amp; Process Optimization
            </h2>
            <p className="text-xs text-slate-500">
              Department of Computer Science &amp; Engineering &bull; Healthcare Informatics Specialization
            </p>
          </div>
        </div>

        <div className="prose text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            <strong>Abstract:</strong> Hospital operational inefficiencies, uncoordinated queue accumulation,
            and prolonged patient waiting times lead to severe administrative friction, resource strain, and reduced
            service satisfaction. This project develops an end-to-end operational analytics engine capable of
            ingesting multi-stage timestamped patient flow logs, computing waiting versus active service intervals,
            automatically classifying bottleneck stages using statistical multi-factor scoring, and simulating
            corrective capacity interventions via classical multi-server queuing theory ($M/M/c$).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block mb-1">Operational Rigor</span>
              <p className="text-[11px] text-slate-600">
                Calculations are derived from atomic timestamps. No clinical diagnostic interference or unsupported
                causal claims.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block mb-1">Mathematical Grounding</span>
              <p className="text-[11px] text-slate-600">
                P50/P90 percentiles, Little&apos;s Law ($L = \lambda W$), and Erlang C queue probability modeling.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="font-bold text-slate-900 block mb-1">Administrative Utility</span>
              <p className="text-[11px] text-slate-600">
                What-If scenario simulation allows hospital directors to preview the ROI of adding counters before hiring.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* External Examiner Defense Viva Guide */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              External Examiner Viva Voce &amp; Defense Q&amp;A Guide
            </h3>
            <p className="text-xs text-slate-500">
              Anticipated examination questions with verified technical and mathematical answers
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {examinerQas.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-3.5 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 transition-colors"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System Architecture Specifications */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
          <Code className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Technical Architecture Specifications</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 pt-1">
          <div>
            <span className="font-semibold text-slate-900 block mb-1">Frontend &amp; Visualization Stack:</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>React 19 &amp; TypeScript with strict typing</li>
              <li>Tailwind CSS v4 (responsive utility-first styling)</li>
              <li>Recharts (Area, Bar, Grouped, and Distribution charts)</li>
              <li>Lucide React (semantic affordance iconography)</li>
              <li>Date-fns &amp; ISO-8601 temporal parsing</li>
            </ul>
          </div>
          <div>
            <span className="font-semibold text-slate-900 block mb-1">Data Model &amp; Invariants:</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>Deterministic Seeded LCG Random Generator</li>
              <li>Atomic queue and service interval calculations</li>
              <li>Zero hard-coded KPIs; dynamic real-time dataset derivation</li>
              <li>LocalStorage persistence with multi-scenario reset triggers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
