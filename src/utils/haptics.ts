/**
 * Motor Táctil y Háptico para GuiaSalud (iOS / Android Mobile)
 * Proporciona respuesta física instantánea (vibración háptica) y tacto nativo
 * en todos los componentes interactivos de la aplicación.
 */

export type HapticFeedbackType = 'light' | 'medium' | 'success' | 'warning' | 'selection';

export function triggerHaptic(type: HapticFeedbackType = 'light') {
  if (typeof window === 'undefined' || !('navigator' in window) || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'light':
      case 'selection':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'success':
        navigator.vibrate([15, 30, 25]);
        break;
      case 'warning':
        navigator.vibrate([30, 40, 30]);
        break;
    }
  } catch {
    // Si el navegador bloquea la vibración, continúa de forma transparente
  }
}

/**
 * Inicializa escuchadores táctiles globales para que TODAS las pantallas
 * respondan con tacto reactivo inmediato y vibración háptica en celulares.
 */
let isInitialized = false;

export function initGlobalTouchInteractivity() {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  const handleTouchStart = (e: TouchEvent) => {
    const target = (e.target as HTMLElement | null)?.closest(
      'button, a, select, input[type="radio"], input[type="checkbox"], [role="button"], .touch-interactive, .interactive-card'
    );
    if (target) {
      triggerHaptic('light');
    }
  };

  window.addEventListener('touchstart', handleTouchStart, { passive: true });
}
