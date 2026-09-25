import { dbPool } from '../config/database';
import {
  UpdateProfileInput,
  UpdateAffiliationInput,
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
} from '../config/validators';

// ============================================================================
// PROFILE SERVICE - Gestión CRUD del Perfil del Usuario (Módulo 4)
// Responsables: Francisco Trujillo Peralta (Frontend), Juan Camilo Ramírez (Frontend),
//               David Marcet Ospina (Backend)
// ============================================================================

// Interfaz completa de perfil (respuesta de API)
export interface FullProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  dataConsentGranted: boolean;
  dataConsentDate: string | null;
  profile: {
    firstName: string;
    lastName: string;
    idType: string;
    idNumber: string;
    birthDate: string;
    gender: string;
    address: string;
    city: string;
    department: string;
    phone: string;
    bloodType: string;
    allergies: string[];
    conditions: string[];
    surgeries: string[];
  };
  affiliation: {
    epsName: string;
    epsRegime: string;
    ipsName: string;
    affiliationStatus: string;
  };
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string | null;
  isPrimary: boolean;
}

// Fallback en memoria para cuando PostgreSQL no está disponible
const FALLBACK_PROFILES: Record<string, any> = {
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': {
    firstName: 'María',
    lastName: 'Rodríguez',
    idType: 'CC',
    idNumber: '1.024.567.890',
    birthDate: '1988-03-15',
    gender: 'Femenino',
    address: 'Calle 45 # 23-67',
    city: 'Bogotá D.C.',
    department: 'Cundinamarca',
    phone: '+57 320 456 7890',
    bloodType: 'O+',
    epsName: 'Sanitas EPS',
    epsRegime: 'Contributivo',
    ipsName: 'Centro Médico El Bosque',
    affiliationStatus: 'Activo',
    allergies: ['Penicilina (Anafilaxia leve)', 'Aspirina / AINEs', 'Látex'],
    conditions: ['Hipertensión arterial esencial (I10 - Controlada)', 'Diabetes mellitus tipo 2 (E11.9 - En manejo farmacológico)'],
    surgeries: ['Apendicectomía por laparoscopia (2018)', 'Cesárea electiva (2015)'],
  },
};

const FALLBACK_EMERGENCY: Record<string, EmergencyContact[]> = {
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11': [
    {
      id: 'ec-001',
      name: 'Carlos Rodríguez',
      relation: 'Hermano (Cuidador principal)',
      phone: '+57 310 234 5678',
      email: null,
      isPrimary: true,
    },
  ],
};

