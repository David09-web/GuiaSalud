import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { ENV } from '../config/env';
import { dbPool } from '../config/database';
import { AuthUser } from '../types';
import { RegisterInput } from '../config/validators';

// ============================================================================
// AUTH SERVICE - Autenticación, Registro y Seguridad 2FA con PostgreSQL
// Responsable: David Marcet Ospina (Backend Lead)
// ============================================================================

// Mock DB en memoria como fallback cuando PostgreSQL no está disponible
const FALLBACK_USERS = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@gmail.com',
    role: 'PATIENT' as const,
    password_hash: '$2a$12$LJ3M4xQkTlv8Jv0qFXTOYO5Lx2FVbGJ0m7H2XsVnKqEZjzJfXqKC',
    two_factor_enabled: true,
    two_factor_secret: null as string | null,
    patient_id: null as string | null,
    data_consent_granted: true,
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    name: 'Carlos Rodríguez (Familiar)',
    email: 'carlos.rodriguez@gmail.com',
    role: 'FAMILY' as const,
    password_hash: '$2a$12$LJ3M4xQkTlv8Jv0qFXTOYO5Lx2FVbGJ0m7H2XsVnKqEZjzJfXqKC',
    two_factor_enabled: false,
    two_factor_secret: null as string | null,
    patient_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    data_consent_granted: true,
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    name: 'Ing. David Marcet (Admin FET)',
    email: 'admin.fet@guiasalud.edu.co',
    role: 'ADMIN' as const,
    password_hash: '$2a$12$LJ3M4xQkTlv8Jv0qFXTOYO5Lx2FVbGJ0m7H2XsVnKqEZjzJfXqKC',
    two_factor_enabled: true,
    two_factor_secret: null as string | null,
    patient_id: null as string | null,
    data_consent_granted: true,
  },
];

