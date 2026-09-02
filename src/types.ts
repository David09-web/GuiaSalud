export type Screen = 'home' | 'agenda' | 'medications' | 'history' | 'tutorials' | 'profile';

export type AppointmentStatus = 'pending' | 'done' | 'cancelled';

export type MedTakenStatus = 'none' | 'taken' | 'skipped';

export interface Appointment {
  id: string;
  date: string;
  time: string;
  specialty: string;
  doctor: string;
  center: string;
  status: AppointmentStatus;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  durationDays: number;
  daysElapsed: number;
  takenToday: MedTakenStatus;
}

export interface MedFile {
  id: string;
  name: string;
  type: 'PDF' | 'Imagen' | 'Otro';
  date: string;
}

export interface TutorialStep {
  title: string;
  description: string;
}

export interface TutorialCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  steps: TutorialStep[];
  officialUrl: string;
  color: string;
}
