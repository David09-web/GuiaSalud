import { dbPool } from '../config/database';
import { Appointment, AppointmentStatus } from '../types';

// ============================================================================
// AGENDASERVICE - Módulo 1: Agenda Médica (Registro, Estados e Historial)
// Responsable Backend: David Marcet Ospina
// Responsable Frontend: Francisco Trujillo Peralta
// ============================================================================

// Interfaz para creación de cita (acepta nombres en español o inglés)
export interface CreateAppointmentInput {
  patientId: string;
  specialty?: string;
  especialidad?: string;
  doctor?: string;
  medico?: string;
  center?: string;
  institucion?: string;
  centro?: string;
  date?: string;
  fecha?: string;
  time?: string;
  hora?: string;
  notes?: string;
  observaciones?: string;
  status?: AppointmentStatus;
  estado?: AppointmentStatus;
}

export interface UpdateAppointmentInput {
  specialty?: string;
  especialidad?: string;
  doctor?: string;
  medico?: string;
  center?: string;
  institucion?: string;
  centro?: string;
  date?: string;
  fecha?: string;
  time?: string;
  hora?: string;
  notes?: string;
  observaciones?: string;
  status?: AppointmentStatus;
  estado?: AppointmentStatus;
}

// Normalizador de estados
export function normalizeStatus(status?: string): AppointmentStatus {
  if (!status) return 'pendiente';
  const s = status.toLowerCase().trim();
  if (s === 'done' || s === 'realizada') return 'realizada';
  if (s === 'cancelled' || s === 'cancelada') return 'cancelada';
  return 'pendiente';
}

export class AgendaService {
  // Almacén en memoria como respaldo cuando PostgreSQL está desconectado
  private static fallbackAppointments: Appointment[] = [
    {
      id: 'apt-001',
      patientId: 'usr-001',
      date: '2026-10-15',
      time: '09:30',
      specialty: 'Medicina General',
      doctor: 'Dr. Andrés Morales',
      center: 'Centro Médico El Bosque - Consultorio 304',
      status: 'pendiente',
      notes: 'Control semestral de presión arterial. Llevar bitácora de tomas.',
      isDeleted: false,
      deletedAt: null,
      createdAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'apt-002',
      patientId: 'usr-001',
      date: '2026-10-22',
      time: '14:00',
      specialty: 'Cardiología',
      doctor: 'Dra. Claudia Vega',
      center: 'Clínica del Norte - Piso 4',
      status: 'pendiente',
      notes: 'Revisión de electrocardiograma y ajuste de dosis de Enalapril.',
      isDeleted: false,
      deletedAt: null,
      createdAt: '2026-09-05T14:30:00Z',
    },
    {
      id: 'apt-003',
      patientId: 'usr-001',
      date: '2026-09-25',
      time: '07:15',
      specialty: 'Laboratorio Clínico',
      doctor: 'Lic. Sandra Pérez',
      center: 'Sede Calle 45 - Laboratorio Central',
      status: 'realizada',
      notes: 'Perfil lipídico y glucosa en ayunas (12 horas de ayuno).',
      isDeleted: false,
      deletedAt: null,
      createdAt: '2026-09-20T08:00:00Z',
    },
    {
      id: 'apt-004',
      patientId: 'usr-001',
      date: '2026-08-18',
      time: '11:00',
      specialty: 'Oftalmología',
      doctor: 'Dr. Roberto Gómez',
      center: 'Centro Oftalmológico Láser',
      status: 'cancelada',
      notes: 'Cancelada por reprogramación de viaje del paciente.',
      isDeleted: false,
      deletedAt: null,
      createdAt: '2026-08-10T09:00:00Z',
    },
    // Semillas para usuario demo María Rodríguez
    {
      id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
      patientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date: '2026-10-15',
      time: '09:30',
      specialty: 'Medicina General',
      doctor: 'Dr. Andrés Morales',
      center: 'Centro Médico El Bosque - Consultorio 304',
      status: 'pendiente',
      notes: 'Control semestral de presión arterial. Llevar bitácora de tomas.',
      isDeleted: false,
      deletedAt: null,
      createdAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55',
      patientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date: '2026-10-22',
      time: '14:00',
      specialty: 'Cardiología',
      doctor: 'Dra. Claudia Vega',
      center: 'Clínica del Norte - Piso 4',
      status: 'pendiente',
      notes: 'Revisión de electrocardiograma y ajuste de dosis de Enalapril.',
      isDeleted: false,
      deletedAt: null,
      createdAt: '2026-09-05T14:30:00Z',
    },
    {
      id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380f66',
      patientId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date: '2026-09-25',
      time: '07:15',
      specialty: 'Laboratorio Clínico',
      doctor: 'Lic. Sandra Pérez',
      center: 'Sede Calle 45 - Laboratorio Central',
      status: 'realizada',
      notes: 'Perfil lipídico y glucosa en ayunas (12 horas de ayuno).',
      isDeleted: false,
      deletedAt: null,
      createdAt: '2026-09-20T08:00:00Z',
    },
  ];

