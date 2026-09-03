import { useState } from 'react';
import type { TutorialCategory } from '../types';

interface TutorialsScreenProps {
  tutorials: TutorialCategory[];
}

export default function TutorialsScreen({ tutorials }: TutorialsScreenProps) {
  const [selected, setSelected] = useState<TutorialCategory | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const filteredTutorials = tutorials.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.entityName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStepCompleted = (stepIdx: number) => {
    if (!selected) return;
    const key = `${selected.id}-${stepIdx}`;
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (selected) {
    const totalSteps = selected.steps.length;
    const finishedStepsCount = selected.steps.filter(
      (_, idx) => completedSteps[`${selected.id}-${idx}`]
    ).length;
    const progressPercent = Math.round((finishedStepsCount / totalSteps) * 100);

    return (
      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto pb-24 animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelected(null);
            setOpenStep(0);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver a listado de tutoriales
        </button>

        {/* Tutorial Header Card */}
        <div
          className="rounded-3xl p-5 border border-slate-200/80 shadow-xs"
          style={{ backgroundColor: selected.color }}
        >
          <div className="flex items-start justify-between">
            <span className="text-4xl">{selected.emoji}</span>
            {selected.verified && (
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                ✓ Enlace Oficial Verificado
              </span>
            )}
          </div>
          <h2 className="font-display text-lg font-bold text-app-text mt-2">{selected.title}</h2>
          <p className="text-xs text-muted-txt mt-1 leading-relaxed">{selected.description}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200/60 pt-2.5">
            <span>Entidad Reguladora: <strong>{selected.entityName}</strong></span>
            <span>{totalSteps} pasos guiados</span>
          </div>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-surface rounded-2xl border border-app-border p-3.5 shadow-xs">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Progreso del trámite</span>
            <span className="font-bold text-primary">{finishedStepsCount} de {totalSteps} completados ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <section className="space-y-2.5">
          <h3 className="font-display font-bold text-app-text text-sm">Pasos para realizar el trámite</h3>
          {selected.steps.map((step, idx) => {
            const isCompleted = Boolean(completedSteps[`${selected.id}-${idx}`]);
            const isOpen = openStep === idx;

            return (
              <div
                key={idx}
                className={`bg-surface rounded-2xl border transition-all overflow-hidden shadow-xs ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : isOpen
                    ? 'border-primary/40'
                    : 'border-app-border'
                }`}
              >
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => setOpenStep(isOpen ? null : idx)}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isOpen
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <p className={`text-xs font-bold ${isCompleted ? 'text-emerald-900 line-through opacity-80' : 'text-app-text'}`}>
                      {step.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStepCompleted(idx)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                      title="Marcar paso completado"
                    >
                      {isCompleted ? 'Completado' : 'Marcar'}
                    </button>
                    <button
                      onClick={() => setOpenStep(isOpen ? null : idx)}
                      className="text-slate-400 p-1"
                    >
                      {isOpen ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-app-border/40 pl-14 leading-relaxed">
                    <p>{step.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Verified Link Action */}
        <div className="pt-2">
          <a
            href={selected.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all font-display text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ir al Portal Oficial de {selected.entityName}
          </a>
          <p className="text-center text-[10px] text-muted-txt mt-2">
            ✓ Enlace oficial verificado por la administración de GuiaSalud y entes del SGSSS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto pb-24">
      <div>
        <h2 className="font-display font-bold text-app-text text-lg">Tutoriales de Trámites en Salud</h2>
        <p className="text-xs text-muted-txt">
          Guías paso a paso para trámites en el Sistema General de Seguridad Social en Salud (Colombia)
        </p>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar trámite (ej: agendar cita, autorizaciones, Sisbén)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface border border-app-border rounded-2xl px-4 py-2.5 pl-10 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 shadow-xs"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      </div>

      {/* Official SGSSS Info Badge */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-3.5 flex gap-3 items-center text-primary shadow-xs">
        <span className="text-2xl">🏛️</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Normativa SGSSS y ODS 16</p>
          <p className="text-[11px] opacity-85 leading-relaxed">
            Todas las guías están actualizadas con los canales virtuales oficiales del Ministerio de Salud y la Superintendencia Nacional de Salud.
          </p>
        </div>
      </div>

      {/* Tutorial Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTutorials.map((tutorial) => (
          <button
            key={tutorial.id}
            onClick={() => {
              setSelected(tutorial);
              setOpenStep(0);
            }}
            className="bg-surface rounded-2xl border border-app-border p-4 text-left shadow-xs hover:border-primary/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-xs"
                style={{ backgroundColor: tutorial.color }}
              >
                {tutorial.emoji}
              </div>
              <h3 className="font-display font-bold text-xs text-app-text group-hover:text-primary transition-colors leading-snug">
                {tutorial.title}
              </h3>
              <p className="text-[11px] text-muted-txt mt-1 line-clamp-2 leading-relaxed">
                {tutorial.description}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-app-border/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">{tutorial.steps.length} pasos</span>
              <span className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Ver guía →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
