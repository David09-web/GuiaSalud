import { useState } from 'react';
import type { UserRole, UserProfile } from '../types';
import { Eye, EyeOff, ShieldCheck, Sparkles, User, Users, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  validateEmail,
  validatePassword,
  validateIdNumber,
  validateBirthDate,
  validateColombiaPhone,
  validatePersonName,
  validateAddress,
  getTodayDateString,
  getMinBirthDateString,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../utils/validation';

interface LoginScreenProps {
  onLogin: (role: UserRole, customUser?: UserProfile, isDemo?: boolean) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Controlled Registration Fields
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [eps, setEps] = useState('Sanitas');
  const [address, setAddress] = useState('');

  const emailValidation = validateEmail(email, !isRegister);
  const pwdValidation = validatePassword(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();

    // 1. REGLAS DE VALIDACIÓN EN REGISTRO
    if (isRegister) {
      // Validación estricta de Nombre Completo (sin números ni texto aleatorio)
      const nameCheck = validatePersonName(fullName.trim(), 'Nombre completo', true);
      if (!nameCheck.isValid) {
        setErrorMessage(nameCheck.error || 'Por favor ingresa un nombre completo válido.');
        return;
      }

      // Validación estricta de documento de identidad (solo números, 6 a 12 dígitos)
      const idCheck = validateIdNumber(idNumber);
      if (!idCheck.isValid) {
        setErrorMessage(idCheck.error || 'El documento de identidad debe contener únicamente números.');
        return;
      }

      // Validación estricta de fecha de nacimiento (no futura, no mayor a 2026, límite 1900)
      const birthCheck = validateBirthDate(birthDate);
      if (!birthCheck.isValid) {
        setErrorMessage(birthCheck.error || 'La fecha de nacimiento no puede ser posterior al día de hoy.');
        return;
      }

      // Validación estricta de teléfono celular (10 dígitos en Colombia, inicio con 3)
      if (phone.trim()) {
        const phoneCheck = validateColombiaPhone(phone.trim(), 'Teléfono Móvil');
        if (!phoneCheck.isValid) {
          setErrorMessage(phoneCheck.error || 'El número de teléfono no es válido.');
          return;
        }
      }

      // Validación estricta de dirección de residencia (si se proporciona)
      if (address.trim()) {
        const addrCheck = validateAddress(address.trim(), false, 'Dirección de Residencia');
        if (!addrCheck.isValid) {
          setErrorMessage(addrCheck.error || 'La dirección de residencia ingresada no es válida.');
          return;
        }
      }

      // Regla de Email: Condicionalidad (is_required: conditional) + Sintaxis Regex + Dominio
      const emailCheck = validateEmail(cleanEmail, false);
      if (!emailCheck.isValid) {
        setErrorMessage(emailCheck.error || 'Formato de correo electrónico no válido.');
        return;
      }

      // Regla de Contraseña: Longitud estricta + Dígito numérico obligatorio ([0-9])
      const pwdCheck = validatePassword(password);
      if (!pwdCheck.isValid) {
        setErrorMessage(pwdCheck.error || 'La contraseña no cumple con las políticas de seguridad.');
        return;
      }
    } else {
      // 2. REGLAS DE VALIDACIÓN EN INICIO DE SESIÓN
      if (!cleanEmail) {
        setErrorMessage('Por favor ingresa tu correo electrónico para iniciar sesión.');
        return;
      }
      const emailCheck = validateEmail(cleanEmail, true);
      if (!emailCheck.isValid) {
        setErrorMessage(emailCheck.error || 'Por favor ingresa un correo con formato válido (ej: usuario@gmail.com).');
        return;
      }
      if (!password.trim()) {
        setErrorMessage('Por favor ingresa tu contraseña.');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (isRegister) {
        const nameParts = fullName.trim().split(' ').filter(Boolean);
        const firstName = nameParts[0] || 'Usuario';
        const assignedEmail = cleanEmail || `${idNumber.trim()}@paciente.guiasalud.edu.co`;

        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name: fullName.trim(),
          firstName,
          idNumber: idNumber.trim() || '1020304050',
          birthDate: birthDate || '1995-01-01',
          address: address.trim() || 'Dirección no registrada',
          phone: phone.trim() || '300 000 0000',
          email: assignedEmail,
          eps: eps || 'Sanitas',
          ips: 'Centro Médico Integral',
          bloodType: bloodType || 'O+',
          allergies: [],
          conditions: [],
          surgeries: [],
          emergencyContact: {
            name: 'Contacto de Emergencia',
            relation: 'Familiar',
            phone: '310 000 0000',
          },
          twoFactorEnabled: true,
          dataConsentGranted: true,
          dataConsentDate: new Date().toISOString().split('T')[0],
        };

        // Guardar en localStorage de cuentas registradas
        try {
          const registeredUsers: any[] = JSON.parse(
            localStorage.getItem('guiasalud_registered_users') || '[]'
          );
          const existingIdx = registeredUsers.findIndex(
            (u) => u.email?.toLowerCase() === assignedEmail.toLowerCase()
          );
          if (existingIdx >= 0) {
            registeredUsers[existingIdx] = { ...newUser, password };
          } else {
            registeredUsers.push({ ...newUser, password });
          }
          localStorage.setItem('guiasalud_registered_users', JSON.stringify(registeredUsers));
        } catch (err) {
          console.error('Error guardando usuario en localStorage:', err);
        }

        // Iniciar sesión directamente con la cuenta creada (no es demo)
        onLogin('patient', newUser, false);
        return;
      }

      // Flujo de Login
      // 1. Verificar si existe en usuarios registrados
      try {
        const registeredUsers: any[] = JSON.parse(
          localStorage.getItem('guiasalud_registered_users') || '[]'
        );
        const found = registeredUsers.find((u) => u.email?.toLowerCase() === cleanEmail);
        if (found) {
          const { password: _, ...userProfile } = found;
          onLogin('patient', userProfile as UserProfile, false);
          return;
        }
      } catch (err) {
        console.error('Error leyendo usuarios de localStorage:', err);
      }

      // 2. Cuentas de demostración predeterminadas
      if (cleanEmail === 'admin.fet@guiasalud.edu.co') {
        onLogin('admin', undefined, true);
        return;
      }
      if (cleanEmail === 'carlos.rodriguez@gmail.com') {
        onLogin('family', undefined, true);
        return;
      }
      if (cleanEmail === 'maria.rodriguez@gmail.com') {
        onLogin('patient', undefined, true);
        return;
      }

      // 3. Si ingresó un correo válido cualquiera directamente en login
      if (cleanEmail) {
        const nameFromEmail = cleanEmail.split('@')[0];
        const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
        const autoUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name: formattedName,
          firstName: formattedName,
          idNumber: '1020304050',
          birthDate: '1995-01-01',
          address: 'Dirección Registrada',
          phone: '300 000 0000',
          email: cleanEmail,
          eps: 'Sanitas',
          ips: 'Centro Médico Integral',
          bloodType: 'O+',
          allergies: [],
          conditions: [],
          surgeries: [],
          emergencyContact: {
            name: 'Contacto Registrado',
            relation: 'Familiar',
            phone: '310 000 0000',
          },
          twoFactorEnabled: true,
          dataConsentGranted: true,
          dataConsentDate: new Date().toISOString().split('T')[0],
        };

        try {
          const registeredUsers: any[] = JSON.parse(
            localStorage.getItem('guiasalud_registered_users') || '[]'
          );
          registeredUsers.push({ ...autoUser, password });
          localStorage.setItem('guiasalud_registered_users', JSON.stringify(registeredUsers));
        } catch (err) {
          console.error(err);
        }

        onLogin('patient', autoUser, false);
        return;
      }

      setErrorMessage('Por favor ingresa un correo electrónico válido.');
    }, 500);
  };

  return (
    <div
      className="w-full min-h-screen overflow-y-auto flex flex-col justify-between py-6 px-4 pb-32 sm:pb-12"
      style={{
        background: 'linear-gradient(160deg, #0A3678 0%, #1565C0 50%, #0288D1 100%)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Top Branding Section */}
      <div className="flex flex-col items-center justify-center pt-4 pb-4 text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center mb-2.5 shadow-xl">
          <svg viewBox="0 0 48 48" fill="none" className="w-9 h-9">
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
          Versión 1.0 · Sistema Integral de Salud
        </span>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-6 max-w-md w-full mx-auto space-y-4">
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 font-medium flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div className="space-y-3 pb-2 border-b border-app-border/60 mb-2">
              <div className="bg-primary-50/50 p-3 rounded-xl border border-primary-100 mb-2">
                <p className="text-[11px] text-primary font-medium flex items-center gap-1.5">
                  <span>📋</span> Completa tu información médica y personal para garantizar una atención adecuada.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''))}
                  placeholder="Ej: Carlos Alberto Gómez"
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
                  required
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo letras y espacios (sin números)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Doc. Identidad <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={12}
                    value={idNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setIdNumber(val);
                    }}
                    placeholder="Ej: 1020304050"
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all font-mono"
                    required
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Solo números (6 a 12 dígitos)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Fecha Nacimiento
                  </label>
                  <input
                    type="date"
                    min={getMinBirthDateString()}
                    max={getTodayDateString()}
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all text-slate-700"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Hasta hoy (máx año 2026)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d+ -]/g, '');
                      setPhone(val);
                    }}
                    placeholder="Ej: 3219594358"
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all font-mono"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">10 dígitos (ej: 3101234567)</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Tipo de Sangre
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all bg-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    EPS
                  </label>
                  <select
                    value={eps}
                    onChange={(e) => setEps(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all bg-white"
                  >
                    <option value="Sanitas">Sanitas</option>
                    <option value="Sura">Sura</option>
                    <option value="Compensar">Compensar</option>
                    <option value="Salud Total">Salud Total</option>
                    <option value="Nueva EPS">Nueva EPS</option>
                    <option value="Comfamiliar Huila">Comfamiliar Huila</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Calle 123 # 45-67"
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Vía y número (ej: Calle 12 # 34-56)</p>
                </div>
              </div>
            </div>
          )}

          {/* Campo Correo Electrónico con Reglas de Validación */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider">
                Correo electrónico {isRegister ? (
                  <span className="text-slate-400 font-normal lowercase">(condicional)</span>
                ) : (
                  <span className="text-rose-500">*</span>
                )}
              </label>
              {email.trim() && (
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    emailValidation.isValid ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {emailValidation.isValid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Sintaxis válida
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Formato o dominio incompleto
                    </>
                  )}
                </span>
              )}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: usuario@gmail.com"
              className={`w-full border rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-app-text transition-all ${
                email.trim()
                  ? emailValidation.isValid
                    ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50'
                    : 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-50'
                  : 'border-app-border focus:border-primary focus:ring-2 focus:ring-primary-50'
              }`}
              required={!isRegister}
            />
            {isRegister && (
              <p className="text-[10px] text-slate-500 mt-1">
                ℹ <strong>Condicionalidad:</strong> No es obligatorio para registrarte. Si lo provees, se validará con sintaxis estándar y dominio coherente (@gmail.com, etc.).
              </p>
            )}
          </div>

          {/* Campo Contraseña con Reglas de Complejidad y Longitud */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider">
                Contraseña <span className="text-rose-500">*</span>
              </label>
              {password && (
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    pwdValidation.isValid ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {pwdValidation.isValid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Contraseña segura
                    </>
                  ) : (
                    <span>{password.length}/{PASSWORD_MIN_LENGTH}+ car.</span>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className={`w-full border rounded-xl px-3.5 py-2.5 pr-10 text-base sm:text-sm text-app-text transition-all ${
                  password
                    ? pwdValidation.isValid
                      ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-50'
                      : 'border-app-border focus:border-primary focus:ring-2 focus:ring-primary-50'
                    : 'border-app-border focus:border-primary focus:ring-2 focus:ring-primary-50'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center p-1.5 cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Panel explicativo de Política de Contraseña (Requisitos) */}
            <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Políticas de Seguridad:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                <span
                  className={`flex items-center gap-1.5 ${
                    pwdValidation.lengthValid ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  <span className={pwdValidation.lengthValid ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {pwdValidation.lengthValid ? '✓' : '○'}
                  </span>
                  Longitud: {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} caracteres
                </span>
                <span
                  className={`flex items-center gap-1.5 ${
                    pwdValidation.hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                  }`}
                >
                  <span className={pwdValidation.hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {pwdValidation.hasNumber ? '✓' : '○'}
                  </span>
                  Al menos un dígito ([0-9])
                </span>
              </div>
            </div>
          </div>

          {/* Security & OMS Health Notice */}
          <div className="flex gap-2.5 bg-slate-50 rounded-xl p-3 border border-slate-200 items-start">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Protección y Privacidad (OMS):</strong> Datos ficticios con fines académicos.
              Cifrado AES-256 en reposo y cumplimiento de Habeas Data (Ley 1581/2012).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all shadow-md font-display text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Autenticando credenciales...</span>
            ) : isRegister ? (
              'Crear cuenta segura'
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Quick Demo Role Selector */}
          {!isRegister && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-[11px] text-center font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Acceso rápido por rol (Demostración)
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('maria.rodriguez@gmail.com');
                    setPassword('password123');
                    onLogin('patient', undefined, true);
                  }}
                  className="bg-blue-50 hover:bg-blue-100 text-primary border border-blue-200 rounded-xl py-2 px-1 text-center font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" /> Paciente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin.fet@guiasalud.edu.co');
                    setPassword('admin2026!');
                    onLogin('admin', undefined, true);
                  }}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-xl py-2 px-1 text-center font-bold text-[11px] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Administrador
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('carlos.rodriguez@gmail.com');
                    setPassword('password123');
                    onLogin('family', undefined, true);
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl py-2 px-1 text-center font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-700" /> Familiar
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center pt-1">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMessage('');
            }}
            className="text-xs text-muted-txt hover:text-primary transition-colors cursor-pointer"
          >
            {isRegister ? '¿Ya tienes cuenta? ' : '¿Deseas registrar una nueva cuenta? '}
            <span className="font-bold text-primary">{isRegister ? 'Iniciar sesión' : 'Regístrate'}</span>
          </button>
        </div>
      </div>

      {/* Footer credits */}
      <p className="text-center text-[11px] text-white/70 mt-4">
        GuiaSalud · Plataforma Integral de Salud Digital y Acompañamiento Familiar
      </p>
    </div>
  );
}
