import { Medication, MedicationDoseLog } from '../types';

export class MedicationService {
  private static medications: Medication[] = [
    {
      id: 'med-001',
      patientId: 'usr-001',
      name: 'Enalapril',
      dose: '10 mg',
      frequency: 'Cada 12 horas',
      durationDays: 90,
      daysElapsed: 76,
      takenToday: 'taken',
      prescribedBy: 'Dr. Andrés Morales',
    },
    {
      id: 'med-002',
      patientId: 'usr-001',
      name: 'Metformina',
      dose: '850 mg',
      frequency: 'Con el desayuno',
      durationDays: 60,
      daysElapsed: 45,
      takenToday: 'pending',
      prescribedBy: 'Dra. Claudia Vega',
    },
    {
      id: 'med-003',
      patientId: 'usr-001',
      name: 'Atorvastatina',
      dose: '20 mg',
      frequency: 'En la noche',
      durationDays: 30,
      daysElapsed: 28,
      takenToday: 'pending',
      prescribedBy: 'Dr. Andrés Morales',
    },
  ];

  private static doseLogs: MedicationDoseLog[] = [];

  public static async getMedications(patientId: string): Promise<Medication[]> {
    return this.medications.filter((m) => m.patientId === patientId);
  }

  public static async registerDose(medicationId: string, status: 'taken' | 'skipped', takenAt?: string): Promise<MedicationDoseLog> {
    const med = this.medications.find((m) => m.id === medicationId);
    if (!med) throw new Error('Medicamento no encontrado');

    med.takenToday = status;

    const log: MedicationDoseLog = {
      id: `log-${Date.now()}`,
      medicationId,
      status,
      takenAt: takenAt || new Date().toISOString(),
    };

    this.doseLogs.push(log);
    return log;
  }
}
