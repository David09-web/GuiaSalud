import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { HistoryService } from '../services/historyService';

export class HistoryController {
  public static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Regla estricta: ADMIN no tiene acceso a historias clínicas privadas
      if (req.user?.role === 'ADMIN') {
        res.status(403).json({
          error: 'Acceso Prohibido (403)',
          message: 'Por estricta política de confidencialidad médica y Habeas Data, el rol ADMIN no puede acceder a historias clínicas.',
        });
        return;
      }

      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const history = await HistoryService.getHistory(patientId);
      res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  }

  public static async exportPDF(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === 'ADMIN') {
        res.status(403).json({ error: 'Acceso no permitido para administradores' });
        return;
      }
      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const result = await HistoryService.generateConsolidatedPDF(patientId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
