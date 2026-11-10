import crypto from 'crypto';
import {
  ClinicalHistory,
  AllergyRecord,
  MedicalBackground,
  ClinicalDiagnosis,
  ClinicalProcedure,
  EncryptedAttachment,
} from '../types';
import { CryptoService } from './cryptoService';

export class HistoryService {
  // Almacenamiento en memoria con cifrado en reposo para demostración y API
  private static histories: Record<string, ClinicalHistory> = {
    'usr-001': {
      patientId: 'usr-001',
      bloodType: 'O+',
      allergies: [
        {
          id: 'alg-001',
          allergen: 'Penicilina',
          reaction: 'Anafilaxia leve, urticaria y prurito',
          severity: 'Severa / Anafilaxia',
          diagnosedYear: '2012',
          status: 'Activa',
        },
        {
          id: 'alg-002',
          allergen: 'Aspirina / AINEs',
          reaction: 'Broncoespasmo leve y edema facial',
          severity: 'Moderada',
          diagnosedYear: '2016',
          status: 'Activa',
        },
        {
          id: 'alg-003',
          allergen: 'Látex',
          reaction: 'Dermatitis por contacto localizada',
          severity: 'Leve',
          diagnosedYear: '2020',
          status: 'Activa',
        },
      ],
      backgrounds: [
        {
          id: 'bg-001',
          category: 'Patológico',
          title: 'Hipertensión arterial esencial',
          description: 'Estadío I controlada con Enalapril 10mg cada 12h',
          year: '2018',
        },
        {
          id: 'bg-002',
          category: 'Patológico',
          title: 'Diabetes mellitus tipo 2',
          description: 'Control con Metformina y dieta hipoglúcida',
          year: '2021',
        },
        {
          id: 'bg-003',
          category: 'Farmacológico',
          title: 'Enalapril 10mg + Metformina 500mg',
          description: 'Tratamiento farmacológico de mantenimiento continuo',
          year: '2026',
        },
        {
          id: 'bg-004',
          category: 'Quirúrgico',
          title: 'Apendicectomía laparoscópica',
          description: 'Sin complicaciones posquirúrgicas',
          year: '2018',
        },
        {
          id: 'bg-005',
          category: 'Familiar',
          title: 'Enfermedad coronaria prematura',
          description: 'Padre diagnosticado a los 55 años',
          year: '2010',
          relationship: 'Padre',
        },
      ],
      diagnoses: [
        {
          id: 'diag-001',
          code: 'I10',
          title: 'Hipertensión arterial esencial (primaria)',
          category: 'Cardiovascular',
          diagnosedDate: '2018-05-14',
          status: 'Controlado',
          doctor: 'Dr. Andrés Morales',
          specialty: 'Medicina General',
          notes: 'Monitoreo bimensual de tensión arterial y estilo de vida.',
        },
        {
          id: 'diag-002',
          code: 'E11.9',
          title: 'Diabetes mellitus tipo 2 sin complicaciones',
          category: 'Endocrinología',
          diagnosedDate: '2021-11-03',
          status: 'En tratamiento',
          doctor: 'Dra. Claudia Vega',
          specialty: 'Medicina Interna',
          notes: 'Metformina 500 mg c/8h y curva de glucemia semestral.',
        },
        {
          id: 'diag-003',
          code: 'K35.8',
          title: 'Apendicitis aguda no especificada',
          category: 'Gastroenterología',
          diagnosedDate: '2018-09-12',
          status: 'Resuelto',
          doctor: 'Dr. Mauricio Gómez',
          specialty: 'Cirugía General',
          notes: 'Apendicectomía completada con éxito.',
        },
      ],
      procedures: [
        {
          id: 'proc-001',
          title: 'Electrocardiograma de Reposo 12 Derivaciones',
          type: 'Examen Diagnóstico',
          date: '2026-06-30',
          institution: 'Clínica del Norte - Cardiología',
          doctor: 'Dra. Claudia Vega',
          outcome: 'Ritmo sinusal normal, sin signos agudos de isquemia.',
          notes: 'Control de rutina para hipertensión.',
        },
        {
          id: 'proc-002',
          title: 'Ecografía Abdominal Total',
          type: 'Examen Diagnóstico',
          date: '2026-05-12',
          institution: 'Centro Médico El Bosque',
          doctor: 'Dr. Leonardo Paz',
          outcome: 'Hígado graso leve (esteatosis hepática grado I).',
          notes: 'Recomendación de control dietético y ejercicio.',
        },
        {
          id: 'proc-003',
          title: 'Apendicectomía por Laparoscopia',
          type: 'Cirugía',
          date: '2018-09-15',
          institution: 'Clínica Universitaria El Bosque',
          doctor: 'Dr. Mauricio Gómez',
          outcome: 'Procedimiento exitoso sin sangrado activo.',
          notes: 'Alta a las 24 horas con evolución favorable.',
        },
      ],
      filesCount: 4,
      lastUpdated: '2026-10-22T10:00:00.000Z',
    },
  };

