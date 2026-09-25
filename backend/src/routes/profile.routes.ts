import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { authMiddleware } from '../middlewares/authMiddleware';

// ============================================================================
// RUTAS DEL PERFIL DE USUARIO (Módulo 4)
// Todas las rutas requieren autenticación JWT
//
// GET    /api/v1/profile                      - Perfil completo
// PUT    /api/v1/profile/personal             - Actualizar datos personales
// PUT    /api/v1/profile/affiliation          - Actualizar afiliación EPS/IPS
// GET    /api/v1/profile/emergency-contacts   - Listar contactos de emergencia
// POST   /api/v1/profile/emergency-contacts   - Crear contacto de emergencia
// PUT    /api/v1/profile/emergency-contacts/:id - Actualizar contacto
// DELETE /api/v1/profile/emergency-contacts/:id - Eliminar contacto
// POST   /api/v1/profile/revoke-consent       - Revocar consentimiento Habeas Data
// ============================================================================

const router = Router();

// Todas las rutas de perfil requieren autenticación
router.use(authMiddleware);

// Perfil completo
router.get('/', ProfileController.getProfile);

// Datos personales
router.put('/personal', ProfileController.updatePersonalData);

// Afiliación EPS/IPS
router.put('/affiliation', ProfileController.updateAffiliation);

// Contactos de emergencia (CRUD)
router.get('/emergency-contacts', ProfileController.getEmergencyContacts);
router.post('/emergency-contacts', ProfileController.createEmergencyContact);
router.put('/emergency-contacts/:id', ProfileController.updateEmergencyContact);
router.delete('/emergency-contacts/:id', ProfileController.deleteEmergencyContact);

// Habeas Data
router.post('/revoke-consent', ProfileController.revokeConsent);

export default router;
