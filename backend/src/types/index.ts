export type UserRole = 'PATIENT' | 'FAMILY' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  patientId?: string; // Si es un familiar cuidando a un paciente
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  specialty: string;
  doctor: string;
  center: string;
  status: 'pending' | 'done' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  frequency: string;
  durationDays: number;
  daysElapsed: number;
  takenToday: 'taken' | 'pending' | 'skipped';
  prescribedBy: string;
}

export interface MedicationDoseLog {
  id: string;
  medicationId: string;
  takenAt: string;
  status: 'taken' | 'skipped';
}

export interface ClinicalHistory {
  patientId: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  surgeries: string[];
  filesCount: number;
  encryptedPayload?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: string;
  userId?: string;
  userRole?: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
  details: string;
}

export interface SGSSSTutorial {
  id: string;
  title: string;
  entityName: string;
  officialUrl: string;
  steps: { stepNumber: number; title: string; instruction: string }[];
}
