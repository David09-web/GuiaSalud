import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AgendaService } from '../services/agendaService';

// ============================================================================
// AGENDACONTROLLER - Endpoints de Agenda Médica (Módulo 1)
// Responsable Backend: David Marcet Ospina
// Responsable Frontend: Francisco Trujillo Peralta
// ============================================================================

export class AgendaController {
  /**
   * GET /api/citas
   * GET /api/v1/citas
   * GET /api/v1/agenda/appointments
   * Obtiene la lista e historial de citas médicas del usuario autenticado.
   */
  public static async getAppointments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId =
        req.user?.role === 'FAMILY' && req.user.patientId
          ? req.user.patientId
          : req.user!.id;

      const status = (req.query.status as string) || (req.query.estado as string);
      const appointments = await AgendaService.getAppointments(patientId, status);

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/citas
   * POST /api/v1/citas
   * POST /api/v1/agenda/appointments
   * Registra una nueva cita médica vinculada al ID del usuario autenticado.
   */
  public static async createAppointment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const patientId =
        req.user?.role === 'FAMILY' && req.user.patientId
          ? req.user.patientId
          : req.user!.id;

      const appointment = await AgendaService.createAppointment({
        ...req.body,
        patientId,
      });

      res.status(201).json({
        success: true,
        message: 'Cita médica agendada exitosamente en el sistema GuiaSalud.',
        data: appointment,
      });
    } catch (err: any) {
      if (err.message && err.message.includes('Todos los campos requeridos')) {
        res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: err.message,
        });
        return;
      }
      next(err);
    }
  }

  /**
   * PUT /api/citas/:id
   * PUT /api/v1/citas/:id
   * Actualiza datos o estado de la cita médica respetando el historial clínico.
   */
  public static async updateAppointment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const patientId =
        req.user?.role === 'FAMILY' && req.user.patientId
          ? req.user.patientId
          : req.user!.id;

      const updated = await AgendaService.updateAppointment(id, patientId, req.body);

      res.status(200).json({
        success: true,
        message: 'Cita médica actualizada correctamente.',
        data: updated,
      });
    } catch (err: any) {
      if (err.message && err.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: err.message,
        });
        return;
      }
      next(err);
    }
  }

  /**
   * PATCH /api/citas/:id/status
   * PATCH /api/v1/citas/:id/status
   * PATCH /api/v1/agenda/appointments/:id/status
   * Actualiza únicamente el estado de la cita (pendiente, realizada, cancelada).
   */
  public static async updateStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const status = req.body.status || req.body.estado;

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'BAD_REQUEST',
          message: 'Debe especificar el nuevo estado ("status" o "estado": pendiente, realizada o cancelada).',
        });
        return;
      }

      const patientId =
        req.user?.role === 'FAMILY' && req.user.patientId
          ? req.user.patientId
          : req.user?.id;

      const updated = await AgendaService.updateStatus(id, status, patientId);

      res.status(200).json({
        success: true,
        message: `Estado de la cita médica actualizado a: ${updated.status}.`,
        data: updated,
      });
    } catch (err: any) {
      if (err.message && err.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: err.message,
        });
        return;
      }
      next(err);
    }
  }

  /**
   * DELETE /api/citas/:id
   * DELETE /api/v1/citas/:id
   * DELETE /api/v1/agenda/appointments/:id
   * BORRADO LÓGICO / SOFT DELETE:
   * Garantiza que el registro NO se elimine físicamente de PostgreSQL para mantener
   * la trazabilidad del historial clínico y los logs de auditoría según la normativa médica.
   */
  public static async softDelete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const patientId =
        req.user?.role === 'FAMILY' && req.user.patientId
          ? req.user.patientId
          : req.user?.id;

      const cancelled = await AgendaService.softDelete(id, patientId);

      res.status(200).json({
        success: true,
        message: 'Cita médica dada de baja lógicamente (conservada en historial clínico y auditoría conforme a ley médica).',
        data: cancelled,
      });
    } catch (err: any) {
      if (err.message && err.message.includes('no encontrada')) {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: err.message,
        });
        return;
      }
      next(err);
    }
  }
}
