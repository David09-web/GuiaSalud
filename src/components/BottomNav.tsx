import type { Screen, UserRole } from '../types';

interface BottomNavProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  currentRole: UserRole;
}

export default function BottomNav({ screen, setScreen, currentRole }: BottomNavProps) {
  const patientNavItems = [
    {
      id: 'home' as Screen,
      label: 'Inicio',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      id: 'agenda' as Screen,
      label: 'Agenda',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
    },
    {
      id: 'medications' as Screen,
      label: 'Medicinas',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <path d="M10.5 20H4a2 2 0 0 1-2-2v-2.5" />
          <path d="M9 10l-6.5 6.5c-.78.78-.78 2.05 0 2.83l2.17 2.17c.78.78 2.05.78 2.83 0L14 15" />
          <path d="M14 4.172a4 4 0 0 1 5.657 0l.172.172a4 4 0 0 1 0 5.656L14 16l-5.828-5.828" />
        </svg>
      ),
    },
    {
      id: 'history' as Screen,
      label: 'Historial',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      id: 'tutorials' as Screen,
      label: 'Trámites',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
  ];

  const adminNavItems = [
    {
      id: 'admin' as Screen,
      label: 'Panel Admin',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: 'tutorials' as Screen,
      label: 'Gestión Trámites',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      id: 'profile' as Screen,
      label: 'Seguridad & Logs',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  const navItems = currentRole === 'admin' ? adminNavItems : patientNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-app-border z-30 md:relative md:border-t-0 md:bg-transparent shadow-lg md:shadow-none">
      <div className="flex items-center justify-around px-2 py-2 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-14 ${
                isActive
                  ? currentRole === 'admin'
                    ? 'text-purple-700 font-bold bg-purple-50'
                    : currentRole === 'family'
                    ? 'text-emerald-700 font-bold bg-emerald-50'
                    : 'text-primary font-bold bg-primary-50'
                  : 'text-muted-txt hover:text-app-text hover:bg-slate-100/60'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
