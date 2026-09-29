import { Patient, WorkflowEvent, WorkflowType, Department, PatientStatus } from '../types/hospital';
import { calculateWaitingTime, calculateProcessingTime } from './calculations';

// Simple Linear Congruential Generator (LCG) for deterministic reproducibility
class SeededRandom {
  private seed: number;

  constructor(seed = 42) {
    this.seed = seed;
  }

  // Returns pseudorandom float between 0 and 1
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Integer in range [min, max]
  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Choice from array
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  // Normal distribution approximation (Box-Muller)
  gaussian(mean: number, stdDev: number): number {
    const u1 = Math.max(1e-6, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return Math.max(1, Math.round(z0 * stdDev + mean));
  }
}

export type PresetPattern = 'standard' | 'morning_surge' | 'lab_backlog' | 'discharge_congestion';

const DEPARTMENTS: Department[] = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Laboratory',
  'Radiology',
];

const AGE_GROUPS: Array<'0-17' | '18-35' | '36-50' | '51-65' | '65+'> = [
  '0-17',
  '18-35',
  '36-50',
  '51-65',
  '65+',
];

const GENDERS: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Other'];

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley'
];

const LAST_INITIALS = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'H.', 'K.', 'M.', 'P.', 'R.', 'S.', 'T.', 'W.'];

/**
 * Generates synthetic hospital dataset with deterministic seeding and realistic temporal bottlenecks
 */
