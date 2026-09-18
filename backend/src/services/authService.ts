import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { AuthUser } from '../types';

export class AuthService {
  // Mock DB en memoria para desarrollo rápido
  private static users = [
    {
      id: 'usr-001',
      name: 'María Rodríguez',
      email: 'maria.rodriguez@gmail.com',
      role: 'PATIENT' as const,
      passwordHash: '$2a$10$wT.mockHashForMaria123',
    },
    {
      id: 'usr-002',
      name: 'Carlos Rodríguez (Familiar)',
      email: 'carlos.rodriguez@gmail.com',
      role: 'FAMILY' as const,
      patientId: 'usr-001',
      passwordHash: '$2a$10$wT.mockHashForCarlos123',
    },
    {
      id: 'usr-003',
      name: 'Ing. David Marcet (Admin FET)',
      email: 'admin.fet@guiasalud.edu.co',
      role: 'ADMIN' as const,
      passwordHash: '$2a$10$wT.mockHashForAdmin123',
    },
  ];

  public static async login(email: string, _password: string): Promise<{ require2FA: boolean; tempToken: string; message: string }> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const tempToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, type: '2FA_PENDING' },
      ENV.JWT.SECRET_2FA,
      { expiresIn: '5m' }
    );

    return {
      require2FA: true,
      tempToken,
      message: 'Código de verificación 2FA enviado a su canal seguro registrado.',
    };
  }

  public static async verify2FA(tempToken: string, code: string): Promise<{ token: string; user: AuthUser }> {
    try {
      const decoded = jwt.verify(tempToken, ENV.JWT.SECRET_2FA) as { id: string; email: string; role: any };
      
      // En un entorno de producción se valida el TOTP/SMS, aquí aceptamos código demo o cualquier código de 6 dígitos
      if (!code || code.length !== 6) {
        throw new Error('El código 2FA debe tener 6 dígitos');
      }

      const user = this.users.find((u) => u.id === decoded.id);
      if (!user) throw new Error('Usuario no encontrado');

      const authUser: AuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: (user as any).patientId,
      };

      const token = jwt.sign(authUser, ENV.JWT.SECRET, { expiresIn: '24h' });

      return { token, user: authUser };
    } catch (err: any) {
      throw new Error(err.message || 'Token 2FA inválido o expirado');
    }
  }
}
