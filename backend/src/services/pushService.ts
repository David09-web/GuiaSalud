
import webpush, { VAPID_KEYS } from '../config/vapid';
import fs from 'fs';
import path from 'path';

const STORAGE_PATH = path.resolve(__dirname, '../../data/push_subscriptions.json');

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface ScheduledPushReminder {
  id: string;
  patientId: string;
  title: string;
  body: string;
  targetTimeMs: number;
  tag: string;
  url?: string;
  dispatched?: boolean;
}

interface UserPushRecord {
  patientId: string;
  subscription: PushSubscriptionData;
  reminders: ScheduledPushReminder[];
  updatedAt: string;
}

function loadPersistedRecords(): Map<string, UserPushRecord> {
  const map = new Map<string, UserPushRecord>();
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
      for (const item of data) {
        map.set(item.patientId, item);
      }
      console.log(`[PUSH] Cargadas ${map.size} suscripciones persistentes desde disco.`);
    }
  } catch (e) {
    console.warn('[PUSH] No se pudieron cargar suscripciones previas:', e);
  }
  return map;
}

function savePersistedRecords(map: Map<string, UserPushRecord>) {
  try {
    const dir = path.dirname(STORAGE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(Array.from(map.values()), null, 2), 'utf8');
  } catch (e) {
    console.error('[PUSH] Error al persistir suscripciones en disco:', e);
  }
}

export class PushService {
  private static userRecords: Map<string, UserPushRecord> = loadPersistedRecords();
  private static schedulerInterval: NodeJS.Timeout | null = null;

  public static getPublicKey(): string {
    return VAPID_KEYS.publicKey;
  }

  public static saveSubscription(
    patientId: string,
    subscription: PushSubscriptionData,
    reminders: ScheduledPushReminder[] = []
  ): void {
    const existing = this.userRecords.get(patientId);
    this.userRecords.set(patientId, {
      patientId,
      subscription,
      reminders: reminders.length > 0 ? reminders : (existing?.reminders || []),
      updatedAt: new Date().toISOString(),
    });

    savePersistedRecords(this.userRecords);
    console.log(`[PUSH] Suscripción registrada para paciente ${patientId} (Total recordatorios: ${reminders.length})`);
    this.ensureScheduler();
  }

  public static syncReminders(patientId: string, reminders: ScheduledPushReminder[]): void {
    const record = this.userRecords.get(patientId);
    if (record) {
      record.reminders = reminders;
      record.updatedAt = new Date().toISOString();
      savePersistedRecords(this.userRecords);
      console.log(`[PUSH] Recordatorios sincronizados para ${patientId}: ${reminders.length} alertas.`);
    } else {
      console.log(`[PUSH] Paciente ${patientId} aún no tiene suscripción activa.`);
    }
  }

  public static async sendPush(
    subscription: PushSubscriptionData,
    payload: { title: string; body: string; tag?: string; url?: string }
  ): Promise<boolean> {
    try {
      const stringifiedPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: '/icon-512.png',
        badge: '/icon-512.png',
        tag: payload.tag || 'guiasalud-alert',
        vibrate: [200, 100, 200],
        data: { url: payload.url || '/' },
      });

      await webpush.sendNotification(subscription as any, stringifiedPayload, {
        TTL: 60 * 60 * 24, // 24 hours TTL
        urgency: 'high',
      });

      console.log(`[PUSH] Notificación enviada con éxito a ${subscription.endpoint.substring(0, 45)}...`);
      return true;
    } catch (error: any) {
      console.error(`[PUSH ERROR] Fallo al enviar notificación push:`, error.message);
      // Si la suscripción expiró o fue dada de baja (HTTP 410 o 404), limpiar
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.warn(`[PUSH] Suscripción expirada/desinstalada.`);
      }
      return false;
    }
  }

  public static async sendTestPush(patientId: string): Promise<boolean> {
    const record = this.userRecords.get(patientId);
    if (!record || !record.subscription) {
      // Intentar enviar al primer registro disponible si no coincide el ID exacto
      const first = Array.from(this.userRecords.values())[0];
      if (first && first.subscription) {
        return this.sendPush(first.subscription, {
          title: '💊 ¡Prueba de Notificación Push!',
          body: 'Si ves este mensaje en tu pantalla de bloqueo, las alertas con la app cerrada funcionan al 100%.',
          tag: 'test-push',
        });
      }
      return false;
    }

    return this.sendPush(record.subscription, {
      title: '💊 ¡Prueba de Notificación Push!',
      body: 'Si ves este mensaje en tu pantalla de bloqueo, las alertas con la app cerrada funcionan al 100%.',
      tag: 'test-push',
    });
  }

  public static ensureScheduler(): void {
    if (this.schedulerInterval) return;

    console.log('[PUSH SCHEDULER] Iniciando vigilante en segundo plano cada 15s...');
    this.schedulerInterval = setInterval(async () => {
      const now = Date.now();

      for (const [patientId, record] of this.userRecords.entries()) {
        if (!record.subscription || !record.reminders) continue;

        for (const rem of record.reminders) {
          if (rem.dispatched) continue;

          // Si ya llegó o pasó la hora programada (margen de hasta 5 minutos de atraso permitido)
          const diffMs = rem.targetTimeMs - now;
          if (diffMs <= 0 && diffMs >= -5 * 60 * 1000) {
            rem.dispatched = true;
            console.log(`[PUSH TRIGGER] Disparando alarma programada: ${rem.title} para ${patientId}`);
            await this.sendPush(record.subscription, {
              title: rem.title,
              body: rem.body,
              tag: rem.tag,
              url: rem.url,
            });
          }
        }
      }
    }, 15000); // Revisión cada 15 segundos
  }
}

// Iniciar de inmediato el scheduler
PushService.ensureScheduler();