export function generateSyntheticDataset(
  count = 780,
  seed = 1042,
  pattern: PresetPattern = 'standard'
): Patient[] {
  const rng = new SeededRandom(seed);
  const patients: Patient[] = [];

  // Generate over a 14-day calendar window ending today
  const referenceDate = new Date();

  for (let i = 1; i <= count; i++) {
    const patientId = `PT-${String(1000 + i).padStart(5, '0')}`;
    const name = `${rng.choice(FIRST_NAMES)} ${rng.choice(LAST_INITIALS)} (#${1000 + i})`;
    const ageGroup = rng.choice(AGE_GROUPS);
    const gender = rng.choice(GENDERS);

    // Distribution: OPD (65%), Laboratory (20%), Admission (8%), Discharge (7%)
    const typeRoll = rng.next();
    let workflowType: WorkflowType = 'OPD';
    if (typeRoll > 0.85) {
      workflowType = 'Admission';
    } else if (typeRoll > 0.78) {
      workflowType = 'Discharge';
    } else if (typeRoll > 0.60) {
      workflowType = 'Laboratory';
    }

    // Department selection based on workflow
    let department: Department;
    if (workflowType === 'Laboratory') {
      department = 'Laboratory';
    } else {
      const depRoll = rng.next();
      if (depRoll < 0.35) department = 'General Medicine';
      else if (depRoll < 0.55) department = 'Cardiology';
      else if (depRoll < 0.75) department = 'Orthopedics';
      else if (depRoll < 0.90) department = 'Pediatrics';
      else department = 'Radiology';
    }

    // Days ago between 0 and 13 (weighted slightly toward recent days)
    const daysAgo = Math.floor(Math.pow(rng.next(), 1.2) * 14);
    const visitDateObj = new Date(referenceDate);
    visitDateObj.setDate(visitDateObj.getDate() - daysAgo);

    // Peak arrival pattern: Heavy morning peak between 08:00 and 11:30, smaller afternoon bump around 14:00-16:00
    let arrivalHour: number;
    const hourRoll = rng.next();
    if (pattern === 'morning_surge' || (pattern === 'standard' && hourRoll < 0.55)) {
      // Morning rush
      arrivalHour = rng.choice([8, 8, 9, 9, 9, 10, 10, 10, 11, 11]);
    } else if (hourRoll < 0.80) {
      // Afternoon bump
      arrivalHour = rng.choice([13, 14, 14, 15, 15, 16]);
    } else if (hourRoll < 0.92) {
      // Mid-day
      arrivalHour = 12;
    } else {
      // Evening/early morning
      arrivalHour = rng.choice([7, 17, 18, 19]);
    }

    const arrivalMinute = rng.range(0, 59);
    const arrivalSecond = rng.range(0, 59);

    const firstArrivalDate = new Date(visitDateObj);
    firstArrivalDate.setHours(arrivalHour, arrivalMinute, arrivalSecond, 0);

    // Build stage events for this patient's journey
    const events: WorkflowEvent[] = [];
    let currentTime = new Date(firstArrivalDate);

    // Determine workflow sequence
    const stageDefinitions = getStageDefinitions(workflowType, rng);

    stageDefinitions.forEach((def, stageIdx) => {
      const queueEntryTime = new Date(currentTime);

      // Calculate realistic waiting time based on hour of day, department, and preset pattern
      let waitMinutes = rng.gaussian(def.baseWaitMean, def.baseWaitStd);

      // Morning Registration bottleneck effect
      if (def.stage.includes('Registration') && arrivalHour >= 8 && arrivalHour <= 11) {
        waitMinutes += pattern === 'morning_surge' ? rng.range(16, 28) : rng.range(8, 18);
      }

      // Laboratory Testing bottleneck effect
      if ((def.stage.includes('Testing') || def.stage.includes('Sample')) && (pattern === 'lab_backlog' || rng.next() > 0.6)) {
        waitMinutes += pattern === 'lab_backlog' ? rng.range(20, 36) : rng.range(10, 20);
      }

      // Billing end-of-day bottleneck effect
      if (def.stage.includes('Billing') && (pattern === 'discharge_congestion' || arrivalHour >= 14)) {
        waitMinutes += pattern === 'discharge_congestion' ? rng.range(15, 26) : rng.range(8, 16);
      }

      // Cardiology and Orthopedics consultations take longer queues
      if (def.stage.includes('Consultation') && (department === 'Cardiology' || department === 'Orthopedics')) {
        waitMinutes += rng.range(6, 14);
      }

      waitMinutes = Math.max(1, waitMinutes);

      const serviceStartTime = new Date(queueEntryTime.getTime() + waitMinutes * 60 * 1000);

      // Calculate processing time
      let processMinutes = rng.gaussian(def.baseProcessMean, def.baseProcessStd);
      processMinutes = Math.max(2, processMinutes);

      const serviceEndTime = new Date(serviceStartTime.getTime() + processMinutes * 60 * 1000);

      const isDelayed = waitMinutes > (def.benchmark || 15);

      events.push({
        eventId: `EV-${patientId}-${stageIdx + 1}`,
        patientId,
        workflowType,
        department,
        stage: def.stage,
        stageOrder: stageIdx + 1,
        queueEntryTime: queueEntryTime.toISOString(),
        serviceStartTime: serviceStartTime.toISOString(),
        serviceEndTime: serviceEndTime.toISOString(),
        timestamp: visitDateObj.toISOString().split('T')[0],
        resourceId: def.resourcePrefix ? `${def.resourcePrefix}-${rng.range(1, def.resourceCount || 4)}` : 'Desk Staff',
        isDelayed,
      });

      // Next stage starts immediately or with short transition
      const transitionMinutes = rng.range(1, 3);
      currentTime = new Date(serviceEndTime.getTime() + transitionMinutes * 60 * 1000);
    });

    // Programmatically calculate totals from timestamped events
    let totalWait = 0;
    let totalProcess = 0;
    events.forEach((ev) => {
      totalWait += calculateWaitingTime(ev);
      totalProcess += calculateProcessingTime(ev);
    });

    const firstArrivalIso = events[0].queueEntryTime;
    const finalCompletionIso = events[events.length - 1].serviceEndTime;
    const totalDuration = Math.round(
      ((new Date(finalCompletionIso).getTime() - new Date(firstArrivalIso).getTime()) / (1000 * 60)) * 10
    ) / 10;

    // Status: Most recent are In Progress if visited today and late
    let status: PatientStatus = 'Completed';
    const isToday = daysAgo === 0;
    if (isToday && rng.next() < 0.18) {
      status = 'In Progress';
    } else if (events.some((e) => e.isDelayed) && rng.next() < 0.35) {
      status = 'Delayed';
    }

    patients.push({
      patientId,
      anonymizedName: name,
      ageGroup,
      gender,
      department,
      workflowType,
      visitDate: visitDateObj.toISOString().split('T')[0],
      status,
      firstArrivalTime: firstArrivalIso,
      finalCompletionTime: status === 'Completed' ? finalCompletionIso : undefined,
      currentStage: events[events.length - 1].stage,
      totalWaitingTime: Math.round(totalWait * 10) / 10,
      totalProcessingTime: Math.round(totalProcess * 10) / 10,
      totalDuration,
      events,
    });
  }

  return patients;
}

interface StageDefinition {
  stage: string;
  baseWaitMean: number;
  baseWaitStd: number;
  baseProcessMean: number;
  baseProcessStd: number;
  benchmark: number;
  resourcePrefix?: string;
  resourceCount?: number;
}

