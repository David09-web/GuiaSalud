import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import {
  RegisterSchema,
  LoginSchema,
  Verify2FASchema,
  Enable2FASchema,
  Verify2FASetupSchema,
} from '../config/validators';
import { ZodError } from 'zod';

// ============================================================================
// AUTH CONTROLLER - Endpoints de Autenticación y Seguridad 2FA
// Responsables: David Marcet Ospina (Backend), Juan Camilo Ramírez (Frontend)
// ============================================================================

export class AuthController {
  // -------------------------------------------------------------------------
  // POST /auth/register - Registro de nuevo usuario
  // -------------------------------------------------------------------------
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const result = await AuthService.register(validatedData);

      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // POST /auth/login - Inicio de sesión (Paso 1)
  // -------------------------------------------------------------------------
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await AuthService.login(validatedData.email, validatedData.password);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // POST /auth/verify-2fa - Verificar código 2FA (Paso 2)
  // -------------------------------------------------------------------------
  public static async verify2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = Verify2FASchema.parse(req.body);
      const result = await AuthService.verify2FA(validatedData.tempToken, validatedData.twoFactorCode);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // POST /auth/2fa/enable - Iniciar configuración de 2FA (requiere auth)
  // -------------------------------------------------------------------------
  public static async enable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const validatedData = Enable2FASchema.parse(req.body);
      const result = await AuthService.enable2FA(req.user.id, validatedData.password);

      res.status(200).json({
        success: true,
        ...result,
        message: 'Escanee el código QR con su app autenticadora (Google Authenticator, Authy, etc.)',
      });
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // POST /auth/2fa/verify-setup - Confirmar activación de 2FA con primer token
  // -------------------------------------------------------------------------
  public static async verify2FASetup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const validatedData = Verify2FASetupSchema.parse(req.body);
      const result = await AuthService.verify2FASetup(req.user.id, validatedData.token);

      res.status(200).json(result);
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Error de validación',
          details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
        return;
      }
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // POST /auth/2fa/disable - Deshabilitar 2FA
  // -------------------------------------------------------------------------
  public static async disable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const result = await AuthService.disable2FA(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // GET /auth/me - Obtener datos del usuario autenticado
  // -------------------------------------------------------------------------
  public static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const user = await AuthService.getMe(req.user.id);
      res.status(200).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
}
