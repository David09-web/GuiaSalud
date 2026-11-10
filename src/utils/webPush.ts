/**
 * Módulo de Cliente Web Push para GuiaSalud
 * Permite suscribir el navegador/celular a notificaciones push del servidor (Apple APNs / Google FCM)
 * para que las alertas lleguen con la aplicación CERRADA y el teléfono bloqueado.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export interface PushReminderPayload {
  id: string;
  patientId: string;
  title: string;
  body: string;
  targetTimeMs: number;
  tag: string;
  url?: string;
}

export async function isPushNotificationSupported(): Promise<boolean> {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export async function checkPushSubscriptionStatus(): Promise<'granted' | 'denied' | 'default'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  return Notification.permission;
}

export async function subscribeToPushNotifications(
  patientId: string = 'usr-001',
  reminders: PushReminderPayload[] = []
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { success: false, error: 'Tu navegador no soporta Web Push en este dispositivo.' };
    }

    // 1. Solicitar permiso al usuario
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'Permiso de notificaciones denegado en el dispositivo.' };
    }

    // 2. Obtener clave pública VAPID desde el backend
    const keyRes = await fetch('/api/v1/notifications/vapid-public-key');
    if (!keyRes.ok) {
      throw new Error('No se pudo obtener la clave VAPID del servidor');
    }
    const { publicKey } = await keyRes.json();

    // 3. Obtener registro del Service Worker
    const registration = await navigator.serviceWorker.ready;

    // 4. Suscribir a PushManager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedKey = urlBase64ToUint8Array(publicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // 5. Enviar suscripción y recordatorios al servidor
    const subRes = await fetch('/api/v1/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        subscription: subscription.toJSON(),
        reminders,
      }),
    });

    if (!subRes.ok) {
      const err = await subRes.json();
      throw new Error(err.message || 'Error guardando suscripción');
    }

    console.log('[CLIENT PUSH] Suscrito exitosamente a Web Push en el servidor.');
    return { success: true };
  } catch (error: any) {
    console.error('[CLIENT PUSH ERROR]', error);
    return { success: false, error: error.message };
  }
}

export async function syncRemindersWithServer(
  patientId: string = 'usr-001',
  reminders: PushReminderPayload[] = []
): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/notifications/sync-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        reminders,
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn('[PUSH SYNC ERROR]', e);
    return false;
  }
}

export async function requestTestPushNotification(
  patientId: string = 'usr-001'
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/v1/notifications/test-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    const data = await res.json();
    return { success: data.success, message: data.message };
  } catch (e: any) {
    return { success: false, message: e.message || 'Error de conexión' };
  }
}

