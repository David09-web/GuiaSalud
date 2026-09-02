import type { Screen } from '../types';
import { user, appointments, initialMedications } from '../data';

interface HomeScreenProps {
  setScreen: (s: Screen) => void;
}

const statusConfig = {
  pending: { label: 'Pendiente', textClass: 'text-pending', bgClass: 'bg-pending-bg' },
  done: { label: 'Realizada', textClass: 'text-done', bgClass: 'bg-done-bg' },
  cancelled: { label: 'Cancelada', textClass: 'text-cancelled', bgClass: 'bg-cancelled-bg' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === tomorrow.toDateString()) return 'Mañana';

  return d.toLocaleDateString('es-CO', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen({ setScreen }: HomeScreenProps) {
  const today = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const upcomingAppointments = appointments.filter((a) => a.status === 'pending');
  const nextAppointment = upcomingAppointments[0];
  const activeMeds = initialMedications;
  const medsEndingSoon = activeMeds.filter(
    (m) => m.daysElapsed / m.durationDays >= 0.8
  );

  const quickStats = [
    { label: 'Citas próximas', value: upcomingAppointments.length, color: 'bg-primary-50 text-primary', action: () => setScreen('agenda') },
    { label: 'Medicamentos activos', value: activeMeds.length, color: 'bg-secondary-50 text-secondary', action: () => setScreen('medications') },
  ];

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
      {/* Greeting hero */}
      <div
        className="rounded-2xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 60%, #0288D1 100%)' }}
      >
        <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5 capitalize">{today}</p>
        <h2 className="font-display text-2xl font-bold leading-tight">
          {getGreeting()},<br />
          {user.firstName} 👋
        </h2>
        <p className="text-white/80 text-sm mt-2">Tienes {upcomingAppointments.length} cita{upcomingAppointments.length !== 1 ? 's' : ''} programada{upcomingAppointments.length !== 1 ? 's' : ''} esta semana.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {quickStats.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.action}
            className={`${stat.color} rounded-2xl p-4 text-left hover:opacity-80 transition-opacity`}
          >
            <p className="text-3xl font-display font-bold">{stat.value}</p>
            <p className="text-sm font-medium mt-0.5 opacity-80">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Alert: treatment ending soon */}
      {medsEndingSoon.length > 0 && (
        <div className="bg-alert-bg border border-alert/30 rounded-2xl p-4 flex gap-3 items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-alert/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-alert" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-alert">Tratamiento próximo a finalizar</p>
            <p className="text-xs text-muted-txt mt-0.5">
              {medsEndingSoon.map((m) => m.name).join(', ')} — consulta renovación con tu médico.
            </p>
          </div>
        </div>
      )}

      {/* Next appointment */}
      {nextAppointment && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-app-text">Próxima cita</h3>
            <button onClick={() => setScreen('agenda')} className="text-xs font-medium text-primary hover:underline">
              Ver todas →
            </button>
          </div>
          <button
            onClick={() => setScreen('agenda')}
            className="w-full bg-surface rounded-2xl border border-app-border p-4 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-txt font-medium">{formatDate(nextAppointment.date)} · {nextAppointment.time}</p>
                  <p className="font-semibold text-app-text text-sm">{nextAppointment.specialty}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[nextAppointment.status].bgClass} ${statusConfig[nextAppointment.status].textClass}`}>
                {statusConfig[nextAppointment.status].label}
              </span>
            </div>
            <div className="space-y-1 text-sm text-muted-txt">
              <p className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                {nextAppointment.doctor}
              </p>
              <p className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {nextAppointment.center}
              </p>
            </div>
          </button>
        </section>
      )}

      {/* Today's medications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-app-text">Medicamentos de hoy</h3>
          <button onClick={() => setScreen('medications')} className="text-xs font-medium text-primary hover:underline">
            Ver todos →
          </button>
        </div>
        <div className="space-y-2">
          {activeMeds.map((med) => {
            const progress = Math.round((med.daysElapsed / med.durationDays) * 100);
            const isAlmostDone = progress >= 80;
            return (
              <div key={med.id} className="bg-surface rounded-2xl border border-app-border p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-app-text">{med.name} <span className="font-normal text-muted-txt">{med.dose}</span></p>
                    <p className="text-xs text-muted-txt">{med.frequency}</p>
                  </div>
                  {isAlmostDone && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-alert-bg text-alert">
                      Finalizando
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${isAlmostDone ? 'bg-alert' : 'bg-secondary'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-txt font-medium w-8 text-right">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h3 className="font-display font-semibold text-app-text mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Nueva cita', emoji: '📅', action: () => setScreen('agenda') },
            { label: 'Mi historia clínica', emoji: '🏥', action: () => setScreen('history') },
            { label: 'Tutoriales de trámites', emoji: '📚', action: () => setScreen('tutorials') },
            { label: 'Mi perfil', emoji: '👤', action: () => setScreen('profile') },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="bg-surface border border-app-border rounded-2xl p-4 text-left hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <span className="text-2xl">{item.emoji}</span>
              <p className="text-sm font-medium text-app-text mt-2 group-hover:text-primary transition-colors">{item.label}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="h-2" />
    </div>
  );
}