  /**
   * Obtiene la lista de citas de un paciente.
   * Permite filtrar por estado (pendiente, realizada, cancelada).
   * Mantiene el historial clínico completo.
   */
  public static async getAppointments(
    patientId: string,
    statusFilter?: string
  ): Promise<Appointment[]> {
    try {
      let query = `
        SELECT 
          id, 
          patient_id as "patientId", 
          to_char(date, 'YYYY-MM-DD') as date, 
          time, 
          specialty, 
          doctor, 
          center, 
          status, 
          notes, 
          is_deleted as "isDeleted", 
          deleted_at as "deletedAt", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM citas_medicas
        WHERE patient_id = $1
      `;
      const params: any[] = [patientId];

      if (statusFilter && statusFilter !== 'all') {
        const norm = normalizeStatus(statusFilter);
        query += ` AND (status = $2 OR (status = 'pending' AND $2 = 'pendiente') OR (status = 'done' AND $2 = 'realizada') OR (status = 'cancelled' AND $2 = 'cancelada'))`;
        params.push(norm);
      }

      query += ` ORDER BY date ASC, time ASC`;

      const res = await dbPool.query(query, params);
      return res.rows.map((row) => ({
        ...row,
        status: normalizeStatus(row.status),
      }));
    } catch {
      // Fallback en memoria si la BD no está disponible
      let list = this.fallbackAppointments.filter(
        (a) => a.patientId === patientId || patientId === 'usr-001'
      );

      if (statusFilter && statusFilter !== 'all') {
        const norm = normalizeStatus(statusFilter);
        list = list.filter((a) => normalizeStatus(a.status) === norm);
      }

      return list.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    }
  }

  /**
   * Obtiene una cita por su ID.
   */
  public static async getAppointmentById(id: string, patientId?: string): Promise<Appointment | null> {
    try {
      let query = `
        SELECT 
          id, 
          patient_id as "patientId", 
          to_char(date, 'YYYY-MM-DD') as date, 
          time, 
          specialty, 
          doctor, 
          center, 
          status, 
          notes, 
          is_deleted as "isDeleted", 
          deleted_at as "deletedAt", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM citas_medicas
        WHERE id = $1
      `;
      const params: any[] = [id];
      if (patientId) {
        query += ` AND patient_id = $2`;
        params.push(patientId);
      }

      const res = await dbPool.query(query, params);
      if (res.rows.length === 0) return null;
      return {
        ...res.rows[0],
        status: normalizeStatus(res.rows[0].status),
      };
    } catch {
      const apt = this.fallbackAppointments.find(
        (a) => a.id === id && (!patientId || a.patientId === patientId || a.patientId === 'usr-001')
      );
      return apt || null;
    }
  }

  /**
   * Crea una nueva cita médica vinculada al ID del usuario autenticado.
   * Valida especialidad, médico, institución/IPS, fecha y hora.
   */
  public static async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    const specialty = input.specialty || input.especialidad;
    const doctor = input.doctor || input.medico;
    const center = input.center || input.institucion || input.centro;
    const date = input.date || input.fecha;
    const time = input.time || input.hora;
    const notes = input.notes || input.observaciones || '';
    const status = normalizeStatus(input.status || input.estado || 'pendiente');

    if (!specialty || !doctor || !center || !date || !time) {
      throw new Error('Todos los campos requeridos deben ser proporcionados: especialidad, médico, institución/IPS, fecha y hora.');
    }

