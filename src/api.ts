import type { UserProfile, UserRole, FamilyCaregiver, AuditLog } from './types';

const API_BASE_URL = 'http://localhost:5000/api/v1';

function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // --- AUTH ---
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error en login');
    }
    return res.json();
  },

  async verify2FA(tempToken: string, twoFactorCode: string) {
    const res = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tempToken, twoFactorCode }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error en validación 2FA');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; role: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Error en registro');
    }
    return res.json();
  },

  // --- PROFILE ---
  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener perfil');
    return res.json();
  },

  async updatePersonal(data: any) {
    const res = await fetch(`${API_BASE_URL}/profile/personal`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar datos personales');
    return res.json();
  },

  async updateAffiliation(data: any) {
    const res = await fetch(`${API_BASE_URL}/profile/affiliation`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar datos de afiliación');
    return res.json();
  },

  async createEmergencyContact(data: any) {
    const res = await fetch(`${API_BASE_URL}/profile/emergency-contacts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear contacto de emergencia');
    return res.json();
  },

  async updateEmergencyContact(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/profile/emergency-contacts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar contacto');
    return res.json();
  },

    async revokeConsent() {
    const res = await fetch(`${API_BASE_URL}/profile/revoke-consent`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al revocar consentimiento');
    return res.json();
  },

  // --- MÓDULO 1: AGENDA MÉDICA (CITAS) ---
  async getCitas(status?: string) {
    const url = status && status !== 'all'
      ? `${API_BASE_URL}/citas?status=${encodeURIComponent(status)}`
      : `${API_BASE_URL}/citas`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener citas médicas');
    return res.json();
  },

  async createCita(data: {
    specialty: string;
    doctor: string;
    center: string;
    date: string;
    time: string;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al agendar la cita médica');
    }
    return res.json();
  },

  async updateCita(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/citas/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar la cita médica');
    return res.json();
  },

  async updateCitaStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE_URL}/citas/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Error al actualizar el estado de la cita');
    return res.json();
  },

  async cancelCita(id: string) {
    // Soft-delete: conservada en auditoría e historial sin borrado físico
    const res = await fetch(`${API_BASE_URL}/citas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al cancelar la cita');
    return res.json();
  },

  // Medicamentos
  async getMedications() {
    const res = await fetch(`${API_BASE_URL}/medications`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener medicamentos');
    return res.json();
  },

  async createMedication(data: any) {
    const res = await fetch(`${API_BASE_URL}/medications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear medicamento');
    return res.json();
  },

  async updateMedication(id: string, data: any) {
    const res = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar medicamento');
    return res.json();
  },

  async deleteMedication(id: string) {
    const res = await fetch(`${API_BASE_URL}/medications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar medicamento');
    return res.json();
  },

  // --- MÓDULO 3: HISTORIA CLÍNICA PERSONAL Y BÓVEDA CIFRADA ---
  async getHistoriaClinica() {
    const res = await fetch(`${API_BASE_URL}/historia-clinica`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al obtener historia clínica');
    }
    return res.json();
  },

  async saveHistoriaClinica(data: any) {
    const res = await fetch(`${API_BASE_URL}/historia-clinica`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al guardar antecedentes en la historia clínica');
    }
    return res.json();
  },

  async getAdjuntos(filters?: { dateFrom?: string; dateTo?: string; category?: string; query?: string }) {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.query) params.append('query', filters.query);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/historia-clinica/adjuntos${queryStr}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al obtener archivos adjuntos');
    }
    return res.json();
  },

  async uploadAdjunto(data: {
    name: string;
    category: string;
    type?: string;
    institution: string;
    notes?: string;
    rawContent?: string;
  }) {
    const res = await fetch(`${API_BASE_URL}/historia-clinica/adjuntos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al cargar y cifrar archivo adjunto');
    }
    return res.json();
  },

  async deleteAdjunto(id: string) {
    const res = await fetch(`${API_BASE_URL}/historia-clinica/adjuntos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar archivo');
    return res.json();
  },

  async exportConsolidatedPDF() {
    const res = await fetch(`${API_BASE_URL}/historia-clinica/export-pdf`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al exportar consolidado en PDF');
    return res.json();
  },
};
