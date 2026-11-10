import type { Appointment, UserProfile } from '../types';

/**
 * Normaliza y formatea un número telefónico para WhatsApp
 * Si es número colombiano de 10 dígitos (ej: 3101234567), antepone el código de país 57
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10 && digits.startsWith('3')) {
    return `57${digits}`;
  }
  return digits;
}

/**
 * Construye el mensaje formal con formato markdown para WhatsApp
 */
export function buildAppointmentWhatsAppMessage(
  appt: Appointment,
  patient: { name: string; idNumber?: string; eps?: string },
  leadTimeText?: string
): string {
  const noticeHeader = leadTimeText
    ? `🚨 *AVISO PREVIO (${leadTimeText.toUpperCase()}): CITA MÉDICA* 🚨`
    : `🏥 *RECORDATORIO DE CITA MÉDICA - GUIASALUD* 🏥`;

  return `${noticeHeader}

Estimado(a) *${patient.name}*${patient.idNumber ? ` (CC ${patient.idNumber})` : ''}:

Le recordamos los detalles de su próxima cita médica en el SGSSS:

🩺 *Especialidad:* ${appt.specialty}
👨‍⚕️ *Profesional tratante:* ${appt.doctor}
📅 *Fecha programada:* ${appt.date}
⏰ *Hora:* ${appt.time}
📍 *Sede / IPS:* ${appt.center}
${patient.eps ? `🏛️ *EPS:* ${patient.eps}\n` : ''}
📋 *Indicaciones del paciente:*
${appt.notes ? `• ${appt.notes}\n` : ''}• Presentarse con mínimo 15 minutos de anticipación.
• Portar documento de identidad original y carné de salud.
• Llevar autorizaciones vigentes y exámenes previos relacionados.

_Recordatorio emitido por GuiaSalud - Sistema de Gestión de Citas y Salud Familiar._`;
}

/**
 * Genera el enlace wa.me para abrir en el celular o WhatsApp Web
 */
export function getWhatsAppUrl(phone: string | undefined, message: string): string {
  const cleanPhone = phone ? formatPhoneForWhatsApp(phone) : '';
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Abre directamente WhatsApp en una nueva pestaña o aplicación nativa
 */
export function openWhatsAppDirect(phone: string | undefined, message: string): void {
  const url = getWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Solicita permisos de notificación del navegador (para celulares y escritorios)
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones nativas de escritorio/móvil.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Dispara una notificación nativa del navegador en el dispositivo (Compatible con Android Chrome, iOS PWA y PC)
 */
export function sendBrowserPushNotification(
  title: string,
  options?: { body?: string; icon?: string; tag?: string }
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    // 1. En móviles (Android Chrome / iOS PWA) se debe usar ServiceWorkerRegistration.showNotification()
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body: options?.body,
            icon: options?.icon || '/icon-512.png',
            badge: '/icon-512.png',
            tag: options?.tag,
            vibrate: [200, 100, 200],
          });
        })
        .catch(() => {
          tryFallbackNotification(title, options);
        });
      return;
    }

    tryFallbackNotification(title, options);
  }
}

function tryFallbackNotification(
  title: string,
  options?: { body?: string; icon?: string; tag?: string }
) {
  try {
    new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/icon-512.png',
      tag: options?.tag,
    });
  } catch (e) {
    console.warn('Error al emitir notificación del navegador:', e);
  }
}
