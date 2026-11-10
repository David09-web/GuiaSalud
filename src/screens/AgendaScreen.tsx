import { useState, useMemo, useEffect } from 'react';
import type { Appointment, AppointmentStatus } from '../types';
import {
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  FileText,
  Check,
  X,
  AlertTriangle,
  Bell,
  ShieldCheck,
  Search,
  Plus,
  CalendarDays,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarRange,
  MessageSquare,
  BellRing,
} from 'lucide-react';
import { openWhatsAppDirect, buildAppointmentWhatsAppMessage } from '../utils/whatsapp';
import { triggerHaptic } from '../utils/haptics';
import {
  validateMedicalText,
  validateDoctorName,
  validateHealthCenter,
  validateAppointmentNotes,
  validateAppointmentDate,
  validateAppointmentTime,
  getMaxAppointmentDateString,
} from '../utils/validation';

interface AgendaScreenProps {
  appointments: Appointment[];
  patientName?: string;
  userPhone?: string;
  onAddAppointment: (appt: Omit<Appointment, 'id' | 'patientId'>) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onRescheduleAppointment?: (
    id: string,
    newDate: string,
    newTime: string,
    notes?: string,
    specialty?: string,
    doctor?: string,
    center?: string
  ) => void;
  onDeleteAppointment: (id: string) => void;
}

// Configuración estética formal de estados clínicos
const statusConfig: Record<
  string,
  { label: string; textClass: string; bgClass: string; borderClass: string; dotColor: string }
> = {
  pending: {
    label: 'Pendiente',
    textClass: 'text-amber-800',
    bgClass: 'bg-amber-50/90',
    borderClass: 'border-amber-200',
    dotColor: '#D97706',
  },
  pendiente: {
    label: 'Pendiente',
    textClass: 'text-amber-800',
    bgClass: 'bg-amber-50/90',
    borderClass: 'border-amber-200',
    dotColor: '#D97706',
  },
  done: {
    label: 'Realizada',
    textClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50/90',
    borderClass: 'border-emerald-200',
    dotColor: '#059669',
  },
  realizada: {
    label: 'Realizada',
    textClass: 'text-emerald-800',
    bgClass: 'bg-emerald-50/90',
    borderClass: 'border-emerald-200',
    dotColor: '#059669',
  },
  cancelled: {
    label: 'Cancelada',
    textClass: 'text-rose-800',
    bgClass: 'bg-rose-50/90',
    borderClass: 'border-rose-200',
    dotColor: '#DC2626',
  },
  cancelada: {
    label: 'Cancelada',
    textClass: 'text-rose-800',
    bgClass: 'bg-rose-50/90',
    borderClass: 'border-rose-200',
    dotColor: '#DC2626',
  },
};

function getStatusDetails(status: string) {
  return statusConfig[status.toLowerCase()] || statusConfig.pending;
}

function normalizeStatusKey(status: string): 'pending' | 'done' | 'cancelled' {
  const s = status.toLowerCase();
  if (s === 'done' || s === 'realizada') return 'done';
  if (s === 'cancelled' || s === 'cancelada') return 'cancelled';
  return 'pending';
}

