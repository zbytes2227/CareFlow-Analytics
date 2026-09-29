import { Patient, FilterState } from '../types/hospital';


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
