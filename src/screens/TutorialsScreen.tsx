import { useState } from 'react';
import { tutorials } from '../data';
import type { TutorialCategory } from '../types';

export default function TutorialsScreen() {
  const [selected, setSelected] = useState<TutorialCategory | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);

  if (selected) {
    return (
      <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => { setSelected(null); setOpenStep(null); }}
          className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-70 transition-opacity"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver a tutoriales
        </button>

        {/* Tutorial header */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: selected.color }}>
          <div className="text-4xl mb-2">{selected.emoji}</div>
          <h2 className="font-display text-xl font-bold text-app-text">{selected.title}</h2>
          <p className="text-sm text-muted-txt mt-1">{selected.description}</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-txt">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
            {selected.steps.length} pasos · Duración estimada: {selected.steps.length * 2} min
          </div>
        </div>

        {/* Steps accordion */}
        <section>
          <h3 className="font-display font-semibold text-app-text mb-3">Pasos del trámite</h3>
          <div className="space-y-2">
            {selected.steps.map((step, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-app-border shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenStep(openStep === i ? null : i)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                    openStep === i ? 'bg-primary text-white' : 'bg-primary-50 text-primary'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-app-text">{step.title}</span>
                  <svg
                    viewBox="0 0 24 24" fill="none"
                    className={`w-4 h-4 text-muted-txt flex-shrink-0 transition-transform ${openStep === i ? 'rotate-180' : ''}`}
                    stroke="currentColor" strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openStep === i && (
                  <div className="px-4 pb-4 pt-1 border-t border-app-border/50">
                    <p className="text-sm text-muted-txt leading-relaxed pl-10">{step.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Completion notice */}
        <div className="bg-secondary-50 rounded-2xl border border-secondary/20 p-4 flex gap-3 items-start">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-secondary">Información verificada</p>
            <p className="text-xs text-muted-txt mt-0.5">Este tutorial usa información oficial de las entidades reguladoras colombianas.</p>
          </div>
        </div>

        {/* Official link */}
        <a
          href={selected.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-primary text-white font-semibold py-4 rounded-2xl hover:bg-primary-hover transition-all shadow-md hover:shadow-lg font-display text-base"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Ir al enlace oficial verificado
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">✓ Verificado</span>
        </a>

        <div className="h-2" />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
      <div>
        <h2 className="font-display font-bold text-app-text text-xl">Tutoriales de trámites</h2>
        <p className="text-sm text-muted-txt mt-1">Guías paso a paso para gestionar tu salud en Colombia.</p>
      </div>

      {/* Info banner */}
      <div className="bg-primary-50 rounded-2xl border border-primary-100 p-4 flex gap-3 items-start">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
        </svg>
        <p className="text-xs text-primary leading-relaxed">
          Todos los tutoriales están verificados y alineados con la normativa vigente del <strong>Sistema General de Seguridad Social en Salud (SGSSS)</strong> colombiano.
        </p>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {tutorials.map((tutorial) => (
          <button
            key={tutorial.id}
            onClick={() => { setSelected(tutorial); setOpenStep(null); }}
            className="bg-surface rounded-2xl border border-app-border shadow-sm p-4 text-left hover:shadow-md hover:border-primary/20 transition-all group"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
              style={{ backgroundColor: tutorial.color }}
            >
              {tutorial.emoji}
            </div>
            <p className="font-semibold text-sm text-app-text group-hover:text-primary transition-colors leading-tight">{tutorial.title}</p>
            <p className="text-xs text-muted-txt mt-1 leading-relaxed line-clamp-2">{tutorial.description}</p>
            <div className="flex items-center gap-1 mt-3">
              <span className="text-xs text-primary font-medium">Ver tutorial</span>
              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-primary" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* All steps count */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: tutorials.length, label: 'Categorías', emoji: '📚' },
          { value: tutorials.reduce((a, t) => a + t.steps.length, 0), label: 'Pasos totales', emoji: '📋' },
          { value: tutorials.length, label: 'Links verificados', emoji: '✅' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface border border-app-border rounded-2xl p-3 text-center shadow-sm">
            <p className="text-lg">{stat.emoji}</p>
            <p className="font-display font-bold text-xl text-app-text">{stat.value}</p>
            <p className="text-xs text-muted-txt">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="h-2" />
    </div>
  );
}
