export type WorkflowType = 'OPD' | 'Laboratory' | 'Admission' | 'Discharge';

export type Department =
  | 'General Medicine'
  | 'Cardiology'
  | 'Orthopedics'
  | 'Pediatrics'
  | 'Laboratory'
  | 'Radiology';

export type PatientStatus = 'In Progress' | 'Completed' | 'Delayed';

export interface WorkflowEvent {
  eventId: string;
  patientId: string;
  workflowType: WorkflowType;
  department: Department;
  stage: string;
  stageOrder: number;
  queueEntryTime: string; // ISO string
  serviceStartTime: string; // ISO string
  serviceEndTime: string; // ISO string
  timestamp: string; // Date string (YYYY-MM-DD)
  resourceId: string; // Staff or counter identifier (e.g., 'Counter 02', 'Dr. Sharma')
  isDelayed?: boolean;
}

export interface Patient {
  patientId: string;
  anonymizedName: string; // e.g. "Case #1042 - P. Miller"
  ageGroup: '0-17' | '18-35' | '36-50' | '51-65' | '65+';
  gender: 'Male' | 'Female' | 'Other';
  department: Department;
  workflowType: WorkflowType;
  visitDate: string; // YYYY-MM-DD
  status: PatientStatus;
  firstArrivalTime: string; // ISO string
  finalCompletionTime?: string; // ISO string
  currentStage: string;
  totalWaitingTime: number; // in minutes (calculated from events)
  totalProcessingTime: number; // in minutes (calculated from events)
  totalDuration: number; // in minutes (calculated from events)
  events: WorkflowEvent[];
}

export interface FilterState {
  dateRange: 'all' | 'today' | 'yesterday' | 'last7days' | 'last14days';
  department: string;
  workflowType: string;
  stage: string;
  status: string;
  searchQuery: string;
}

export interface StagePerformance {
  stage: string;
  workflowType: WorkflowType;
  patientCount: number;
  avgWaitingTime: number; // in minutes
  medianWaitingTime: number; // in minutes
  p90WaitingTime: number; // in minutes
  avgProcessingTime: number; // in minutes
  avgStageDuration: number; // in minutes
  maxWaitingTime: number;
  delayRate: number; // percentage of patients exceeding benchmark
  benchmarkWaitTime: number; // expected benchmark in minutes
  severity: 'normal' | 'moderate' | 'high';
  resourceUtilization: number; // 0-100%
}

export interface BottleneckInsight {
  id: string;
  stage: string;
  department: Department | 'All Departments';
  workflowType: WorkflowType;
  avgWaitingTime: number;
  medianWaitingTime: number;
  p90WaitingTime: number;
  avgProcessingTime: number;
  patientVolume: number;
  severity: 'Critical' | 'High' | 'Moderate' | 'Nominal';
  bottleneckScore: number; // 0 - 100
  reasonForFlagging: string;
  possibleOperationalFactor: string;
  trend: 'worsening' | 'stable' | 'improving';
  recommendedIntervention: string;
}

export interface ScenarioSimulationResult {
  scenarioName: string;
  description: string;
  baseline: {
    avgWaitingTime: number;
    avgJourneyDuration: number;
    throughputPerHour: number;
    stageWaitTime: number;
    peakQueueSize: number;
  };
  simulated: {
    avgWaitingTime: number;
    avgJourneyDuration: number;
    throughputPerHour: number;
    stageWaitTime: number;
    peakQueueSize: number;
  };
  deltaWaitPercentage: number;
  deltaDurationMinutes: number;
  estimatedQueueReduction: number;
  assumptions: string[];
}
