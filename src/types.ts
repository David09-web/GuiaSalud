export type UserRole = 'patient' | 'family' | 'admin';

export type Screen = 'home' | 'agenda' | 'medications' | 'history' | 'tutorials' | 'profile' | 'admin';

export type AppointmentStatus =
  | 'pending'
  | 'done'
  | 'cancelled'
  | 'pendiente'
  | 'realizada'
  | 'cancelada';

export type MedTakenStatus = 'none' | 'taken' | 'skipped';

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  idNumber: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  eps: string;
  ips: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  surgeries: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  twoFactorEnabled: boolean;
  dataConsentGranted: boolean;
  dataConsentDate: string;
}

export interface FamilyCaregiver {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  status: 'active' | 'pending' | 'revoked';
  permissions: {
    viewAgenda: boolean;
    viewMeds: boolean;
    viewHistory: boolean;
    receiveAlerts: boolean;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  date: string;
  time: string;
  specialty: string;
  doctor: string;
  center: string;
  status: AppointmentStatus;
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  frequency: string;
  timeOfDay: string[];
  durationDays: number;
  daysElapsed: number;
  takenToday: MedTakenStatus;
  lastTakenTime?: string;
  prescribedBy?: string;
}

export interface MedDoseHistory {
  id: string;
  medicationId: string;
  medicationName: string;
  date: string;
  time: string;
  status: 'taken' | 'skipped';
}

export interface AllergyItem {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'Leve' | 'Moderada' | 'Severa / Anafilaxia';
  diagnosedYear: string;
  status: 'Activa' | 'En desensibilización' | 'Resuelta';
}

export interface MedicalBackgroundItem {
  id: string;
  category: 'Patológico' | 'Farmacológico' | 'Quirúrgico' | 'Familiar' | 'Tóxico-Alérgico';
  title: string;
  description: string;
  year?: string;
  relationship?: string; // Para antecedentes familiares
}

export interface ClinicalDiagnosisItem {
  id: string;
  code: string; // CIE-10
  title: string;
  category: string;
  diagnosedDate: string;
  status: 'Activo' | 'En tratamiento' | 'Controlado' | 'Resuelto';
  doctor: string;
  specialty: string;
  notes?: string;
}

export interface ClinicalProcedureItem {
  id: string;
  title: string;
  type: 'Cirugía' | 'Examen Diagnóstico' | 'Procedimiento Menor' | 'Hospitalización';
  date: string;
  institution: string;
  doctor: string;
  outcome?: string;
  notes?: string;
}

export interface MedFile {
  id: string;
  patientId: string;
  name: string;
  type: 'PDF' | 'Imagen' | 'Laboratorio' | 'Radiografía' | 'Otro';
  category: 'Laboratorio' | 'Imagenología' | 'Diagnóstico' | 'Receta';
  date: string;
  size: string;
  encrypted: boolean;
  institution: string;
  fileUrl?: string;
  notes?: string;
  sha256?: string;
  cipherAlgorithm?: string;
}

export interface TutorialStep {
  title: string;
  description: string;
  tip?: string;
}

export interface TutorialCategoryDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  enabled: boolean;
}

export interface TutorialCategory {
  id: string;
  categoryId: string;
  categoryName?: string;
  title: string;
  emoji: string;
  description: string;
  prerequisites: string[];
  steps: TutorialStep[];
  officialUrl: string;
  entityName: string;
  color: string;
  verified: boolean;
  enabled: boolean;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'medication' | 'security' | 'system';
  timestamp: string;
  read: boolean;
  targetScreen?: Screen;
  whatsAppUrl?: string;
  advanceType?: '24h' | '12h' | '5h' | 'now';
  apptId?: string;
}
