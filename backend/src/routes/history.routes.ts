import { Router } from 'express';
import { HistoryController } from '../controllers/historyController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren token de autenticación
router.use(authMiddleware);

// Endpoints principales del Módulo 3: Historia Clínica Personal
// GET /api/historia-clinica -> Obtiene la historia clínica con payload cifrado
router.get('/', HistoryController.getHistory);

// POST /api/historia-clinica -> Registra antecedentes, alergias, diagnósticos o procedimientos
router.post('/', HistoryController.saveHistory);

// GET /api/historia-clinica/adjuntos -> Lista archivos adjuntos con filtros de fecha y categoría
router.get('/adjuntos', HistoryController.getAdjuntos);

// POST /api/historia-clinica/adjuntos -> Carga un archivo con cifrado en reposo AES-256
router.post('/adjuntos', HistoryController.uploadAdjunto);

// DELETE /api/historia-clinica/adjuntos/:id -> Elimina un archivo adjunto
router.delete('/adjuntos/:id', HistoryController.deleteAdjunto);

// GET /api/historia-clinica/export-pdf -> Genera informe consolidado en PDF
router.get('/export-pdf', HistoryController.exportPDF);

export default router;
