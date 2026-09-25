import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { ProfileService } from '../services/profileService';
import {
  UpdateProfileSchema,
  UpdateAffiliationSchema,
  CreateEmergencyContactSchema,
  UpdateEmergencyContactSchema,
} from '../config/validators';
import { ZodError } from 'zod';

// ============================================================================
// PROFILE CONTROLLER - Gestión CRUD del Perfil (Módulo 4)
// Responsables: Francisco Trujillo Peralta (Frontend), Juan Camilo Ramírez (Frontend),
//               David Marcet Ospina (Backend)
// ============================================================================

export class ProfileController {
  // -------------------------------------------------------------------------
  // GET /profile - Obtener perfil completo del usuario autenticado
  // -------------------------------------------------------------------------
  public static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const profile = await ProfileService.getFullProfile(req.user.id);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // PUT /profile/personal - Actualizar datos personales
  // -------------------------------------------------------------------------
  public static async updatePersonalData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const validatedData = UpdateProfileSchema.parse(req.body);
      const result = await ProfileService.updateProfile(req.user.id, validatedData);
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
  // PUT /profile/affiliation - Actualizar afiliación EPS/IPS
  // -------------------------------------------------------------------------
  public static async updateAffiliation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const validatedData = UpdateAffiliationSchema.parse(req.body);
      const result = await ProfileService.updateAffiliation(req.user.id, validatedData);
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
  // GET /profile/emergency-contacts - Listar contactos de emergencia
  // -------------------------------------------------------------------------
  public static async getEmergencyContacts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const profile = await ProfileService.getFullProfile(req.user.id);
      res.status(200).json({ success: true, data: profile.emergencyContacts });
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // POST /profile/emergency-contacts - Crear contacto de emergencia
  // -------------------------------------------------------------------------
  public static async createEmergencyContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const validatedData = CreateEmergencyContactSchema.parse(req.body);
      const contact = await ProfileService.createEmergencyContact(req.user.id, validatedData);
      res.status(201).json({ success: true, data: contact, message: 'Contacto de emergencia creado.' });
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
  // PUT /profile/emergency-contacts/:id - Actualizar contacto de emergencia
  // -------------------------------------------------------------------------
  public static async updateEmergencyContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const { id } = req.params;
      const validatedData = UpdateEmergencyContactSchema.parse(req.body);
      const result = await ProfileService.updateEmergencyContact(req.user.id, id, validatedData);
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
  // DELETE /profile/emergency-contacts/:id - Eliminar contacto de emergencia
  // -------------------------------------------------------------------------
  public static async deleteEmergencyContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const { id } = req.params;
      const result = await ProfileService.deleteEmergencyContact(req.user.id, id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // -------------------------------------------------------------------------
  // POST /profile/revoke-consent - Revocar consentimiento Habeas Data
  // -------------------------------------------------------------------------
  public static async revokeConsent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'No autenticado' });
        return;
      }

      const result = await ProfileService.revokeConsent(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
