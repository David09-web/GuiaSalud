import { useState } from 'react';
import type { UserProfile, FamilyCaregiver, AuditLog, UserRole } from '../types';

interface ProfileScreenProps {
  user: UserProfile;
  caregivers: FamilyCaregiver[];
  auditLogs: AuditLog[];
  currentRole: UserRole;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onToggleCaregiverPermission: (
    caregiverId: string,
    permissionKey: keyof FamilyCaregiver['permissions']
  ) => void;
  onAddCaregiver: (caregiver: Omit<FamilyCaregiver, 'id'>) => void;
  onRevokeConsent: () => void;
}

export default function ProfileScreen({
  user,
  caregivers,
  auditLogs,
  currentRole,
  onUpdateUser,
  onToggleCaregiverPermission,
  onAddCaregiver,
  onRevokeConsent,
}: ProfileScreenProps) {
  const [showEmergencyCall, setShowEmergencyCall] = useState(false);
  const [showAddCaregiverModal, setShowAddCaregiverModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showHabeasModal, setShowHabeasModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [formData, setFormData] = useState({
    phone: user.phone,
    address: user.address,
    email: user.email,
    eps: user.eps,
    ips: user.ips,
  });

  const [newCaregiver, setNewCaregiver] = useState({
    name: '',
    relation: 'Hijo(a) / Familiar',
    phone: '',
    email: '',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(formData);
    setIsEditingProfile(false);
  };

  const handleCreateCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaregiver.name || !newCaregiver.phone) return;
    onAddCaregiver({
      name: newCaregiver.name,
      relation: newCaregiver.relation,
      phone: newCaregiver.phone,
      email: newCaregiver.email,
      status: 'active',
      permissions: {
        viewAgenda: true,
        viewMeds: true,
        viewHistory: false,
        receiveAlerts: true,
      },
    });
    setNewCaregiver({ name: '', relation: 'Hijo(a) / Familiar', phone: '', email: '' });
    setShowAddCaregiverModal(false);
  };

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto pb-24">
      {/* Profile Header Card */}
      <div className="bg-surface rounded-3xl border border-app-border shadow-xs p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-bold text-white shadow-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0D47A1, #1976D2)' }}
          >
            MR
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-app-text text-base truncate">{user.name}</h2>
            <p className="text-xs text-muted-txt truncate">{user.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] bg-secondary-50 text-secondary font-bold px-2 py-0.5 rounded-md border border-secondary-200">
                {user.eps}
              </span>
              <span className="text-[10px] bg-primary-50 text-primary font-bold px-2 py-0.5 rounded-md border border-primary-200">
                Sangre {user.bloodType}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="text-xs font-semibold text-primary bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
        >
          {isEditingProfile ? 'Cancelar' : 'Editar'}
        </button>
      </div>

      {/* Emergency Contact Quick Action */}
      <div className="bg-red-50 border border-red-200 rounded-3xl p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center text-lg shadow-xs flex-shrink-0">
            🚨
          </div>
          <div>
            <p className="text-[11px] font-bold text-red-800 uppercase tracking-wider">
              Contacto de Emergencia Asignado
            </p>
            <p className="font-bold text-xs text-slate-900">{user.emergencyContact.name}</p>
            <p className="text-[11px] text-slate-600">
              {user.emergencyContact.relation} · {user.emergencyContact.phone}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowEmergencyCall(true)}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.36 17.18 7.4 15.2 6.14 12.92A19.79 19.79 0 0 1 3.07 4.27 2 2 0 0 1 5.05 2.13H8a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 23 16.92z" />
          </svg>
          Llamar
        </button>
      </div>

      {/* Edit Profile Form or Personal Info display */}
      {isEditingProfile ? (
        <form onSubmit={handleSaveProfile} className="bg-surface rounded-3xl border border-app-border p-5 shadow-xs space-y-3.5">
          <h3 className="font-display font-bold text-app-text text-sm">Actualizar Datos Personales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">EPS</label>
              <input
                type="text"
                value={formData.eps}
                onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">IPS Primaria</label>
              <input
                type="text"
                value={formData.ips}
                onChange={(e) => setFormData({ ...formData, ips: e.target.value })}
                className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
          >
            Guardar Cambios
          </button>
        </form>
      ) : (
        <section className="bg-surface rounded-3xl border border-app-border shadow-xs divide-y divide-app-border overflow-hidden">
          <div className="p-4 bg-slate-50 flex justify-between items-center">
            <h3 className="font-display font-bold text-app-text text-xs uppercase tracking-wider">
              Datos de Afiliación e Identidad
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
              Afiliación Activa SGSSS
            </span>
          </div>
          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-txt">Documento de Identidad:</span>
              <span className="font-bold text-slate-800">CC {user.idNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-txt">Fecha de Nacimiento:</span>
              <span className="font-semibold text-slate-800">{user.birthDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-txt">Dirección de Residencia:</span>
              <span className="font-semibold text-slate-800">{user.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-txt">EPS Asignada:</span>
              <span className="font-bold text-primary">{user.eps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-txt">IPS Primaria:</span>
              <span className="font-bold text-primary">{user.ips}</span>
            </div>
          </div>
        </section>
      )}

      {/* Authorized Family Members Section (Módulo Cuidador / Familiar) */}
      <section className="bg-surface rounded-3xl border border-app-border shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-app-text text-sm flex items-center gap-1.5">
              <span>👥</span> Familiar Autorizado / Delegación de Permisos
            </h3>
            <p className="text-[11px] text-muted-txt">
              Permite a cuidadores de confianza asistir en citas y medicamentos.
            </p>
          </div>
          <button
            onClick={() => setShowAddCaregiverModal(true)}
            className="text-xs font-bold text-primary bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            + Agregar
          </button>
        </div>

        <div className="space-y-3">
          {caregivers.map((cg) => (
            <div key={cg.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-xs text-slate-900">{cg.name}</p>
                  <p className="text-[11px] text-muted-txt">{cg.relation} · {cg.phone}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cg.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {cg.status === 'active' ? 'Acceso Autorizado' : 'Pendiente Confirmación'}
                </span>
              </div>

              {/* Granular Permissions Config */}
              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'viewAgenda' as const, label: 'Ver Agenda Médica' },
                  { key: 'viewMeds' as const, label: 'Ver Medicamentos' },
                  { key: 'viewHistory' as const, label: 'Ver Historia Clínica' },
                  { key: 'receiveAlerts' as const, label: 'Recibir Alertas SMS' },
                ].map((perm) => (
                  <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cg.permissions[perm.key]}
                      onChange={() => onToggleCaregiverPermission(cg.id, perm.key)}
                      className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-slate-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security, 2FA and OMS Digital Health Privacy */}
      <section className="bg-surface rounded-3xl border border-app-border shadow-xs divide-y divide-app-border overflow-hidden">
        <div className="p-4 bg-slate-50 flex items-center justify-between">
          <h3 className="font-display font-bold text-app-text text-xs uppercase tracking-wider flex items-center gap-1.5">
            <span>🛡️</span> Seguridad y Privacidad Digital (OMS / Habeas Data)
          </h3>
          <span className="text-[10px] bg-secondary-100 text-secondary-800 font-bold px-2 py-0.5 rounded-md">
            2FA Activo
          </span>
        </div>

        <div className="p-4 space-y-3">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">Doble Factor de Autenticación (2FA)</p>
              <p className="text-[11px] text-muted-txt">Requiere token de 6 dígitos en cada inicio de sesión.</p>
            </div>
            <button
              onClick={() => onUpdateUser({ twoFactorEnabled: !user.twoFactorEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                user.twoFactorEnabled ? 'bg-secondary' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  user.twoFactorEnabled ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Audit Logs button */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Registro Auditor de Seguridad y Accesos</p>
              <p className="text-[11px] text-muted-txt">Monitoreo inmutable según pautas de ciberseguridad OMS.</p>
            </div>
            <button
              onClick={() => setShowLogsModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-colors"
            >
              Ver Logs ({auditLogs.length})
            </button>
          </div>

          {/* Habeas Data & Consent management */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Gestión de Consentimientos y Habeas Data</p>
              <p className="text-[11px] text-muted-txt">Revocación, rectificación o eliminación de datos personales.</p>
            </div>
            <button
              onClick={() => setShowHabeasModal(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition-colors"
            >
              Gestionar
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Call Modal */}
      {showEmergencyCall && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowEmergencyCall(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-3 animate-pulse">
              📞
            </div>
            <h3 className="font-display font-bold text-app-text text-lg">Llamada de Emergencia</h3>
            <p className="text-xs text-muted-txt mt-1">
              Contactando a {user.emergencyContact.name} ({user.emergencyContact.relation})
            </p>
            <p className="font-display font-bold text-2xl text-slate-900 mt-2">
              {user.emergencyContact.phone}
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowEmergencyCall(false)}
                className="flex-1 py-2.5 rounded-xl border border-app-border text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <a
                href={`tel:${user.emergencyContact.phone}`}
                onClick={() => setShowEmergencyCall(false)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center justify-center gap-1"
              >
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Add Caregiver Modal */}
      {showAddCaregiverModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowAddCaregiverModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-app-text text-base">Autorizar Nuevo Familiar / Cuidador</h3>
              <button
                onClick={() => setShowAddCaregiverModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCaregiver} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ej: Lucía Ospina"
                  value={newCaregiver.name}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, name: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">Parentesco</label>
                <input
                  type="text"
                  placeholder="Ej: Hija mayor / Cuidador"
                  value={newCaregiver.relation}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, relation: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej: +57 315 876 5432"
                  value={newCaregiver.phone}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, phone: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="Ej: lucia.ospina@gmail.com"
                  value={newCaregiver.email}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, email: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors font-display text-xs shadow-md"
              >
                Autorizar y Enviar Clave de Acceso
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security Audit Logs Modal */}
      {showLogsModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowLogsModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="font-display font-bold text-sm">Registro Auditor de Accesos (OMS)</h3>
                  <p className="text-[10px] text-slate-400">Trazabilidad inmutable de eventos de seguridad</p>
                </div>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2.5 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-700 text-[11px]">{log.details}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Usuario: {log.userEmail} ({log.userRole})</span>
                    <span className="text-emerald-700 font-bold">IP: {log.ipAddress} · {log.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habeas Data Modal */}
      {showHabeasModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowHabeasModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary flex items-center justify-center text-xl">
                ⚖️
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-app-text">Derechos Habeas Data (Ley 1581)</h3>
                <p className="text-[11px] text-muted-txt">Protección y control soberano de tus datos de salud</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              Conforme a la normativa colombiana y directrices de la OMS, tienes derecho a conocer, actualizar, rectificar y suprimir tus datos en cualquier momento.
            </p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  alert('Se ha generado el archivo JSON con la exportación total de tus datos personales.');
                }}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 flex justify-between items-center"
              >
                <span>📥 Descargar copia total de mis datos (Portabilidad)</span>
                <span>→</span>
              </button>

              <button
                onClick={() => {
                  onRevokeConsent();
                  setShowHabeasModal(false);
                  alert('Consentimiento informado revocado exitosamente.');
                }}
                className="w-full text-left p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 font-semibold text-red-700 flex justify-between items-center"
              >
                <span>🚫 Revocar consentimiento de tratamiento de datos</span>
                <span>⚠</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHabeasModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
