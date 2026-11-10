import { Router } from 'express';
import { AgendaController } from '../controllers/agendaController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/rolesMiddleware';

// ============================================================================
// RUTAS OFICIALES: /api/citas (Módulo 1 - Agenda Médica)
// Responsable Backend: David Marcet Ospina
// Responsable Frontend: Francisco Trujillo Peralta
// ============================================================================

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('PATIENT', 'FAMILY', 'ADMIN'));

// Endpoints definidos en el acta de acuerdos de desarrollo:
// • POST /api/citas - Crear cita vinculada al ID del usuario autenticado
// • GET /api/citas - Obtener citas programadas e historial clínico
// • PUT /api/citas/:id - Actualizar datos o estado de la cita
// • PATCH /api/citas/:id/status - Cambiar estado (pendiente, realizada, cancelada)
// • DELETE /api/citas/:id - Baja lógica / soft-delete (sin borrado físico en PostgreSQL)
router.get('/', AgendaController.getAppointments);
router.post('/', AgendaController.createAppointment);
router.put('/:id', AgendaController.updateAppointment);
router.patch('/:id/status', AgendaController.updateStatus);
router.delete('/:id', AgendaController.softDelete);

export default router;
