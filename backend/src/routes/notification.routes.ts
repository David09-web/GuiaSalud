import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

const router = Router();

// GET /api/v1/notifications/preferences
router.get('/preferences', (req: Request, res: Response) => {
  try {
    const patientId = (req.query.patientId as string) || 'usr-001';
    const preferences = NotificationService.getPreferences(patientId);
    res.status(200).json({ success: true, data: preferences });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/notifications/preferences
router.put('/preferences', (req: Request, res: Response) => {
  try {
    const patientId = (req.body.patientId as string) || 'usr-001';
    const updated = NotificationService.updatePreferences(patientId, req.body);
    res.status(200).json({
      success: true,
      message: 'Preferencias de notificación actualizadas exitosamente.',
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/v1/notifications
router.get('/', (req: Request, res: Response) => {
  try {
    const patientId = (req.query.patientId as string) || 'usr-001';
    const result = NotificationService.getNotifications(patientId);
    res.status(200).json({
      success: true,
      count: result.data.length,
      unreadCount: result.unreadCount,
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = NotificationService.markAsRead(id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada.' });
    }
    res.status(200).json({ success: true, message: 'Notificación marcada como leída.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/notifications/worker/scan (Simulación de ejecución del background worker)
router.post('/worker/scan', async (_req: Request, res: Response) => {
  try {
    const stats = await NotificationService.scanAndDispatchReminders();
    res.status(200).json({
      success: true,
      message: 'Background worker ejecutado correctamente.',
      stats,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// ENDPOINTS REALES DE WEB PUSH NOTIFICATIONS
// ==========================================

import { PushService } from '../services/pushService';

// GET /api/v1/notifications/vapid-public-key
router.get('/vapid-public-key', (_req: Request, res: Response) => {
  try {
    const publicKey = PushService.getPublicKey();
    res.status(200).json({ success: true, publicKey });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/notifications/subscribe
router.post('/subscribe', (req: Request, res: Response) => {
  try {
    const { patientId = 'usr-001', subscription, reminders = [] } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: 'Objeto de suscripción inválido.' });
    }

    PushService.saveSubscription(patientId, subscription, reminders);
    res.status(200).json({ success: true, message: 'Suscripción Web Push guardada exitosamente.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/notifications/sync-reminders
router.post('/sync-reminders', (req: Request, res: Response) => {
  try {
    const { patientId = 'usr-001', reminders = [] } = req.body;
    PushService.syncReminders(patientId, reminders);
    res.status(200).json({ success: true, message: 'Recordatorios sincronizados con el servidor.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/notifications/test-push
router.post('/test-push', async (req: Request, res: Response) => {
  try {
    const { patientId = 'usr-001' } = req.body;
    const ok = await PushService.sendTestPush(patientId);
    if (!ok) {
      return res.status(404).json({
        success: false,
        message: 'No hay ninguna suscripción push registrada para enviar la prueba.',
      });
    }
    res.status(200).json({ success: true, message: 'Notificación push de prueba despachada exitosamente.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