export class ProfileService {
  // =========================================================================
  // Helpers
  // =========================================================================
  private static async isDbAvailable(): Promise<boolean> {
    try {
      await dbPool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  // =========================================================================
  // LEER PERFIL COMPLETO (READ)
  // =========================================================================
  public static async getFullProfile(userId: string): Promise<FullProfile> {
    if (await this.isDbAvailable()) {
      // Datos del usuario base
      const userResult = await dbPool.query(
        `SELECT id, name, email, role, two_factor_enabled, data_consent_granted, data_consent_date
         FROM users WHERE id = $1 AND is_active = true`,
        [userId]
      );
      if (userResult.rows.length === 0) throw new Error('Usuario no encontrado.');
      const user = userResult.rows[0];

      // Datos del perfil
      const profileResult = await dbPool.query(
        `SELECT first_name, last_name, id_type, id_number, birth_date, gender,
                address, city, department, phone, blood_type,
                eps_name, eps_regime, ips_name, affiliation_status,
                allergies, conditions, surgeries
         FROM user_profiles WHERE user_id = $1`,
        [userId]
      );
      const profile = profileResult.rows[0] || {};

      // Contactos de emergencia
      const ecResult = await dbPool.query(
        `SELECT id, name, relation, phone, email, is_primary
         FROM emergency_contacts WHERE user_id = $1 ORDER BY is_primary DESC, created_at ASC`,
        [userId]
      );

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.two_factor_enabled,
        dataConsentGranted: user.data_consent_granted,
        dataConsentDate: user.data_consent_date,
        profile: {
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          idType: profile.id_type || 'CC',
          idNumber: profile.id_number || '',
          birthDate: profile.birth_date || '',
          gender: profile.gender || '',
          address: profile.address || '',
          city: profile.city || '',
          department: profile.department || '',
          phone: profile.phone || '',
          bloodType: profile.blood_type || '',
          allergies: profile.allergies || [],
          conditions: profile.conditions || [],
          surgeries: profile.surgeries || [],
        },
        affiliation: {
          epsName: profile.eps_name || '',
          epsRegime: profile.eps_regime || 'Contributivo',
          ipsName: profile.ips_name || '',
          affiliationStatus: profile.affiliation_status || 'Activo',
        },
        emergencyContacts: ecResult.rows.map((ec: any) => ({
          id: ec.id,
          name: ec.name,
          relation: ec.relation,
          phone: ec.phone,
          email: ec.email,
          isPrimary: ec.is_primary,
        })),
      };
    }

    // Fallback en memoria
    const fallbackProfile = FALLBACK_PROFILES[userId] || {};
    const fallbackEmergency = FALLBACK_EMERGENCY[userId] || [];

    return {
      userId,
      name: fallbackProfile.firstName ? `${fallbackProfile.firstName} ${fallbackProfile.lastName}` : 'Usuario',
      email: 'maria.rodriguez@gmail.com',
      role: 'PATIENT',
      twoFactorEnabled: true,
      dataConsentGranted: true,
      dataConsentDate: '2026-08-28T09:15:00Z',
      profile: {
        firstName: fallbackProfile.firstName || '',
        lastName: fallbackProfile.lastName || '',
        idType: fallbackProfile.idType || 'CC',
        idNumber: fallbackProfile.idNumber || '',
        birthDate: fallbackProfile.birthDate || '',
        gender: fallbackProfile.gender || '',
        address: fallbackProfile.address || '',
        city: fallbackProfile.city || '',
        department: fallbackProfile.department || '',
        phone: fallbackProfile.phone || '',
        bloodType: fallbackProfile.bloodType || '',
        allergies: fallbackProfile.allergies || [],
        conditions: fallbackProfile.conditions || [],
        surgeries: fallbackProfile.surgeries || [],
      },
      affiliation: {
        epsName: fallbackProfile.epsName || '',
        epsRegime: fallbackProfile.epsRegime || 'Contributivo',
        ipsName: fallbackProfile.ipsName || '',
        affiliationStatus: fallbackProfile.affiliationStatus || 'Activo',
      },
      emergencyContacts: fallbackEmergency,
    };
  }

  // =========================================================================
  // ACTUALIZAR DATOS PERSONALES (UPDATE)
  // =========================================================================
  public static async updateProfile(userId: string, data: UpdateProfileInput): Promise<{ success: boolean; message: string }> {
    if (await this.isDbAvailable()) {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fieldMap: Record<string, string> = {
        firstName: 'first_name',
        lastName: 'last_name',
        idType: 'id_type',
        idNumber: 'id_number',
        birthDate: 'birth_date',
        gender: 'gender',
        address: 'address',
        city: 'city',
        department: 'department',
        phone: 'phone',
        bloodType: 'blood_type',
        allergies: 'allergies',
        conditions: 'conditions',
        surgeries: 'surgeries',
      };

      for (const [key, dbCol] of Object.entries(fieldMap)) {
        if ((data as any)[key] !== undefined) {
          fields.push(`${dbCol} = $${paramIndex}`);
          values.push((data as any)[key]);
          paramIndex++;
        }
      }

      if (fields.length === 0) {
        return { success: false, message: 'No se proporcionaron campos para actualizar.' };
      }

      values.push(userId);
      await dbPool.query(
        `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = $${paramIndex}`,
        values
      );
    } else {
      // Fallback: actualizar en memoria
      if (!FALLBACK_PROFILES[userId]) FALLBACK_PROFILES[userId] = {};
      Object.assign(FALLBACK_PROFILES[userId], data);
    }

    return { success: true, message: 'Datos personales actualizados correctamente.' };
  }

  // =========================================================================
  // ACTUALIZAR AFILIACIÓN EPS/IPS (UPDATE)
  // =========================================================================
  public static async updateAffiliation(userId: string, data: UpdateAffiliationInput): Promise<{ success: boolean; message: string }> {
    if (await this.isDbAvailable()) {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fieldMap: Record<string, string> = {
        epsName: 'eps_name',
        epsRegime: 'eps_regime',
        ipsName: 'ips_name',
        affiliationStatus: 'affiliation_status',
      };

      for (const [key, dbCol] of Object.entries(fieldMap)) {
        if ((data as any)[key] !== undefined) {
          fields.push(`${dbCol} = $${paramIndex}`);
          values.push((data as any)[key]);
          paramIndex++;
        }
      }

      if (fields.length === 0) {
        return { success: false, message: 'No se proporcionaron campos de afiliación.' };
      }

      values.push(userId);
      await dbPool.query(
        `UPDATE user_profiles SET ${fields.join(', ')} WHERE user_id = $${paramIndex}`,
        values
      );
    } else {
      if (!FALLBACK_PROFILES[userId]) FALLBACK_PROFILES[userId] = {};
      Object.assign(FALLBACK_PROFILES[userId], data);
    }

    return { success: true, message: 'Datos de afiliación EPS/IPS actualizados correctamente.' };
  }

  // =========================================================================
  // CREAR CONTACTO DE EMERGENCIA (CREATE)
  // =========================================================================
  public static async createEmergencyContact(
    userId: string,
    data: CreateEmergencyContactInput
  ): Promise<EmergencyContact> {
    if (await this.isDbAvailable()) {
      // Si es primario, desmarcar otros
      if (data.isPrimary) {
        await dbPool.query(
          'UPDATE emergency_contacts SET is_primary = false WHERE user_id = $1',
          [userId]
        );
      }

      const result = await dbPool.query(
        `INSERT INTO emergency_contacts (user_id, name, relation, phone, email, is_primary)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, relation, phone, email, is_primary`,
        [userId, data.name, data.relation, data.phone, data.email || null, data.isPrimary]
      );

      const ec = result.rows[0];
      return {
        id: ec.id,
        name: ec.name,
        relation: ec.relation,
        phone: ec.phone,
        email: ec.email,
        isPrimary: ec.is_primary,
      };
    }

    // Fallback
    const newContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: data.name,
      relation: data.relation,
      phone: data.phone,
      email: data.email || null,
      isPrimary: data.isPrimary,
    };

    if (!FALLBACK_EMERGENCY[userId]) FALLBACK_EMERGENCY[userId] = [];
    if (data.isPrimary) {
      FALLBACK_EMERGENCY[userId].forEach((c) => (c.isPrimary = false));
    }
    FALLBACK_EMERGENCY[userId].push(newContact);

    return newContact;
  }