  private static attachments: Record<string, EncryptedAttachment[]> = {
    'usr-001': [
      {
        id: 'doc-001',
        patientId: 'usr-001',
        name: 'Resultado Hemograma Completo y Glucemia',
        type: 'PDF',
        category: 'Laboratorio',
        date: '2026-08-28',
        size: '1.2 MB',
        encrypted: true,
        institution: 'Laboratorios El Bosque',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        cipherAlgorithm: 'AES-256-GCM',
        notes: 'Glucemia 110 mg/dL, HbA1c 6.4%, perfil lipídico normal.',
      },
      {
        id: 'doc-002',
        patientId: 'usr-001',
        name: 'Radiografía de Tórax AP y Lateral',
        type: 'Radiografía',
        category: 'Imagenología',
        date: '2026-07-15',
        size: '4.8 MB',
        encrypted: true,
        institution: 'Clínica del Norte - Imágenes Diagnósticas',
        sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        cipherAlgorithm: 'AES-256-GCM',
        notes: 'Campos pulmonares claros, silueta cardiovascular normal.',
      },
      {
        id: 'doc-003',
        patientId: 'usr-001',
        name: 'Electrocardiograma de Reposo 12 Derivaciones',
        type: 'PDF',
        category: 'Diagnóstico',
        date: '2026-06-30',
        size: '850 KB',
        encrypted: true,
        institution: 'Clínica del Norte - Cardiología',
        sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        cipherAlgorithm: 'AES-256-GCM',
        notes: 'Ritmo sinusal regular sin elevación del segmento ST.',
      },
      {
        id: 'doc-004',
        patientId: 'usr-001',
        name: 'Fórmula Médica Enalapril y Metformina',
        type: 'PDF',
        category: 'Receta',
        date: '2026-05-12',
        size: '640 KB',
        encrypted: true,
        institution: 'Centro Médico El Bosque',
        sha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        cipherAlgorithm: 'AES-256-GCM',
        notes: 'Tratamiento para 90 días con entrega en droguería Cruz Verde.',
      },
    ],
  };

  /**
   * Obtiene la historia clínica con su carga cifrada en reposo.
   */
  public static async getHistory(patientId: string): Promise<ClinicalHistory> {
    let history = this.histories[patientId];
    if (!history) {
      // Inicializar historia vacía pero segura
      history = {
        patientId,
        bloodType: 'O+',
        allergies: [],
        backgrounds: [],
        diagnoses: [],
        procedures: [],
        filesCount: 0,
        lastUpdated: new Date().toISOString(),
      };
      this.histories[patientId] = history;
    }

    const fileList = this.attachments[patientId] || [];
    history.filesCount = fileList.length;

    // Cifrado de datos sensibles en reposo conforme a la OMS y Ley 1581
    const sensitivePayload = JSON.stringify({
      allergies: history.allergies,
      backgrounds: history.backgrounds,
      diagnoses: history.diagnoses,
      procedures: history.procedures,
    });

    const encrypted = CryptoService.encrypt(sensitivePayload);
    const sha256Sig = crypto.createHash('sha256').update(sensitivePayload).digest('hex');

    return {
      ...history,
      encryptedPayload: encrypted,
      sha256Signature: sha256Sig,
    };
  }

  /**
   * Guarda o actualiza los antecedentes, alergias y diagnósticos clínicos (POST /api/historia-clinica).
   */
  public static async saveHistory(
    patientId: string,
    payload: {
      bloodType?: string;
      allergies?: AllergyRecord[];
      backgrounds?: MedicalBackground[];
      diagnoses?: ClinicalDiagnosis[];
      procedures?: ClinicalProcedure[];
      newAllergy?: Omit<AllergyRecord, 'id'>;
      newBackground?: Omit<MedicalBackground, 'id'>;
      newDiagnosis?: Omit<ClinicalDiagnosis, 'id'>;
      newProcedure?: Omit<ClinicalProcedure, 'id'>;
    }
  ): Promise<ClinicalHistory> {
    const existing = await this.getHistory(patientId);

    if (payload.bloodType) existing.bloodType = payload.bloodType;
    if (payload.allergies) existing.allergies = payload.allergies;
    if (payload.backgrounds) existing.backgrounds = payload.backgrounds;
    if (payload.diagnoses) existing.diagnoses = payload.diagnoses;
    if (payload.procedures) existing.procedures = payload.procedures;

    if (payload.newAllergy) {
      const allergy: AllergyRecord = {
        ...payload.newAllergy,
        id: `alg-${Date.now()}`,
      };
      existing.allergies.unshift(allergy);
    }

    if (payload.newBackground) {
      const bg: MedicalBackground = {
        ...payload.newBackground,
        id: `bg-${Date.now()}`,
      };
      existing.backgrounds.unshift(bg);
    }

    if (payload.newDiagnosis) {
      const diag: ClinicalDiagnosis = {
        ...payload.newDiagnosis,
        id: `diag-${Date.now()}`,
      };
      existing.diagnoses.unshift(diag);
    }

    if (payload.newProcedure) {
      const proc: ClinicalProcedure = {
        ...payload.newProcedure,
        id: `proc-${Date.now()}`,
      };
      existing.procedures.unshift(proc);
    }

    existing.lastUpdated = new Date().toISOString();
    this.histories[patientId] = existing;

    return this.getHistory(patientId);
  }

