import { Router } from 'express';
import authRoutes from './auth.routes';
import agendaRoutes from './agenda.routes';
import medicationRoutes from './medication.routes';
import historyRoutes from './history.routes';
import adminRoutes from './admin.routes';

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
router.use('/agenda', agendaRoutes);
router.use('/medications', medicationRoutes);
router.use('/clinical-history', historyRoutes);
router.use('/admin', adminRoutes);

export default router;
