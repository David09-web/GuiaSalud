import { useState, useEffect } from 'react';
import type { UserProfile, FamilyCaregiver, AuditLog, UserRole } from '../types';
import {
  PhoneCall,
  Users,
  ShieldCheck,
  Scale,
  Download,
  ShieldAlert,
  X,
  ArrowRight,
  Lock,
  Plus,
  Droplet,
  MessageSquare,
  BellRing,
  Heart,
  Calendar,
  AlertTriangle,
  Check,
  CheckCircle2,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { openWhatsAppDirect, requestBrowserNotificationPermission } from '../utils/whatsapp';
import {
  validateEmail,
  validateBirthDate,
  validateColombiaPhone,
  validateClinicalDescription,
  validatePersonName,
  validateRelationship,
  validateAddress,
  validateHealthCenter,
  getTodayDateString,
  getMinBirthDateString,
} from '../utils/validation';
import { triggerHaptic } from '../utils/haptics';

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
  onUpdateCaregiver?: (id: string, updated: Partial<FamilyCaregiver>) => void;
  onDeleteCaregiver?: (id: string) => void;
  onRevokeConsent: () => void;
}

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function ProfileScreen({
  user,
  caregivers,
  auditLogs,
  currentRole,
  onUpdateUser,
  onToggleCaregiverPermission,
  onAddCaregiver,
  onUpdateCaregiver,
  onDeleteCaregiver,
  onRevokeConsent,
}: ProfileScreenProps) {
  const [showEmergencyCall, setShowEmergencyCall] = useState(false);
  const [showAddCaregiverModal, setShowAddCaregiverModal] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<FamilyCaregiver | null>(null);
  const [deletingCaregiverId, setDeletingCaregiverId] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showHabeasModal, setShowHabeasModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [browserPermActive, setBrowserPermActive] = useState<boolean>(false);

  // Form state con soporte para tipo de sangre, contacto de emergencia, datos personales y médicos
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    birthDate: user.birthDate || '',
    address: user.address || '',
    email: user.email || '',
    eps: user.eps || '',
    ips: user.ips || '',
    bloodType: user.bloodType || 'O+',
    emergencyName: user.emergencyContact?.name || '',
    emergencyRelation: user.emergencyContact?.relation || '',
    emergencyPhone: user.emergencyContact?.phone || '',
    allergies: (user.allergies || []).join(', '),
    conditions: (user.conditions || []).join(', '),
    surgeries: (user.surgeries || []).join(', '),
  });

  // Sincronizar form data cuando el usuario cambie desde fuera
  useEffect(() => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      birthDate: user.birthDate || '',
      address: user.address || '',
      email: user.email || '',
      eps: user.eps || '',
      ips: user.ips || '',
      bloodType: user.bloodType || 'O+',
      emergencyName: user.emergencyContact?.name || '',
      emergencyRelation: user.emergencyContact?.relation || '',
      emergencyPhone: user.emergencyContact?.phone || '',
      allergies: (user.allergies || []).join(', '),
      conditions: (user.conditions || []).join(', '),
      surgeries: (user.surgeries || []).join(', '),
    });
  }, [user]);

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermActive(Notification.permission === 'granted');
    }
  }, []);

  const [newCaregiver, setNewCaregiver] = useState({
    name: '',
    relation: 'Hijo(a) / Familiar',
    phone: '',
    email: '',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar Nombre Completo (sin números ni texto aleatorio)
    const nameCheck = validatePersonName(formData.name.trim(), 'Nombre Completo', true);
    if (!nameCheck.isValid) {
      alert(nameCheck.error);
      return;
    }

    // 2. Validar Teléfono Celular (10 dígitos en Colombia, ej: 3101234567, sin letras)
    if (formData.phone.trim()) {
      const phoneCheck = validateColombiaPhone(formData.phone.trim(), 'Teléfono Celular');
      if (!phoneCheck.isValid) {
        alert(phoneCheck.error);
        return;
      }
    }

    // 3. Validar Contacto de Emergencia: Nombre, Parentesco y Teléfono
    if (formData.emergencyName.trim()) {
      const emNameCheck = validatePersonName(formData.emergencyName.trim(), 'Nombre del Contacto de Emergencia', true);
      if (!emNameCheck.isValid) {
        alert(emNameCheck.error);
        return;
      }
    }

    if (formData.emergencyRelation.trim()) {
      const emRelCheck = validateRelationship(formData.emergencyRelation.trim(), 'Parentesco del Contacto de Emergencia', true);
      if (!emRelCheck.isValid) {
        alert(emRelCheck.error);
        return;
      }
    }

    if (formData.emergencyPhone.trim()) {
      const emPhoneCheck = validateColombiaPhone(formData.emergencyPhone.trim(), 'Teléfono de Contacto de Emergencia');
      if (!emPhoneCheck.isValid) {
        alert(emPhoneCheck.error);
        return;
      }
    }

    // 4. Validar Correo Electrónico (RegEx estricto, dominio y longitud <= 100)
    if (formData.email.trim()) {
      const emailCheck = validateEmail(formData.email.trim(), false);
      if (!emailCheck.isValid) {
        alert(emailCheck.error || 'Por favor ingresa un correo electrónico válido.');
        return;
      }
    }

    // 5. Validar Fecha de Nacimiento (<= hoy, <= 2026, límite biológico)
    if (formData.birthDate.trim()) {
      const birthCheck = validateBirthDate(formData.birthDate.trim());
      if (!birthCheck.isValid) {
        alert(birthCheck.error || 'La fecha de nacimiento no puede ser posterior al día de hoy ni mayor a 2026.');
        return;
      }
    }

    // 6. Validar Dirección de Residencia
    if (formData.address.trim()) {
      const addrCheck = validateAddress(formData.address.trim(), false, 'Dirección de Residencia');
      if (!addrCheck.isValid) {
        alert(addrCheck.error);
        return;
      }
    }

    // 7. Validar IPS Primaria
    if (formData.ips.trim()) {
      const ipsCheck = validateHealthCenter(formData.ips.trim());
      if (!ipsCheck.isValid) {
        alert(ipsCheck.error);
        return;
      }
    }

    // 8. Validar Antecedentes / Alergias / Cirugías (prevención de texto basura)
    if (formData.allergies.trim()) {
      const allergyCheck = validateClinicalDescription(formData.allergies.trim(), 'Alergias', false);
      if (!allergyCheck.isValid) {
        alert(allergyCheck.error);
        return;
      }
    }

    if (formData.conditions.trim()) {
      const condCheck = validateClinicalDescription(formData.conditions.trim(), 'Antecedentes', false);
      if (!condCheck.isValid) {
        alert(condCheck.error);
        return;
      }
    }

    if (formData.surgeries.trim()) {
      const surgCheck = validateClinicalDescription(formData.surgeries.trim(), 'Procedimiento', false);
      if (!surgCheck.isValid) {
        alert(surgCheck.error);
        return;
      }
    }

    onUpdateUser({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      birthDate: formData.birthDate.trim(),
      email: formData.email.trim(),
      eps: formData.eps.trim(),
      ips: formData.ips.trim(),
      bloodType: formData.bloodType.trim(),
      emergencyContact: {
        name: formData.emergencyName.trim(),
        relation: formData.emergencyRelation.trim(),
        phone: formData.emergencyPhone.trim(),
      },
      allergies: formData.allergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      conditions: formData.conditions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      surgeries: formData.surgeries
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setIsEditingProfile(false);
    setSaveSuccessToast('✓ Perfil clínico, tipo de sangre y datos de contacto actualizados exitosamente.');
    setTimeout(() => setSaveSuccessToast(null), 4000);
  };

  const handleCreateCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaregiver.name || !newCaregiver.phone) {
      alert('Por favor completa el nombre y teléfono del familiar.');
      return;
    }

    // 1. Nombre sin números ni texto aleatorio
    const nameCheck = validatePersonName(newCaregiver.name.trim(), 'Nombre del Familiar', true);
    if (!nameCheck.isValid) {
      alert(nameCheck.error);
      return;
    }

    // 2. Parentesco sin números
    const relCheck = validateRelationship(newCaregiver.relation.trim(), 'Parentesco / Rol', true);
    if (!relCheck.isValid) {
      alert(relCheck.error);
      return;
    }

    // 3. Teléfono de 10 dígitos sin letras
    const phoneCheck = validateColombiaPhone(newCaregiver.phone, 'Teléfono del Familiar');
    if (!phoneCheck.isValid) {
      alert(phoneCheck.error);
      return;
    }

    if (newCaregiver.email.trim()) {
      const emailCheck = validateEmail(newCaregiver.email.trim(), false);
      if (!emailCheck.isValid) {
        alert(emailCheck.error || 'El correo del familiar no tiene un formato válido.');
        return;
      }
    }

    onAddCaregiver({
      name: newCaregiver.name.trim(),
      relation: newCaregiver.relation.trim(),
      phone: newCaregiver.phone.trim(),
      email: newCaregiver.email.trim(),
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
    triggerHaptic('success');
  };

  const handleSaveEditCaregiver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCaregiver) return;
    if (!editingCaregiver.name || !editingCaregiver.phone) {
      alert('Por favor completa el nombre y teléfono del familiar.');
      return;
    }

    // 1. Nombre sin números ni texto aleatorio
    const nameCheck = validatePersonName(editingCaregiver.name.trim(), 'Nombre del Familiar', true);
    if (!nameCheck.isValid) {
      alert(nameCheck.error);
      return;
    }

    // 2. Parentesco sin números
    const relCheck = validateRelationship(editingCaregiver.relation.trim(), 'Parentesco / Rol', true);
    if (!relCheck.isValid) {
      alert(relCheck.error);
      return;
    }

    // 3. Teléfono de 10 dígitos sin letras
    const phoneCheck = validateColombiaPhone(editingCaregiver.phone, 'Teléfono del Familiar');
    if (!phoneCheck.isValid) {
      alert(phoneCheck.error);
      return;
    }

    if (editingCaregiver.email && editingCaregiver.email.trim()) {
      const emailCheck = validateEmail(editingCaregiver.email.trim(), false);
      if (!emailCheck.isValid) {
        alert(emailCheck.error || 'El correo del familiar no tiene un formato válido.');
        return;
      }
    }

    if (onUpdateCaregiver) {
      onUpdateCaregiver(editingCaregiver.id, {
        name: editingCaregiver.name.trim(),
        relation: editingCaregiver.relation.trim(),
        phone: editingCaregiver.phone.trim(),
        email: editingCaregiver.email?.trim() || '',
        status: editingCaregiver.status,
      });
    }

    setEditingCaregiver(null);
    triggerHaptic('success');
    setSaveSuccessToast('✓ Familiar actualizado correctamente.');
    setTimeout(() => setSaveSuccessToast(null), 3000);
  };

  const handleConfirmDeleteCaregiver = (id: string) => {
    if (onDeleteCaregiver) {
      onDeleteCaregiver(id);
    }
    setDeletingCaregiverId(null);
    triggerHaptic('medium');
    setSaveSuccessToast('✓ Familiar eliminado.');
    setTimeout(() => setSaveSuccessToast(null), 3000);
  };

  const handleEnablePush = async () => {
    const ok = await requestBrowserNotificationPermission();
    setBrowserPermActive(ok);
    if (ok) {
      setSaveSuccessToast('✓ Notificaciones en celular / navegador habilitadas.');
      setTimeout(() => setSaveSuccessToast(null), 3000);
    }
  };

  const handleSendWhatsAppTest = () => {
    const msg = `🏥 *GUIASALUD - PRUEBA DE NOTIFICACIONES* 🏥\n\nHola *${user.name}*,\n\nTe confirmamos que las notificaciones de citas y medicamentos por WhatsApp están activas para tu número telefónico registrado.\n\nRecibirás recordatorios previos:\n• 📅 1 día antes (24h)\n• ⏰ 12 horas antes\n• 🚨 5 horas antes\n• 💊 Toma de medicamentos del día`;
    openWhatsAppDirect(user.phone, msg);
  };

  const handleSendWhatsAppEmergency = () => {
    const msg = `🚨 *ALERTA MÉDICA - CONTACTO DE EMERGENCIA* 🚨\n\nHola *${user.emergencyContact.name}*,\n\nTe contactamos desde GuiaSalud en nombre de *${user.name}* (Tipo de Sangre: ${user.bloodType}, EPS: ${user.eps}).\nEstás registrado(a) como su contacto prioritario de emergencia (${user.emergencyContact.relation}).`;
    openWhatsAppDirect(user.emergencyContact.phone, msg);
  };

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto pb-28">
      {/* Toast Feedback */}
      {saveSuccessToast && (
        <div className="fixed top-16 right-4 left-4 max-w-md mx-auto z-50 bg-emerald-700 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-surface rounded-3xl border border-app-border shadow-xs p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-bold text-white shadow-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0D47A1, #1976D2)' }}
          >
            {initials || 'GS'}
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-app-text text-base truncate">{user.name}</h2>
            <p className="text-xs text-muted-txt truncate">{user.email || 'Sin correo registrado'}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[10px] bg-secondary-50 text-secondary font-bold px-2 py-0.5 rounded-md border border-secondary-200">
                {user.eps}
              </span>
              <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                <Droplet className="w-3 h-3 text-rose-600 fill-rose-600" />
                Sangre {user.bloodType}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                CC {user.idNumber}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsEditingProfile(!isEditingProfile);
          }}
          className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex-shrink-0 cursor-pointer active:scale-90 touch-manipulation ${
            isEditingProfile
              ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              : 'text-primary bg-primary-50 hover:bg-primary-100'
          }`}
        >
          {isEditingProfile ? 'Cancelar' : 'Editar Perfil'}
        </button>
      </div>

      {/* Emergency Contact Quick Action */}
      <div className="bg-red-50 border border-red-200 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center text-lg shadow-xs flex-shrink-0">
            <PhoneCall className="w-5 h-5 text-white" />
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
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleSendWhatsAppEmergency}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Escribir al WhatsApp del contacto de emergencia"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={() => setShowEmergencyCall(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Llamar
          </button>
        </div>
      </div>

      {/* SECCIÓN NUEVA: CANALES DE NOTIFICACIÓN EN CELULAR Y WHATSAPP */}
      <section className="bg-white rounded-3xl border border-app-border shadow-xs p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-app-text text-sm">
                Canales de Notificación Móvil y WhatsApp
              </h3>
              <p className="text-[11px] text-muted-txt">
                Avisos previos con antelación: 1 día (24h), 12 horas y 5 horas antes de tus citas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Card WhatsApp */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Móvil
              </span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Conectado
              </span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Teléfono registrado: <strong>{user.phone || 'No especificado'}</strong>
            </p>
            <button
              onClick={handleSendWhatsAppTest}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Probar Aviso WhatsApp
            </button>
          </div>

          {/* Card Alertas Push en Celular / Navegador */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-primary" /> Alertas Push Celular
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  browserPermActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {browserPermActive ? 'Activo' : 'Pendiente permiso'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {browserPermActive
                ? 'Tu dispositivo recibirá notificaciones flotantes con anterioridad.'
                : 'Activa los permisos para recibir avisos nativos en tu pantalla.'}
            </p>
            {!browserPermActive ? (
              <button
                onClick={handleEnablePush}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-1.5 px-3 rounded-xl text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Permitir Alertas Push
              </button>
            ) : (
              <div className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1 py-1">
                <Check className="w-3.5 h-3.5" /> Permiso concedido
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FORMULARIO COMPLETO DE EDICIÓN O RESUMEN CLÍNICO */}
      {isEditingProfile ? (
        <form
          onSubmit={handleSaveProfile}
          className="bg-surface rounded-3xl border border-app-border p-5 shadow-xs space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-app-border pb-3">
            <div>
              <h3 className="font-display font-bold text-app-text text-base">
                Editar Perfil y Ficha de Salud
              </h3>
              <p className="text-xs text-muted-txt">
                Actualiza tu tipo de sangre, contactos, afiliación y antecedentes.
              </p>
            </div>
            <span className="text-xs bg-primary-50 text-primary font-bold px-2.5 py-1 rounded-full">
              Edición Activa
            </span>
          </div>

          <div className="space-y-4">
            {/* 1. Datos Básicos */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                1. Identidad y Afiliación
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                      })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 bg-white"
                    required
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Solo letras y espacios (sin números)</p>
                </div>

                {/* Tipo de Sangre y Factor RH */}
                <div>
                  <label className="block text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Droplet className="w-3 h-3 text-rose-600 fill-rose-600" />
                    Tipo de Sangre y RH <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full border-2 border-rose-300 rounded-xl px-3 py-2 text-xs font-bold text-rose-950 focus:ring-2 focus:ring-rose-200 bg-rose-50/50"
                    required
                  >
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        Grupo {bt} (Factor RH {bt.includes('+') ? 'Positivo' : 'Negativo'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    min={getMinBirthDateString()}
                    max={getTodayDateString()}
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 bg-white text-slate-800 font-medium"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Hasta hoy (máx año 2026)</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Teléfono Celular / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d+ -]/g, '');
                      setFormData({ ...formData, phone: val });
                    }}
                    placeholder="Ej: 3000000000"
                    maxLength={10}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 bg-white font-mono"
                    required
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Exactamente 10 dígitos numéricos (ej: 3101234567)</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Dirección de Residencia
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej: Calle 123 # 45-67"
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Vía y número (ej: Calle 123 # 45-67)</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    EPS Asignada
                  </label>
                  <input
                    type="text"
                    value={formData.eps}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    IPS Primaria
                  </label>
                  <input
                    type="text"
                    value={formData.ips}
                    onChange={(e) => setFormData({ ...formData, ips: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Contacto de Emergencia */}
            <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200">
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-red-600" /> 2. Contacto de Emergencia
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-red-950 uppercase tracking-wider mb-1">
                    Nombre del Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyName: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                      })
                    }
                    className="w-full border border-red-200 rounded-xl px-3 py-2 text-xs bg-white"
                    placeholder="Nombre completo"
                  />
                  <p className="text-[9px] text-red-700/80 mt-0.5">Solo letras (sin números)</p>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-red-950 uppercase tracking-wider mb-1">
                    Parentesco / Relación
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyRelation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyRelation: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s/()-]/g, ''),
                      })
                    }
                    className="w-full border border-red-200 rounded-xl px-3 py-2 text-xs bg-white"
                    placeholder="Ej: Hermano, Cónyuge"
                  />
                  <p className="text-[9px] text-red-700/80 mt-0.5">Solo letras (sin números)</p>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-red-950 uppercase tracking-wider mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.emergencyPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d+ -]/g, '');
                      setFormData({ ...formData, emergencyPhone: val });
                    }}
                    className="w-full border border-red-200 rounded-xl px-3 py-2 text-xs bg-white font-mono"
                    placeholder="3100000000"
                    maxLength={10}
                  />
                  <p className="text-[9px] text-red-700/80 mt-0.5">10 dígitos para Colombia</p>
                </div>
              </div>
            </div>

            {/* 3. Datos Clínicos Complementarios */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> 3. Alergias y Condiciones Médicas
              </h4>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Alergias Principales (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Ej: Penicilina, Látex, AINEs"
                    maxLength={300}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs bg-white"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Texto alfanumérico con signos de puntuación básica (5 - 300 caracteres)</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Condiciones Crónicas / Patologías de Base (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    placeholder="Ej: Hipertensión arterial, Diabetes mellitus"
                    maxLength={300}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs bg-white"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Texto alfanumérico con signos de puntuación básica (5 - 300 caracteres)</p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Cirugías Previas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.surgeries}
                    onChange={(e) => setFormData({ ...formData, surgeries: e.target.value })}
                    placeholder="Ej: Apendicectomía (2018), Cesárea (2015)"
                    maxLength={300}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs bg-white"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Texto descriptivo alfanumérico (5 - 300 caracteres)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              Guardar Todos los Cambios
            </button>
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <section className="bg-surface rounded-3xl border border-app-border shadow-xs divide-y divide-app-border overflow-hidden">
          <div className="p-4 bg-slate-50 flex justify-between items-center">
            <h3 className="font-display font-bold text-app-text text-xs uppercase tracking-wider">
              Datos de Afiliación e Identidad
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
              Afiliación Activa SGSSS
            </span>
          </div>
          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-txt">Documento de Identidad:</span>
              <span className="font-bold text-slate-800">CC {user.idNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-txt">Tipo de Sangre y RH:</span>
              <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                {user.bloodType}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-txt">Fecha de Nacimiento:</span>
              <span className="font-semibold text-slate-800">{user.birthDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-txt">Teléfono / WhatsApp:</span>
              <span className="font-semibold text-slate-800">{user.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-txt">Dirección de Residencia:</span>
              <span className="font-semibold text-slate-800">{user.address}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-txt">EPS Asignada:</span>
              <span className="font-bold text-primary">{user.eps}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-txt">IPS Primaria:</span>
              <span className="font-bold text-primary">{user.ips}</span>
            </div>
          </div>

          {/* Resumen Alergias y Condiciones en modo vista */}
          <div className="p-4 bg-slate-50/50 space-y-2 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-slate-700">Alergias Conocidas:</span>
              <div className="flex flex-wrap gap-1">
                {user.allergies && user.allergies.length > 0 ? (
                  user.allergies.map((alg, i) => (
                    <span
                      key={i}
                      className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                    >
                      {alg}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Sin alergias registradas</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-1">
              <span className="text-[11px] font-bold text-slate-700">Condiciones de Salud:</span>
              <div className="flex flex-wrap gap-1">
                {user.conditions && user.conditions.length > 0 ? (
                  user.conditions.map((c, i) => (
                    <span
                      key={i}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Sin condiciones crónicas</span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Authorized Family Members Section (Módulo Cuidador / Familiar) */}
      <section className="bg-surface rounded-3xl border border-app-border shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-app-text text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Familiar Autorizado / Delegación de Permisos
            </h3>
            <p className="text-[11px] text-muted-txt">
              Permite a cuidadores de confianza asistir en citas y medicamentos.
            </p>
          </div>
          <button
            onClick={() => setShowAddCaregiverModal(true)}
            className="text-xs font-bold text-primary bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        <div className="space-y-3">
          {caregivers.map((cg) => (
            <div key={cg.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-xs text-slate-900">{cg.name}</p>
                  <p className="text-[11px] text-muted-txt">
                    {cg.relation} · {cg.phone}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const msg = `Hola *${cg.name}*, te comparto información médica desde mi cuenta de GuiaSalud.`;
                      openWhatsAppDirect(cg.phone, msg);
                    }}
                    className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Enviar mensaje por WhatsApp al familiar"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setEditingCaregiver(cg)}
                    className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Editar datos del familiar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeletingCaregiverId(cg.id)}
                    className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Eliminar familiar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cg.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cg.status === 'active' ? 'Autorizado' : 'Pendiente'}
                  </span>
                </div>
              </div>

              {/* Switches de permisos */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cg.permissions.viewAgenda}
                    onChange={() => onToggleCaregiverPermission(cg.id, 'viewAgenda')}
                    className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="text-[11px] text-slate-700">Ver Agenda Citas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cg.permissions.viewMeds}
                    onChange={() => onToggleCaregiverPermission(cg.id, 'viewMeds')}
                    className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="text-[11px] text-slate-700">Ver Medicamentos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cg.permissions.receiveAlerts}
                    onChange={() => onToggleCaregiverPermission(cg.id, 'receiveAlerts')}
                    className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="text-[11px] text-slate-700">Recibir Alertas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cg.permissions.viewHistory}
                    onChange={() => onToggleCaregiverPermission(cg.id, 'viewHistory')}
                    className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="text-[11px] text-slate-700">Ver Historia Clínica</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Audit Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setShowLogsModal(true)}
          className="p-4 bg-surface rounded-2xl border border-app-border text-left hover:border-slate-300 transition-colors flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-app-text">Bitácora de Auditoría</p>
              <p className="text-[11px] text-muted-txt">Registro inmutable de accesos</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowHabeasModal(true)}
          className="p-4 bg-surface rounded-2xl border border-app-border text-left hover:border-slate-300 transition-colors flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-app-text">Habeas Data (Ley 1581)</p>
              <p className="text-[11px] text-muted-txt">Portabilidad y derechos</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Emergency Call Modal */}
      {showEmergencyCall && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowEmergencyCall(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl">
              <PhoneCall className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-app-text">
                Llamar a {user.emergencyContact.name}
              </h3>
              <p className="text-xs text-muted-txt mt-1">
                {user.emergencyContact.relation} · {user.emergencyContact.phone}
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${user.emergencyContact.phone}`}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs transition-colors block text-center"
              >
                Confirmar Llamada Telefónica
              </a>
              <button
                onClick={handleSendWhatsAppEmergency}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Abrir Chat de WhatsApp
              </button>
              <button
                onClick={() => setShowEmergencyCall(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
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
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-app-border pb-3">
              <h3 className="font-display font-bold text-app-text text-base">
                Vincular Familiar / Cuidador
              </h3>
              <button
                onClick={() => setShowAddCaregiverModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCaregiver} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={newCaregiver.name}
                  onChange={(e) =>
                    setNewCaregiver({
                      ...newCaregiver,
                      name: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                    })
                  }
                  placeholder="Ej: Lucía Rodríguez"
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo letras y espacios (sin números)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Parentesco
                </label>
                <input
                  type="text"
                  required
                  value={newCaregiver.relation}
                  onChange={(e) =>
                    setNewCaregiver({
                      ...newCaregiver,
                      relation: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s/()-]/g, ''),
                    })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo letras (ej: Hijo(a), Hermano, Cuidador)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Teléfono Móvil
                </label>
                <input
                  type="tel"
                  required
                  value={newCaregiver.phone}
                  onChange={(e) =>
                    setNewCaregiver({
                      ...newCaregiver,
                      phone: e.target.value.replace(/[^\d+ -]/g, ''),
                    })
                  }
                  placeholder="Ej: 3101234567 o +57 310..."
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Exactamente 10 dígitos (Colombia, ej: 3101234567)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  value={newCaregiver.email}
                  onChange={(e) => setNewCaregiver({ ...newCaregiver, email: e.target.value })}
                  placeholder="familiar@gmail.com"
                  maxLength={100}
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Máximo 100 caracteres con dominio válido</p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Registrar y Enviar Notificación
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCaregiverModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Caregiver Modal */}
      {editingCaregiver && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setEditingCaregiver(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-app-text flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-primary" /> Editar Familiar Autorizado
              </h3>
              <button
                onClick={() => setEditingCaregiver(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCaregiver} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={editingCaregiver.name}
                  onChange={(e) =>
                    setEditingCaregiver({
                      ...editingCaregiver,
                      name: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                    })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo letras y espacios (sin números)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Parentesco / Rol
                </label>
                <input
                  type="text"
                  required
                  value={editingCaregiver.relation}
                  onChange={(e) =>
                    setEditingCaregiver({
                      ...editingCaregiver,
                      relation: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s/()-]/g, ''),
                    })
                  }
                  placeholder="Ej: Hermano, Hija mayor, Cuidador..."
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo letras (sin números)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Teléfono Móvil (WhatsApp)
                </label>
                <input
                  type="tel"
                  required
                  value={editingCaregiver.phone}
                  onChange={(e) =>
                    setEditingCaregiver({
                      ...editingCaregiver,
                      phone: e.target.value.replace(/[^\d+ -]/g, ''),
                    })
                  }
                  placeholder="Ej: 3101234567 o +57 310..."
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Exactamente 10 dígitos (Colombia, ej: 3101234567)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  value={editingCaregiver.email || ''}
                  onChange={(e) => setEditingCaregiver({ ...editingCaregiver, email: e.target.value })}
                  placeholder="familiar@gmail.com"
                  maxLength={100}
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Máximo 100 caracteres con dominio válido</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Estado de Autorización
                </label>
                <select
                  value={editingCaregiver.status}
                  onChange={(e) => setEditingCaregiver({ ...editingCaregiver, status: e.target.value as 'active' | 'pending' })}
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs bg-white"
                >
                  <option value="active">Autorizado (Activo)</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCaregiver(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Caregiver Modal */}
      {deletingCaregiverId && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setDeletingCaregiverId(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-app-text">
                ¿Eliminar este familiar autorizado?
              </h3>
              <p className="text-xs text-muted-txt mt-1">
                Se revocarán todos los permisos delegados para este contacto.
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleConfirmDeleteCaregiver(deletingCaregiverId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Sí, Eliminar
              </button>
              <button
                onClick={() => setDeletingCaregiverId(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Modal */}
      {showLogsModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowLogsModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-sm">Registro de Auditoría SGSSS</h3>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-slate-100 flex-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="pt-2.5 first:pt-0 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-muted-txt">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{log.details}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Usuario: {log.userEmail} ({log.userRole})</span>
                    <span className="text-emerald-700 font-bold">IP: {log.ipAddress} · {log.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
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
              <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
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
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-800 flex justify-between items-center cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Descargar copia total de mis datos (Portabilidad)
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onRevokeConsent();
                  setShowHabeasModal(false);
                  alert('Consentimiento informado revocado exitosamente.');
                }}
                className="w-full text-left p-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 font-semibold text-red-700 flex justify-between items-center cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" /> Revocar consentimiento de tratamiento de datos
                </span>
                <span className="text-red-500 text-xs font-bold">Revocar</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHabeasModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
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
