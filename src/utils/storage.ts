import { Patient, FilterState } from '../types/hospital';
import { generateSyntheticDataset, PresetPattern } from './syntheticData';

const STORAGE_KEY = 'hospital_workflow_records_v1';
const PATTERN_KEY = 'hospital_workflow_active_pattern';

export function getStoredPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateSyntheticDataset(820, 1042, 'standard');
      savePatients(initial);
      localStorage.setItem(PATTERN_KEY, 'standard');
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = generateSyntheticDataset(820, 1042, 'standard');
    savePatients(initial);
    return initial;
  } catch (err) {
    console.error('Failed reading stored patients, regenerating:', err);
    return generateSyntheticDataset(820, 1042, 'standard');
  }
}

export function savePatients(patients: Patient[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  } catch (err) {
    console.error('Failed saving patients to storage:', err);
  }
}

export function resetDataset(count = 820, pattern: PresetPattern = 'standard'): Patient[] {
  const seed = Math.floor(Math.random() * 90000) + 1000;
  const newDataset = generateSyntheticDataset(count, seed, pattern);
  savePatients(newDataset);
  localStorage.setItem(PATTERN_KEY, pattern);
  return newDataset;
}

export function getActivePattern(): PresetPattern {
  return (localStorage.getItem(PATTERN_KEY) as PresetPattern) || 'standard';
}

export function filterPatients(patients: Patient[], filters: FilterState): Patient[] {
  const todayStr = new Date().toISOString().split('T')[0];

  return patients.filter((patient) => {
    // 1. Date Range
    if (filters.dateRange !== 'all') {
      const visitDate = new Date(patient.visitDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((todayDate.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));

      if (filters.dateRange === 'today' && patient.visitDate !== todayStr) {
        return false;
      }
      if (filters.dateRange === 'yesterday' && diffDays !== 1) {
        return false;
      }
      if (filters.dateRange === 'last7days' && (diffDays < 0 || diffDays > 7)) {
        return false;
      }
      if (filters.dateRange === 'last14days' && (diffDays < 0 || diffDays > 14)) {
        return false;
      }
    }

    // 2. Department
    if (filters.department && filters.department !== 'all') {
      if (patient.department !== filters.department) {
        return false;
      }
    }

    // 3. Workflow Type
    if (filters.workflowType && filters.workflowType !== 'all') {
      if (patient.workflowType !== filters.workflowType) {
        return false;
      }
    }

    // 4. Status
    if (filters.status && filters.status !== 'all') {
      if (patient.status !== filters.status) {
        return false;
      }
    }

    // 5. Stage
    if (filters.stage && filters.stage !== 'all') {
      const hasStage = patient.events.some((ev) => ev.stage === filters.stage);
      if (!hasStage) {
        return false;
      }
    }

    // 6. Search Query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      const matchId = patient.patientId.toLowerCase().includes(query);
      const matchName = patient.anonymizedName.toLowerCase().includes(query);
      const matchDept = patient.department.toLowerCase().includes(query);
      const matchStage = patient.currentStage.toLowerCase().includes(query);
      if (!matchId && !matchName && !matchDept && !matchStage) {
        return false;
      }
    }

    return true;
  });
}
