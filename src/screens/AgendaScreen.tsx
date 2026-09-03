import { useState } from 'react';
import type { Appointment, AppointmentStatus } from '../types';

interface AgendaScreenProps {
  appointments: Appointment[];
  onAddAppointment: (appt: Omit<Appointment, 'id' | 'patientId'>) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
}

const statusConfig: Record<
  AppointmentStatus,
  { label: string; textClass: string; bgClass: string; dotColor: string }
> = {
  pending: { label: 'Pendiente', textClass: 'text-pending', bgClass: 'bg-pending-bg', dotColor: '#D97706' },
  done: { label: 'Realizada', textClass: 'text-done', bgClass: 'bg-done-bg', dotColor: '#059669' },
  cancelled: { label: 'Cancelada', textClass: 'text-cancelled', bgClass: 'bg-cancelled-bg', dotColor: '#DC2626' },
};

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getWeekDays() {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i - 1);
    days.push(d);
  }
  return days;
}

function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
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
];

export default function AgendaScreen({
  appointments,
  onAddAppointment,
  onUpdateStatus,
  onDeleteAppointment,
}: AgendaScreenProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const [newAppt, setNewAppt] = useState({
    date: '2026-09-08',
    time: '09:00',
    specialty: 'Medicina General',
    doctor: '',
    center: '',
    notes: '',
  });

  const weekDays = getWeekDays();
  const today = toYMD(new Date());

  const filtered = appointments
    .filter((a) => {
      const matchDate = selectedDate ? a.date === selectedDate : true;
      const matchStatus = filterStatus === 'all' ? true : a.status === filterStatus;
      const matchSpecialty = filterSpecialty === 'all' ? true : a.specialty === filterSpecialty;
      return matchDate && matchStatus && matchSpecialty;
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.date || !newAppt.doctor || !newAppt.center) return;
    onAddAppointment({
      date: newAppt.date,
      time: newAppt.time,
      specialty: newAppt.specialty,
      doctor: newAppt.doctor,
      center: newAppt.center,
      status: 'pending',
      notes: newAppt.notes,
    });
    setNewAppt({
      date: '2026-09-08',
      time: '09:00',
      specialty: 'Medicina General',
      doctor: '',
      center: '',
      notes: '',
    });
    setShowModal(false);
  };

  const handleSetReminder = (specialty: string, time: string) => {
    setReminderToast(`Recordatorio programado para cita de ${specialty} a las ${time} (SMS y Push activos).`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto relative pb-24">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-fadeIn">
          <span>🔔</span>
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Header section with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-app-text text-lg">Agenda Médica</h2>
          <p className="text-xs text-muted-txt">Registro y control de citas con IPS y especialistas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Cita
        </button>
      </div>

      {/* Week Calendar Strip */}
      <section className="bg-surface rounded-2xl border border-app-border p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-700">Calendario de la semana</p>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-[11px] text-primary font-semibold hover:underline"
            >
              Ver todas las fechas
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {weekDays.map((d) => {
            const ymd = toYMD(d);
            const isToday = ymd === today;
            const isSelected = selectedDate === ymd;
            const hasCita = appointments.some((a) => a.date === ymd && a.status === 'pending');

            return (
              <button
                key={ymd}
                onClick={() => setSelectedDate(isSelected ? null : ymd)}
                className={`flex-shrink-0 flex flex-col items-center w-13 py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-md'
                    : isToday
                    ? 'bg-primary-50 text-primary border border-primary-200'
                    : 'bg-white text-app-text border border-app-border hover:border-primary/40'
                }`}
              >
                <span className="text-[10px] font-bold uppercase opacity-75">
                  {d.toLocaleDateString('es-CO', { weekday: 'short' })}
                </span>
                <span className="text-base font-display font-bold leading-tight">{d.getDate()}</span>
                {hasCita && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-white' : 'bg-pending'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <p className="text-xs text-primary font-medium mt-2 pt-2 border-t border-slate-100 capitalize">
            Filtrando por: {formatFullDate(selectedDate)}
          </p>
        )}
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex gap-1.5">
          {(['all', 'pending', 'done', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                filterStatus === s
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface border border-app-border text-muted-txt hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? 'Todas' : statusConfig[s].label}
            </button>
          ))}
        </div>

        <select
          value={filterSpecialty}
          onChange={(e) => setFilterSpecialty(e.target.value)}
          className="text-xs border border-app-border rounded-xl px-2.5 py-1.5 bg-surface text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary-50"
        >
          <option value="all">Todas las especialidades</option>
          {SPECIALTIES.map((sp) => (
            <option key={sp} value={sp}>
              {sp}
            </option>
          ))}
        </select>
      </div>

      {/* Appointments List */}
      <section className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-2xl border border-app-border p-6">
            <p className="text-4xl mb-2">📅</p>
            <p className="font-bold text-app-text text-sm">No hay citas registradas</p>
            <p className="text-xs text-muted-txt mt-0.5">
              {selectedDate
                ? 'No tienes citas programadas para el día seleccionado.'
                : 'Usa el botón "Nueva Cita" para agendar tu primera consulta.'}
            </p>
          </div>
        ) : (
          filtered.map((appt) => {
            const sc = statusConfig[appt.status];
            return (
              <div
                key={appt.id}
                className="bg-surface rounded-2xl border border-app-border shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                <div className="flex">
                  <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: sc.dotColor }} />
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-sm text-app-text">{appt.specialty}</p>
                        <p className="text-xs text-muted-txt capitalize">
                          {formatFullDate(appt.date)} · {appt.time}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bgClass} ${sc.textClass}`}
                      >
                        {sc.label}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-muted-txt bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span>👨‍⚕️</span> {appt.doctor}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span>🏥</span> {appt.center}
                      </p>
                      {appt.notes && (
                        <p className="flex items-start gap-1.5 text-slate-500 pt-1 border-t border-slate-200/60 mt-1">
                          <span>📝</span> {appt.notes}
                        </p>
                      )}
                    </div>

                    {/* Action buttons based on status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-app-border/60">
                      {appt.status === 'pending' ? (
                        <>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onUpdateStatus(appt.id, 'done')}
                              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                            >
                              ✓ Realizada
                            </button>
                            <button
                              onClick={() => onUpdateStatus(appt.id, 'cancelled')}
                              className="text-xs font-semibold text-cancelled bg-cancelled-bg hover:opacity-80 px-3 py-1.5 rounded-lg transition-opacity flex items-center gap-1"
                            >
                              ✕ Cancelar
                            </button>
                          </div>
                          <button
                            onClick={() => handleSetReminder(appt.specialty, appt.time)}
                            className="text-xs font-medium text-primary bg-primary-50 hover:bg-primary-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          >
                            🔔 Recordatorio
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[11px] text-muted-txt">
                            Cita {sc.label.toLowerCase()} · Histórico guardado
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onUpdateStatus(appt.id, 'pending')}
                              className="text-xs text-primary font-semibold hover:underline"
                            >
                              Reactivar cita
                            </button>
                            <button
                              onClick={() => onDeleteAppointment(appt.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Eliminar
                            </button>
                          </div>
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

      {/* Agendar Cita Modal Form */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-display font-bold text-app-text text-base">Agendar Nueva Cita</h3>
                <p className="text-[11px] text-muted-txt">Registra tu cita médica para recibir alertas</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Especialidad médica
                </label>
                <select
                  value={newAppt.specialty}
                  onChange={(e) => setNewAppt({ ...newAppt, specialty: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Profesional de la salud / Médico
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Andrés Morales"
                  value={newAppt.doctor}
                  onChange={(e) => setNewAppt({ ...newAppt, doctor: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Sede / Centro de Salud o IPS
                </label>
                <input
                  type="text"
                  placeholder="Ej: Centro Médico El Bosque - Consultorio 304"
                  value={newAppt.center}
                  onChange={(e) => setNewAppt({ ...newAppt, center: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Observaciones o preparación previa (opcional)
                </label>
                <textarea
                  placeholder="Ej: Asistir en ayunas de 8 horas, llevar orden médica y documento original."
                  value={newAppt.notes}
                  onChange={(e) => setNewAppt({ ...newAppt, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors font-display text-sm shadow-md"
              >
                Confirmar y Agendar Cita
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
