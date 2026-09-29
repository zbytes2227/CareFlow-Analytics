import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowEvent {
  eventId: string;
  patientId: string;
  workflowType: string;
  department: string;
  stage: string;
  stageOrder: number;
  queueEntryTime: string;
  serviceStartTime: string;
  serviceEndTime: string;
  timestamp: string;
  resourceId: string;
  isDelayed?: boolean;
}

export interface IPatientDoc extends Document {
  patientId: string;
  anonymizedName: string;
  ageGroup: string;
  gender: string;
  department: string;
  workflowType: string;
  visitDate: string;
  status: string;
  firstArrivalTime: string;
  finalCompletionTime?: string;
  currentStage: string;
  totalWaitingTime: number;
  totalProcessingTime: number;
  totalDuration: number;
  events: IWorkflowEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowEventSchema = new Schema<IWorkflowEvent>({
  eventId: { type: String, required: true },
  patientId: { type: String, required: true },
  workflowType: { type: String, required: true },
  department: { type: String, required: true },
  stage: { type: String, required: true },
  stageOrder: { type: Number, required: true },
  queueEntryTime: { type: String, required: true },
  serviceStartTime: { type: String, required: true },
  serviceEndTime: { type: String, required: true },
  timestamp: { type: String, required: true },
  resourceId: { type: String, default: 'General Staff' },
  isDelayed: { type: Boolean, default: false },
}, { _id: false });

const PatientSchema = new Schema<IPatientDoc>({
  patientId: { type: String, required: true, unique: true, index: true },
  anonymizedName: { type: String, required: true },
  ageGroup: { type: String, required: true },
  gender: { type: String, required: true },
  department: { type: String, required: true, index: true },
  workflowType: { type: String, required: true, index: true },
  visitDate: { type: String, required: true, index: true },
  status: { type: String, required: true, default: 'Completed', index: true },
  firstArrivalTime: { type: String, required: true },
  finalCompletionTime: { type: String },
  currentStage: { type: String, required: true },
  totalWaitingTime: { type: Number, required: true, default: 0 },
  totalProcessingTime: { type: Number, required: true, default: 0 },
  totalDuration: { type: Number, required: true, default: 0 },
  events: [WorkflowEventSchema],
}, { timestamps: true });

export const PatientModel = mongoose.models.Patient || mongoose.model<IPatientDoc>('Patient', PatientSchema);
