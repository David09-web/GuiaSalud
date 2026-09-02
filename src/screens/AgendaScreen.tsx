import { useState } from 'react';
import type { Appointment, AppointmentStatus } from '../types';
import { appointments as initialAppointments } from '../data';

const statusConfig: Record<AppointmentStatus, { label: string; textClass: string; bgClass: string; dotColor: string }> = {
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

const SPECIALTIES = ['Medicina General', 'Cardiología', 'Laboratorio Clínico', 'Oftalmología', 'Dermatología', 'Ortopedia', 'Psicología'];

export default function AgendaScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'all'>('all');
  const [newAppt, setNewAppt] = useState({
    date: '', time: '09:00', specialty: 'Medicina General', doctor: '', center: '',
  });

  const weekDays = getWeekDays();
  const today = toYMD(new Date());

  const filtered = appointments.filter((a) => {
    const matchDate = selectedDate ? a.date === selectedDate : true;
    const matchStatus = filterStatus === 'all' ? true : a.status === filterStatus;
    return matchDate && matchStatus;
  }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.date || !newAppt.doctor || !newAppt.center) return;
    const appt: Appointment = {
      id: String(Date.now()),
      date: newAppt.date,
      time: newAppt.time,
      specialty: newAppt.specialty,
      doctor: newAppt.doctor,
      center: newAppt.center,
      status: 'pending',
    };
    setAppointments([...appointments, appt]);
    setNewAppt({ date: '', time: '09:00', specialty: 'Medicina General', doctor: '', center: '' });
    setShowModal(false);
  };

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto relative">
      {/* Week strip */}
      <section>
        <h2 className="font-display font-bold text-app-text mb-3">Agenda médica</h2>
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
                className={`flex-shrink-0 flex flex-col items-center w-12 py-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-md'
                    : isToday
                    ? 'bg-primary-50 text-primary border border-primary-100'
                    : 'bg-surface text-app-text border border-app-border hover:border-primary/30'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase opacity-70">
                  {d.toLocaleDateString('es-CO', { weekday: 'short' })}
                </span>
                <span className="text-lg font-display font-bold leading-tight">{d.getDate()}</span>
                {hasCita && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-pending'}`} />
                )}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <p className="text-xs text-muted-txt mt-2 capitalize">{formatFullDate(selectedDate)}</p>
        )}
      </section>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'pending', 'done', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              filterStatus === s
                ? 'bg-primary text-white'
                : 'bg-surface border border-app-border text-muted-txt hover:border-primary/30'
            }`}
          >
            {s === 'all' ? 'Todas' : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* Appointment list */}
      <section className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-medium text-app-text">No hay citas</p>
            <p className="text-sm text-muted-txt mt-1">
              {selectedDate ? 'Sin citas para este día.' : 'Agenda tu primera cita.'}
            </p>
          </div>
        ) : (
          filtered.map((appt) => {
            const sc = statusConfig[appt.status];
            return (
              <div key={appt.id} className="bg-surface rounded-2xl border border-app-border shadow-sm overflow-hidden">
                <div className="flex">
                  <div className="w-1 flex-shrink-0" style={{ backgroundColor: sc.dotColor }} />
                  <div className="p-4 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-sm text-app-text">{appt.specialty}</p>
                        <p className="text-xs text-muted-txt capitalize">{formatFullDate(appt.date)} · {appt.time}</p>
                      </div>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bgClass} ${sc.textClass}`}>
                        {sc.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-muted-txt">
                      <p className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {appt.doctor}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {appt.center}
                      </p>
                    </div>
                    {appt.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button className="flex items-center gap-1 text-xs font-medium text-primary bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                          Recordatorio
                        </button>
                        <button
                          onClick={() => setAppointments(appointments.map((a) => a.id === appt.id ? { ...a, status: 'cancelled' } : a))}
                          className="text-xs font-medium text-cancelled bg-cancelled-bg px-3 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-5 md:bottom-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl hover:bg-primary-hover transition-all hover:scale-105 flex items-center justify-center z-10"
        aria-label="Agendar nueva cita"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end md:items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-app-border flex items-center justify-between">
              <h3 className="font-display font-bold text-app-text">Agendar nueva cita</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              {[
                { label: 'Fecha', type: 'date', field: 'date' as const },
                { label: 'Hora', type: 'time', field: 'time' as const },
                { label: 'Médico tratante', type: 'text', field: 'doctor' as const, placeholder: 'Ej: Dr. Andrés Morales' },
                { label: 'Centro de salud / IPS', type: 'text', field: 'center' as const, placeholder: 'Ej: Centro Médico El Bosque' },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={newAppt[f.field]}
                    onChange={(e) => setNewAppt({ ...newAppt, [f.field]: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
                    required={f.field === 'date' || f.field === 'doctor' || f.field === 'center'}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1.5">Especialidad</label>
                <select
                  value={newAppt.specialty}
                  onChange={(e) => setNewAppt({ ...newAppt, specialty: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all bg-white"
                >
                  {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <button type="submit" className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary-hover transition-colors font-display">
                Agendar cita
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}