export class AuthService {
  // =========================================================================
  // Helpers para modo dual (PostgreSQL o Fallback en memoria)
  // =========================================================================
  private static async isDbAvailable(): Promise<boolean> {
    try {
      await dbPool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private static async findUserByEmail(email: string) {
    if (await this.isDbAvailable()) {
      const result = await dbPool.query(
        'SELECT id, name, email, password_hash, role, patient_id, two_factor_enabled, two_factor_secret, data_consent_granted FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );
      return result.rows[0] || null;
    }
    // Fallback en memoria
    return FALLBACK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  private static async findUserById(id: string) {
    if (await this.isDbAvailable()) {
      const result = await dbPool.query(
        'SELECT id, name, email, role, patient_id, two_factor_enabled, two_factor_secret, data_consent_granted FROM users WHERE id = $1 AND is_active = true',
        [id]
      );
      return result.rows[0] || null;
    }
    return FALLBACK_USERS.find((u) => u.id === id) || null;
  }

  // =========================================================================
  // REGISTRO DE USUARIO
  // =========================================================================
  public static async register(input: RegisterInput): Promise<{ user: AuthUser; token: string; message: string }> {
    const { name, email, password, role, patientId } = input;

    // Verificar si el email ya existe
    const existing = await this.findUserByEmail(email);
    if (existing) {
      throw new Error('El correo electrónico ya se encuentra registrado en el sistema.');
    }

    // Hash de la contraseña con bcrypt (cost factor 12 para seguridad)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser: any;

    if (await this.isDbAvailable()) {
      const result = await dbPool.query(
        `INSERT INTO users (name, email, password_hash, role, patient_id, data_consent_granted, data_consent_date)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING id, name, email, role, patient_id`,
        [name, email.toLowerCase(), passwordHash, role, patientId || null]
      );
      newUser = result.rows[0];

      // Crear perfil vacío asociado al usuario
      await dbPool.query(
        `INSERT INTO user_profiles (user_id, first_name)
         VALUES ($1, $2)`,
        [newUser.id, name.split(' ')[0]]
      );
    } else {
      // Fallback: crear en memoria
      newUser = {
        id: `usr-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role,
        patient_id: patientId || null,
        password_hash: passwordHash,
        two_factor_enabled: false,
        two_factor_secret: null,
        data_consent_granted: true,
      };
      FALLBACK_USERS.push(newUser);
    }

    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      patientId: newUser.patient_id,
    };

    const token = jwt.sign({ ...authUser }, ENV.JWT.SECRET, { expiresIn: ENV.JWT.EXPIRES_IN as any });

    return {
      user: authUser,
      token,
      message: 'Cuenta creada exitosamente. Bienvenido(a) a GuiaSalud.',
    };
  }

  // =========================================================================
  // LOGIN (Paso 1: Credenciales → Token temporal 2FA o JWT directo)
  // =========================================================================
  public static async login(
    email: string,
    password: string
  ): Promise<{ require2FA: boolean; tempToken?: string; token?: string; user?: AuthUser; message: string }> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas. Verifique su correo electrónico.');
    }

    // Verificar contraseña con bcrypt
    // En modo fallback/demo, aceptar 'GuiaSalud2026!' o cualquier contraseña (para fines académicos)
    let passwordValid = false;
    try {
      passwordValid = await bcrypt.compare(password, user.password_hash);
    } catch {
      // Si el hash no es válido (mock hash antiguo), aceptar password demo
      passwordValid = false;
    }

    // Fallback para demostración académica: aceptar cualquier contraseña si el hash es mock
    if (!passwordValid && user.password_hash.includes('.mock')) {
      passwordValid = true;
    }

    // Para el entorno de desarrollo, aceptar la contraseña demo
    if (!passwordValid && ENV.NODE_ENV === 'development') {
      passwordValid = true;
    }

    if (!passwordValid) {
      throw new Error('Credenciales inválidas. Contraseña incorrecta.');
    }

    // Si tiene 2FA habilitado → emitir token temporal y solicitar código
    if (user.two_factor_enabled) {
      const tempToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, type: '2FA_PENDING' },
        ENV.JWT.SECRET_2FA,
        { expiresIn: '5m' }
      );

      return {
        require2FA: true,
        tempToken,
        message: 'Código de verificación 2FA requerido. Ingrese el token de su app autenticadora.',
      };
    }

    // Si no tiene 2FA → emitir JWT de sesión directamente
    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: user.patient_id,
    };

    const token = jwt.sign({ ...authUser }, ENV.JWT.SECRET, { expiresIn: ENV.JWT.EXPIRES_IN as any });

    return {
      require2FA: false,
      token,
      user: authUser,
      message: 'Inicio de sesión exitoso.',
    };
  }

  // =========================================================================
  // VERIFICAR CÓDIGO 2FA (Paso 2: Token temporal + TOTP → JWT de sesión)
  // =========================================================================
  public static async verify2FA(tempToken: string, code: string): Promise<{ token: string; user: AuthUser }> {
    let decoded: { id: string; email: string; role: any };

    try {
      decoded = jwt.verify(tempToken, ENV.JWT.SECRET_2FA) as any;
    } catch {
      throw new Error('Token temporal 2FA inválido o expirado. Inicie sesión nuevamente.');
    }

    if (!code || code.length !== 6) {
      throw new Error('El código 2FA debe tener exactamente 6 dígitos.');
    }

    const user = await this.findUserById(decoded.id);
    if (!user) throw new Error('Usuario no encontrado en el sistema.');

    // Validar código TOTP
    if (user.two_factor_secret) {
      const isValid = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: code,
        window: 1,
      });

      if (!isValid) {
        throw new Error('Código 2FA incorrecto o expirado. Intente con un código nuevo.');
      }
    } else {
      // En modo demo sin TOTP configurado, aceptar cualquier código de 6 dígitos
      if (!/^\d{6}$/.test(code)) {
        throw new Error('El código 2FA debe ser numérico de 6 dígitos.');
      }
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: user.patient_id,
    };

    const token = jwt.sign({ ...authUser }, ENV.JWT.SECRET, { expiresIn: ENV.JWT.EXPIRES_IN as any });

    return { token, user: authUser };
  }

  // =========================================================================
  // HABILITAR 2FA (Generar secreto TOTP + QR Code)
  // =========================================================================
  public static async enable2FA(
    userId: string,
    password: string
  ): Promise<{ secret: string; qrCodeUrl: string; otpauthUrl: string }> {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('Usuario no encontrado.');

    // Generar secreto TOTP
    const secretInfo = speakeasy.generateSecret({ name: `GuiaSalud (${user.email})` });
    const secret = secretInfo.base32;
    const otpauthUrl = secretInfo.otpauth_url as string;
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // Guardar secreto temporalmente (se confirma en verify2FASetup)
    if (await this.isDbAvailable()) {
      await dbPool.query(
        'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
        [secret, userId]
      );
    } else {
      const fallbackUser = FALLBACK_USERS.find((u) => u.id === userId);
      if (fallbackUser) fallbackUser.two_factor_secret = secret;
    }

    return { secret, qrCodeUrl, otpauthUrl };
  }

  // =========================================================================
  // CONFIRMAR CONFIGURACIÓN 2FA (Verifica primer token TOTP)
  // =========================================================================
  public static async verify2FASetup(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    const user = await this.findUserById(userId);
    if (!user || !user.two_factor_secret) {
      throw new Error('No se ha iniciado la configuración de 2FA.');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) {
      throw new Error('Código de verificación incorrecto. Intente nuevamente.');
    }

    // Activar 2FA en la cuenta
    if (await this.isDbAvailable()) {
      await dbPool.query(
        'UPDATE users SET two_factor_enabled = true WHERE id = $1',
        [userId]
      );
    } else {
      const fallbackUser = FALLBACK_USERS.find((u) => u.id === userId);
      if (fallbackUser) (fallbackUser as any).two_factor_enabled = true;
    }

    return {
      success: true,
      message: 'Autenticación de Doble Factor (2FA) activada exitosamente.',
    };
  }

  // =========================================================================
  // DESHABILITAR 2FA
  // =========================================================================
  public static async disable2FA(userId: string): Promise<{ success: boolean; message: string }> {
    if (await this.isDbAvailable()) {
      await dbPool.query(
        'UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1',
        [userId]
      );
    } else {
      const fallbackUser = FALLBACK_USERS.find((u) => u.id === userId);
      if (fallbackUser) {
        (fallbackUser as any).two_factor_enabled = false;
        fallbackUser.two_factor_secret = null;
      }
    }

    return {
      success: true,
      message: 'Autenticación de Doble Factor (2FA) desactivada.',
    };
  }

  // =========================================================================
  // OBTENER PERFIL DEL USUARIO AUTENTICADO
  // =========================================================================
  public static async getMe(userId: string): Promise<AuthUser> {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('Usuario no encontrado.');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      patientId: user.patient_id,
    };
  }
}
