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
  }
};
