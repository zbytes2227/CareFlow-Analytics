import React, { useState } from 'react';
import { useAuth } from '../../utils/authContext';
import { X, UserPlus, Building, Clock, Check, AlertCircle } from 'lucide-react';
import { Patient, Department, WorkflowType } from '../../types/hospital';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientCreated: (newPatient: Patient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientCreated,
}) => {
  const { token, user } = useAuth();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<Department>('General Medicine');
  const [workflowType, setWorkflowType] = useState<WorkflowType>('OPD');
  const [ageGroup, setAgeGroup] = useState<'0-17' | '18-35' | '36-50' | '51-65' | '65+'>('36-50');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          department,
          workflowType,
          ageGroup,
          gender,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to check-in patient');
      }

      setSuccess(true);
      onPatientCreated(data.patient);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setName('');
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Check-in Patient Intake Encounter
              </h3>
              <p className="text-xs text-slate-500">
                Log real-time patient queue entry into MongoDB operational stream
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encounter logged successfully! Patient added to live queue.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Patient Alias / Name (De-identified)
            </label>
            <input
              type="text"
              placeholder="e.g. Case #1084 - R. Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Leave blank to automatically assign sequential identifier (e.g. Case #1092)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Radiology">Radiology</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Workflow Pathway
              </label>
              <select
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value as WorkflowType)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="OPD">Outpatient (OPD)</option>
                <option value="Laboratory">Laboratory Diagnostics</option>
                <option value="Admission">Inpatient Admission</option>
                <option value="Discharge">Discharge Clearance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age Demographic Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="0-17">0-17 (Pediatric)</option>
                <option value="18-35">18-35 (Young Adult)</option>
                <option value="36-50">36-50 (Adult)</option>
                <option value="51-65">51-65 (Mature)</option>
                <option value="65+">65+ (Senior)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender Classification
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Unspecified</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Initial Stage:</span>
            </span>
            <span className="font-semibold text-slate-900">
              {workflowType === 'Laboratory' ? 'Test Request & Registration' : 'Patient Arrival & Triage'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Logging Encounter...' : 'Log & Check-in Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
