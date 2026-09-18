import { Appointment } from '../types';

export class AgendaService {
  private static appointments: Appointment[] = [
    {
      id: 'apt-001',
      patientId: 'usr-001',
      date: '2026-09-04',
      time: '09:30',
      specialty: 'Medicina General',
      doctor: 'Dr. Andrés Morales',
      center: 'Centro Médico El Bosque',
      status: 'pending',
      notes: 'Control semestral de presión arterial.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'apt-002',
      patientId: 'usr-001',
      date: '2026-09-10',
      time: '14:00',
      specialty: 'Cardiología',
      doctor: 'Dra. Claudia Vega',
      center: 'Clínica del Norte',
      status: 'pending',
      notes: 'Revisión de electrocardiograma y ajuste de dosis.',
      createdAt: new Date().toISOString(),
    },
  ];

  public static async getAppointments(patientId: string, status?: string): Promise<Appointment[]> {
    let result = this.appointments.filter((a) => a.patientId === patientId);
    if (status && status !== 'all') {
      result = result.filter((a) => a.status === status);
    }
    return result;
  }

  public static async createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    this.appointments.unshift(newAppointment);
    return newAppointment;
  }

  public static async updateStatus(id: string, status: 'pending' | 'done' | 'cancelled'): Promise<Appointment> {
    const apt = this.appointments.find((a) => a.id === id);
    if (!apt) throw new Error('Cita médica no encontrada');
    apt.status = status;
    return apt;
  }
}