  // =========================================================================
  // ACTUALIZAR CONTACTO DE EMERGENCIA (UPDATE)
  // =========================================================================
  public static async updateEmergencyContact(
    userId: string,
    contactId: string,
    data: UpdateEmergencyContactInput
  ): Promise<{ success: boolean; message: string }> {
    if (await this.isDbAvailable()) {
      // Verificar que pertenezca al usuario
      const existing = await dbPool.query(
        'SELECT id FROM emergency_contacts WHERE id = $1 AND user_id = $2',
        [contactId, userId]
      );
      if (existing.rows.length === 0) throw new Error('Contacto de emergencia no encontrado.');

      if (data.isPrimary) {
        await dbPool.query(
          'UPDATE emergency_contacts SET is_primary = false WHERE user_id = $1',
          [userId]
        );
      }

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fieldMap: Record<string, string> = {
        name: 'name',
        relation: 'relation',
        phone: 'phone',
        email: 'email',
        isPrimary: 'is_primary',
      };

      for (const [key, dbCol] of Object.entries(fieldMap)) {
        if ((data as any)[key] !== undefined) {
          fields.push(`${dbCol} = $${paramIndex}`);
          values.push((data as any)[key]);
          paramIndex++;
        }
      }

      if (fields.length > 0) {
        values.push(contactId);
        await dbPool.query(
          `UPDATE emergency_contacts SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
          values
        );
      }
    } else {
      const contacts = FALLBACK_EMERGENCY[userId] || [];
      const idx = contacts.findIndex((c) => c.id === contactId);
      if (idx === -1) throw new Error('Contacto de emergencia no encontrado.');
      if (data.isPrimary) contacts.forEach((c) => (c.isPrimary = false));
      Object.assign(contacts[idx], data);
    }

    return { success: true, message: 'Contacto de emergencia actualizado.' };
  }

  // =========================================================================
  // ELIMINAR CONTACTO DE EMERGENCIA (DELETE)
  // =========================================================================
  public static async deleteEmergencyContact(userId: string, contactId: string): Promise<{ success: boolean; message: string }> {
    if (await this.isDbAvailable()) {
      const result = await dbPool.query(
        'DELETE FROM emergency_contacts WHERE id = $1 AND user_id = $2 RETURNING id',
        [contactId, userId]
      );
      if (result.rows.length === 0) throw new Error('Contacto de emergencia no encontrado.');
    } else {
      const contacts = FALLBACK_EMERGENCY[userId] || [];
      const idx = contacts.findIndex((c) => c.id === contactId);
      if (idx === -1) throw new Error('Contacto de emergencia no encontrado.');
      contacts.splice(idx, 1);
    }

    return { success: true, message: 'Contacto de emergencia eliminado.' };
  }

  // =========================================================================
  // REVOCAR CONSENTIMIENTO HABEAS DATA (Ley 1581/2012)
  // =========================================================================
  public static async revokeConsent(userId: string): Promise<{ success: boolean; message: string }> {
    if (await this.isDbAvailable()) {
      await dbPool.query(
        'UPDATE users SET data_consent_granted = false, data_consent_date = NOW() WHERE id = $1',
        [userId]
      );
    }

    return {
      success: true,
      message: 'Consentimiento de tratamiento de datos revocado conforme a Ley 1581/2012.',
    };
  }
}
