import { useState } from 'react';
import type { TutorialCategory, TutorialCategoryDef } from '../types';
import {
  Search,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle2,
  Building2,
  ClipboardList,
  Footprints,
  ExternalLink,
  Copy,
  BookOpen,
  Compass,
  FileCheck,
  Landmark,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface TutorialsScreenProps {
  tutorials: TutorialCategory[];
  categories?: TutorialCategoryDef[];
}

function getCategoryIcon(categoryId: string) {
  switch (categoryId) {
    case 'agendamiento':
      return <Calendar className="w-3.5 h-3.5 text-blue-600" />;
    case 'certificados':
      return <FileText className="w-3.5 h-3.5 text-amber-600" />;
    case 'autorizaciones':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    case 'eps_ips':
      return <Building2 className="w-3.5 h-3.5 text-teal-600" />;
    case 'all':
    default:
      return <Compass className="w-3.5 h-3.5 text-slate-600" />;
  }
}

function getTutorialCardIcon(categoryId: string, id: string) {
  if (id.includes('bdua') || id.includes('cert') || categoryId === 'certificados') {
    return <FileCheck className="w-6 h-6 text-amber-600" />;
  }
  if (categoryId === 'agendamiento') {
    return <Calendar className="w-6 h-6 text-primary" />;
  }
  if (categoryId === 'autorizaciones') {
    return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
  }
  if (categoryId === 'eps_ips') {
    return <BarChart3 className="w-6 h-6 text-teal-600" />;
  }
  return <BookOpen className="w-6 h-6 text-primary" />;
}

export default function TutorialsScreen({ tutorials, categories }: TutorialsScreenProps) {
  const [selected, setSelected] = useState<TutorialCategory | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [checkedPrereqs, setCheckedPrereqs] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  // Available categories with fallback
  const categoryList: { id: string; name: string }[] = categories && categories.length > 0
    ? [{ id: 'all', name: 'Todos los Trámites' }, ...categories.map(c => ({ id: c.id, name: c.name }))]
    : [
        { id: 'all', name: 'Todos los Trámites' },
        { id: 'agendamiento', name: 'Agendamiento de Citas' },
        { id: 'certificados', name: 'Certificados de Afiliación' },
        { id: 'autorizaciones', name: 'Autorizaciones Médicas' },
        { id: 'eps_ips', name: 'Información General EPS/IPS' },
      ];

  // Only show enabled tutorials for citizens
  const activeTutorials = tutorials.filter((t) => t.enabled !== false);

  const filteredTutorials = activeTutorials.filter((t) => {
    const matchesCategory = selectedCategory === 'all' || t.categoryId === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.prerequisites && t.prerequisites.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  const toggleStepCompleted = (stepIdx: number) => {
    if (!selected) return;
    const key = `${selected.id}-step-${stepIdx}`;
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrereqChecked = (prereqIdx: number) => {
    if (!selected) return;
    const key = `${selected.id}-prereq-${prereqIdx}`;
    setCheckedPrereqs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // -------------------------------------------------------------
  // DETAIL VIEW FOR A SPECIFIC TUTORIAL
  // -------------------------------------------------------------
  if (selected) {
    const totalSteps = selected.steps.length;
    const finishedStepsCount = selected.steps.filter(
      (_, idx) => completedSteps[`${selected.id}-step-${idx}`]
    ).length;
    const progressPercent = totalSteps > 0 ? Math.round((finishedStepsCount / totalSteps) * 100) : 0;

    const prereqs = selected.prerequisites || [];
    const totalPrereqs = prereqs.length;
    const readyPrereqsCount = prereqs.filter(
      (_, idx) => checkedPrereqs[`${selected.id}-prereq-${idx}`]
    ).length;

    return (
      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto pb-28 animate-fadeIn">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setSelected(null);
              setOpenStep(0);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Volver a listado de tutoriales
          </button>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {selected.categoryName || 'Guía de Trámite'}
          </span>
        </div>

        {/* Tutorial Hero Card */}
        <div
          className="rounded-3xl p-5 border border-slate-200/90 shadow-xs transition-all"
          style={{ backgroundColor: selected.color || '#EBF3FD' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center">
                {getTutorialCardIcon(selected.categoryId, selected.id)}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {selected.categoryName}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full ml-2 inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" /> Oficial Verificado
                </span>
              </div>
            </div>
          </div>

          <h2 className="font-display font-extrabold text-app-text text-lg sm:text-xl leading-tight mt-3">
            {selected.title}
          </h2>
          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
            {selected.description}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-300/70 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold">Entidad:</span>
              <span className="bg-white/90 font-bold px-2 py-0.5 rounded-md text-slate-800 border border-slate-200">
                {selected.entityName}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5 text-slate-500" /> {totalPrereqs} requisitos
              </span>
              <span className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-slate-500" /> {totalSteps} pasos guiados
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 1: REQUISITOS PREVIOS */}
        <section className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-app-text text-sm">
                  Requisitos Previos Antes de Iniciar
                </h3>
                <p className="text-[11px] text-muted-txt">
                  Alista estos documentos antes de ingresar al portal oficial para evitar retrasos
                </p>
              </div>
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                readyPrereqsCount === totalPrereqs && totalPrereqs > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {readyPrereqsCount} de {totalPrereqs} listos
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {prereqs.map((prereq, pIdx) => {
              const isChecked = Boolean(checkedPrereqs[`${selected.id}-prereq-${pIdx}`]);
              return (
                <label
                  key={pIdx}
                  onClick={() => togglePrereqChecked(pIdx)}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 text-xs">
                    <span className={isChecked ? 'line-through opacity-85 font-medium' : 'font-medium'}>
                      {prereq}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: PROGRESO Y PASOS GUIADOS */}
        <section className="space-y-3">
          {/* Progress Tracker Card */}
          <div className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-primary" /> Progreso de los Pasos
              </span>
              <span className="font-bold text-primary">
                {finishedStepsCount} de {totalSteps} completados ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {progressPercent === 100 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 font-bold flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Felicitaciones! Has completado todos los pasos guiados para este trámite.</span>
              </div>
            )}
          </div>

          {/* Steps List Accordion */}
          <div className="space-y-2.5">
            {selected.steps.map((step, idx) => {
              const isCompleted = Boolean(completedSteps[`${selected.id}-step-${idx}`]);
              const isOpen = openStep === idx;

              return (
                <div
                  key={idx}
                  className={`bg-surface rounded-2xl border transition-all overflow-hidden shadow-xs ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isOpen
                      ? 'border-primary/50'
                      : 'border-app-border'
                  }`}
                >
                  <button
                    onClick={() => setOpenStep(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isOpen
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-app-text">{step.title}</p>
                        <p className="text-[10px] text-muted-txt">Paso {idx + 1} de {totalSteps}</p>
                      </div>
                    </div>
                    <span className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 space-y-3 text-xs border-t border-slate-100">
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {step.description}
                      </p>

                      {step.tip && (
                        <div className="flex gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 items-start">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] leading-relaxed">
                            <strong>Consejo útil: </strong>{step.tip}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => toggleStepCompleted(idx)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Paso completado
                            </>
                          ) : (
                            'Marcar paso como realizado'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: ENLACE OFICIAL VERIFICADO */}
        <section className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-primary shrink-0" />
              <h3 className="font-display font-bold text-app-text text-sm">
                Canal Oficial Verificado del Trámite
              </h3>
            </div>
            <button
              onClick={() => handleCopyLink(selected.officialUrl)}
              className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? '¡Enlace copiado!' : 'Copiar URL'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{selected.officialUrl}</p>
              <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <Check className="w-3 h-3" /> Verificado por {selected.entityName}
              </p>
            </div>
          </div>

          <a
            href={selected.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all shadow-md font-display text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" /> Ir al Portal Oficial de {selected.entityName}
          </a>

          <p className="text-center text-[10px] text-muted-txt">
            Apertura directa en nueva pestaña segura bajo directiva de ciberseguridad SGSSS.
          </p>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN CATALOG VIEW (LIST OF TUTORIALS BY CATEGORY)
  // -------------------------------------------------------------
  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto pb-28">
      {/* Module Title Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-app-text text-lg">
            Tutoriales de Trámites en Salud
          </h2>
          <span className="text-[10px] font-bold bg-primary-50 text-primary border border-primary-200 px-2 py-0.5 rounded-full">
            SGSSS Colombia
          </span>
        </div>
        <p className="text-xs text-muted-txt mt-0.5">
          Guías interactivas con requisitos previos y enlaces oficiales verificados para evitar desinformación
        </p>
      </div>

      {/* Category Filter Chips / Tabs - Desplazamiento táctil fluido */}
      <div className="touch-scroll-x select-none gap-2 pb-2 -mx-4 px-4">
        {categoryList.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all'
            ? activeTutorials.length
            : activeTutorials.filter((t) => t.categoryId === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('selection');
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all shadow-2xs active:scale-90 touch-manipulation cursor-pointer ${
                isSelected
                  ? 'bg-primary text-white shadow-xs font-bold scale-[1.02]'
                  : 'bg-surface border border-app-border text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 active:bg-slate-100'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por trámite, requisito o entidad (ej: citas, Sisbén, ADRES, autorización)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-app-border rounded-2xl px-4 py-2.5 pl-10 pr-9 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Official SGSSS Assurance Banner */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-3.5 flex gap-3 items-center text-primary shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-primary-100/80 flex items-center justify-center text-primary shrink-0">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Enlaces Oficiales Verificados</p>
          <p className="text-[11px] opacity-85 leading-relaxed">
            Todas las guías conectan con canales gubernamentales e institucionales protegidos (MinSalud, ADRES, Supersalud, DNP) previniendo sitios fraudulentos.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filteredTutorials.length === 0 && (
        <div className="bg-surface rounded-2xl border border-app-border p-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800">No se encontraron trámites</h4>
          <p className="text-xs text-muted-txt max-w-sm mx-auto">
            No hay guías que coincidan con &quot;{searchQuery}&quot; en esta categoría. Intenta con otra palabra clave o selecciona &quot;Todos los Trámites&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      )}

      {/* Tutorials Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTutorials.map((tutorial) => {
          const prereqsCount = tutorial.prerequisites?.length || 0;
          const stepsCount = tutorial.steps.length;

          return (
            <button
              key={tutorial.id}
              onClick={() => {
                triggerHaptic('light');
                setSelected(tutorial);
                setOpenStep(0);
              }}
              className="bg-surface rounded-2xl border border-app-border p-4 text-left shadow-xs hover:border-primary/50 hover:shadow-md active:scale-[0.97] active:bg-blue-50/40 active:border-primary/40 transition-all group flex flex-col justify-between cursor-pointer touch-manipulation"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: tutorial.color || '#EBF3FD' }}
                  >
                    {getTutorialCardIcon(tutorial.categoryId, tutorial.id)}
                  </div>
                  {tutorial.verified && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" /> Oficial
                    </span>
                  )}
                </div>

                <div className="mb-1">
                  <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    {tutorial.categoryName || 'Trámite'}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xs text-app-text group-hover:text-primary transition-colors leading-snug">
                  {tutorial.title}
                </h3>
                <p className="text-[11px] text-muted-txt mt-1 line-clamp-2 leading-relaxed">
                  {tutorial.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-app-border/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5 text-slate-400" /> {prereqsCount} req. ·{' '}
                    <Footprints className="w-3.5 h-3.5 text-slate-400" /> {stepsCount} pasos
                  </span>
                  <span className="text-primary font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ver guía <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-slate-600 truncate">
                  Entidad: <strong className="text-slate-800">{tutorial.entityName}</strong>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Credits */}
      <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-1">
        <p className="text-[11px] text-slate-500">
          <strong>GuiaSalud</strong> · Tutoriales de Trámites y Asistencia al Ciudadano
        </p>
        <p className="text-[10px] text-slate-500">
          Canales oficiales verificados ante el Sistema General de Seguridad Social en Salud (SGSSS)
        </p>
      </div>
    </div>
  );
}
