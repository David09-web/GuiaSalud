import { Router } from 'express';
import { MedicationController } from '../controllers/medicationController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rolesMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('PATIENT', 'FAMILY'));

router.get('/', MedicationController.getMedications);
router.post('/', MedicationController.createMedication);
router.put('/:id', MedicationController.updateMedication);
router.delete('/:id', MedicationController.deleteMedication);
router.post('/:id/doses', MedicationController.registerDose);

export default router;
