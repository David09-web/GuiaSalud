import { ClinicalHistory } from '../types';
import { CryptoService } from './cryptoService';

export class HistoryService {
  private static histories: Record<string, ClinicalHistory> = {
    'usr-001': {
      patientId: 'usr-001',
      bloodType: 'O+',
      allergies: ['Penicilina', 'Aspirina', 'Látex'],
      conditions: ['Hipertensión arterial (I10)', 'Diabetes mellitus tipo 2 (E11.9)'],
      surgeries: ['Apendicectomía (2018)'],
      filesCount: 4,
    },
  };

  public static async getHistory(patientId: string): Promise<ClinicalHistory> {
    const history = this.histories[patientId];
    if (!history) {
      throw new Error('Historia clínica no encontrada');
    }

    // Ejemplo de cifrado/descifrado en reposo para protección de datos según OMS
    const sensitiveData = JSON.stringify({ allergies: history.allergies, conditions: history.conditions });
    const encrypted = CryptoService.encrypt(sensitiveData);
    
    return {
      ...history,
      encryptedPayload: encrypted,
    };
  }

  public static async generateConsolidatedPDF(patientId: string): Promise<{ downloadUrl: string; generatedAt: string }> {
    const history = await this.getHistory(patientId);
    return {
      downloadUrl: `/downloads/resumen-clinico-${patientId}-${Date.now()}.pdf`,
      generatedAt: new Date().toISOString(),
    };
  }
}
