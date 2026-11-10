import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { HistoryService } from '../services/historyService';

export class HistoryController {
  /**
   * GET /api/historia-clinica
   * Retorna la historia clínica completa con carga cifrada en reposo.
   * Regla RBAC: ADMIN bloqueado por confidencialidad médica (Ley 1581 / Habeas Data).
   */
  public static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === 'ADMIN') {
        res.status(403).json({
          error: 'Acceso Prohibido (403)',
          message:
            'Por estricta política de confidencialidad médica y Habeas Data (Ley 1581 de 2012), el rol ADMIN no puede acceder a historias clínicas privadas.',
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

  /**
   * POST /api/historia-clinica
   * Registra o actualiza antecedentes médicos, alergias o diagnósticos.
   */
  public static async saveHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === 'ADMIN') {
        res.status(403).json({
          error: 'Acceso Prohibido (403)',
          message: 'El rol ADMIN tiene denegado el registro o alteración de expedientes médicos privados.',
        });
        return;
      }

      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const updatedHistory = await HistoryService.saveHistory(patientId, req.body);

      res.status(200).json({
        message: 'Historia clínica actualizada con cifrado en reposo exitosamente.',
        history: updatedHistory,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/historia-clinica/adjuntos
   * Obtiene la lista de documentos clínicos cifrados con soporte de filtros por fecha y categoría.
   */
  public static async getAdjuntos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === 'ADMIN') {
        res.status(403).json({
          error: 'Acceso Prohibido (403)',
          message: 'El rol ADMIN no tiene privilegios para visualizar exámenes o documentos clínicos de pacientes.',
        });
        return;
      }

      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const { dateFrom, dateTo, category, query } = req.query as {
        dateFrom?: string;
        dateTo?: string;
        category?: string;
        query?: string;
      };

      const result = await HistoryService.getAdjuntos(patientId, {
        dateFrom,
        dateTo,
        category,
        query,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/historia-clinica/adjuntos
   * Almacena un nuevo archivo clínico con cifrado AES-256 en reposo y hash SHA-256.
   */
  public static async uploadAdjunto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === 'ADMIN') {
        res.status(403).json({
          error: 'Acceso Prohibido (403)',
          message: 'El rol ADMIN no puede subir archivos a expedientes clínicos privados.',
        });
        return;
      }

      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const { name, category, type, institution, notes, rawContent } = req.body;

      if (!name || !category || !institution) {
        res.status(400).json({
          error: 'Datos incompletos',
          message: 'Los campos name, category e institution son obligatorios.',
        });
        return;
      }

      const newAttachment = await HistoryService.uploadAdjunto(patientId, {
        name,
        category,
        type,
        institution,
        notes,
        rawContent,
      });

      res.status(201).json({
        message: 'Archivo clínico cifrado y archivado exitosamente (AES-256-GCM).',
        attachment: newAttachment,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/historia-clinica/adjuntos/:id
   * Elimina un archivo adjunto.
   */
  public static async deleteAdjunto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user?.role === 'ADMIN') {
        res.status(403).json({ error: 'Operación denegada a administradores.' });
        return;
      }

      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const fileId = req.params.id;

      const success = await HistoryService.deleteAdjunto(patientId, fileId);
      if (!success) {
        res.status(404).json({ error: 'Archivo no encontrado' });
        return;
      }

      res.status(200).json({ message: 'Archivo clínico eliminado exitosamente.' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/historia-clinica/export-pdf
   * Genera el consolidado firmado digitalmente en formato PDF.
   */
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
