import { Router } from 'express';
import { AgendaController } from '../controllers/agendaController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rolesMiddleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('PATIENT', 'FAMILY', 'ADMIN'));

router.get('/appointments', AgendaController.getAppointments);
router.post('/appointments', AgendaController.createAppointment);
router.put('/appointments/:id', AgendaController.updateAppointment);
router.patch('/appointments/:id/status', AgendaController.updateStatus);
router.delete('/appointments/:id', AgendaController.softDelete);

export default router;
