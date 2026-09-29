import React, { useState } from 'react';
import { Patient, WorkflowEvent } from '../../types/hospital';
import { calculateWaitingTime, calculateProcessingTime, calculateStageDuration, STAGE_BENCHMARKS } from '../../utils/calculations';
import { useAuth } from '../../utils/authContext';
import { X, Clock, User, Building, AlertCircle, CheckCircle2, ArrowDown, FastForward } from 'lucide-react';

interface PatientTimelineModalProps {
  patient: Patient | null;
  onClose: () => void;
  onPatientUpdated?: (updated: Patient) => void;
}

export const PatientTimelineModal: React.FC<PatientTimelineModalProps> = ({ 
  patient, 
  onClose,
  onPatientUpdated 
}) => {
  const { token, isAuthenticated } = useAuth();
  const [advancing, setAdvancing] = useState(false);
  const [selectedNextStage, setSelectedNextStage] = useState('');
  const [customWait, setCustomWait] = useState(14);
  const [customProcess, setCustomProcess] = useState(8);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);

  if (!patient) return null;

  const formatIsoTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const getPossibleNextStages = () => {
    const current = patient.currentStage;
    if (patient.workflowType === 'OPD') {
      if (current.includes('Arrival')) return ['Registration & Desk Check-in'];
      if (current.includes('Registration')) return ['Waiting Room Call'];
      if (current.includes('Waiting Room')) return ['Doctor Consultation'];
      if (current.includes('Consultation')) return ['Investigation / Order Entry', 'Billing & Insurance Clearance'];
      if (current.includes('Investigation')) return ['Billing & Insurance Clearance'];
      if (current.includes('Billing')) return ['Pharmacy Dispensation'];
      if (current.includes('Pharmacy')) return ['Patient Exit'];
    } else if (patient.workflowType === 'Laboratory') {
      if (current.includes('Request')) return ['Sample Collection'];
      if (current.includes('Sample')) return ['Laboratory Testing'];
      if (current.includes('Testing')) return ['Report Preparation'];
      if (current.includes('Preparation')) return ['Report Review & Sign-off'];
      if (current.includes('Review')) return ['Completed'];
    }
    return ['Next Clinical Evaluation', 'Discharge Formalities & Exit'];
  };

  const handleAdvanceStage = async () => {
    const next = selectedNextStage || getPossibleNextStages()[0];
    if (!next) return;

    setAdvancing(true);
    try {
      const res = await fetch(`/api/patients/${patient.patientId}/advance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nextStage: next,
          waitMinutes: customWait,
          serviceMinutes: customProcess,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to advance stage');
        return;
      }

      if (onPatientUpdated) {
        onPatientUpdated(data.patient);
      }
      setShowAdvanceForm(false);
    } catch (err: any) {
      alert('Error advancing patient: ' + err.message);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{patient.anonymizedName}</h2>
              <span className="text-xs font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded-sm">
                {patient.patientId}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{patient.department}</span>
              <span aria-hidden="true">·</span>
              <span>{patient.workflowType} Workflow</span>
              <span aria-hidden="true">·</span>
              <span>Visit: {patient.visitDate}</span>
              <span aria-hidden="true">·</span>
              <span className={`capitalize font-semibold ${
                patient.status === 'Completed' ? 'text-emerald-700' : 'text-blue-700'
              }`}>
                {patient.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Operational Journey Summary Header */}
        <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-slate-500">Cumulative Wait Time</div>
            <div className="text-lg font-bold font-mono text-amber-700">
              {patient.totalWaitingTime} <span className="text-xs font-normal">min</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Active Service Time</div>
            <div className="text-lg font-bold font-mono text-blue-700">
              {patient.totalProcessingTime} <span className="text-xs font-normal">min</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Total Visit Duration</div>
            <div className="text-lg font-bold font-mono text-slate-900">
              {patient.totalDuration} <span className="text-xs font-normal">min</span>
            </div>
          </div>
        </div>

        {/* Operational Stage Advance Strip for active cases */}
        {patient.status !== 'Completed' && (
          <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Current Active Stage: <strong>{patient.currentStage}</strong></span>
            </div>

            {!showAdvanceForm ? (
              <button
                onClick={() => {
                  setSelectedNextStage(getPossibleNextStages()[0] || '');
                  setShowAdvanceForm(true);
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium flex items-center gap-1 self-start sm:self-auto shadow-xs"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Advance to Next Stage</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedNextStage}
                  onChange={(e) => setSelectedNextStage(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-medium"
                >
                  {getPossibleNextStages().map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-600">Wait:</span>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={customWait}
                    onChange={(e) => setCustomWait(Number(e.target.value))}
                    className="w-12 px-1 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                  <span className="text-[11px] text-slate-600">m</span>
                </div>
                <button
                  onClick={handleAdvanceStage}
                  disabled={advancing}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
                >
                  {advancing ? 'Saving...' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowAdvanceForm(false)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vertical Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            End-to-End Operational Timeline ({patient.events.length} Stages Recorded)
          </div>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
            {patient.events.map((event, idx) => {
              const wait = calculateWaitingTime(event);
              const process = calculateProcessingTime(event);
              const duration = calculateStageDuration(event);
              const benchmark = STAGE_BENCHMARKS[event.stage] || 15;
              const isOverBenchmark = wait > benchmark;

              return (
                <div key={event.eventId} className="relative group">
                  {/* Timeline Marker Dot */}
                  <div
                    className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                      isOverBenchmark
                        ? 'border-rose-500 ring-4 ring-rose-50'
                        : 'border-blue-600 ring-4 ring-blue-50'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isOverBenchmark ? 'bg-rose-500' : 'bg-blue-600'
                      }`}
                    />
                  </div>

                  {/* Stage Card */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          0{idx + 1}.
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900">{event.stage}</h4>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                          {event.resourceId}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-100 mb-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Queue Entry:</span>
                        <span className="font-mono font-medium">{formatIsoTime(event.queueEntryTime)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Service Started:</span>
                        <span className="font-mono font-medium">{formatIsoTime(event.serviceStartTime)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Service Finished:</span>
                        <span className="font-mono font-medium">{formatIsoTime(event.serviceEndTime)}</span>
                      </div>
                    </div>

                    {/* Waiting & Processing Breakdown */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-slate-500">Waiting: </span>
                          <strong
                            className={`font-mono ${
                              isOverBenchmark ? 'text-rose-600 font-bold' : 'text-slate-800'
                            }`}
                          >
                            {wait} min
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Processing: </span>
                          <strong className="font-mono text-blue-700">{process} min</strong>
                        </div>
                        <div>
                          <span className="text-slate-500">Stage Total: </span>
                          <strong className="font-mono text-slate-900">{duration} min</strong>
                        </div>
                      </div>

                      {isOverBenchmark && (
                        <div className="text-rose-600 flex items-center gap-1 font-medium text-[11px]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Exceeded {benchmark}m benchmark</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Data is persisted in the hospital operational database.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
