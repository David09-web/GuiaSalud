import { useState } from 'react';
import type { TutorialCategory, AuditLog } from '../types';

interface AdminScreenProps {
  tutorials: TutorialCategory[];
  auditLogs: AuditLog[];
  onAddTutorial: (tutorial: Omit<TutorialCategory, 'id'>) => void;
  onUpdateTutorial: (id: string, updated: Partial<TutorialCategory>) => void;
  onDeleteTutorial: (id: string) => void;
}

export default function AdminScreen({
  tutorials,
  auditLogs,
  onAddTutorial,
  onUpdateTutorial,
  onDeleteTutorial,
}: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<'tutorials' | 'users' | 'security'>('tutorials');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTutorialId, setEditingTutorialId] = useState<string | null>(null);

  const [newTutorial, setNewTutorial] = useState({
    title: '',
    emoji: '📝',
    description: '',
    entityName: 'Ministerio de Salud',
    officialUrl: 'https://www.minsalud.gov.co',
    color: '#EBF3FD',
    verified: true,
    steps: [
      { title: 'Paso 1: Acceso al portal', description: 'Ingresa con tu documento de identidad.' },
      { title: 'Paso 2: Confirmación', description: 'Verifica los datos y descarga el comprobante.' },
    ],
  });

  const handleCreateTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutorial.title) return;
    onAddTutorial(newTutorial);
    setNewTutorial({
      title: '',
      emoji: '📝',
      description: '',
      entityName: 'Ministerio de Salud',
      officialUrl: 'https://www.minsalud.gov.co',
      color: '#EBF3FD',
      verified: true,
      steps: [
        { title: 'Paso 1: Acceso al portal', description: 'Ingresa con tu documento de identidad.' },
        { title: 'Paso 2: Confirmación', description: 'Verifica los datos y descarga el comprobante.' },
      ],
    });
    setShowAddModal(false);
  };

  const mockUsers = [
    {
      id: 'usr-001',
      name: 'María Rodríguez',
      email: 'maria.rodriguez@gmail.com',
      role: 'Paciente',
      twoFactor: 'Activo (2FA)',
      consent: 'Otorgado (28/08/2026)',
      status: 'Activo',
    },
    {
      id: 'usr-002',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@gmail.com',
      role: 'Familiar Autorizado',
      twoFactor: 'Activo (2FA)',
      consent: 'Delegado por usr-001',
      status: 'Activo',
    },
    {
      id: 'usr-003',
      name: 'Miguel Antonio Urbano',
      email: 'docente.urbano@fet.edu.co',
      role: 'Docente (Gestor)',
      twoFactor: 'Activo (2FA)',
      consent: 'Académico FET',
      status: 'Activo',
    },
    {
      id: 'usr-004',
      name: 'David Marcet Ospina',
      email: 'david_ospinagu@fet.edu.co',
      role: 'Desarrollador / Coach',
      twoFactor: 'Activo (2FA)',
      consent: 'Académico FET',
      status: 'Activo',
    },
  ];

  return (
    <div className="px-4 py-5 space-y-5 max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="bg-purple-900 text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-700/60 flex items-center justify-center text-2xl">
            🛡️
          </div>
          <div>
            <h2 className="font-display font-bold text-base">Panel de Control del Administrador</h2>
            <p className="text-xs text-purple-200">
              GuiaSalud Versión 1.0 · Gestión de Trámites, URLs y Monitoreo de Seguridad
            </p>
          </div>
        </div>
        <span className="text-[11px] bg-purple-800 text-purple-200 px-3 py-1 rounded-full font-semibold border border-purple-600">
          Rol: Administrador
        </span>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="bg-surface border border-app-border rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-xs text-muted-txt">Trámites Activos</p>
          <p className="text-2xl font-display font-bold text-purple-700 mt-0.5">{tutorials.length}</p>
        </div>
        <div className="bg-surface border border-app-border rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-xs text-muted-txt">URLs Verificadas</p>
          <p className="text-2xl font-display font-bold text-emerald-600 mt-0.5">
            {tutorials.filter((t) => t.verified).length}
          </p>
        </div>
        <div className="bg-surface border border-app-border rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-xs text-muted-txt">Usuarios Registrados</p>
          <p className="text-2xl font-display font-bold text-primary mt-0.5">{mockUsers.length}</p>
        </div>
        <div className="bg-surface border border-app-border rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-xs text-muted-txt">Eventos Auditoría</p>
          <p className="text-2xl font-display font-bold text-slate-800 mt-0.5">{auditLogs.length}</p>
        </div>
      </div>

      {/* Privacy Guarantee Alert */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-center gap-3 text-purple-900 text-xs">
        <span className="text-xl">⚖️</span>
        <p className="leading-relaxed">
          <strong>Política de Privacidad y Principio de Mínimo Privilegio (OMS):</strong> El rol
          Administrador puede gestionar tutoriales y verificar enlaces, pero{' '}
          <strong>no tiene acceso a las historias clínicas privadas de los pacientes</strong>.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'tutorials'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gestión de Tutoriales ({tutorials.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Cuentas de Usuarios ({mockUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'security'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Auditoría y Logs OMS ({auditLogs.length})
        </button>
      </div>

      {/* Tab: Tutorials Management */}
      {activeTab === 'tutorials' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-app-text text-sm">
              Listado y Enlaces Oficiales Verificados
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              + Nuevo Trámite
            </button>
          </div>

          <div className="space-y-2.5">
            {tutorials.map((tut) => (
              <div
                key={tut.id}
                className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{tut.emoji}</span>
                    <div>
                      <h4 className="font-bold text-xs text-app-text">{tut.title}</h4>
                      <p className="text-[11px] text-muted-txt">Entidad: {tut.entityName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        onUpdateTutorial(tut.id, { verified: !tut.verified })
                      }
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tut.verified
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tut.verified ? '✓ Verificado' : 'Sin verificar'}
                    </button>
                    <button
                      onClick={() => onDeleteTutorial(tut.id)}
                      className="text-xs text-slate-400 hover:text-red-600 p-1"
                      title="Eliminar guía"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-muted-txt truncate max-w-xs">{tut.officialUrl}</span>
                  <a
                    href={tut.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-700 font-bold hover:underline flex-shrink-0"
                  >
                    Probar Enlace ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <section className="bg-surface rounded-2xl border border-app-border overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-app-border">
            <h3 className="font-display font-bold text-app-text text-sm">
              Gestión de Cuentas y Consentimientos
            </h3>
            <p className="text-[11px] text-muted-txt">
              Control de roles según requerimientos de la asignatura de Ingeniería de Software II.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">2FA</th>
                  <th className="p-3">Habeas Data</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="p-3 font-semibold text-purple-700">{u.role}</td>
                    <td className="p-3 text-emerald-700 font-medium">{u.twoFactor}</td>
                    <td className="p-3 text-slate-600">{u.consent}</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab: Security & Audit Logs */}
      {activeTab === 'security' && (
        <section className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-app-text text-sm">
              Trazabilidad Inmutable de Seguridad (OMS)
            </h3>
            <span className="text-[10px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded-md">
              SYSLOG_MONITOR: ACTIVE
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                </div>
                <p className="text-slate-700">{log.details}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                  <span>Módulo: {log.module} | Usuario: {log.userEmail}</span>
                  <span className="text-emerald-700 font-bold">IP: {log.ipAddress} · {log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal: Create Tutorial */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50">
              <h3 className="font-display font-bold text-app-text text-base">Crear Nueva Guía de Trámite</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTutorial} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Título del trámite
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cambio de IPS Primaria"
                  value={newTutorial.title}
                  onChange={(e) => setNewTutorial({ ...newTutorial, title: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Descripción breve
                </label>
                <textarea
                  placeholder="Explica para qué sirve este trámite y qué requisitos exige."
                  value={newTutorial.description}
                  onChange={(e) => setNewTutorial({ ...newTutorial, description: e.target.value })}
                  rows={2}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Entidad oficial responsable
                </label>
                <input
                  type="text"
                  placeholder="Ej: Superintendencia Nacional de Salud"
                  value={newTutorial.entityName}
                  onChange={(e) => setNewTutorial({ ...newTutorial, entityName: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  URL oficial verificada
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newTutorial.officialUrl}
                  onChange={(e) => setNewTutorial({ ...newTutorial, officialUrl: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-xl transition-colors font-display text-xs shadow-md"
              >
                Publicar Guía Verificada
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