function getStageDefinitions(workflowType: WorkflowType, rng: SeededRandom): StageDefinition[] {
  switch (workflowType) {
    case 'OPD':
      return [
        {
          stage: 'Patient Arrival & Triage',
          baseWaitMean: 4,
          baseWaitStd: 2,
          baseProcessMean: 3,
          baseProcessStd: 1,
          benchmark: 10,
          resourcePrefix: 'Triage Desk',
          resourceCount: 2,
        },
        {
          stage: 'Registration & Desk Check-in',
          baseWaitMean: 14,
          baseWaitStd: 6,
          baseProcessMean: 4.5,
          baseProcessStd: 1.5,
          benchmark: 12,
          resourcePrefix: 'Counter',
          resourceCount: 3,
        },
        {
          stage: 'Waiting Room Call',
          baseWaitMean: 16,
          baseWaitStd: 7,
          baseProcessMean: 2,
          baseProcessStd: 1,
          benchmark: 15,
          resourcePrefix: 'Nurse Station',
          resourceCount: 4,
        },
        {
          stage: 'Doctor Consultation',
          baseWaitMean: 18,
          baseWaitStd: 8,
          baseProcessMean: 14,
          baseProcessStd: 4,
          benchmark: 20,
          resourcePrefix: 'Exam Room',
          resourceCount: 6,
        },
        // Optional investigation stage (50% probability)
        ...(rng.next() > 0.5
          ? [
              {
                stage: 'Investigation / Order Entry',
                baseWaitMean: 12,
                baseWaitStd: 5,
                baseProcessMean: 8,
                baseProcessStd: 2.5,
                benchmark: 15,
                resourcePrefix: 'Diagnostics Unit',
                resourceCount: 3,
              },
            ]
          : []),
        {
          stage: 'Billing & Insurance Clearance',
          baseWaitMean: 11,
          baseWaitStd: 5,
          baseProcessMean: 6,
          baseProcessStd: 2,
          benchmark: 12,
          resourcePrefix: 'Billing Desk',
          resourceCount: 3,
        },
        {
          stage: 'Pharmacy Dispensation',
          baseWaitMean: 13,
          baseWaitStd: 5,
          baseProcessMean: 7,
          baseProcessStd: 2,
          benchmark: 14,
          resourcePrefix: 'Pharm Counter',
          resourceCount: 3,
        },
      ];

    case 'Laboratory':
      return [
        {
          stage: 'Test Request & Registration',
          baseWaitMean: 6,
          baseWaitStd: 3,
          baseProcessMean: 3.5,
          baseProcessStd: 1.2,
          benchmark: 10,
          resourcePrefix: 'Lab Intake',
          resourceCount: 2,
        },
        {
          stage: 'Sample Collection',
          baseWaitMean: 24,
          baseWaitStd: 9,
          baseProcessMean: 7,
          baseProcessStd: 2,
          benchmark: 18,
          resourcePrefix: 'Phlebotomy Bay',
          resourceCount: 3,
        },
        {
          stage: 'Laboratory Testing',
          baseWaitMean: 22,
          baseWaitStd: 8,
          baseProcessMean: 28,
          baseProcessStd: 7,
          benchmark: 25,
          resourcePrefix: 'Auto-Analyzer',
          resourceCount: 4,
        },
        {
          stage: 'Report Preparation',
          baseWaitMean: 14,
          baseWaitStd: 5,
          baseProcessMean: 12,
          baseProcessStd: 3,
          benchmark: 15,
          resourcePrefix: 'LIMS Terminal',
          resourceCount: 3,
        },
        {
          stage: 'Report Review & Sign-off',
          baseWaitMean: 15,
          baseWaitStd: 6,
          baseProcessMean: 9,
          baseProcessStd: 2.5,
          benchmark: 15,
          resourcePrefix: 'Pathologist Desk',
          resourceCount: 2,
        },
      ];

    case 'Admission':
      return [
        {
          stage: 'Admission Request & Triage',
          baseWaitMean: 12,
          baseWaitStd: 4,
          baseProcessMean: 8,
          baseProcessStd: 2,
          benchmark: 15,
          resourcePrefix: 'Admit Office',
          resourceCount: 2,
        },
        {
          stage: 'Bed Assignment & Prep',
          baseWaitMean: 28,
          baseWaitStd: 11,
          baseProcessMean: 18,
          baseProcessStd: 5,
          benchmark: 25,
          resourcePrefix: 'Ward Coordinator',
          resourceCount: 2,
        },
        {
          stage: 'Clinical Clearance',
          baseWaitMean: 15,
          baseWaitStd: 6,
          baseProcessMean: 22,
          baseProcessStd: 6,
          benchmark: 20,
          resourcePrefix: 'Attending Physician',
          resourceCount: 3,
        },
      ];

    case 'Discharge':
      return [
        {
          stage: 'Clinical Clearance',
          baseWaitMean: 18,
          baseWaitStd: 7,
          baseProcessMean: 12,
          baseProcessStd: 3,
          benchmark: 20,
          resourcePrefix: 'Discharge Doctor',
          resourceCount: 2,
        },
        {
          stage: 'Billing & Insurance Clearance',
          baseWaitMean: 21,
          baseWaitStd: 8,
          baseProcessMean: 14,
          baseProcessStd: 4,
          benchmark: 15,
          resourcePrefix: 'Discharge Cashier',
          resourceCount: 2,
        },
        {
          stage: 'Pharmacy Dispensation',
          baseWaitMean: 16,
          baseWaitStd: 6,
          baseProcessMean: 8,
          baseProcessStd: 2,
          benchmark: 15,
          resourcePrefix: 'Discharge Pharm',
          resourceCount: 2,
        },
        {
          stage: 'Discharge Formalities & Exit',
          baseWaitMean: 9,
          baseWaitStd: 4,
          baseProcessMean: 5,
          baseProcessStd: 1.5,
          benchmark: 10,
          resourcePrefix: 'Nurse Helpdesk',
          resourceCount: 2,
        },
      ];
  }
}
