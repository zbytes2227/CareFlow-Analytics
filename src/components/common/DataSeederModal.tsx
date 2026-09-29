import React, { useState } from 'react';
import { PresetPattern } from '../../utils/syntheticData';
import { X, Database, RefreshCw, Upload, Download, Check, AlertCircle } from 'lucide-react';
import { Patient } from '../../types/hospital';

interface DataSeederModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePattern: PresetPattern;
  onResetData: (count: number, pattern: PresetPattern) => void;
  onImportData: (importedPatients: Patient[]) => void;
  totalRecords: number;
}

export const DataSeederModal: React.FC<DataSeederModalProps> = ({
  isOpen,
  onClose,
  activePattern,
  onResetData,
  onImportData,
  totalRecords,
}) => {
  const [selectedPattern, setSelectedPattern] = useState<PresetPattern>(activePattern);
  const [recordCount, setRecordCount] = useState<number>(820);
  const [isResetting, setIsResetting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const patterns: { id: PresetPattern; title: string; desc: string; badge: string }[] = [
    {
      id: 'standard',
      title: 'Standard Hospital Baseline',
      desc: 'Typical daily flow with natural morning surge (08:30–11:00 AM) and balanced departmental loads.',
      badge: 'Balanced Realism',
    },
    {
      id: 'morning_surge',
      title: 'Severe Morning Triage Surge',
      desc: 'Exaggerated 08:00–10:30 AM arrival wave creating critical registration and consultation bottlenecks.',
      badge: 'Front-Desk Chokepoint',
    },
    {
      id: 'lab_backlog',
      title: 'Laboratory Testing Backlog',
      desc: 'Centrifuge analyzer batch delays creating heavy sample collection and diagnostic review queues.',
      badge: 'Diagnostic Chokepoint',
    },
    {
      id: 'discharge_congestion',
      title: 'Afternoon Discharge Congestion',
      desc: 'Simultaneous discharge orders creating afternoon insurance clearance and billing delays.',
      badge: 'Exit Chokepoint',
    },
  ];

  const handleApplyReset = () => {
    setIsResetting(true);
    setFeedbackMsg(null);
    setTimeout(() => {
      onResetData(recordCount, selectedPattern);
      setIsResetting(false);
      setFeedbackMsg(`Successfully generated ${recordCount} synthetic patient records!`);
      setTimeout(() => {
        onClose();
      }, 900);
    }, 300);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].patientId) {
          onImportData(parsed);
          setFeedbackMsg(`Imported ${parsed.length} patient records successfully!`);
          setTimeout(() => onClose(), 1000);
        } else {
          alert('Invalid file format. Expected JSON array of Patient records.');
        }
      } catch (err) {
        alert('Failed parsing JSON file: ' + err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Synthetic Dataset Generator &amp; Presets
              </h3>
              <p className="text-xs text-slate-500">
                Current active database contains <strong className="font-mono text-slate-800">{totalRecords}</strong> timestamped patient visits
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

        {feedbackMsg && (
          <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <div className="space-y-4 my-4">
          <label className="block text-xs font-semibold text-slate-700">
            Select Operational Delay Simulation Pattern:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patterns.map((p) => {
              const isSelected = selectedPattern === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPattern(p.id)}
                  className={`text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{p.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">{p.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-semibold text-slate-700">
              Sample Cohort Size (500–1,000 visits):
            </label>
            <div className="flex items-center gap-1.5">
              {[500, 750, 820, 1000].map((num) => (
                <button
                  key={num}
                  onClick={() => setRecordCount(num)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded border ${
                    recordCount === num
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Import JSON File option */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Import external JSON logs</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyReset}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Regenerating...' : 'Regenerate Dataset'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
