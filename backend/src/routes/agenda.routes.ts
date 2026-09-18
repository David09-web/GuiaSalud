import { Router } from 'express';
import { AgendaController } from '../controllers/agendaController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rolesMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('PATIENT', 'FAMILY'));

router.get('/appointments', AgendaController.getAppointments);
router.post('/appointments', AgendaController.createAppointment);
router.patch('/appointments/:id/status', AgendaController.updateStatus);

export default router;
