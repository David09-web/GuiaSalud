import { NotificationPreferences, NotificationItem, NotificationChannel } from '../types';
import { AgendaService } from './agendaService';
import { MedicationService } from './medicationService';

export class NotificationService {
  // Preferencias en memoria por paciente con valores por defecto
  private static userPreferences: Map<string, NotificationPreferences> = new Map();

  // Historial de notificaciones en el buzón interno
  private static notifications: NotificationItem[] = [
    {
      id: 'notif-demo-01',
      patientId: 'usr-001',
      type: 'APPOINTMENT_24H',
      channel: 'web',
      title: 'Recordatorio de Cita Médica (24h antes)',
      message: 'Mañana a las 09:30 a. m. tiene cita de Medicina General con el Dr. Andrés Morales en Centro Médico El Bosque.',
      targetId: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'notif-demo-02',
      patientId: 'usr-001',
      type: 'MEDICATION_REMINDER',
      channel: 'push',
      title: 'Hora de su medicamento: Enalapril',
      message: 'Dosis programada: 10 mg (Cada 12 horas). Recuerde marcar su toma para mantener su adherencia posológica.',
      targetId: 'med-001',
      read: true,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ];

  // Registro de despachos para evitar duplicidad en la ventana temporal
  private static dispatchedRegistry: Set<string> = new Set();

  /**
   * Obtiene o inicializa las preferencias de notificación de un paciente
   */
  public static getPreferences(patientId: string): NotificationPreferences {
    if (!this.userPreferences.has(patientId)) {
      this.userPreferences.set(patientId, {
        patientId,
        channels: {
          web: true,
          push: true,
          email: true,
          whatsapp: true,
        },
        appointments: {
          notify24h: true,
          notify12h: true,
          notify5h: true,
          notify2h: true,
          whatsappDirect: true,
        },
        medications: {
          enabled: true,
          allowSnooze: true,
          snoozeMinutes: 15,
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '06:00',
        },
      });
    }
    return this.userPreferences.get(patientId)!;
  }

  /**
   * Actualiza las preferencias de notificación del paciente
   */
  public static updatePreferences(
    patientId: string,
    updates: Partial<Omit<NotificationPreferences, 'patientId'>>
  ): NotificationPreferences {
    const current = this.getPreferences(patientId);
    const updated: NotificationPreferences = {
      ...current,
      ...updates,
      channels: { ...current.channels, ...updates.channels },
      appointments: { ...current.appointments, ...updates.appointments },
      medications: { ...current.medications, ...updates.medications },
      quietHours: { ...current.quietHours, ...updates.quietHours },
    };
    this.userPreferences.set(patientId, updated);
    return updated;
  }

  /**
   * Consulta las notificaciones del paciente
   */
  public static getNotifications(patientId: string): { data: NotificationItem[]; unreadCount: number } {
    const list = this.notifications.filter((n) => n.patientId === patientId);
    const unreadCount = list.filter((n) => !n.read).length;
    return { data: list, unreadCount };
  }

  /**
   * Marca una notificación como leída
   */
  public static markAsRead(notificationId: string): boolean {
    const notif = this.notifications.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  /**
   * Envía un mensaje a través del canal especificado respetando las preferencias
   */
  public static async dispatchNotification(
    patientId: string,
    type: NotificationItem['type'],
    channel: NotificationChannel,
    title: string,
    message: string,
    targetId?: string,
    whatsAppUrl?: string
  ): Promise<NotificationItem | null> {
    const prefs = this.getPreferences(patientId);

    // Verificar si el canal está activo en las preferencias
    if (!prefs.channels[channel]) {
      return null;
    }

    const item: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      patientId,
      type,
      channel,
      title,
      message,
      targetId,
      whatsAppUrl,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(item);

    // Log estructurado simulando el despacho a servicios de correo, push o WhatsApp
    console.log(`[MULTICHANNEL DISPATCH] Canal: ${channel.toUpperCase()} | Destino: ${patientId} | Asunto: ${title}`);

    return item;
  }

  /**
   * BACKGROUND WORKER:
   * Sondea citas agendadas y medicamentos programados para enviar avisos preventivos a 24h, 12h, 5h y 2h
   */
  public static async scanAndDispatchReminders(): Promise<{ appointmentsNotified: number; medicationsNotified: number }> {
    let appointmentsCount = 0;
    let medicationsCount = 0;

    const now = new Date();
    const currentMs = now.getTime();

    // 1. Escaneo de citas médicas
    const appointments = await AgendaService.getAppointments('usr-001');

    for (const app of appointments) {
      if (app.status !== 'pendiente' && app.status !== 'pending') continue;

      const appDateTime = new Date(`${app.date}T${app.time}:00`);
      const diffMs = appDateTime.getTime() - currentMs;
      const diffHours = diffMs / (1000 * 60 * 60);

      // Claves de registro único
      const key24h = `${app.id}_24h`;
      const key12h = `${app.id}_12h`;
      const key5h = `${app.id}_5h`;
      const key2h = `${app.id}_2h`;

      // Ventana de 1 día antes / 24 horas (entre 22h y 26h)
      if (diffHours >= 22 && diffHours <= 26 && !this.dispatchedRegistry.has(key24h)) {
        this.dispatchedRegistry.add(key24h);
        await this.dispatchNotification(
          app.patientId,
          'APPOINTMENT_24H',
          'web',
          'Aviso previo (1 día antes): Cita médica en 24 horas',
          `Le recordamos su cita de ${app.specialty} con ${app.doctor} programada para mañana a las ${app.time} en ${app.center}.`,
          app.id
        );
        await this.dispatchNotification(
          app.patientId,
          'APPOINTMENT_24H',
          'email',
          `[GuiaSalud] Aviso 24h: Cita médica de ${app.specialty}`,
          `Estimado paciente, le recordamos su cita con ${app.doctor} mañana a las ${app.time}.`,
          app.id
        );
        appointmentsCount++;
      }

      // Ventana de 12 horas antes (entre 11h y 13h)
      if (diffHours >= 11 && diffHours <= 13 && !this.dispatchedRegistry.has(key12h)) {
        this.dispatchedRegistry.add(key12h);
        await this.dispatchNotification(
          app.patientId,
          'APPOINTMENT_12H',
          'web',
          'Aviso previo (12 horas antes): Cita médica próxima',
          `Faltan 12 horas para su consulta médica de ${app.specialty} con ${app.doctor} a las ${app.time}. Prepare autorizaciones y documentos.`,
          app.id
        );
        appointmentsCount++;
      }

      // Ventana de 5 horas antes (entre 4.5h y 5.5h)
      if (diffHours >= 4.5 && diffHours <= 5.5 && !this.dispatchedRegistry.has(key5h)) {
        this.dispatchedRegistry.add(key5h);
        await this.dispatchNotification(
          app.patientId,
          'APPOINTMENT_5H',
          'push',
          'Recordatorio prioritario (5 horas antes): Cita médica',
          `En 5 horas tiene consulta de ${app.specialty} en ${app.center} (${app.time}). Planifique su transporte para llegar puntual.`,
          app.id
        );
        appointmentsCount++;
      }

      // Ventana de 2 horas (entre 1h y 3h)
      if (diffHours >= 1 && diffHours <= 3 && !this.dispatchedRegistry.has(key2h)) {
        this.dispatchedRegistry.add(key2h);
        await this.dispatchNotification(
          app.patientId,
          'APPOINTMENT_2H',
          'push',
          '¡Atención! Cita médica en 2 horas',
          `Su consulta de ${app.specialty} inicia a las ${app.time} en ${app.center}. Por favor preséntese 15 minutos antes.`,
          app.id
        );
        appointmentsCount++;
      }
    }

    // 2. Escaneo de medicamentos pendientes del día
    const medications = await MedicationService.getMedications('usr-001');
    for (const med of medications) {
      if (med.takenToday === 'pending') {
        const medKey = `${med.id}_${now.toISOString().split('T')[0]}`;
        if (!this.dispatchedRegistry.has(medKey)) {
          this.dispatchedRegistry.add(medKey);
          await this.dispatchNotification(
            med.patientId,
            'MEDICATION_REMINDER',
            'push',
            `Hora de toma: ${med.name}`,
            `Dosis: ${med.dose} (${med.frequency}). Prescrito por: ${med.prescribedBy}.`,
            med.id
          );
          medicationsCount++;
        }
      }
    }

    return { appointmentsNotified: appointmentsCount, medicationsNotified: medicationsCount };
  }
}
