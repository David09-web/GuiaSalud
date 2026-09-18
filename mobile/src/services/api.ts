import { Appointment, Medication, ClinicalHistory, User } from '../types';

const API_BASE_URL = 'http://10.0.2.2:5000/api/v1'; // 10.0.2.2 para emulador Android, localhost para iOS/Web

class ApiClient {
  private token: string | null = null;

  public setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (err: any) {
      console.warn(`[API] Fallback local para ${endpoint}:`, err.message);
      throw err;
    }
  }

  public async login(email: string, password: string) {
    return this.request<{ require2FA: boolean; tempToken: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  public async verify2FA(tempToken: string, twoFactorCode: string) {
    return this.request<{ token: string; user: User }>('/auth/verify-2fa', {
      method: 'POST',
      body: JSON.stringify({ tempToken, twoFactorCode }),
    });
  }

  public async getAppointments() {
    return this.request<Appointment[]>('/agenda/appointments');
  }

  public async getMedications() {
    return this.request<Medication[]>('/medications');
  }

  public async getClinicalHistory() {
    return this.request<ClinicalHistory>('/clinical-history');
  }
}

export const api = new ApiClient();
