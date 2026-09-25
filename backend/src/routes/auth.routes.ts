import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

// ============================================================================
// RUTAS DE AUTENTICACIÓN Y SEGURIDAD 2FA
// POST /api/v1/auth/register       - Registro de usuario
// POST /api/v1/auth/login           - Inicio de sesión (paso 1)
// POST /api/v1/auth/verify-2fa      - Verificación 2FA (paso 2)
// GET  /api/v1/auth/me              - Perfil del usuario autenticado
// POST /api/v1/auth/2fa/enable      - Iniciar configuración 2FA
// POST /api/v1/auth/2fa/verify-setup- Confirmar activación 2FA
// POST /api/v1/auth/2fa/disable     - Deshabilitar 2FA
// ============================================================================

const router = Router();

// Públicas (no requieren JWT)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify-2fa', AuthController.verify2FA);

// Protegidas (requieren JWT válido)
router.get('/me', authMiddleware, AuthController.getMe);
router.post('/2fa/enable', authMiddleware, AuthController.enable2FA);
router.post('/2fa/verify-setup', authMiddleware, AuthController.verify2FASetup);
router.post('/2fa/disable', authMiddleware, AuthController.disable2FA);

export default router;
