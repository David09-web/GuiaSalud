import type { Screen, UserRole, UserProfile, Appointment, Medication } from '../types';
import {
  Calendar,
  Pill,
  Users,
  ShieldCheck,
  Stethoscope,
  Building2,
  BookOpen,
  FileDown,
  AlertTriangle,
  ArrowRight,
  Check,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface HomeScreenProps {
  setScreen: (s: Screen) => void;
  currentRole: UserRole;
  user: UserProfile;
  appointments: Appointment[];
  medications: Medication[];
  onUpdateMedTaken: (id: string, status: 'taken' | 'skipped' | 'none') => void;
  onOpenReportModal: () => void;
}

const statusConfig: Record<string, { label: string; textClass: string; bgClass: string }> = {
  pending: { label: 'Pendiente', textClass: 'text-amber-800', bgClass: 'bg-amber-50 border border-amber-200' },
  pendiente: { label: 'Pendiente', textClass: 'text-amber-800', bgClass: 'bg-amber-50 border border-amber-200' },
  done: { label: 'Realizada', textClass: 'text-emerald-800', bgClass: 'bg-emerald-50 border border-emerald-200' },
  realizada: { label: 'Realizada', textClass: 'text-emerald-800', bgClass: 'bg-emerald-50 border border-emerald-200' },
  cancelled: { label: 'Cancelada', textClass: 'text-rose-800', bgClass: 'bg-rose-50 border border-rose-200' },
  cancelada: { label: 'Cancelada', textClass: 'text-rose-800', bgClass: 'bg-rose-50 border border-rose-200' },
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

export default function HomeScreen({
  setScreen,
  currentRole,
  user,
  appointments,
  medications,
  onUpdateMedTaken,
  onOpenReportModal,
}: HomeScreenProps) {
  const todayFormatted = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const upcomingAppointments = appointments.filter((a) => a.status === 'pending');
  const nextAppointment = upcomingAppointments[0];
  const medsEndingSoon = medications.filter(
    (m) => m.daysElapsed / m.durationDays >= 0.8
  );

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
      {/* Role Notice Banner for Caregivers */}
      {currentRole === 'family' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Modo Familiar Autorizado Activo
              </p>
              <p className="text-xs text-emerald-700">
                Visualizando información médica delegada de <strong>{user.name}</strong>
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
            Permisos OK
          </span>
        </div>
      )}

      {/* Admin Quick Banner */}
      {currentRole === 'admin' && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between text-purple-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-800">
                Panel de Administración y Auditoría
              </p>
              <p className="text-xs text-purple-700">
                Gestión de tutoriales, enlaces verificados y monitoreo de seguridad OMS.
              </p>
            </div>
          </div>
          <button
            onClick={() => setScreen('admin')}
            className="text-xs bg-purple-700 hover:bg-purple-800 text-white font-semibold px-3 py-1.5 rounded-xl transition-colors"
          >
            Ir al Panel
          </button>
        </div>
      )}

      {/* Hero Greeting Section */}
      <div
        className="rounded-3xl p-5 text-white shadow-md relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #0288D1 100%)' }}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white/75 text-xs font-medium uppercase tracking-widest capitalize">
              {todayFormatted}
            </p>
            <h2 className="font-display text-2xl font-bold leading-tight mt-1">
              {getGreeting()},<br />
              {currentRole === 'family' ? 'Carlos (Familiar)' : currentRole === 'admin' ? 'Administrador' : user.firstName}
            </h2>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenReportModal();
            }}
            className="bg-white/20 hover:bg-white/30 active:scale-90 backdrop-blur-md border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all touch-manipulation cursor-pointer"
            title="Generar Resumen Clínico en PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
        </div>

        <p className="text-white/85 text-xs mt-3">
          {upcomingAppointments.length} cita{upcomingAppointments.length !== 1 ? 's' : ''} médica{upcomingAppointments.length !== 1 ? 's' : ''} programada{upcomingAppointments.length !== 1 ? 's' : ''} y {medications.length} medicamentos activos en tratamiento.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            triggerHaptic('selection');
            setScreen('agenda');
          }}
          className="bg-primary-50 text-primary border border-primary-100 rounded-2xl p-4 text-left hover:bg-primary-100/70 active:scale-95 active:shadow-inner transition-all shadow-xs touch-manipulation cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-primary-100/70 flex items-center justify-center text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-3xl font-display font-bold">{upcomingAppointments.length}</span>
          </div>
          <p className="text-xs font-semibold mt-2">Citas próximas</p>
          <p className="text-[11px] opacity-75 flex items-center gap-1 mt-0.5">
            Ver agenda médica <ArrowRight className="w-3 h-3" />
          </p>
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setScreen('medications');
          }}
          className="bg-secondary-50 text-secondary border border-secondary-100 rounded-2xl p-4 text-left hover:bg-secondary-100/70 active:scale-95 active:shadow-inner transition-all shadow-xs touch-manipulation cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-secondary-100/70 flex items-center justify-center text-secondary">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-3xl font-display font-bold">{medications.length}</span>
          </div>
          <p className="text-xs font-semibold mt-2">Medicamentos activos</p>
          <p className="text-[11px] opacity-75 flex items-center gap-1 mt-0.5">
            Control de tomas <ArrowRight className="w-3 h-3" />
          </p>
        </button>
      </div>

      {/* Critical Alert: Prescriptions Ending Soon */}
      {medsEndingSoon.length > 0 && (
        <div className="bg-alert-bg border border-alert/30 rounded-2xl p-4 flex gap-3 items-start shadow-xs">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-alert/10 flex items-center justify-center text-alert">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-alert uppercase tracking-wide">
              Tratamiento próximo a finalizar
            </p>
            <p className="text-xs text-muted-txt mt-0.5">
              {medsEndingSoon.map((m) => `${m.name} (${m.durationDays - m.daysElapsed} días restantes)`).join(', ')}.
              Solicita renovación de fórmula a tu EPS antes de agotar existencia.
            </p>
          </div>
        </div>
      )}

      {/* Next Appointment Card */}
      {nextAppointment && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-app-text text-sm">Próxima cita médica</h3>
            <button
              onClick={() => setScreen('agenda')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Ver todas ({upcomingAppointments.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div
            onClick={() => {
              triggerHaptic('light');
              setScreen('agenda');
            }}
            className="w-full bg-surface rounded-2xl border border-app-border p-4 text-left shadow-xs hover:border-primary/40 active:scale-[0.98] active:bg-slate-50 cursor-pointer transition-all touch-manipulation"
          >
            <div className="flex items-start justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-txt font-medium">
                    {formatDate(nextAppointment.date)} · {nextAppointment.time}
                  </p>
                  <p className="font-bold text-app-text text-sm">{nextAppointment.specialty}</p>
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  statusConfig[nextAppointment.status].bgClass
                } ${statusConfig[nextAppointment.status].textClass}`}
              >
                {statusConfig[nextAppointment.status].label}
              </span>
            </div>
            <div className="space-y-1 text-xs text-muted-txt border-t border-app-border/60 pt-2">
              <p className="flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> {nextAppointment.doctor}
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> {nextAppointment.center}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Today's Medications with Direct Action */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-app-text text-sm">Medicamentos para hoy</h3>
          <button
            onClick={() => setScreen('medications')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Gestionar recetas <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2.5">
          {medications.slice(0, 3).map((med) => {
            const progress = Math.round((med.daysElapsed / med.durationDays) * 100);
            return (
              <div
                key={med.id}
                className="bg-surface rounded-2xl border border-app-border p-3.5 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-app-text truncate">{med.name}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {med.dose}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-txt mt-0.5">{med.frequency}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progress >= 80 ? 'bg-alert' : 'bg-secondary'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Día {med.daysElapsed}/{med.durationDays}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      onUpdateMedTaken(med.id, med.takenToday === 'taken' ? 'none' : 'taken');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-90 touch-manipulation cursor-pointer ${
                      med.takenToday === 'taken'
                        ? 'bg-done-bg text-done border border-done/30 shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-done-bg hover:text-done active:bg-emerald-100'
                    }`}
                  >
                    {med.takenToday === 'taken' ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Tomada
                      </>
                    ) : (
                      'Tomar'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Action Hub */}
      <section>
        <h3 className="font-display font-bold text-app-text text-sm mb-2.5">Acceso rápido a trámites</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              title: 'Nueva Cita',
              desc: 'Agendar con IPS',
              icon: <Calendar className="w-5 h-5 text-primary" />,
              action: () => setScreen('agenda'),
            },
            {
              title: 'Historia Clínica',
              desc: 'Ver archivos y vacunas',
              icon: <Building2 className="w-5 h-5 text-teal-600" />,
              action: () => setScreen('history'),
            },
            {
              title: 'Guías y Trámites',
              desc: 'Paso a paso EPS / Sisbén',
              icon: <BookOpen className="w-5 h-5 text-indigo-600" />,
              action: () => setScreen('tutorials'),
            },
            {
              title: 'Resumen PDF',
              desc: 'Imprimir para consulta',
              icon: <FileDown className="w-5 h-5 text-amber-600" />,
              action: onOpenReportModal,
            },
          ].map((item) => (
            <button
              key={item.title}
              onClick={() => {
                triggerHaptic('light');
                item.action();
              }}
              className="bg-surface border border-app-border rounded-2xl p-3.5 text-left hover:border-primary/40 hover:shadow-xs active:scale-95 active:bg-blue-50/60 active:border-primary/40 transition-all touch-manipulation cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-1 group-hover:bg-slate-100 transition-colors">
                {item.icon}
              </div>
              <p className="text-xs font-bold text-app-text mt-1 group-hover:text-primary transition-colors">
                {item.title}
              </p>
              <p className="text-[11px] text-muted-txt">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
