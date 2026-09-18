import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rolesMiddleware';

const router = Router();

// Endpoint público para consulta de tutoriales SGSSS
router.get('/tutorials', AdminController.getTutorials);

// Endpoints protegidos solo para ADMINISTRADOR FET
router.post('/tutorials', authMiddleware, requireRoles('ADMIN'), AdminController.createTutorial);
router.get('/audit-logs', authMiddleware, requireRoles('ADMIN'), AdminController.getAuditLogs);

export default router;
