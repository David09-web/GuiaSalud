import { useState, useEffect, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    // Check if already installed / in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return; // Don't show banner if already installed

    // Check if iOS (Safari doesn't support beforeinstallprompt)
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    if (ios) {
      // On iOS, show the banner after a short delay to explain manual install
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => clearTimeout(timer);
      }
      return;
    }

    // For Android/Chrome: Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    dismissedRef.current = true;
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="pwa-install-banner">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm leading-tight">📱 Instala GuiaSalud</p>
        {isIOS ? (
          <p className="text-xs mt-1 opacity-90 leading-tight">
            Toca <strong>Compartir</strong> (⬆️) y luego <strong>"Añadir a Inicio"</strong>
          </p>
        ) : (
          <p className="text-xs mt-1 opacity-90 leading-tight">
            Accede rápido desde tu pantalla de inicio
          </p>
        )}
      </div>
      {!isIOS && (
        <button className="install" onClick={handleInstall}>
          Instalar
        </button>
      )}
      <button className="dismiss" onClick={handleDismiss} aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}
