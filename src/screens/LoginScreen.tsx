import { useState } from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('maria.rodriguez@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 900);
  };

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #0D47A1 0%, #1565C0 45%, #1976D2 100%)' }}>
      {/* Top hero section */}
      <div className="flex flex-col items-center justify-center pt-14 pb-8 px-6 text-white">
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 shadow-xl">
          <svg viewBox="0 0 48 48" fill="none" className="w-11 h-11">
            <circle cx="24" cy="24" r="20" fill="white" opacity="0.15"/>
            <path d="M24 10C16.27 10 10 16.27 10 24s6.27 14 14 14 14-6.27 14-14S31.73 10 24 10z" fill="white" opacity="0.2"/>
            <path d="M27 19h-6v5h-5v6h5v5h6v-5h5v-6h-5v-5z" fill="white"/>
            <path d="M24 8C15.16 8 8 15.16 8 24s7.16 16 16 16 16-7.16 16-16S32.84 8 24 8zm0 28c-6.63 0-12-5.37-12-12s5.37-12 12-12 12 5.37 12 12-5.37 12-12 12z" fill="white" opacity="0.4"/>
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-1">GuiaSalud</h1>
        <p className="text-white/70 text-sm text-center">Tu salud, organizada y segura</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-3xl shadow-2xl px-6 pt-8 pb-10">
        <h2 className="font-display text-xl font-bold text-app-text mb-1">
          {isRegister ? 'Crear cuenta' : 'Bienvenida de nuevo'}
        </h2>
        <p className="text-muted-txt text-sm mb-6">
          {isRegister ? 'Completa tus datos para comenzar' : 'Ingresa tus credenciales para continuar'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="María Rodríguez"
                className="w-full border border-app-border rounded-xl px-4 py-3 text-sm text-app-text placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full border border-app-border rounded-xl px-4 py-3 text-sm text-app-text placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-app-border rounded-xl px-4 py-3 pr-11 text-sm text-app-text placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-txt hover:text-primary transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* 2FA expandable section */}
          <div className="rounded-xl border border-app-border overflow-hidden">
            <button
              type="button"
              onClick={() => setShow2FA(!show2FA)}
              className="w-full flex items-center justify-between px-4 py-3 bg-primary-50 text-sm font-medium text-primary hover:bg-primary-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                </svg>
                Doble Factor de Autenticación (2FA)
              </span>
              <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 transition-transform ${show2FA ? 'rotate-180' : ''}`} stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {show2FA && (
              <div className="px-4 pb-4 pt-3 bg-primary-50/50 space-y-3">
                <p className="text-xs text-muted-txt">Ingresa el código de 6 dígitos enviado por SMS o generado por tu app autenticadora.</p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-10 h-12 text-center text-lg font-bold border border-app-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
                      value={twoFACode[i] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/, '');
                        const arr = twoFACode.split('');
                        arr[i] = val;
                        setTwoFACode(arr.join('').slice(0, 6));
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-primary cursor-pointer hover:underline">¿No recibiste el código? Reenviar</p>
              </div>
            )}
          </div>

          {/* Privacy notice */}
          <div className="flex gap-3 bg-primary-50 rounded-xl p-3.5 border border-primary-100">
            <div className="flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-primary" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <p className="text-xs text-primary leading-relaxed">
              <strong>Aviso de privacidad:</strong> Esta plataforma usa datos ficticios con fines académicos. Tu información está protegida conforme a la Ley 1581/2012 y las pautas de la OMS sobre salud digital. No compartimos datos con terceros.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed font-display text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Verificando...
              </span>
            ) : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-muted-txt hover:text-primary transition-colors"
          >
            {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
            <span className="font-semibold text-primary">{isRegister ? 'Iniciar sesión' : 'Regístrate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
