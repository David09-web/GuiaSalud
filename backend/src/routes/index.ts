import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import agendaRoutes from './agenda.routes';
import citasRoutes from './citas.routes';
import medicationRoutes from './medication.routes';
import historyRoutes from './history.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    project: 'GuiaSalud Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/agenda', agendaRoutes);
router.use('/citas', citasRoutes);
router.use('/medications', medicationRoutes);
router.use('/clinical-history', historyRoutes);
router.use('/historia-clinica', historyRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

export default router;
