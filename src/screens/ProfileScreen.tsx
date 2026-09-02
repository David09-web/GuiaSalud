import { useState } from 'react';
import { user } from '../data';

export default function ProfileScreen() {
  const [familyAccess, setFamilyAccess] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showEmergencyCall, setShowEmergencyCall] = useState(false);

  const personalInfo = [
    { label: 'Número de cédula', value: user.idNumber },
    { label: 'Fecha de nacimiento', value: user.birthDate },
    { label: 'Dirección', value: user.address },
    { label: 'Teléfono', value: user.phone },
    { label: 'Correo electrónico', value: user.email },
  ];

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="bg-surface rounded-2xl border border-app-border shadow-sm p-5 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1565C0, #1976D2)' }}
        >
          MR
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-app-text text-lg leading-tight">{user.name}</h2>
          <p className="text-sm text-muted-txt">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs bg-secondary-50 text-secondary font-semibold px-2 py-0.5 rounded-full border border-secondary/20">
              {user.eps}
            </span>
            <span className="text-xs bg-primary-50 text-primary font-semibold px-2 py-0.5 rounded-full border border-primary-100">
              {user.bloodType}
            </span>
          </div>
        </div>
        <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-muted-txt" stroke="currentColor" strokeWidth="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </button>
      </div>

      {/* Emergency contact — prominent red card */}
      <button
        onClick={() => setShowEmergencyCall(true)}
        className="w-full bg-emergency-bg border border-emergency/25 rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-shadow group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emergency/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emergency" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.36 17.18 7.4 15.2 6.14 12.92A19.79 19.79 0 0 1 3.07 4.27 2 2 0 0 1 5.05 2.13H8a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-emergency uppercase tracking-wide">Contacto de emergencia</p>
              <p className="font-semibold text-app-text">{user.emergencyContact.name}</p>
            </div>
          </div>
          <div className="bg-emergency text-white text-xs font-bold px-3 py-1.5 rounded-xl group-hover:opacity-90 transition-opacity flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.36 17.18 7.4 15.2 6.14 12.92A19.79 19.79 0 0 1 3.07 4.27 2 2 0 0 1 5.05 2.13H8a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/>
            </svg>
            Llamar
          </div>
        </div>
        <div className="flex items-center gap-4 pl-11 text-sm text-muted-txt">
          <span>{user.emergencyContact.relation}</span>
          <span className="font-medium text-app-text">{user.emergencyContact.phone}</span>
        </div>
      </button>

      {/* Affiliation */}
      <section className="bg-surface rounded-2xl border border-app-border shadow-sm divide-y divide-app-border overflow-hidden">
        <div className="p-4">
          <p className="text-xs font-semibold text-muted-txt uppercase tracking-wider mb-3">Afiliación en salud</p>
          <div className="space-y-3">
            {[
              { label: 'EPS', value: user.eps, icon: '🏥' },
              { label: 'IPS Primaria', value: user.ips, icon: '🏨' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-xs text-muted-txt">{item.label}</p>
                  <p className="text-sm font-semibold text-app-text">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personal info */}
      <section className="bg-surface rounded-2xl border border-app-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-app-border flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-txt uppercase tracking-wider">Datos personales</p>
          <button className="text-xs text-primary font-medium hover:underline">Editar</button>
        </div>
        <div className="divide-y divide-app-border/50">
          {personalInfo.map((item) => (
            <div key={item.label} className="px-4 py-3 flex items-start justify-between gap-3">
              <p className="text-xs text-muted-txt flex-shrink-0 w-32">{item.label}</p>
              <p className="text-sm text-app-text font-medium text-right">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Settings / toggles */}
      <section className="bg-surface rounded-2xl border border-app-border shadow-sm divide-y divide-app-border overflow-hidden">
        <div className="p-4">
          <p className="text-xs font-semibold text-muted-txt uppercase tracking-wider mb-3">Permisos y configuración</p>
          <div className="space-y-4">
            {/* Family access toggle */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-app-text">Acceso familiar autorizado</p>
                  <p className="text-xs text-muted-txt mt-0.5">Permite a un familiar de confianza ver tu información médica básica.</p>
                  {familyAccess && (
                    <button className="text-xs text-primary font-medium mt-1 hover:underline">Gestionar permisos →</button>
                  )}
                </div>
              </div>
              <button
                onClick={() => setFamilyAccess(!familyAccess)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${familyAccess ? 'bg-secondary' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${familyAccess ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-primary" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-app-text">Recordatorios de citas y medicamentos</p>
                  <p className="text-xs text-muted-txt mt-0.5">Notificaciones por SMS y app para nunca olvidar una toma o cita.</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${notifications ? 'bg-primary' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifications ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security section */}
      <section className="bg-surface rounded-2xl border border-app-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-app-border">
          <p className="text-xs font-semibold text-muted-txt uppercase tracking-wider">Seguridad</p>
        </div>
        <div className="divide-y divide-app-border/50">
          {[
            { label: 'Cambiar contraseña', icon: '🔒' },
            { label: 'Configurar 2FA', icon: '📱' },
            { label: 'Descargar mis datos', icon: '📥' },
          ].map((item) => (
            <button key={item.label} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span className="text-sm font-medium text-app-text">{item.label}</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-muted-txt" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      </section>

      {/* Emergency call modal */}
      {showEmergencyCall && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center p-4" onClick={() => setShowEmergencyCall(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-emergency/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-emergency" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.36 17.18 7.4 15.2 6.14 12.92A19.79 19.79 0 0 1 3.07 4.27 2 2 0 0 1 5.05 2.13H8a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/>
              </svg>
            </div>
            <h3 className="font-display font-bold text-app-text text-lg">Contacto de emergencia</h3>
            <p className="text-muted-txt text-sm mt-1">{user.emergencyContact.name} · {user.emergencyContact.relation}</p>
            <p className="font-display font-bold text-2xl text-app-text mt-3">{user.emergencyContact.phone}</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEmergencyCall(false)} className="flex-1 py-3 rounded-xl border border-app-border text-sm font-semibold text-muted-txt hover:bg-slate-50">
                Cancelar
              </button>
              <button
                onClick={() => { setShowEmergencyCall(false); }}
                className="flex-1 py-3 rounded-xl bg-emergency text-white text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.36 17.18 7.4 15.2 6.14 12.92A19.79 19.79 0 0 1 3.07 4.27 2 2 0 0 1 5.05 2.13H8a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z"/>
                </svg>
                Llamar ahora
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}
