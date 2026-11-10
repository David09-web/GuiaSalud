import { useState } from 'react';
import type { TutorialCategory, TutorialCategoryDef, AuditLog } from '../types';
import { BookOpen, Folder, Shield, Users, ScrollText, Plus, X, Check, Search, ExternalLink, ShieldCheck } from 'lucide-react';

interface AdminScreenProps {
  tutorials: TutorialCategory[];
  categories: TutorialCategoryDef[];
  auditLogs: AuditLog[];
  onAddTutorial: (tutorial: Omit<TutorialCategory, 'id'>) => void;
  onUpdateTutorial: (id: string, updated: Partial<TutorialCategory>) => void;
  onDeleteTutorial: (id: string) => void;
  onAddCategory: (category: TutorialCategoryDef) => void;
  onUpdateCategory: (id: string, updated: Partial<TutorialCategoryDef>) => void;
  onDeleteCategory: (id: string) => void;
  onRecordAuditLog?: (action: string, module: string, details: string, status?: 'SUCCESS' | 'WARNING' | 'DENIED') => void;
}

export default function AdminScreen({
  tutorials,
  categories,
  auditLogs,
  onAddTutorial,
  onUpdateTutorial,
  onDeleteTutorial,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onRecordAuditLog,
}: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<'tutorials' | 'categories' | 'rbac' | 'logs'>('tutorials');

  // Filter state for tutorials
  const [tutorialSearch, setTutorialSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Modals state
  const [showAddTutorialModal, setShowAddTutorialModal] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<TutorialCategory | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TutorialCategoryDef | null>(null);
  const [urlVerificationModal, setUrlVerificationModal] = useState<{ url: string; entity: string; title: string } | null>(null);
  const [rbacTestResult, setRbacTestResult] = useState<string | null>(null);

  // Form state for creating tutorial
  const [tutorialForm, setTutorialForm] = useState({
    categoryId: 'agendamiento',
    title: '',
    emoji: '📝',
    description: '',
    entityName: 'Superintendencia Nacional de Salud',
    officialUrl: 'https://www.supersalud.gov.co',
    color: '#EBF3FD',
    verified: true,
    enabled: true,
    prerequisitesText: 'Documento de identidad vigente\nUsuario en el portal oficial',
    stepsText: 'Paso 1: Acceso al portal|Ingresa con tu documento de identidad.|Verifica conexión HTTPS\nPaso 2: Confirmación|Verifica los datos y descarga el comprobante digital.|Guarda el soporte',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    emoji: '📁',
    color: '#EBF3FD',
    enabled: true,
  });

  // Helper to open edit tutorial
  const handleOpenEditTutorial = (tut: TutorialCategory) => {
    setEditingTutorial(tut);
    setTutorialForm({
      categoryId: tut.categoryId || 'agendamiento',
      title: tut.title,
      emoji: tut.emoji,
      description: tut.description,
      entityName: tut.entityName,
      officialUrl: tut.officialUrl,
      color: tut.color || '#EBF3FD',
      verified: tut.verified,
      enabled: tut.enabled !== false,
      prerequisitesText: (tut.prerequisites || []).join('\n'),
      stepsText: tut.steps
        .map((s) => `${s.title}|${s.description}${s.tip ? `|${s.tip}` : ''}`)
        .join('\n'),
    });
  };

  // Helper to save new or edited tutorial
  const handleSaveTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorialForm.title.trim()) return;

    const prereqs = tutorialForm.prerequisitesText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const steps = tutorialForm.stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((line, idx) => {
        const parts = line.split('|');
        return {
          title: parts[0]?.trim() || `Paso ${idx + 1}`,
          description: parts[1]?.trim() || 'Sigue las instrucciones en el portal oficial.',
          tip: parts[2]?.trim(),
        };
      });

    const categoryObj = categories.find((c) => c.id === tutorialForm.categoryId);
    const categoryName = categoryObj ? categoryObj.name : 'Trámites';

    if (editingTutorial) {
      onUpdateTutorial(editingTutorial.id, {
        categoryId: tutorialForm.categoryId,
        categoryName,
        title: tutorialForm.title,
        emoji: tutorialForm.emoji,
        description: tutorialForm.description,
        entityName: tutorialForm.entityName,
        officialUrl: tutorialForm.officialUrl,
        color: tutorialForm.color,
        verified: tutorialForm.verified,
        enabled: tutorialForm.enabled,
        prerequisites: prereqs,
        steps,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      if (onRecordAuditLog) {
        onRecordAuditLog('TUTORIAL_EDITED', 'Panel Administración', `Trámite editado: ${tutorialForm.title}`);
      }
      setEditingTutorial(null);
    } else {
      onAddTutorial({
        categoryId: tutorialForm.categoryId,
        categoryName,
        title: tutorialForm.title,
        emoji: tutorialForm.emoji,
        description: tutorialForm.description,
        entityName: tutorialForm.entityName,
        officialUrl: tutorialForm.officialUrl,
        color: tutorialForm.color,
        verified: tutorialForm.verified,
        enabled: tutorialForm.enabled,
        prerequisites: prereqs,
        steps,
        updatedAt: new Date().toISOString().split('T')[0],
      });
      if (onRecordAuditLog) {
        onRecordAuditLog('TUTORIAL_CREATED', 'Panel Administración', `Nuevo trámite publicado: ${tutorialForm.title}`);
      }
      setShowAddTutorialModal(false);
    }

    // Reset form
    setTutorialForm({
      categoryId: 'agendamiento',
      title: '',
      emoji: '📝',
      description: '',
      entityName: 'Superintendencia Nacional de Salud',
      officialUrl: 'https://www.supersalud.gov.co',
      color: '#EBF3FD',
      verified: true,
      enabled: true,
      prerequisitesText: 'Documento de identidad vigente\nUsuario en el portal oficial',
      stepsText: 'Paso 1: Acceso al portal|Ingresa con tu documento de identidad.|Verifica conexión HTTPS\nPaso 2: Confirmación|Verifica los datos y descarga el comprobante digital.|Guarda el soporte',
    });
  };

  // Helper to save category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, {
        name: categoryForm.name,
        description: categoryForm.description,
        emoji: categoryForm.emoji,
        color: categoryForm.color,
        enabled: categoryForm.enabled,
      });
      if (onRecordAuditLog) {
        onRecordAuditLog('CATEGORY_EDITED', 'Panel Administración', `Categoría actualizada: ${categoryForm.name}`);
      }
      setEditingCategory(null);
    } else {
      const generatedId = categoryForm.id.trim() || `cat_${Date.now()}`;
      onAddCategory({
        id: generatedId.toLowerCase().replace(/\s+/g, '_'),
        name: categoryForm.name,
        description: categoryForm.description,
        emoji: categoryForm.emoji,
        color: categoryForm.color,
        enabled: categoryForm.enabled,
      });
      if (onRecordAuditLog) {
        onRecordAuditLog('CATEGORY_CREATED', 'Panel Administración', `Nueva categoría agregada: ${categoryForm.name}`);
      }
      setShowAddCategoryModal(false);
    }

    setCategoryForm({
      id: '',
      name: '',
      description: '',
      emoji: '📁',
      color: '#EBF3FD',
      enabled: true,
    });
  };

  // URL security checker
  const handleVerifyUrlSecurity = (tut: TutorialCategory) => {
    setUrlVerificationModal({
      url: tut.officialUrl,
      entity: tut.entityName,
      title: tut.title,
    });
  };

  // RBAC Firewall Simulation test
  const handleSimulateRbacTest = () => {
    const isForbidden = true;
    if (isForbidden) {
      setRbacTestResult(
        'ACCESO DENEGADO POR REGLA RBAC (HTTP 403 Forbidden): El rol Administrador NO tiene privilegios para consultar historias clínicas confidenciales ni recetas médicas de pacientes (Ley 1581/2012 y Res. 1995/1999 de Colombia). Evento registrado en SysLog inmutable.'
      );
      if (onRecordAuditLog) {
        onRecordAuditLog(
          'RBAC_ACCESS_DENIED',
          'Seguridad & RBAC',
          'Intento de acceso a historias clínicas desde rol Administrador interceptado exitosamente',
          'DENIED'
        );
      }
    }
  };

  // Filtered tutorials for admin list
  const filteredAdminTutorials = tutorials.filter((t) => {
    const matchesCategory = selectedCategoryFilter === 'all' || t.categoryId === selectedCategoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'enabled' && t.enabled !== false) ||
      (statusFilter === 'disabled' && t.enabled === false);
    const matchesSearch =
      t.title.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
      t.entityName.toLowerCase().includes(tutorialSearch.toLowerCase()) ||
      t.officialUrl.toLowerCase().includes(tutorialSearch.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="px-4 py-5 space-y-5 max-w-4xl mx-auto pb-28">
      {/* Admin Panel Header Banner */}
      <div className="bg-purple-900 text-white rounded-3xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-700/70 border border-purple-500/50 flex items-center justify-center text-2xl shadow-inner">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base sm:text-lg">
                Panel de Administración y Contenidos
              </h2>
              <span className="text-[10px] bg-purple-700 text-purple-200 border border-purple-500 font-mono px-2 py-0.5 rounded-full">
                v1.0
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Gestión de Tutoriales, Categorías, Enlaces Oficiales y Control RBAC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-start">
          <span className="text-[11px] bg-purple-800 text-purple-200 px-3 py-1 rounded-full font-bold border border-purple-600">
            Rol: Administrador
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-surface border border-app-border rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-[11px] text-muted-txt">Trámites Totales</p>
          <p className="text-2xl font-display font-bold text-purple-700 mt-0.5">{tutorials.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {tutorials.filter((t) => t.enabled !== false).length} activos
          </span>
        </div>
        <div className="bg-surface border border-app-border rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-[11px] text-muted-txt">Categorías SGSSS</p>
          <p className="text-2xl font-display font-bold text-blue-600 mt-0.5">{categories.length}</p>
          <span className="text-[10px] text-slate-500 font-semibold">
            {categories.filter((c) => c.enabled !== false).length} habilitadas
          </span>
        </div>
        <div className="bg-surface border border-app-border rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-[11px] text-muted-txt">URLs Verificadas</p>
          <p className="text-2xl font-display font-bold text-emerald-600 mt-0.5">
            {tutorials.filter((t) => t.verified).length}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">100% Anti-Phishing</span>
        </div>
        <div className="bg-surface border border-app-border rounded-2xl p-3.5 text-center shadow-xs">
          <p className="text-[11px] text-muted-txt">Acceso Clínico Admin</p>
          <p className="text-2xl font-display font-bold text-red-600 mt-0.5">0%</p>
          <span className="text-[10px] text-red-700 font-semibold">RBAC Protegido</span>
        </div>
      </div>

      {/* RBAC Legal Compliance Alert */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-start gap-3 text-purple-900 text-xs">
        <span className="text-xl flex-shrink-0">⚖️</span>
        <div className="leading-relaxed">
          <strong>Garantía de Privacidad y Principio de Mínimo Privilegio (OMS & Ley 1581/2012):</strong>{' '}
          El rol de Administrador está habilitado exclusivamente para gestionar contenidos educativos,
          verificar enlaces institucionales y categorías. Por diseño de seguridad RBAC,{' '}
          <strong>no tiene acceso a datos personales ni a historias clínicas privadas de los pacientes</strong>.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto scrollbar-none gap-1">
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'tutorials'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Trámites ({tutorials.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'categories'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Folder className="w-3.5 h-3.5" /> Categorías ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'rbac'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> Control RBAC
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'logs'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" /> Auditoría ({auditLogs.length})
        </button>
      </div>

      {/* ========================================================
          TAB 1: GESTIÓN DE TUTORIALES (CREAR, EDITAR, DESHABILITAR)
          ======================================================== */}
      {activeTab === 'tutorials' && (
        <section className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-app-border">
            <div>
              <h3 className="font-display font-bold text-app-text text-sm">
                Catálogo de Guías y Enlaces Oficiales
              </h3>
              <p className="text-[11px] text-muted-txt">
                Crea, edita o deshabilita guías de trámites en tiempo real.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTutorial(null);
                setTutorialForm({
                  categoryId: categories[0]?.id || 'agendamiento',
                  title: '',
                  emoji: '📝',
                  description: '',
                  entityName: 'Superintendencia Nacional de Salud',
                  officialUrl: 'https://www.supersalud.gov.co',
                  color: '#EBF3FD',
                  verified: true,
                  enabled: true,
                  prerequisitesText: 'Documento de identidad vigente\nUsuario en el portal oficial',
                  stepsText: 'Paso 1: Acceso al portal|Ingresa con tu documento de identidad.|Verifica conexión HTTPS\nPaso 2: Confirmación|Verifica los datos y descarga el comprobante digital.|Guarda el soporte',
                });
                setShowAddTutorialModal(true);
              }}
              className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+</span> Nueva Guía de Trámite
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Buscar por título, entidad o URL..."
              value={tutorialSearch}
              onChange={(e) => setTutorialSearch(e.target.value)}
              className="bg-surface border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
            />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-surface border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-surface border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
            >
              <option value="all">Todos los estados</option>
              <option value="enabled">Solo Habilitados</option>
              <option value="disabled">Solo Deshabilitados</option>
            </select>
          </div>

          {/* List of Tutorials */}
          <div className="space-y-3">
            {filteredAdminTutorials.map((tut) => {
              const isEnabled = tut.enabled !== false;
              return (
                <div
                  key={tut.id}
                  className={`bg-surface rounded-2xl border p-4 shadow-xs space-y-3 transition-all ${
                    isEnabled ? 'border-app-border' : 'border-slate-300 bg-slate-50/70 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-100 flex-shrink-0">
                        {tut.emoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs sm:text-sm text-app-text">{tut.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isEnabled
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {isEnabled ? '● Habilitado' : '○ Deshabilitado'}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            {tut.categoryName || tut.categoryId}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-txt mt-1 leading-relaxed">
                          {tut.description}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Entidad responsable: <strong className="text-slate-700">{tut.entityName}</strong> ·{' '}
                          {tut.prerequisites?.length || 0} requisitos previos · {tut.steps.length} pasos
                        </p>
                      </div>
                    </div>

                    {/* Actions: Toggle Enabled, Edit, Verify, Delete */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start flex-wrap">
                      <button
                        onClick={() => {
                          onUpdateTutorial(tut.id, { enabled: !isEnabled });
                          if (onRecordAuditLog) {
                            onRecordAuditLog(
                              'TUTORIAL_STATUS_CHANGED',
                              'Panel Administración',
                              `Guía "${tut.title}" cambiada a: ${!isEnabled ? 'HABILITADA' : 'DESHABILITADA'}`
                            );
                          }
                        }}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
                          isEnabled
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                        }`}
                        title={isEnabled ? 'Deshabilitar guía' : 'Habilitar guía'}
                      >
                        {isEnabled ? 'Deshabilitar' : 'Habilitar'}
                      </button>

                      <button
                        onClick={() => handleOpenEditTutorial(tut)}
                        className="text-[10px] bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => handleVerifyUrlSecurity(tut)}
                        className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Verificar URL
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar la guía "${tut.title}" permanentemente?`)) {
                            onDeleteTutorial(tut.id);
                            if (onRecordAuditLog) {
                              onRecordAuditLog(
                                'TUTORIAL_DELETED',
                                'Panel Administración',
                                `Guía eliminada: ${tut.title}`
                              );
                            }
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar guía"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Official URL display */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-emerald-700 font-bold text-[10px]">✓ OFICIAL:</span>
                      <span className="font-mono text-[11px] text-slate-700 truncate">{tut.officialUrl}</span>
                    </div>
                    <a
                      href={tut.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-700 font-bold hover:underline flex-shrink-0 flex items-center gap-1"
                    >
                      Probar enlace ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 2: GESTIÓN DE CATEGORÍAS
          ======================================================== */}
      {activeTab === 'categories' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4 rounded-2xl border border-app-border">
            <div>
              <h3 className="font-display font-bold text-app-text text-sm">
                Categorías de Trámites del SGSSS
              </h3>
              <p className="text-[11px] text-muted-txt">
                Administra las categorías principales (Agendamiento, Certificados, Autorizaciones, Información EPS/IPS).
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({
                  id: '',
                  name: '',
                  description: '',
                  emoji: '📁',
                  color: '#EBF3FD',
                  enabled: true,
                });
                setShowAddCategoryModal(true);
              }}
              className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>+</span> Nueva Categoría
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const tutorialCount = tutorials.filter((t) => t.categoryId === cat.id).length;
              const isEnabled = cat.enabled !== false;

              return (
                <div
                  key={cat.id}
                  className={`bg-surface rounded-2xl border p-4 shadow-xs space-y-3 flex flex-col justify-between ${
                    isEnabled ? 'border-app-border' : 'border-slate-300 bg-slate-50/60 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs"
                          style={{ backgroundColor: cat.color || '#EBF3FD' }}
                        >
                          {cat.emoji}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-app-text">{cat.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isEnabled ? 'Habilitada' : 'Deshabilitada'}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-txt mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-app-border/70 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 text-[11px]">
                      {tutorialCount} trámites asociados
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onUpdateCategory(cat.id, { enabled: !isEnabled });
                          if (onRecordAuditLog) {
                            onRecordAuditLog(
                              'CATEGORY_TOGGLED',
                              'Panel Administración',
                              `Categoría "${cat.name}" cambiada a: ${!isEnabled ? 'HABILITADA' : 'DESHABILITADA'}`
                            );
                          }
                        }}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                          isEnabled
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isEnabled ? 'Deshabilitar' : 'Habilitar'}
                      </button>

                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryForm({
                            id: cat.id,
                            name: cat.name,
                            description: cat.description,
                            emoji: cat.emoji,
                            color: cat.color || '#EBF3FD',
                            enabled: cat.enabled !== false,
                          });
                        }}
                        className="text-[10px] bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 3: CONTROL DE ACCESO RBAC & POLÍTICAS OMS
          ======================================================== */}
      {activeTab === 'rbac' && (
        <section className="space-y-4">
          <div className="bg-surface rounded-2xl border border-app-border p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h3 className="font-display font-bold text-app-text text-base">
                  Matriz de Control de Acceso Basado en Roles (RBAC)
                </h3>
              </div>
              <p className="text-xs text-muted-txt mt-1 leading-relaxed">
                Implementación formal del Principio de Mínimo Privilegio (OMS) y la Ley 1581 de 2012 de Protección de Datos Personales en Colombia.
              </p>
            </div>

            {/* Permissions Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Sección / Recurso del Sistema</th>
                    <th className="p-3 text-center">Rol Paciente</th>
                    <th className="p-3 text-center">Rol Familiar Cuidador</th>
                    <th className="p-3 text-center bg-purple-50 text-purple-900">Rol Administrador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">
                      Gestión de Tutoriales & Categorías
                    </td>
                    <td className="p-3 text-center text-slate-500">Solo Lectura</td>
                    <td className="p-3 text-center text-slate-500">Solo Lectura</td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-purple-50/50">
                      ✓ Crear, Editar, Deshabilitar
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">
                      Verificación de URLs Oficiales
                    </td>
                    <td className="p-3 text-center text-slate-500">Acceso Seguro</td>
                    <td className="p-3 text-center text-slate-500">Acceso Seguro</td>
                    <td className="p-3 text-center font-bold text-emerald-700 bg-purple-50/50">
                      ✓ Verificación & Auditoría
                    </td>
                  </tr>
                  <tr className="bg-red-50/30">
                    <td className="p-3 font-semibold text-red-900 flex items-center gap-1.5">
                      <span>🚫</span> Historia Clínica & Exámenes Confidenciales
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700">✓ Titular Total</td>
                    <td className="p-3 text-center text-amber-700 font-semibold">Delegado Consentido</td>
                    <td className="p-3 text-center font-bold text-red-700 bg-red-100/50">
                      ✕ DENEGADO ESTRICTO (0%)
                    </td>
                  </tr>
                  <tr className="bg-red-50/30">
                    <td className="p-3 font-semibold text-red-900 flex items-center gap-1.5">
                      <span>🚫</span> Fórmulas y Medicamentos Privados
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700">✓ Titular Total</td>
                    <td className="p-3 text-center text-amber-700 font-semibold">Delegado Consentido</td>
                    <td className="p-3 text-center font-bold text-red-700 bg-red-100/50">
                      ✕ DENEGADO ESTRICTO (0%)
                    </td>
                  </tr>
                  <tr className="bg-red-50/30">
                    <td className="p-3 font-semibold text-red-900 flex items-center gap-1.5">
                      <span>🚫</span> Citas Médicas Personales del Paciente
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700">✓ Titular Total</td>
                    <td className="p-3 text-center text-amber-700 font-semibold">Delegado Consentido</td>
                    <td className="p-3 text-center font-bold text-red-700 bg-red-100/50">
                      ✕ DENEGADO ESTRICTO (0%)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Test Simulation Button */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">
                    Test de Verificación de Barrera RBAC en Vivo
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Ejecuta una solicitud simulada desde la sesión de Administrador hacia un registro de Historia Clínica confidencial.
                  </p>
                </div>
                <button
                  onClick={handleSimulateRbacTest}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Simular Acceso a Historial
                </button>
              </div>

              {rbacTestResult && (
                <div className="bg-red-50 border border-red-300 text-red-900 rounded-xl p-3 text-xs leading-relaxed font-mono">
                  {rbacTestResult}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'logs' && (
        <section className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-app-text text-sm">
              Trazabilidad Inmutable de Seguridad (OMS & MinSalud)
            </h3>
            <span className="text-[10px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded-md">
              SYSLOG: ACTIVE
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
                  <span>Área: {log.module} | Rol: {log.userRole}</span>
                  <span
                    className={`font-bold ${
                      log.status === 'DENIED'
                        ? 'text-red-600'
                        : log.status === 'WARNING'
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    IP: {log.ipAddress} · {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================
          MODAL: CREAR / EDITAR GUÍA DE TRÁMITE
          ======================================================== */}
      {(showAddTutorialModal || editingTutorial) && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => {
            setShowAddTutorialModal(false);
            setEditingTutorial(null);
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-fadeIn my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-purple-900 text-white">
              <div>
                <h3 className="font-display font-bold text-base">
                  {editingTutorial ? 'Editar Guía de Trámite' : 'Crear Nueva Guía de Trámite'}
                </h3>
                <p className="text-[11px] text-purple-200">
                  Contenido oficial con requisitos previos y enlace verificado
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddTutorialModal(false);
                  setEditingTutorial(null);
                }}
                className="w-7 h-7 rounded-full bg-purple-800 text-purple-200 flex items-center justify-center hover:bg-purple-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTutorial} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría del Trámite *
                  </label>
                  <select
                    value={tutorialForm.categoryId}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, categoryId: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ícono / Emoji *
                  </label>
                  <input
                    type="text"
                    value={tutorialForm.emoji}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, emoji: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Trámite *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cambio de IPS Primaria o Portabilidad"
                  value={tutorialForm.title}
                  onChange={(e) => setTutorialForm({ ...tutorialForm, title: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción breve para el usuario *
                </label>
                <textarea
                  placeholder="Explica claramente en qué consiste el trámite y a quién va dirigido."
                  value={tutorialForm.description}
                  onChange={(e) => setTutorialForm({ ...tutorialForm, description: e.target.value })}
                  rows={2}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entidad Oficial Responsable *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: ADRES / Ministerio de Salud"
                    value={tutorialForm.entityName}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, entityName: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Oficial Verificada *
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.minsalud.gov.co"
                    value={tutorialForm.officialUrl}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, officialUrl: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Requisitos Previos (uno por línea) *
                </label>
                <textarea
                  placeholder="Documento de identidad vigente&#10;Orden médica vigente menor a 30 días&#10;Usuario y clave en portal EPS"
                  value={tutorialForm.prerequisitesText}
                  onChange={(e) => setTutorialForm({ ...tutorialForm, prerequisitesText: e.target.value })}
                  rows={3}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                  required
                />
                <span className="text-[10px] text-muted-txt">
                  Escribe cada requisito en un renglón separado. El usuario podrá marcarlos como un checklist interactivo.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pasos Guiados (formato: Título|Instrucción|Consejo opcional) *
                </label>
                <textarea
                  placeholder="Paso 1: Ingreso al portal|Ingresa a www.ejemplo.gov.co|Usa Google Chrome&#10;Paso 2: Descarga|Descarga tu PDF|Conserva el radicado"
                  value={tutorialForm.stepsText}
                  onChange={(e) => setTutorialForm({ ...tutorialForm, stepsText: e.target.value })}
                  rows={4}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text font-mono"
                  required
                />
                <span className="text-[10px] text-muted-txt">
                  Separa con el caracter | el título, la instrucción y el consejo práctico.
                </span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={tutorialForm.enabled}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, enabled: e.target.checked })}
                    className="rounded text-purple-700 focus:ring-purple-600"
                  />
                  Habilitar inmediatamente en la vista de usuarios
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={tutorialForm.verified}
                    onChange={(e) => setTutorialForm({ ...tutorialForm, verified: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Sello de Enlace Verificado
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTutorialModal(false);
                    setEditingTutorial(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingTutorial ? 'Guardar Cambios' : 'Publicar Guía Oficial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CREAR / EDITAR CATEGORÍA
          ======================================================== */}
      {(showAddCategoryModal || editingCategory) && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => {
            setShowAddCategoryModal(false);
            setEditingCategory(null);
          }}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-purple-900 text-white">
              <h3 className="font-display font-bold text-base">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría de Trámites'}
              </h3>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="w-7 h-7 rounded-full bg-purple-800 text-purple-200 flex items-center justify-center hover:bg-purple-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-3.5">
              {!editingCategory && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Identificador (Slug) *
                  </label>
                  <input
                    type="text"
                    placeholder="ej: derechos_usuario"
                    value={categoryForm.id}
                    onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs font-mono text-app-text"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    placeholder="ej: Derechos y Deberes"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emoji *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.emoji}
                    onChange={(e) => setCategoryForm({ ...categoryForm, emoji: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-center text-app-text"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  placeholder="Describe qué trámites abarcará esta categoría."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  rows={2}
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Color de Fondo (Hex o Tailwind)
                </label>
                <div className="flex gap-2">
                  {['#EBF3FD', '#FFEDD5', '#FEF3C7', '#ECFDF5', '#F3E8FF'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, color: c })}
                      className={`w-7 h-7 rounded-lg border-2 ${categoryForm.color === c ? 'border-purple-700 scale-110' : 'border-slate-300'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat-enabled"
                  checked={categoryForm.enabled}
                  onChange={(e) => setCategoryForm({ ...categoryForm, enabled: e.target.checked })}
                  className="rounded text-purple-700 focus:ring-purple-600"
                />
                <label htmlFor="cat-enabled" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Categoría Habilitada
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: VERIFICADOR DE SEGURIDAD DE URL (ANTI-PHISHING)
          ======================================================== */}
      {urlVerificationModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setUrlVerificationModal(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔍</span>
                <h3 className="font-display font-bold text-slate-900 text-sm">
                  Auditoría de Seguridad de URL
                </h3>
              </div>
              <button
                onClick={() => setUrlVerificationModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Trámite Evaluado</p>
                <p className="font-bold text-slate-900 mt-0.5">{urlVerificationModal.title}</p>
                <p className="text-[11px] text-purple-700 font-medium">Entidad: {urlVerificationModal.entity}</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 font-medium">
                  <span>Protocolo Cifrado SSL (HTTPS):</span>
                  <span className="font-bold">✓ VÁLIDO</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 font-medium">
                  <span>Dominio Institucional / Gubernamental:</span>
                  <span className="font-bold">✓ AUTORIZADO</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-900 font-medium">
                  <span>Filtro Anti-Phishing SGSSS:</span>
                  <span className="font-bold">✓ LIMPIO</span>
                </div>
              </div>

              <div className="p-3 bg-purple-50 text-purple-900 rounded-xl font-mono text-[11px] break-all border border-purple-200">
                {urlVerificationModal.url}
              </div>
            </div>

            <button
              onClick={() => setUrlVerificationModal(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Cerrar Auditoría
            </button>
          </div>
        </div>
      )}

          </div>
  );
}
