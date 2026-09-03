import { useState } from 'react';
import type { Screen, UserRole } from '../types';

interface TopBarProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  onProfileClick: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

const titles: Record<Screen, string> = {
  home: 'GuiaSalud',
  agenda: 'Agenda Médica',
  medications: 'Medicamentos',
  history: 'Historia Clínica',
  tutorials: 'Tutoriales de Trámites',
  profile: 'Perfil y Seguridad',
  admin: 'Panel Administrador',
};

export default function TopBar({
  screen,
  setScreen,
  onProfileClick,
  currentRole,
  onRoleChange,
  unreadCount,
  onOpenNotifications,
  onLogout,
}: TopBarProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'patient':
        return { label: 'Paciente', bg: 'bg-primary-50 text-primary border-primary-200' };
      case 'family':
        return { label: 'Familiar Autorizado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'admin':
        return { label: 'Administrador', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <header className="bg-surface border-b border-app-border sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-xs">
      {/* Left title & branding */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setScreen('home')}
          className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs hover:opacity-90 transition-opacity"
          aria-label="Ir a Inicio"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
        <div>
          <h1 className="font-display font-bold text-app-text text-base leading-tight">
            {titles[screen]}
          </h1>
          {currentRole === 'family' ? (
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cuidando a: María Rodríguez
            </p>
          ) : currentRole === 'admin' ? (
            <p className="text-[11px] text-purple-600 font-medium">Gestión de Trámites & Auditoría</p>
          ) : (
            <p className="text-[11px] text-muted-txt">Salud digital y bienestar</p>
          )}
        </div>
      </div>

      {/* Right controls: Role Selector, Notifications, Profile */}
      <div className="flex items-center gap-2">
        {/* Role Selector Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${roleInfo.bg} flex items-center gap-1.5 hover:opacity-85 transition-all`}
            title="Cambiar rol de usuario para demostración"
          >
            <span>{roleInfo.label}</span>
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showRoleMenu && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-app-border py-2 z-50 animate-fadeIn"
              onClick={() => setShowRoleMenu(false)}
            >
              <div className="px-3 py-1.5 border-b border-app-border text-[11px] font-semibold text-muted-txt uppercase tracking-wider">
                Cambiar Rol Activo
              </div>
              <button
                onClick={() => {
                  onRoleChange('patient');
                  setScreen('home');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  currentRole === 'patient' ? 'font-bold text-primary bg-primary-50/50' : 'text-app-text'
                }`}
              >
                <span>👤 Paciente (María)</span>
                {currentRole === 'patient' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onRoleChange('family');
                  setScreen('home');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  currentRole === 'family' ? 'font-bold text-emerald-700 bg-emerald-50/50' : 'text-app-text'
                }`}
              >
                <span>👥 Familiar (Carlos)</span>
                {currentRole === 'family' && <span>✓</span>}
              </button>
              <button
                onClick={() => {
                  onRoleChange('admin');
                  setScreen('admin');
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  currentRole === 'admin' ? 'font-bold text-purple-700 bg-purple-50/50' : 'text-app-text'
                }`}
              >
                <span>🛡️ Administrador FET</span>
                {currentRole === 'admin' && <span>✓</span>}
              </button>
              <div className="pt-1 mt-1 border-t border-app-border">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications button */}
        <button
          onClick={onOpenNotifications}
          className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          aria-label="Abrir centro de notificaciones"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-app-text" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cancelled text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar button */}
        <button
          onClick={onProfileClick}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-display text-white transition-all shadow-xs ${
            currentRole === 'admin'
              ? 'bg-purple-700 ring-2 ring-purple-300'
              : currentRole === 'family'
              ? 'bg-emerald-700 ring-2 ring-emerald-300'
              : 'bg-primary ring-2 ring-primary-300'
          }`}
          aria-label="Ver perfil"
        >
          {currentRole === 'admin' ? 'AD' : currentRole === 'family' ? 'CR' : 'MR'}
        </button>
      </div>
    </header>
  );
}
