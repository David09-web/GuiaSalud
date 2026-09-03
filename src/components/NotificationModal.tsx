import type { NotificationItem, Screen } from '../types';

interface NotificationModalProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onSelectNotification: (target?: Screen) => void;
}

export default function NotificationModal({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onSelectNotification,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return (
          <div className="w-8 h-8 rounded-full bg-primary-50 text-primary flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
        );
      case 'medication':
        return (
          <div className="w-8 h-8 rounded-full bg-alert-bg text-alert flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <path d="M10.5 20H4a2 2 0 0 1-2-2v-2.5" />
              <path d="M9 10l-6.5 6.5c-.78.78-.78 2.05 0 2.83l2.17 2.17c.78.78 2.05.78 2.83 0L14 15" />
              <path d="M14 4.172a4 4 0 0 1 5.657 0l.172.172a4 4 0 0 1 0 5.656L14 16l-5.828-5.828" />
            </svg>
          </div>
        );
      case 'security':
        return (
          <div className="w-8 h-8 rounded-full bg-secondary-50 text-secondary flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 px-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-app-text text-base">Notificaciones</h3>
            <span className="text-xs bg-primary-50 text-primary font-bold px-2 py-0.5 rounded-full">
              {notifications.filter((n) => !n.read).length} nuevas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Marcar leídas
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center hover:bg-slate-200 text-muted-txt"
            >
              ✕
            </button>
          </div>
        </div>

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
                onClick={() => {
                  if (n.targetScreen) {
                    onSelectNotification(n.targetScreen);
                  }
                  onClose();
                }}
                className={`p-4 flex gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                  !n.read ? 'bg-primary-50/20' : ''
                }`}
              >
                {getIcon(n.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-semibold ${!n.read ? 'text-primary' : 'text-app-text'}`}>
                      {n.title}
                    </p>
                    <span className="text-[11px] text-muted-txt flex-shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-txt mt-1 leading-relaxed">{n.message}</p>
                  {n.targetScreen && (
                    <p className="text-[11px] font-semibold text-primary mt-1.5 flex items-center gap-1">
                      Ver detalle →
                    </p>
                  )}
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-app-border text-center">
          <p className="text-[11px] text-muted-txt">
            Sistema multicanal: Notificaciones internas, push y avisos SMS programados.
          </p>
        </div>
      </div>
    </div>
  );
}
