import type { Screen } from '../types';

interface TopBarProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  onProfileClick: () => void;
}

const navItems: { id: Screen; label: string }[] = [
  { id: 'home', label: 'Inicio' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'medications', label: 'Medicamentos' },
  { id: 'history', label: 'Historia' },
  { id: 'tutorials', label: 'Tutoriales' },
];

export default function TopBar({ screen, setScreen, onProfileClick }: TopBarProps) {
  return (
    <header className="bg-primary text-white shadow-lg z-20 flex-shrink-0">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" opacity="0.3"/>
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight">GuiaSalud</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                screen === item.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={onProfileClick}
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-sm font-bold text-white"
          aria-label="Ver perfil"
        >
          MR
        </button>
      </div>
    </header>
  );
}
