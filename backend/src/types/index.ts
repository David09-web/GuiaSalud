export type UserRole = 'PATIENT' | 'FAMILY' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  patientId?: string; // Si es un familiar cuidando a un paciente
}

export type AppointmentStatus = 'pending' | 'done' | 'cancelled' | 'pendiente' | 'realizada' | 'cancelada';

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
  createdAt: string;
  updatedAt?: string;
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

export interface AllergyRecord {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'Leve' | 'Moderada' | 'Severa / Anafilaxia';
  diagnosedYear: string;
  status: 'Activa' | 'En desensibilización' | 'Resuelta';
}

export interface MedicalBackground {
  id: string;
  category: 'Patológico' | 'Farmacológico' | 'Quirúrgico' | 'Familiar' | 'Tóxico-Alérgico';
  title: string;
  description: string;
  year?: string;
  relationship?: string;
}

export interface ClinicalDiagnosis {
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

export interface ClinicalProcedure {
  id: string;
  title: string;
  type: 'Cirugía' | 'Examen Diagnóstico' | 'Procedimiento Menor' | 'Hospitalización';
  date: string;
  institution: string;
  doctor: string;
  outcome?: string;
  notes?: string;
}

export interface EncryptedAttachment {
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
  cipherIV?: string;
  cipherAuthTag?: string;
}

export interface ClinicalHistory {
  patientId: string;
  bloodType: string;
  allergies: AllergyRecord[];
  backgrounds: MedicalBackground[];
  diagnoses: ClinicalDiagnosis[];
  procedures: ClinicalProcedure[];
  filesCount: number;
  encryptedPayload?: string;
  sha256Signature?: string;
  lastUpdated?: string;
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

export type NotificationChannel = 'web' | 'push' | 'email' | 'whatsapp';

export interface NotificationPreferences {
  patientId: string;
  channels: {
    web: boolean;
    push: boolean;
    email: boolean;
    whatsapp?: boolean;
  };
  appointments: {
    notify24h: boolean;
    notify12h: boolean;
    notify5h: boolean;
    notify2h: boolean;
    whatsappDirect?: boolean;
  };
  medications: {
    enabled: boolean;
    allowSnooze: boolean;
    snoozeMinutes: number;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationItem {
  id: string;
  patientId: string;
  type:
    | 'APPOINTMENT_24H'
    | 'APPOINTMENT_12H'
    | 'APPOINTMENT_5H'
    | 'APPOINTMENT_2H'
    | 'MEDICATION_REMINDER'
    | 'GENERAL';
  channel: NotificationChannel;
  title: string;
  message: string;
  targetId?: string;
  whatsAppUrl?: string;
  read: boolean;
  createdAt: string;
}
