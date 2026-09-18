import { Router } from 'express';
import { HistoryController } from '../controllers/historyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', HistoryController.getHistory);
router.get('/export-pdf', HistoryController.exportPDF);

export default router;
