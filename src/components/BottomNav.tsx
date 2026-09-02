import type { Screen } from '../types';

interface BottomNavProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
}

const tabs = [
  {
    id: 'home' as Screen,
    label: 'Inicio',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={active ? '#1565C0' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    id: 'agenda' as Screen,
    label: 'Agenda',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={active ? '#1565C0' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
        <circle cx="8" cy="15" r="1" fill={active ? '#1565C0' : '#94a3b8'}/>
        <circle cx="12" cy="15" r="1" fill={active ? '#1565C0' : '#94a3b8'}/>
      </svg>
    ),
  },
  {
    id: 'medications' as Screen,
    label: 'Medicamentos',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={active ? '#1565C0' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 20H4a2 2 0 0 1-2-2v-2.5"/>
        <path d="M9 10l-6.5 6.5c-.78.78-.78 2.05 0 2.83l2.17 2.17c.78.78 2.05.78 2.83 0L14 15"/>
        <path d="M14 4.172a4 4 0 0 1 5.657 0l.172.172a4 4 0 0 1 0 5.656L14 16l-5.828-5.828"/>
      </svg>
    ),
  },
  {
    id: 'history' as Screen,
    label: 'Historia',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={active ? '#1565C0' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="12" y2="17"/>
      </svg>
    ),
  },
  {
    id: 'tutorials' as Screen,
    label: 'Tutoriales',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke={active ? '#1565C0' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
  },
];

export default function BottomNav({ screen, setScreen }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-app-border z-20 safe-bottom">
      <div className="flex">
        {tabs.map((tab) => {
          const active = screen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? 'text-primary' : 'text-muted-txt'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {tab.icon(active)}
              <span className={`text-[10px] font-medium leading-tight ${active ? 'text-primary' : 'text-muted-txt'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