    try {
      const query = `
        INSERT INTO citas_medicas (
          patient_id, specialty, doctor, center, date, time, notes, status, is_deleted
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
        RETURNING 
          id, 
          patient_id as "patientId", 
          to_char(date, 'YYYY-MM-DD') as date, 
          time, 
          specialty, 
          doctor, 
          center, 
          status, 
          notes, 
          is_deleted as "isDeleted", 
          deleted_at as "deletedAt", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
      const res = await dbPool.query(query, [
        input.patientId,
        specialty,
        doctor,
        center,
        date,
        time,
        notes,
        status,
      ]);

      return {
        ...res.rows[0],
        status: normalizeStatus(res.rows[0].status),
      };
    } catch {
      // Fallback en memoria
      const newApt: Appointment = {
        id: `apt-${Date.now().toString().slice(-6)}`,
        patientId: input.patientId,
        specialty,
        doctor,
        center,
        date,
        time,
        notes,
        status,
        isDeleted: false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.fallbackAppointments.unshift(newApt);
      return newApt;
    }
  }

  /**
   * Actualiza datos o estado de la cita (PUT /api/citas/:id).
   * Respeta la integridad histórica.
   */
  public static async updateAppointment(
    id: string,
    patientId: string,
    input: UpdateAppointmentInput
  ): Promise<Appointment> {
    const existing = await this.getAppointmentById(id, patientId);
    if (!existing) {
      throw new Error(`Cita médica con ID ${id} no encontrada o sin acceso.`);
    }

    const specialty = input.specialty || input.especialidad || existing.specialty;
    const doctor = input.doctor || input.medico || existing.doctor;
    const center = input.center || input.institucion || input.centro || existing.center;
    const date = input.date || input.fecha || existing.date;
    const time = input.time || input.hora || existing.time;
    const notes = input.notes !== undefined ? input.notes : (input.observaciones !== undefined ? input.observaciones : existing.notes);
    const status = input.status || input.estado ? normalizeStatus(input.status || input.estado) : existing.status;

    try {
      const query = `
        UPDATE citas_medicas
        SET 
          specialty = $1, 
          doctor = $2, 
          center = $3, 
          date = $4, 
          time = $5, 
          notes = $6, 
          status = $7,
          updated_at = NOW()
        WHERE id = $8 AND patient_id = $9
        RETURNING 
          id, 
          patient_id as "patientId", 
          to_char(date, 'YYYY-MM-DD') as date, 
          time, 
          specialty, 
          doctor, 
          center, 
          status, 
          notes, 
          is_deleted as "isDeleted", 
          deleted_at as "deletedAt", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;
      const res = await dbPool.query(query, [
        specialty,
        doctor,
        center,
        date,
        time,
        notes,
        status,
        id,
        patientId,
      ]);

      return {
        ...res.rows[0],
        status: normalizeStatus(res.rows[0].status),
      };
    } catch {
      const apt = this.fallbackAppointments.find((a) => a.id === id);
      if (!apt) throw new Error('Cita médica no encontrada en memoria.');
      apt.specialty = specialty;
      apt.doctor = doctor;
      apt.center = center;
      apt.date = date;
      apt.time = time;
      apt.notes = notes;
      apt.status = status;
      apt.updatedAt = new Date().toISOString();
      return apt;
    }
  }

  /**
   * Actualiza únicamente el estado de la cita (pendiente, realizada, cancelada).
   */
  public static async updateStatus(
    id: string,
    statusRaw: string,
    patientId?: string
  ): Promise<Appointment> {
    const status = normalizeStatus(statusRaw);

    try {
      let query = `
        UPDATE citas_medicas
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `;
      const params: any[] = [status, id];
      if (patientId) {
        query += ` AND patient_id = $3`;
        params.push(patientId);
      }
      query += `
        RETURNING 
          id, 
          patient_id as "patientId", 
          to_char(date, 'YYYY-MM-DD') as date, 
          time, 
          specialty, 
          doctor, 
          center, 
          status, 
          notes, 
          is_deleted as "isDeleted", 
          deleted_at as "deletedAt", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;

      const res = await dbPool.query(query, params);
      if (res.rows.length === 0) {
        throw new Error('Cita médica no encontrada.');
      }
      return {
        ...res.rows[0],
        status: normalizeStatus(res.rows[0].status),
      };
    } catch {
      const apt = this.fallbackAppointments.find((a) => a.id === id);
      if (!apt) throw new Error('Cita médica no encontrada');
      apt.status = status;
      apt.updatedAt = new Date().toISOString();
      return apt;
    }
  }

  /**
   * BORRADO LÓGICO (Soft Delete):
   * Regla crítica del proyecto: "garantizando que los registros no se eliminen físicamente de PostgreSQL
   * para mantener el historial clínico y los logs de auditoría".
   */
  public static async softDelete(id: string, patientId?: string): Promise<Appointment> {
    try {
      let query = `
        UPDATE citas_medicas
        SET 
          status = 'cancelada', 
          is_deleted = true, 
          deleted_at = NOW(), 
          updated_at = NOW()
        WHERE id = $1
      `;
      const params: any[] = [id];
      if (patientId) {
        query += ` AND patient_id = $2`;
        params.push(patientId);
      }
      query += `
        RETURNING 
          id, 
          patient_id as "patientId", 
          to_char(date, 'YYYY-MM-DD') as date, 
          time, 
          specialty, 
          doctor, 
          center, 
          status, 
          notes, 
          is_deleted as "isDeleted", 
          deleted_at as "deletedAt", 
          created_at as "createdAt", 
          updated_at as "updatedAt"
      `;

      const res = await dbPool.query(query, params);
      if (res.rows.length === 0) {
        throw new Error('Cita médica no encontrada para cancelación.');
      }
      return {
        ...res.rows[0],
        status: normalizeStatus(res.rows[0].status),
      };
    } catch {
      const apt = this.fallbackAppointments.find((a) => a.id === id);
      if (!apt) throw new Error('Cita médica no encontrada.');
      apt.status = 'cancelada';
      apt.isDeleted = true;
      apt.deletedAt = new Date().toISOString();
      apt.updatedAt = new Date().toISOString();
      return apt;
    }
  }
}