function formatFullDate(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function toYMD(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

export default function AgendaScreen({
  appointments,
  patientName = 'Paciente',
  userPhone = '',
  onAddAppointment,
  onUpdateStatus,
  onRescheduleAppointment,
}: AgendaScreenProps) {
  // Filtros de agenda
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'done' | 'cancelled'>('all');
  const [filterRange, setFilterRange] = useState<
    'all' | 'today' | 'this_week' | 'this_month' | 'upcoming' | 'past'
  >('all');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);

  // Modal y formulario de REAGENDAMIENTO DE FECHA
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    specialty: 'Medicina General',
    doctor: '',
    center: '',
    date: '',
    time: '',
    notes: '',
  });

  // Estado del Formulario de Nueva Cita
  const todayStr = useMemo(() => toYMD(new Date()), []);

  const [newAppt, setNewAppt] = useState({
    date: toYMD(new Date()),
    time: '09:30',
    specialty: 'Medicina General',
    doctor: '',
    center: '',
    notes: '',
  });

  // Generador dinámico de días de la semana con soporte de desplazamiento (semanas anterior / siguiente)
  const weekDays = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    const dayOfWeek = base.getDay(); // 0 domingo, 1 lunes...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + mondayOffset);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekOffset]);

  // Rango de fechas de la semana actual y mes actual para filtrado
  const dateRanges = useMemo(() => {
    const now = new Date();
    const curYMD = toYMD(now);

    // Semana actual (lunes a domingo)
    const dayOfWeek = now.getDay();
    const monOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mon = new Date(now);
    mon.setDate(now.getDate() + monOffset);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const startOfWeek = toYMD(mon);
    const endOfWeek = toYMD(sun);

    // Mes actual
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfMonth = toYMD(new Date(year, month, 1));
    const endOfMonth = toYMD(new Date(year, month + 1, 0));

    return { curYMD, startOfWeek, endOfWeek, startOfMonth, endOfMonth };
  }, []);

  // Especialidades con citas agendadas únicamente (según directriz docente)
  const availableSpecialties = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((a) => {
      if (a.specialty && a.specialty.trim()) {
        set.add(a.specialty.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
  }, [appointments]);

  // Si la especialidad filtrada ya no tiene citas agendadas, reiniciar a 'all'
  useEffect(() => {
    if (filterSpecialty !== 'all' && !availableSpecialties.includes(filterSpecialty)) {
      setFilterSpecialty('all');
    }
  }, [availableSpecialties, filterSpecialty]);

  // Próxima cita médica más cercana
  const nextUpcoming = useMemo(() => {
    const pendingList = appointments.filter(
      (a) => normalizeStatusKey(a.status) === 'pending' && a.date >= todayStr
    );
    return pendingList.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0] || null;
  }, [appointments, todayStr]);

  // Contadores para métricas de estado
  const stats = useMemo(() => {
    return {
      total: appointments.length,
      pending: appointments.filter((a) => normalizeStatusKey(a.status) === 'pending').length,
      done: appointments.filter((a) => normalizeStatusKey(a.status) === 'done').length,
      cancelled: appointments.filter((a) => normalizeStatusKey(a.status) === 'cancelled').length,
    };
  }, [appointments]);

  // Filtrado exhaustivo y reactivo de citas de la agenda
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const normStatus = normalizeStatusKey(a.status);

        // 1. Filtro por estado
        const matchStatus = filterTab === 'all' ? true : normStatus === filterTab;

        // 2. Filtro por fecha específica seleccionada
        const matchDate = selectedDate ? a.date === selectedDate : true;

        // 3. Filtro por rango de fechas (preset)
        let matchRange = true;
        if (filterRange === 'today') {
          matchRange = a.date === dateRanges.curYMD;
        } else if (filterRange === 'this_week') {
          matchRange = a.date >= dateRanges.startOfWeek && a.date <= dateRanges.endOfWeek;
        } else if (filterRange === 'this_month') {
          matchRange = a.date >= dateRanges.startOfMonth && a.date <= dateRanges.endOfMonth;
        } else if (filterRange === 'upcoming') {
          matchRange = a.date >= dateRanges.curYMD;
        } else if (filterRange === 'past') {
          matchRange = a.date < dateRanges.curYMD;
        }

        // 4. Filtro por especialidad
        const matchSpecialty = filterSpecialty === 'all' ? true : a.specialty === filterSpecialty;

        // 5. Búsqueda libre
        const query = searchQuery.toLowerCase().trim();
        const matchSearch = query
          ? a.specialty.toLowerCase().includes(query) ||
            a.doctor.toLowerCase().includes(query) ||
            a.center.toLowerCase().includes(query) ||
            (a.notes && a.notes.toLowerCase().includes(query))
          : true;

        return matchStatus && matchDate && matchRange && matchSpecialty && matchSearch;
      })
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [appointments, filterTab, selectedDate, filterRange, filterSpecialty, searchQuery, dateRanges]);

  // Comprobar si hay filtros activos para mostrar la barra de chips
  const hasActiveFilters =
    filterTab !== 'all' ||
    selectedDate !== null ||
    filterRange !== 'all' ||
    filterSpecialty !== 'all' ||
    searchQuery.trim().length > 0;

  const handleClearAllFilters = () => {
    setFilterTab('all');
    setSelectedDate(null);
    setFilterRange('all');
    setFilterSpecialty('all');
    setSearchQuery('');
    setWeekOffset(0);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.date || !newAppt.time) return;

    // 1. Validación de Fecha y Hora (no en el pasado, horario hábil 06:00 - 20:00)
    const dateCheck = validateAppointmentDate(newAppt.date);
    if (!dateCheck.isValid) {
      alert(dateCheck.error);
      return;
    }
    const timeCheck = validateAppointmentTime(newAppt.time);
    if (!timeCheck.isValid) {
      alert(timeCheck.error);
      return;
    }

    // 2. Validación Especialidad y Profesional Médico (alfabético, sin números)
    const specCheck = validateMedicalText(newAppt.specialty, 'Especialidad médica');
    if (!specCheck.isValid) {
      alert(specCheck.error);
      return;
    }
    const docCheck = validateDoctorName(newAppt.doctor, 'Profesional médico');
    if (!docCheck.isValid) {
      alert(docCheck.error);
      return;
    }

    // 3. Validación Sede / IPS (alfanumérico, 5 a 80 caracteres)
    const centerCheck = validateHealthCenter(newAppt.center);
    if (!centerCheck.isValid) {
      alert(centerCheck.error);
      return;
    }

    // 4. Validación Notas de preparación / Motivo (10 a 250 caracteres, prevención XSS/SQL)
    if (newAppt.notes.trim()) {
      const notesCheck = validateAppointmentNotes(newAppt.notes, false);
      if (!notesCheck.isValid) {
        alert(notesCheck.error);
        return;
      }
    }

    onAddAppointment({
      date: newAppt.date,
      time: newAppt.time,
      specialty: newAppt.specialty.trim(),
      doctor: newAppt.doctor.trim(),
      center: newAppt.center.trim(),
      status: 'pending',
      notes: newAppt.notes.trim(),
    });

    setNewAppt({
      date: todayStr,
      time: '09:30',
      specialty: 'Medicina General',
      doctor: '',
      center: '',
      notes: '',
    });
    setShowModal(false);

    setReminderToast(`Consulta médica con ${newAppt.doctor} programada correctamente.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  // Abrir modal de reagendamiento con datos prellenados
  const handleOpenReschedule = (appt: Appointment) => {
    setRescheduleModalAppt(appt);
    setRescheduleForm({
      specialty: appt.specialty || 'Medicina General',
      doctor: appt.doctor || '',
      center: appt.center || '',
      date: appt.date >= todayStr ? appt.date : todayStr,
      time: appt.time || '09:00',
      notes: appt.notes || '',
    });
  };

  // Confirmar y guardar el reagendamiento con nueva fecha/hora
  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleModalAppt || !rescheduleForm.date || !rescheduleForm.time) return;

    // 1. Validación de Fecha y Hora de Reagendamiento
    const dateCheck = validateAppointmentDate(rescheduleForm.date);
    if (!dateCheck.isValid) {
      alert(dateCheck.error);
      return;
    }
    const timeCheck = validateAppointmentTime(rescheduleForm.time);
    if (!timeCheck.isValid) {
      alert(timeCheck.error);
      return;
    }

    // 2. Validación Especialidad y Profesional Médico (sin números)
    const specCheck = validateMedicalText(rescheduleForm.specialty, 'Especialidad médica');
    if (!specCheck.isValid) {
      alert(specCheck.error);
      return;
    }
    const docCheck = validateDoctorName(rescheduleForm.doctor, 'Profesional médico');
    if (!docCheck.isValid) {
      alert(docCheck.error);
      return;
    }

    // 3. Validación Sede / IPS
    const centerCheck = validateHealthCenter(rescheduleForm.center);
    if (!centerCheck.isValid) {
      alert(centerCheck.error);
      return;
    }

    // 4. Validación Notas / Motivo
    if (rescheduleForm.notes.trim()) {
      const notesCheck = validateAppointmentNotes(rescheduleForm.notes, false);
      if (!notesCheck.isValid) {
        alert(notesCheck.error);
        return;
      }
    }

    if (onRescheduleAppointment) {
      onRescheduleAppointment(
        rescheduleModalAppt.id,
        rescheduleForm.date,
        rescheduleForm.time,
        rescheduleForm.notes,
        rescheduleForm.specialty,
        rescheduleForm.doctor,
        rescheduleForm.center
      );
    } else {
      onUpdateStatus(rescheduleModalAppt.id, 'pending');
    }

    const doctorName = rescheduleForm.doctor || rescheduleModalAppt.doctor;
    const newDateFormatted = formatFullDate(rescheduleForm.date);
    const newTimeFormatted = rescheduleForm.time;

    setRescheduleModalAppt(null);
    setReminderToast(
      `✓ Cita con ${doctorName} reagendada con éxito para el ${newDateFormatted} a las ${newTimeFormatted}.`
    );
    setTimeout(() => setReminderToast(null), 4500);
  };

  const handleConfirmCancel = () => {
    if (!cancelModalAppt) return;
    onUpdateStatus(cancelModalAppt.id, 'cancelled');
    setCancelModalAppt(null);
    setReminderToast(`Cita médica cancelada y conservada en su historial clínico digital.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  const handleSendApptWhatsApp = (appt: Appointment) => {
    const msg = buildAppointmentWhatsAppMessage(appt, { name: patientName });
    openWhatsAppDirect(userPhone, msg);
    setReminderToast(`✓ Abriendo WhatsApp con los datos de tu cita de ${appt.specialty}.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  const handleSetReminder = (specialty: string, time: string) => {
    setReminderToast(
      `✓ Recordatorio activo para ${specialty} a las ${time}: Avisos automáticos a 1 día (24h), 12 horas y 5 horas antes en tu celular.`
    );
    setTimeout(() => setReminderToast(null), 5000);
  };

  return (
    <div className="px-4 py-5 space-y-5 max-w-3xl mx-auto relative pb-28">
      {/* Toast Notification Elegante */}
      {reminderToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-fadeIn backdrop-blur-md max-w-md">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium tracking-tight">{reminderToast}</span>
        </div>
      )}

      {/* Header & Nueva Cita CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-primary text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-white/20 text-white backdrop-blur-xs">
              Gestión de Citas
            </span>
            <span className="text-xs text-blue-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Sincronizado
            </span>
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight">
            Agenda Médica
          </h2>
          <p className="text-xs text-blue-100 mt-0.5">
            Agendamiento de citas, control de estados clínicos, reagendamiento e historial
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="relative z-10 flex items-center justify-center gap-2 bg-white text-primary hover:bg-blue-50 font-semibold text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agendar Nueva Cita
        </button>
      </div>

      {/* VISTA RESUMIDA DE PRÓXIMAS CITAS (Hero Card) */}
      {nextUpcoming ? (
        <section className="bg-white rounded-3xl border border-app-border p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 rounded-xl bg-primary-50 text-primary items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider block leading-none">
                  Próxima Cita más Cercana
                </span>
                <h3 className="font-display font-bold text-app-text text-sm sm:text-base leading-tight mt-1">
                  {nextUpcoming.specialty}
                </h3>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Pendiente
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
              <p className="flex items-center gap-2 text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="capitalize">{formatFullDate(nextUpcoming.date)}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Hora: {nextUpcoming.time}</span>
              </p>
            </div>

            <div className="space-y-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
              <p className="flex items-center gap-2 text-slate-700 font-medium">
                <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{nextUpcoming.doctor}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{nextUpcoming.center}</span>
              </p>
            </div>
          </div>

          {nextUpcoming.notes && (
            <div className="mt-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
              <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold">Observaciones previas: </strong>
                {nextUpcoming.notes}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onUpdateStatus(nextUpcoming.id, 'done')}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Marcar Realizada
              </button>
              <button
                onClick={() => handleOpenReschedule(nextUpcoming)}
                className="text-xs font-semibold text-primary bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Actualizar fecha y hora de la cita"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reagendar Fecha
              </button>
              <button
                onClick={() => setCancelModalAppt(nextUpcoming)}
                className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
            </div>
            <button
              onClick={() => handleSetReminder(nextUpcoming.specialty, nextUpcoming.time)}
              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" /> Alerta
            </button>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200/60 p-4 text-xs text-emerald-900 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">No tienes citas pendientes para los próximos días</p>
            <p className="text-emerald-700 text-[11px] mt-0.5">
              Tus consultas están al día. Usa el botón "Agendar Nueva Cita" si requieres una nueva valoración médica.
            </p>
          </div>
        </section>
      )}

      {/* METRIC CHIPS / STATS DE ESTADO */}
      <div className="grid grid-cols-4 gap-2 text-center select-none">
        <button
          onClick={() => {
            triggerHaptic('selection');
            setFilterTab('all');
          }}
          className={`p-2.5 rounded-2xl border transition-all active:scale-90 touch-manipulation cursor-pointer ${
            filterTab === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border-app-border hover:bg-slate-50'
          }`}
        >
          <span className="block text-lg font-bold font-display leading-tight">{stats.total}</span>
          <span className="text-[10px] uppercase font-semibold opacity-80">Total</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setFilterTab('pending');
          }}
          className={`p-2.5 rounded-2xl border transition-all active:scale-90 touch-manipulation cursor-pointer ${
            filterTab === 'pending'
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span className="block text-lg font-bold font-display leading-tight">{stats.pending}</span>
          <span className="text-[10px] uppercase font-semibold opacity-90">Pendientes</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setFilterTab('done');
          }}
          className={`p-2.5 rounded-2xl border transition-all active:scale-90 touch-manipulation cursor-pointer ${
            filterTab === 'done'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span className="block text-lg font-bold font-display leading-tight">{stats.done}</span>
          <span className="text-[10px] uppercase font-semibold opacity-90">Realizadas</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setFilterTab('cancelled');
          }}
          className={`p-2.5 rounded-2xl border transition-all active:scale-90 touch-manipulation cursor-pointer ${
            filterTab === 'cancelled'
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <span className="block text-lg font-bold font-display leading-tight">{stats.cancelled}</span>
          <span className="text-[10px] uppercase font-semibold opacity-90">Canceladas</span>
        </button>
      </div>

      {/* =========================================================================
          PANEL INTEGRAL DE FILTRADO POR AGENDA (FECHA, PERÍODO, ESPECIALIDAD, TEXTO)
          ========================================================================= */}
      <section className="bg-white rounded-3xl border border-app-border p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800">Filtrado Avanzado por Agenda</p>
              <p className="text-[10px] text-muted-txt">
                Explora citas por fecha exacta, rango temporal, especialidad o profesional
              </p>
            </div>
          </div>

          {/* Selector de fecha nativo directo (Permite saltar a cualquier fecha) */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Fecha exacta:</span>
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="text-xs border border-app-border rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary-50"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                title="Quitar filtro de fecha exacta"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* PRESETS RÁPIDOS DE PERÍODO / RANGO DE AGENDA */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Todas las fechas' },
            { id: 'today', label: 'Hoy' },
            { id: 'this_week', label: 'Esta semana' },
            { id: 'this_month', label: 'Este mes' },
            { id: 'upcoming', label: 'Próximas' },
            { id: 'past', label: 'Historial pasado' },
          ].map((rng) => (
            <button
              key={rng.id}
              onClick={() => setFilterRange(rng.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterRange === rng.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rng.label}
            </button>
          ))}
        </div>

        {/* CALENDARIO SEMANAL INTERACTIVO CON NAVEGACIÓN ANTERIOR / SIGUIENTE */}
        <div className="pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-slate-700">
                Semana:{' '}
                <span className="capitalize text-primary">
                  {weekDays[0].toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })} –{' '}
                  {weekDays[6].toLocaleDateString('es-CO', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer flex items-center gap-1 px-2"
                title="Semana anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[10px] hidden sm:inline">Anterior</span>
              </button>
              {weekOffset !== 0 && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="px-2 py-1 rounded-xl bg-blue-50 text-primary font-bold text-[10px] hover:bg-blue-100"
                >
                  Esta semana
                </button>
              )}
              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="p-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer flex items-center gap-1 px-2"
                title="Semana siguiente"
              >
                <span className="text-[10px] hidden sm:inline">Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {weekDays.map((d) => {
              const ymd = toYMD(d);
              const isToday = ymd === todayStr;
              const isSelected = selectedDate === ymd;
              const countForDay = appointments.filter((a) => a.date === ymd).length;

              return (
                <button
                  key={ymd}
                  onClick={() => setSelectedDate(isSelected ? null : ymd)}
                  className={`flex-1 min-w-[56px] flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-md scale-102 ring-2 ring-primary-100'
                      : isToday
                      ? 'bg-blue-50 text-primary border-primary-200 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary/50'
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
                    {d.toLocaleDateString('es-CO', { weekday: 'short' })}
                  </span>
                  <span className="text-base font-display font-extrabold leading-none my-1">
                    {d.getDate()}
                  </span>
                  {countForDay > 0 ? (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white text-primary' : 'bg-primary text-white'
                      }`}
                    >
                      {countForDay} {countForDay === 1 ? 'cita' : 'citas'}
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* BUSCADOR DE TEXTO Y SELECTOR DE ESPECIALIDAD */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por médico, IPS, especialidad o preparación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-app-border rounded-2xl pl-9 pr-8 py-2 text-xs text-app-text focus:border-primary focus:ring-1 focus:ring-primary-50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={filterSpecialty}
            onChange={(e) => setFilterSpecialty(e.target.value)}
            className="text-xs border border-app-border rounded-2xl px-3 py-2 bg-slate-50 focus:bg-white text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary-50"
          >
            <option value="all">
              {availableSpecialties.length === 0
                ? 'Sin especialidades con citas'
                : `Todas las especialidades (${availableSpecialties.length})`}
            </option>
            {availableSpecialties.map((sp) => {
              const countInSpecialty = appointments.filter((a) => a.specialty === sp).length;
              return (
                <option key={sp} value={sp}>
                  {sp} ({countInSpecialty})
                </option>
              );
            })}
          </select>
        </div>

        {/* BARRA DE CHIPS DE FILTROS ACTIVOS */}
        {hasActiveFilters && (
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-primary" /> Filtros aplicados:
            </span>

            {filterTab !== 'all' && (
              <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                Estado: {filterTab}
                <button
                  onClick={() => setFilterTab('all')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterRange !== 'all' && (
              <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                Período: {filterRange}
                <button
                  onClick={() => setFilterRange('all')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDate && (
              <span className="bg-white border border-slate-200 text-primary text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                Fecha: {selectedDate}
                <button
                  onClick={() => setSelectedDate(null)}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterSpecialty !== 'all' && (
              <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                Especialidad: {filterSpecialty}
                <button
                  onClick={() => setFilterSpecialty('all')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() && (
              <span className="bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                Búsqueda: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline ml-auto cursor-pointer"
            >
              Limpiar todos
            </button>
          </div>
        )}
      </section>

      {/* LISTADO DE CITAS E HISTORIAL CLÍNICO */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display font-bold text-app-text text-sm">
            {filterTab === 'all'
              ? 'Todas las Citas e Historial'
              : filterTab === 'pending'
              ? 'Citas Pendientes Programadas'
              : filterTab === 'done'
              ? 'Consultas Realizadas'
              : 'Historial de Cancelaciones'}
          </h3>
          <span className="text-xs text-muted-txt">
            Mostrando {filteredAppointments.length} de {appointments.length} cita(s)
          </span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-app-border p-6 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <CalendarX2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-app-text text-sm">No se encontraron citas</p>
            <p className="text-xs text-muted-txt mt-1 max-w-sm mx-auto">
              No hay citas que coincidan con los filtros seleccionados de la agenda. Puedes cambiar los criterios o registrar una nueva consulta médica.
            </p>
            <button
              onClick={handleClearAllFilters}
              className="mt-3 text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : (
          filteredAppointments.map((appt) => {
            const sc = getStatusDetails(appt.status);
            const norm = normalizeStatusKey(appt.status);

            return (
              <div
                key={appt.id}
                className="bg-white rounded-3xl border border-app-border shadow-xs hover:border-slate-300 transition-all overflow-hidden"
              >
                <div className="flex">
                  <div className="w-2 flex-shrink-0" style={{ backgroundColor: sc.dotColor }} />
                  <div className="p-4 sm:p-5 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-app-text">{appt.specialty}</span>
                        </div>
                        <p className="text-xs text-muted-txt capitalize mt-0.5">
                          {formatFullDate(appt.date)} ·{' '}
                          <strong className="text-slate-700">{appt.time}</strong>
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bgClass} ${sc.textClass} ${sc.borderClass}`}
                      >
                        {sc.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="flex items-center gap-2 font-medium text-slate-800">
                        <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{appt.doctor}</span>
                      </p>
                      <p className="flex items-center gap-2 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{appt.center}</span>
                      </p>
                    </div>

                    {appt.notes && (
                      <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong className="font-medium">Indicaciones previas: </strong>
                          {appt.notes}
                        </p>
                      </div>
                    )}

                    {/* Alertas con antelación: 1 día, 12h, 5h */}
                    {norm === 'pending' && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <BellRing className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-slate-700">Alertas automáticas:</span>
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          📅 1 día antes (24h)
                        </span>
                        <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          ⏰ 12 horas antes
                        </span>
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                          🚨 5 horas antes
                        </span>
                      </div>
                    )}

                    {/* BOTONES DE GESTIÓN, REAGENDAMIENTO Y ESTADOS */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {norm === 'pending' ? (
                        <>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => onUpdateStatus(appt.id, 'done')}
                              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Realizada
                            </button>
                            <button
                              onClick={() => handleOpenReschedule(appt)}
                              className="text-xs font-semibold text-primary bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Reagendar y actualizar fecha de la cita"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Reagendar Fecha
                            </button>
                            <button
                              onClick={() => setCancelModalAppt(appt)}
                              className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" /> Cancelar
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleSendApptWhatsApp(appt)}
                              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                              title="Enviar recordatorio formal por WhatsApp al celular"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                            </button>
                            <button
                              onClick={() => handleSetReminder(appt.specialty, appt.time)}
                              className="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Bell className="w-3.5 h-3.5" /> Recordatorio
                            </button>
                          </div>
                        </>
                      ) : norm === 'done' ? (
                        <>
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Cita completada · Registro en historial clínico seguro
                          </span>
                          <button
                            onClick={() => handleOpenReschedule(appt)}
                            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer bg-primary-50 px-2.5 py-1 rounded-xl"
                          >
                            <RotateCcw className="w-3 h-3" /> Programar Cita de Control
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[11px] text-rose-700 font-medium flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            Cita cancelada · Registro conservado en auditoría
                          </span>
                          <button
                            onClick={() => handleOpenReschedule(appt)}
                            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer bg-primary-50 px-2.5 py-1 rounded-xl"
                            title="Seleccionar nueva fecha y reactivar cita"
                          >
                            <RotateCcw className="w-3 h-3" /> Reagendar con Nueva Fecha
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* NOTA NORMATIVA DE AUDITORÍA Y NO ELIMINACIÓN FÍSICA */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800">
            Garantía de Auditoría y No Eliminación Física (PostgreSQL):
          </p>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            Conforme a las directrices de la Ley 1581 de 2012 y normatividad SGSSS en Colombia, los registros médicos
            no son borrados físicamente. Los cambios de estado, reagendamientos y cancelaciones quedan registrados con fecha y hora
            en los logs de auditoría para garantizar la trazabilidad médica continua.
          </p>
        </div>
      </div>

      {/* =========================================================================
          MODAL: REAGENDAMIENTO DE CITA (ACTUALIZAR FECHA Y HORA DE REAGENDAMIENTO)
          ========================================================================= */}
      {rescheduleModalAppt && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setRescheduleModalAppt(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto animate-scaleUp border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Reagendamiento
                  </span>
                  <h3 className="font-display font-bold text-app-text text-base">
                    Actualizar Fecha de Reagendamiento
                  </h3>
                  <p className="text-xs text-muted-txt">
                    Reprograma la fecha y hora para tu consulta médica
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleModalAppt(null)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="p-5 space-y-4">
              {/* Resumen de referencia de la consulta previa */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Programación Actual:
                </span>
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-primary" />
                  {rescheduleModalAppt.specialty} — {rescheduleModalAppt.doctor}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Fecha previa: <strong className="capitalize">{formatFullDate(rescheduleModalAppt.date)}</strong> a las {rescheduleModalAppt.time} ({rescheduleModalAppt.center})
                </p>
              </div>

              {/* 1. Especialidad médica */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Especialidad médica <span className="text-red-500">*</span>
                </label>
                <select
                  value={rescheduleForm.specialty}
                  onChange={(e) =>
                    setRescheduleForm({ ...rescheduleForm, specialty: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Selector de Nueva Fecha y Nueva Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    2. Nueva Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    max={getMaxAppointmentDateString()}
                    value={rescheduleForm.date}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, date: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                  <span className="text-[10px] text-muted-txt mt-1 block">
                    Desde hoy hasta máx 1 año en adelante
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    3. Nueva Hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    min="06:00"
                    max="20:00"
                    value={rescheduleForm.time}
                    onChange={(e) =>
                      setRescheduleForm({ ...rescheduleForm, time: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                  <span className="text-[10px] text-muted-txt mt-1 block">
                    Atención entre 06:00 AM y 08:00 PM
                  </span>
                </div>
              </div>

              {/* 4. Profesional de la salud / Médico tratante */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  4. Profesional de la salud / Médico tratante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Andrés Morales / Dra. Claudia Vega"
                  value={rescheduleForm.doctor}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      doctor: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                    })
                  }
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo texto alfabético y espacios (sin números)</p>
              </div>

              {/* 5. Institución médica / IPS o Sede */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  5. Institución médica / IPS o Sede <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Clínica del Norte - Torre Médica Piso 4"
                  value={rescheduleForm.center}
                  onChange={(e) =>
                    setRescheduleForm({ ...rescheduleForm, center: e.target.value })
                  }
                  list="ips-suggestions-reschedule"
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                />
                <datalist id="ips-suggestions-reschedule">
                  {COMMON_IPS.map((ips) => (
                    <option key={ips} value={ips} />
                  ))}
                </datalist>
              </div>

              {/* 6. Motivo o indicaciones adicionales del reagendamiento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  6. Motivo o Notas de Reagendamiento
                </label>
                <textarea
                  placeholder="Ej: Reprogramada por disponibilidad de especialista / solicitud del paciente. Asistir 15 min antes con carnet."
                  value={rescheduleForm.notes}
                  onChange={(e) =>
                    setRescheduleForm({ ...rescheduleForm, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalAppt(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-xs shadow-md active:scale-98 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Guardar y Reagendar Consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRO DE NUEVA CITA */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto animate-scaleUp border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/50">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Programación de Consulta
                </span>
                <h3 className="font-display font-bold text-app-text text-base">
                  Agendar Nueva Cita Médica
                </h3>
                <p className="text-xs text-muted-txt">
                  Completa los campos requeridos para programar tu consulta
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-4">
              {/* 1. Especialidad */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Especialidad médica <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAppt.specialty}
                  onChange={(e) => setNewAppt({ ...newAppt, specialty: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Fecha y Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    2. Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    max={getMaxAppointmentDateString()}
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                  <span className="text-[10px] text-muted-txt mt-0.5 block">
                    Desde hoy hasta 1 año
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    3. Hora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    min="06:00"
                    max="20:00"
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                  <span className="text-[10px] text-muted-txt mt-0.5 block">
                    06:00 AM a 08:00 PM
                  </span>
                </div>
              </div>

              {/* 3. Profesional de la salud */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  4. Profesional de la salud / Médico tratante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Andrés Morales / Dra. Claudia Vega"
                  value={newAppt.doctor}
                  onChange={(e) =>
                    setNewAppt({
                      ...newAppt,
                      doctor: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                    })
                  }
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo texto alfabético y espacios (sin números)</p>
              </div>

              {/* 4. Sede o IPS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  5. Institución médica / IPS o Sede <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Centro Médico El Bosque - Consultorio 304"
                  value={newAppt.center}
                  onChange={(e) => setNewAppt({ ...newAppt, center: e.target.value })}
                  list="ips-suggestions"
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                />
                <datalist id="ips-suggestions">
                  {COMMON_IPS.map((ips) => (
                    <option key={ips} value={ips} />
                  ))}
                </datalist>
              </div>

              {/* 5. Observaciones previas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  6. Observaciones previas o preparación médica
                </label>
                <textarea
                  placeholder="Ej: Asistir en ayunas de 8 horas, llevar documento original, orden médica de la EPS y resultados de laboratorio anteriores."
                  value={newAppt.notes}
                  onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all font-display text-sm shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Confirmar y Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE CANCELACIÓN (SOFT DELETE EXPLICADO) */}
      {cancelModalAppt && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setCancelModalAppt(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-5 border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm">
                  ¿Deseas cancelar esta cita médica?
                </h4>
                <p className="text-xs text-muted-txt">
                  {cancelModalAppt.specialty} con {cancelModalAppt.doctor}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Nota de Trazabilidad Clínica:</strong> La cita no será eliminada físicamente de la base de datos PostgreSQL. Se marcará como <strong>cancelada</strong> y quedará registrada en su historial clínico digital y logs de auditoría según los requerimientos del proyecto.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalAppt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Volver
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
