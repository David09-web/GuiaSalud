import { useState, useEffect } from 'react';
import type { NotificationItem, Screen } from '../types';
import { requestBrowserNotificationPermission } from '../utils/whatsapp';
import {
  subscribeToPushNotifications,
  requestTestPushNotification,
  checkPushSubscriptionStatus,
} from '../utils/webPush';
import { MessageSquare, BellRing, Check, ExternalLink, Calendar, Pill, Shield, Info, Smartphone, Sparkles } from 'lucide-react';

interface NotificationModalProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectNotification: (target?: Screen) => void;
  patientId?: string;
}

export default function NotificationModal({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onSelectNotification,
  patientId = 'usr-001',
}: NotificationModalProps) {
  const [hasBrowserPerm, setHasBrowserPerm] = useState<boolean>(false);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [testCountdown, setTestCountdown] = useState<number | null>(null);
  const [testStatus, setTestStatus] = useState<string>('');

  useEffect(() => {
    checkPushSubscriptionStatus().then((status) => {
      setHasBrowserPerm(status === 'granted');
      // Si el navegador ya tiene permiso concedido, auto-sincronizar suscripción con el servidor
      if (status === 'granted') {
        subscribeToPushNotifications(patientId).catch(() => {});
      }
    });
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const handleRequestPush = async () => {
    setIsSubscribing(true);
    setTestStatus('Activando Web Push con el servidor...');
    const result = await subscribeToPushNotifications(patientId);
    setIsSubscribing(false);
    if (result.success) {
      setHasBrowserPerm(true);
      setTestStatus('✅ ¡Servidor Web Push conectado con tu iPhone!');
      setTimeout(() => setTestStatus(''), 4000);
    } else {
      setTestStatus('❌ ' + (result.error || 'No se pudo activar'));
    }
  };

  const handleTriggerTestPush = async () => {
    setIsSubscribing(true);
    setTestStatus('Conectando con tu iPhone...');
    // Garantizar que la suscripción esté registrada en el backend
    const subRes = await subscribeToPushNotifications(patientId);
    setIsSubscribing(false);

    if (!subRes.success) {
      setTestStatus('❌ ' + (subRes.error || 'Error conectando con el servidor'));
      return;
    }

    setTestCountdown(5);
    setTestStatus('¡Bloquea tu pantalla ahora! Enviando en 5s...');

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setTestCountdown(count);
        setTestStatus(`¡Bloquea tu pantalla ahora! Enviando en ${count}s...`);
      } else {
        clearInterval(interval);
        setTestCountdown(null);
        setTestStatus('📲 ¡Enviando notificación push desde el servidor...');
        requestTestPushNotification(patientId).then((res) => {
          if (res.success) {
            setTestStatus('✅ ¡Notificación enviada con éxito a tu iPhone!');
          } else {
            setTestStatus('❌ ' + (res.message || 'Error de envío'));
          }
          setTimeout(() => setTestStatus(''), 5000);
        });
      }
    }, 1000);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case 'medication':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Pill className="w-4 h-4" />
          </div>
        );
      case 'security':
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const getAdvanceBadge = (advance?: NotificationItem['advanceType']) => {
    switch (advance) {
      case '24h':
        return (
          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
            🔔 1 día antes
          </span>
        );
      case '12h':
        return (
          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
            ⏰ 12 horas antes
          </span>
        );
      case '5h':
        return (
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
            🚨 5 horas antes
          </span>
        );
      case 'now':
        return (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            ⚡ En curso
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn max-h-[85dvh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-app-text text-base">Notificaciones</h3>
            <span className="text-xs bg-primary-50 text-primary font-bold px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.read).length} nuevas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Marcar leídas
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center hover:bg-slate-200 text-muted-txt cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Browser Push Banner & Server Web Push controls */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-emerald-900">
              <BellRing className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold leading-tight">
                  {hasBrowserPerm ? '✅ Web Push Activo en tu Celular' : '🔔 Activar Alertas en Celular'}
                </p>
                <p className="text-[10px] text-emerald-700 leading-tight">
                  {hasBrowserPerm
                    ? 'El servidor avisará a tu teléfono con la app cerrada'
                    : 'Permite notificaciones push aunque no tengas la app abierta'}
                </p>
              </div>
            </div>
            {!hasBrowserPerm ? (
              <button
                onClick={handleRequestPush}
                disabled={isSubscribing}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubscribing ? 'Activando...' : 'Activar Web Push'}
              </button>
            ) : (
              <button
                onClick={handleTriggerTestPush}
                disabled={Boolean(testCountdown)}
                className="bg-primary hover:bg-primary-hover active:scale-95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1"
                title="Prueba si llega con la app cerrada y pantalla bloqueada"
              >
                <Smartphone className="w-3 h-3" />
                {testCountdown ? `Enviando (${testCountdown}s)` : 'Probar en 5s'}
              </button>
            )}
          </div>

          {testStatus && (
            <div className="bg-primary-50 border border-primary-200 text-primary-900 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>{testStatus}</span>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-app-border/60">
          {notifications.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-3xl mb-2">🔔</p>
              <p className="text-sm font-semibold text-app-text">Sin notificaciones pendientes</p>
              <p className="text-xs text-muted-txt mt-0.5">Estás al día con tus citas y medicamentos.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${
                  !n.read ? 'bg-primary-50/20' : ''
                }`}
              >
                {getIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <p className={`text-xs sm:text-sm font-bold ${!n.read ? 'text-primary' : 'text-app-text'}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-muted-txt flex-shrink-0">{n.timestamp}</span>
                  </div>

                  {n.advanceType && <div className="mt-1">{getAdvanceBadge(n.advanceType)}</div>}

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{n.message}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-1">
                    {/* Botón WhatsApp si está disponible */}
                    {n.whatsAppUrl && (
                      <a
                        href={n.whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Abrir en WhatsApp
                      </a>
                    )}

                    {n.targetScreen && (
                      <button
                        onClick={() => {
                          onSelectNotification(n.targetScreen);
                          onClose();
                        }}
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Ver en {n.targetScreen === 'agenda' ? 'Agenda' : n.targetScreen === 'medications' ? 'Medicamentos' : 'Historial'} →
                      </button>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-app-border text-center space-y-1">
          <p className="text-[11px] text-muted-txt font-medium">
            Sistema multicanal: Notificaciones internas, push y avisos directos a WhatsApp móvil.
          </p>
        </div>
      </div>
    </div>
  );
}
