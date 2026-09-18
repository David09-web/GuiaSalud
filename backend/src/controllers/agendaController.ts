import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AgendaService } from '../services/agendaService';

export class AgendaController {
  public static async getAppointments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const status = req.query.status as string | undefined;
      const appointments = await AgendaService.getAppointments(patientId, status);
      res.status(200).json(appointments);
    } catch (err) {
      next(err);
    }
  }

  public static async createAppointment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const appointment = await AgendaService.createAppointment({
        ...req.body,
        patientId,
        status: 'pending',
      });
      res.status(201).json(appointment);
    } catch (err) {
      next(err);
    }
  }

  public static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await AgendaService.updateStatus(id, status);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
}
