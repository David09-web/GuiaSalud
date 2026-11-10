import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { MedicationService } from '../services/medicationService';

export class MedicationController {
  public static async getMedications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const medications = await MedicationService.getMedications(patientId);
      res.status(200).json(medications);
    } catch (err) {
      next(err);
    }
  }

  public static async registerDose(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, takenAt } = req.body;
      const log = await MedicationService.registerDose(id, status, takenAt);
      res.status(200).json(log);
    } catch (err) {
      next(err);
    }
  }

  public static async createMedication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.user?.role === 'FAMILY' && req.user.patientId ? req.user.patientId : req.user!.id;
      const medication = await MedicationService.createMedication(patientId, req.body);
      res.status(201).json(medication);
    } catch (err) {
      next(err);
    }
  }

  public static async updateMedication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const medication = await MedicationService.updateMedication(id, req.body);
      res.status(200).json(medication);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteMedication(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await MedicationService.deleteMedication(id);
      res.status(200).json({ message: 'Medicamento eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  }
}

