import { useState } from 'react';
import type { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState('maria.rodriguez@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('849201');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'patient') {
      setEmail('maria.rodriguez@gmail.com');
    } else if (role === 'family') {
      setEmail('carlos.rodriguez@gmail.com');
    } else {
      setEmail('admin.fet@guiasalud.edu.co');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(selectedRole);
    }, 600);
  };

  return (
    <div
      className="min-h-full flex flex-col justify-between py-6 px-4"
      style={{ background: 'linear-gradient(160deg, #0A3678 0%, #1565C0 50%, #0288D1 100%)' }}
    >
      {/* Top Branding Section */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4 text-white">
        <div className="w-18 h-18 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3 shadow-xl">
          <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
            <circle cx="24" cy="24" r="20" fill="white" opacity="0.15" />
            <path
              d="M24 10C16.27 10 10 16.27 10 24s6.27 14 14 14 14-6.27 14-14S31.73 10 24 10z"
              fill="white"
              opacity="0.2"
            />
            <path d="M27 19h-6v5h-5v6h5v5h6v-5h5v-6h-5v-5z" fill="white" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">GuiaSalud</h1>
        <p className="text-white/80 text-xs text-center mt-0.5">
          Tu salud, organizada y segura · ODS 16 y ODS 3
        </p>
        <span className="mt-2 text-[11px] bg-white/20 border border-white/30 text-white font-medium px-3 py-0.5 rounded-full">
          Versión 1.0 (Ingeniería de Software II - FET)
        </span>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full mx-auto space-y-4">
        {/* Role Fast Selector */}
        <div>
          <label className="block text-[11px] font-bold text-muted-txt uppercase tracking-wider mb-2">
            Seleccionar Rol de Acceso (Demostración Académica)
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleRoleSelect('patient')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'patient'
                  ? 'bg-white text-primary shadow-xs border border-primary/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👤 Paciente
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('family')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'family'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Familiar
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                defaultValue="María Rodríguez"
                className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-app-border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-txt hover:text-primary transition-colors"
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* 2FA Section Toggle */}
          <div className="rounded-xl border border-app-border overflow-hidden">
            <button
              type="button"
              onClick={() => setShow2FA(!show2FA)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-primary-50 text-xs font-semibold text-primary hover:bg-primary-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                Verificación Doble Factor (2FA Activo)
              </span>
              <span>{show2FA ? '▲' : '▼'}</span>
            </button>
            {show2FA && (
              <div className="px-3.5 py-3 bg-primary-50/40 space-y-2">
                <p className="text-[11px] text-muted-txt">
                  Token generado por la App Autenticadora / SMS:
                </p>
                <div className="flex justify-between gap-1.5">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-10 h-10 text-center text-base font-bold border border-app-border rounded-lg bg-white focus:border-primary focus:ring-2 focus:ring-primary-50"
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
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  ✓ Token de 6 dígitos verificado con servidor seguro
                </p>
              </div>
            )}
          </div>

          {/* Security & OMS Health Notice */}
          <div className="flex gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-200">
            <span className="text-primary text-base">🛡️</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Protección y Privacidad (OMS):</strong> Datos ficticios con fines académicos.
              Cifrado AES-256 en reposo y cumplimiento de Habeas Data (Ley 1581/2012).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all shadow-md font-display text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Autenticando credenciales y 2FA...</span>
            ) : isRegister ? (
              'Crear cuenta segura'
            ) : (
              `Ingresar como ${
                selectedRole === 'patient'
                  ? 'Paciente'
                  : selectedRole === 'family'
                  ? 'Familiar Autorizado'
                  : 'Administrador'
              }`
            )}
          </button>
        </form>

        <div className="text-center pt-1">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-muted-txt hover:text-primary transition-colors"
          >
            {isRegister ? '¿Ya tienes cuenta? ' : '¿Deseas registrar una nueva cuenta? '}
            <span className="font-bold text-primary">{isRegister ? 'Iniciar sesión' : 'Regístrate'}</span>
          </button>
        </div>
      </div>

      {/* Footer credits */}
      <p className="text-center text-[11px] text-white/70 mt-4">
        FET - Fundación Escuela Tecnológica de Neiva · Ingeniería de Software II
      </p>
    </div>
  );
}
