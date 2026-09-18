export type UserRole = 'PATIENT' | 'FAMILY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  patientId?: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  specialty: string;
  doctor: string;
  center: string;
  status: 'pending' | 'done' | 'cancelled';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  durationDays: number;
  daysElapsed: number;
  takenToday: 'taken' | 'pending' | 'skipped';
  prescribedBy: string;
}

export interface ClinicalHistory {
  bloodType: string;
  allergies: string[];
  conditions: string[];
  surgeries: string[];
  filesCount: number;
}
