import { useState, useEffect } from 'react';
import type { Appointment, Medication } from '../types';
import {
  Bell,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Clock,
  MapPin,
  UserCheck,
  Stethoscope,
  Pill,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { openWhatsAppDirect, buildAppointmentWhatsAppMessage } from '../utils/whatsapp';
import { triggerHaptic } from '../utils/haptics';
import {
  validateAppointmentDate,
  validateAppointmentTime,
  validateDoctorName,
  getTodayDateString,
  getMaxAppointmentDateString,
} from '../utils/validation';

export type DueItem =
  | { type: 'appointment'; appt: Appointment }
  | { type: 'medication'; med: Medication; scheduledTime: string };

interface DueActionModalProps {
  isOpen: boolean;
  item: DueItem | null;
  onClose: () => void;
  onCompleteAppointment: (apptId: string) => void;
  onCancelAppointment: (apptId: string) => void;
  onRescheduleAppointment: (
    apptId: string,
    newDate: string,
    newTime: string,
    notes?: string,
    specialty?: string,
    doctor?: string,
    center?: string
  ) => void;
  onTakeMedication: (medId: string) => void;
  onSkipMedication: (medId: string) => void;
  onRescheduleMedication: (medId: string, newTime: string) => void;
}

const SPECIALTIES = [
  'Medicina General',
  'Cardiología',
  'Laboratorio Clínico',
  'Oftalmología',
  'Dermatología',
  'Ortopedia y Traumatología',
  'Pediatría',
  'Ginecología y Obstetricia',
  'Psicología / Salud Mental',
  'Nutrición y Dietética',
  'Odontología',
  'Endocrinología',
];

const COMMON_IPS = [
  'Centro Médico El Bosque - Consultorio 304',
  'Clínica del Norte - Torre Médica Piso 4',
  'Sede Calle 45 - Laboratorio Central',
  'Hospital Universitario Hernando Moncaleano',
  'IPS Comfamiliar Huila - Sede Principal',
  'Centro Oftalmológico Láser - Sala 2',
];

export default function DueActionModal({
  isOpen,
  item,
  onClose,
  onCompleteAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
  onTakeMedication,
  onSkipMedication,
  onRescheduleMedication,
}: DueActionModalProps) {
  const [mode, setMode] = useState<'prompt' | 'rescheduleAppt' | 'rescheduleMed'>('prompt');

  // Reschedule Form State for Appointment
  const [apptForm, setApptForm] = useState({
    specialty: '',
    doctor: '',
    center: '',
    date: '',
    time: '',
    notes: '',
  });

  // Reschedule Form State for Medication
  const [medPostponeTime, setMedPostponeTime] = useState('');

  // Sync state when item changes or modal opens
  useEffect(() => {
    if (!item) {
      setMode('prompt');
      return;
    }

    setMode('prompt');
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const curDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${curYear}-${curMonth}-${curDay}`;

    if (item.type === 'appointment') {
      const appt = item.appt;
      setApptForm({
        specialty: appt.specialty || 'Medicina General',
        doctor: appt.doctor || '',
        center: appt.center || '',
        date: appt.date >= todayStr ? appt.date : todayStr,
        time: appt.time || '09:00',
        notes: appt.notes || '',
      });
    } else {
      // Medication: default postpone by 15 mins
      const next15 = new Date(now.getTime() + 15 * 60000);
      const h = String(next15.getHours()).padStart(2, '0');
      const m = String(next15.getMinutes()).padStart(2, '0');
      setMedPostponeTime(`${h}:${m}`);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const isAppt = item.type === 'appointment';
  const appt = isAppt ? item.appt : null;
  const med = !isAppt ? item.med : null;
  const scheduledTime = isAppt ? appt?.time : item.scheduledTime;

  // Handlers for Appointment
  const handleApptRealizar = () => {
    if (!appt) return;
    onCompleteAppointment(appt.id);
    onClose();
  };

  const handleApptCancelar = () => {
    if (!appt) return;
    onCancelAppointment(appt.id);
    onClose();
  };

  const handleApptSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appt || !apptForm.date || !apptForm.time) return;

    // Validación de Fecha y Hora de Reagendamiento
    const dateCheck = validateAppointmentDate(apptForm.date);
    if (!dateCheck.isValid) {
      alert(dateCheck.error);
      return;
    }
    const timeCheck = validateAppointmentTime(apptForm.time);
    if (!timeCheck.isValid) {
      alert(timeCheck.error);
      return;
    }

    if (apptForm.doctor.trim()) {
      const docCheck = validateDoctorName(apptForm.doctor, 'Profesional médico');
      if (!docCheck.isValid) {
        alert(docCheck.error);
        return;
      }
    }

    onRescheduleAppointment(
      appt.id,
      apptForm.date,
      apptForm.time,
      apptForm.notes,
      apptForm.specialty,
      apptForm.doctor,
      apptForm.center
    );
    onClose();
  };

  // Handlers for Medication
  const handleMedTomar = () => {
    if (!med) return;
    onTakeMedication(med.id);
    onClose();
  };

  const handleMedOmitir = () => {
    if (!med) return;
    onSkipMedication(med.id);
    onClose();
  };

  const handleMedQuickPostpone = (minutes: number) => {
    if (!med) return;
    const now = new Date();
    const target = new Date(now.getTime() + minutes * 60000);
    const h = String(target.getHours()).padStart(2, '0');
    const m = String(target.getMinutes()).padStart(2, '0');
    onRescheduleMedication(med.id, `${h}:${m}`);
    onClose();
  };

  const handleMedSaveCustomReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!med || !medPostponeTime) return;
    onRescheduleMedication(med.id, medPostponeTime);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp max-h-[90dvh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER DESTACADO DE ALARMA VIBRANTE */}
        <div
          className={`p-5 text-white ${
            isAppt
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-primary'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner animate-pulse shrink-0">
                {isAppt ? (
                  <Bell className="w-6 h-6 text-white" />
                ) : (
                  <Pill className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest bg-white/25 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  {isAppt ? '⏰ ¡Hora de tu cita médica!' : '💊 ¡Hora de tu medicamento!'}
                </span>
                <h3 className="font-display font-black text-lg text-white leading-tight">
                  {isAppt ? appt?.specialty : med?.name}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono tracking-tight bg-black/20 px-3 py-1 rounded-xl inline-block border border-white/20">
                {scheduledTime}
              </span>
              <p className="text-[10px] text-white/80 font-medium mt-0.5">Hora programada</p>
            </div>
          </div>
        </div>

        {/* CONTENIDO INTERACTIVO SEGÚN EL MODO */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* MODO 1: PROMPT PRINCIPAL CON LAS 3 OPCIONES (REALIZAR / REPROGRAMAR / CANCELAR) */}
          {mode === 'prompt' && (
            <div className="space-y-4">
              {/* Tarjeta de Información Detallada */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                {isAppt && appt && (
                  <>
                    <div className="flex items-start gap-2 text-slate-800">
                      <Stethoscope className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">
                          Médico Tratante
                        </span>
                        <strong className="text-sm font-semibold">{appt.doctor}</strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700 pt-1 border-t border-slate-200/60">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">
                          Institución Médica / IPS o Sede
                        </span>
                        <span>{appt.center}</span>
                      </div>
                    </div>
                    {appt.notes && (
                      <div className="text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/60 mt-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                          Notas / Preparación previa:
                        </span>
                        {appt.notes}
                      </div>
                    )}
                  </>
                )}

                {!isAppt && med && (
                  <>
                    <div className="flex items-start gap-2 text-slate-800">
                      <Pill className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">
                          Dosis y Vía de Administración
                        </span>
                        <strong className="text-sm font-semibold text-slate-900">
                          {med.name} — {med.dose}
                        </strong>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700 pt-1 border-t border-slate-200/60">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-bold block">
                          Esquema / Frecuencia
                        </span>
                        <span>{med.frequency}</span>
                      </div>
                    </div>
                    {med.prescribedBy && (
                      <div className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                        Prescrito por: <strong>{med.prescribedBy}</strong>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Pregunta clara y directa */}
              <div className="text-center py-1">
                <p className="text-xs font-semibold text-slate-700">
                  {isAppt
                    ? '¿Qué deseas hacer con esta cita médica en este momento?'
                    : '¿Vas a tomar tu medicamento en este instante?'}
                </p>
                <p className="text-[11px] text-muted-txt">
                  Selecciona una de las 3 opciones para mantener al día tu control de salud:
                </p>
              </div>

              {/* LOS 3 BOTONES DE ACCIÓN PRINCIPALES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* 1. REALIZAR / TOMAR */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('success');
                    if (isAppt) handleApptRealizar();
                    else handleMedTomar();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/25 cursor-pointer touch-manipulation group"
                >
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-display font-bold text-xs text-white">
                    {isAppt ? '1. Realizar Cita' : '1. Tomada'}
                  </span>
                  <span className="text-[10px] text-emerald-100 text-center leading-tight">
                    {isAppt ? 'Marcar como realizada' : 'Registrar que la tomaste'}
                  </span>
                </button>

                {/* 2. REPROGRAMAR / REAGENDAR */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setMode(isAppt ? 'rescheduleAppt' : 'rescheduleMed');
                  }}
                  className="bg-primary hover:bg-primary-hover active:scale-90 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/25 cursor-pointer touch-manipulation group"
                >
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-45 transition-transform">
                    <RotateCcw className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-display font-bold text-xs text-white">
                    2. Reprogramar
                  </span>
                  <span className="text-[10px] text-blue-100 text-center leading-tight">
                    {isAppt ? 'Cambiar fecha, médico o sede' : 'Posponer para más tarde'}
                  </span>
                </button>

                {/* 3. CANCELAR / OMITIR */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('warning');
                    if (isAppt) handleApptCancelar();
                    else handleMedOmitir();
                  }}
                  className="bg-rose-50 hover:bg-rose-100 active:scale-90 text-rose-700 border border-rose-200 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer touch-manipulation group"
                >
                  <div className="w-9 h-9 rounded-full bg-rose-200/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <XCircle className="w-5 h-5 text-rose-700" />
                  </div>
                  <span className="font-display font-bold text-xs">
                    {isAppt ? '3. Cancelar Cita' : '3. Omitir Dosis'}
                  </span>
                  <span className="text-[10px] text-rose-600/80 text-center leading-tight">
                    {isAppt ? 'Guardar en historial' : 'No la tomaré ahora'}
                  </span>
                </button>
              </div>

              {/* Botón WhatsApp de notificación directa al celular */}
              {isAppt && appt && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    ¿Deseas enviar este recordatorio al celular?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      const msg = buildAppointmentWhatsAppMessage(appt, { name: 'Paciente' });
                      openWhatsAppDirect(undefined, msg);
                    }}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs cursor-pointer touch-manipulation"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Enviar a WhatsApp
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODO 2: REPROGRAMACIÓN DE CITA MÉDICA (CON TODOS LOS CAMPOS SOLICITADOS POR EL USUARIO) */}
          {mode === 'rescheduleAppt' && (
            <form onSubmit={handleApptSaveReschedule} className="space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  Editar y Reprogramar Consulta Médica
                </h4>
                <button
                  type="button"
                  onClick={() => setMode('prompt')}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Volver
                </button>
              </div>

              {/* 1. Especialidad médica */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  1. Especialidad médica <span className="text-red-500">*</span>
                </label>
                <select
                  value={apptForm.specialty}
                  onChange={(e) =>
                    setApptForm({ ...apptForm, specialty: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2 & 3: Nueva Fecha y Nueva Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nueva Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    max={getMaxAppointmentDateString()}
                    value={apptForm.date}
                    onChange={(e) =>
                      setApptForm({ ...apptForm, date: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                  <p className="text-[9px] text-muted-txt mt-0.5">Desde hoy hasta 1 año</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nueva Hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    min="06:00"
                    max="20:00"
                    value={apptForm.time}
                    onChange={(e) =>
                      setApptForm({ ...apptForm, time: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                  <p className="text-[9px] text-muted-txt mt-0.5">06:00 AM a 08:00 PM</p>
                </div>
              </div>

              {/* 4. Profesional de la salud / Médico tratante */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  4. Profesional de la salud / Médico tratante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Andrés Morales / Dra. Claudia Vega"
                  value={apptForm.doctor}
                  onChange={(e) =>
                    setApptForm({
                      ...apptForm,
                      doctor: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                    })
                  }
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo letras (sin números)</p>
              </div>

              {/* 5. Institución médica / IPS o Sede */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  5. Institución médica / IPS o Sede <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Clínica del Norte - Torre Médica Piso 4"
                  value={apptForm.center}
                  onChange={(e) =>
                    setApptForm({ ...apptForm, center: e.target.value })
                  }
                  list="ips-suggestions-modal"
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                />
                <datalist id="ips-suggestions-modal">
                  {COMMON_IPS.map((ips) => (
                    <option key={ips} value={ips} />
                  ))}
                </datalist>
              </div>

              {/* 6. Motivo de reagendamiento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Motivo o Notas de Reagendamiento
                </label>
                <textarea
                  placeholder="Ej: Reagendada por cambio de turno laboral / disponibilidad."
                  value={apptForm.notes}
                  onChange={(e) =>
                    setApptForm({ ...apptForm, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMode('prompt')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-xs shadow-md active:scale-98 flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Guardar y Reagendar
                </button>
              </div>
            </form>
          )}

          {/* MODO 3: REPROGRAMACIÓN / POSPONER MEDICAMENTO (PASTA) */}
          {mode === 'rescheduleMed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Reprogramar / Posponer toma de pasta
                </h4>
                <button
                  type="button"
                  onClick={() => setMode('prompt')}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Volver
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Selecciona en cuántos minutos deseas que te volvamos a avisar para tomar tu pasta:
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleMedQuickPostpone(15)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 text-center transition-all cursor-pointer group"
                >
                  <span className="block text-sm font-bold text-slate-800 group-hover:text-orange-600">
                    +15 min
                  </span>
                  <span className="text-[10px] text-muted-txt">Avisar pronto</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMedQuickPostpone(30)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 text-center transition-all cursor-pointer group"
                >
                  <span className="block text-sm font-bold text-slate-800 group-hover:text-orange-600">
                    +30 min
                  </span>
                  <span className="text-[10px] text-muted-txt">Media hora</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMedQuickPostpone(60)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 text-center transition-all cursor-pointer group"
                >
                  <span className="block text-sm font-bold text-slate-800 group-hover:text-orange-600">
                    +1 hora
                  </span>
                  <span className="text-[10px] text-muted-txt">Más tarde</span>
                </button>
              </div>

              {/* O elegir hora personalizada */}
              <form onSubmit={handleMedSaveCustomReschedule} className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  O define una hora exacta para hoy:
                </label>
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={medPostponeTime}
                    onChange={(e) => setMedPostponeTime(e.target.value)}
                    className="flex-1 border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Reprogramar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* FOOTER DISCRETO */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-muted-txt">
          <span>Sistema inteligente de control y adherencia en tiempo real</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer underline"
          >
            Posponer aviso
          </button>
        </div>
      </div>
    </div>
  );
}