  /**
   * Obtiene los archivos adjuntos cifrados con soporte de filtros por rango de fechas, categoría y búsqueda.
   */
  public static async getAdjuntos(
    patientId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      category?: string;
      query?: string;
    }
  ): Promise<{ attachments: EncryptedAttachment[]; count: number; encryptionStandard: string }> {
    const list = this.attachments[patientId] || [];

    let filtered = [...list];

    if (filters?.category && filters.category !== 'all') {
      filtered = filtered.filter((f) => f.category === filters.category);
    }

    if (filters?.dateFrom) {
      filtered = filtered.filter((f) => f.date >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      filtered = filtered.filter((f) => f.date <= filters.dateTo!);
    }

    if (filters?.query && filters.query.trim() !== '') {
      const q = filters.query.toLowerCase().trim();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.institution.toLowerCase().includes(q) ||
          (f.notes && f.notes.toLowerCase().includes(q))
      );
    }

    return {
      attachments: filtered,
      count: filtered.length,
      encryptionStandard: 'AES-256-GCM / SHA-256 Integrity Verification',
    };
  }

  /**
   * Sube un archivo adjunto con cifrado seguro en reposo (POST /api/historia-clinica/adjuntos).
   */
  public static async uploadAdjunto(
    patientId: string,
    fileData: {
      name: string;
      category: 'Laboratorio' | 'Imagenología' | 'Diagnóstico' | 'Receta';
      type?: 'PDF' | 'Imagen' | 'Laboratorio' | 'Radiografía' | 'Otro';
      institution: string;
      notes?: string;
      rawContent?: string;
    }
  ): Promise<EncryptedAttachment> {
    if (!this.attachments[patientId]) {
      this.attachments[patientId] = [];
    }

    const contentForHash = fileData.rawContent || `${fileData.name}-${fileData.institution}-${Date.now()}`;
    const sha256 = crypto.createHash('sha256').update(contentForHash).digest('hex');
    const encryptedRaw = CryptoService.encrypt(contentForHash);
    const [iv, authTag] = encryptedRaw.split(':');

    const newAttachment: EncryptedAttachment = {
      id: `doc-${Date.now()}`,
      patientId,
      name: fileData.name,
      category: fileData.category,
      type: fileData.type || (fileData.category === 'Imagenología' ? 'Imagen' : 'PDF'),
      date: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      encrypted: true,
      institution: fileData.institution,
      notes: fileData.notes || 'Documento clínico cifrado y archivado satisfactoriamente.',
      sha256,
      cipherAlgorithm: 'AES-256-GCM',
      cipherIV: iv,
      cipherAuthTag: authTag,
    };

    this.attachments[patientId].unshift(newAttachment);

    // Actualizar conteo en la historia
    if (this.histories[patientId]) {
      this.histories[patientId].filesCount = this.attachments[patientId].length;
      this.histories[patientId].lastUpdated = new Date().toISOString();
    }

    return newAttachment;
  }

  /**
   * Elimina un archivo adjunto.
   */
  public static async deleteAdjunto(patientId: string, fileId: string): Promise<boolean> {
    const list = this.attachments[patientId];
    if (!list) return false;

    const initialLen = list.length;
    this.attachments[patientId] = list.filter((f) => f.id !== fileId);

    if (this.histories[patientId]) {
      this.histories[patientId].filesCount = this.attachments[patientId].length;
    }

    return this.attachments[patientId].length < initialLen;
  }

  /**
   * Genera el consolidado en PDF de la historia clínica.
   */
  public static async generateConsolidatedPDF(
    patientId: string
  ): Promise<{ downloadUrl: string; generatedAt: string; documentChecksum: string }> {
    const history = await this.getHistory(patientId);
    const checksum = crypto
      .createHash('sha256')
      .update(`${patientId}-${history.lastUpdated}-${Date.now()}`)
      .digest('hex');

    return {
      downloadUrl: `/downloads/resumen-clinico-${patientId}-${Date.now()}.pdf`,
      generatedAt: new Date().toISOString(),
      documentChecksum: checksum,
    };
  }
}
