import { useState } from 'react';
import type { Medication, MedTakenStatus } from '../types';
import { initialMedications } from '../data';

export default function MedicationsScreen() {
  const [meds, setMeds] = useState<Medication[]>(initialMedications);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dose: '', frequency: '', durationDays: 30 });

  const updateTaken = (id: string, status: MedTakenStatus) => {
    setMeds((prev) => prev.map((m) => m.id === id ? { ...m, takenToday: status } : m));
  };

  const endingSoon = meds.filter((m) => m.daysElapsed / m.durationDays >= 0.8);

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dose) return;
    const med: Medication = {
      id: String(Date.now()),
      name: newMed.name,
      dose: newMed.dose,
      frequency: newMed.frequency || 'Una vez al día',
      durationDays: newMed.durationDays,
      daysElapsed: 0,
      takenToday: 'none',
    };
    setMeds([...meds, med]);
    setNewMed({ name: '', dose: '', frequency: '', durationDays: 30 });
    setShowAddModal(false);
  };

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-app-text text-xl">Medicamentos</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-white bg-primary px-3 py-2 rounded-xl hover:bg-primary-hover transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar
        </button>
      </div>

      {/* Alert section */}
      {endingSoon.length > 0 && (
        <div className="bg-alert-bg border border-alert/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-alert" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-sm font-semibold text-alert">Tratamiento próximo a finalizar</p>
          </div>
          <div className="space-y-1">
            {endingSoon.map((m) => (
              <p key={m.id} className="text-xs text-muted-txt">
                <strong className="text-alert">{m.name}</strong> — {m.durationDays - m.daysElapsed} día{m.durationDays - m.daysElapsed !== 1 ? 's' : ''} restante{m.durationDays - m.daysElapsed !== 1 ? 's' : ''}.
                Consulta renovación con tu médico.
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 text-xs text-muted-txt">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary inline-block" />En tiempo</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-alert inline-block" />Finalizando pronto</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cancelled inline-block" />Completado</span>
      </div>

      {/* Medication cards */}
      <section className="space-y-3">
        {meds.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">💊</p>
            <p className="font-medium text-app-text">Sin medicamentos activos</p>
            <p className="text-sm text-muted-txt mt-1">Agrega tus medicamentos para hacer seguimiento.</p>
          </div>
        ) : (
          meds.map((med) => {
            const progress = Math.min(100, Math.round((med.daysElapsed / med.durationDays) * 100));
            const isAlmostDone = progress >= 80 && progress < 100;
            const isComplete = progress >= 100;
            const barColor = isComplete ? '#DC2626' : isAlmostDone ? '#EA580C' : '#059669';
            const daysLeft = med.durationDays - med.daysElapsed;

            return (
              <div key={med.id} className="bg-surface rounded-2xl border border-app-border shadow-sm p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-secondary" stroke="currentColor" strokeWidth="2">
                        <path d="M10.5 20H4a2 2 0 0 1-2-2v-2.5"/><path d="M9 10l-6.5 6.5c-.78.78-.78 2.05 0 2.83l2.17 2.17c.78.78 2.05.78 2.83 0L14 15"/>
                        <path d="M14 4.172a4 4 0 0 1 5.657 0l.172.172a4 4 0 0 1 0 5.656L14 16l-5.828-5.828"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-app-text">{med.name}</p>
                      <p className="text-xs text-muted-txt">{med.dose}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-muted-txt px-2 py-1 rounded-lg font-medium">
                    {med.frequency}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-txt">Progreso del tratamiento</span>
                    <span className="font-semibold" style={{ color: barColor }}>
                      {isComplete ? 'Completado' : `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-txt mt-1">
                    <span>Día {med.daysElapsed}</span>
                    <span>Día {med.durationDays}</span>
                  </div>
                </div>

                {/* Action buttons */}
                {!isComplete && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTaken(med.id, med.takenToday === 'taken' ? 'none' : 'taken')}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-all ${
                        med.takenToday === 'taken'
                          ? 'bg-done-bg text-done border-2 border-done/30'
                          : 'bg-slate-50 border border-app-border text-muted-txt hover:bg-done-bg hover:text-done hover:border-done/30'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {med.takenToday === 'taken' ? '✓ Tomada' : 'Marcar tomada'}
                    </button>
                    <button
                      onClick={() => updateTaken(med.id, med.takenToday === 'skipped' ? 'none' : 'skipped')}
                      className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-all ${
                        med.takenToday === 'skipped'
                          ? 'bg-cancelled-bg text-cancelled border-2 border-cancelled/30'
                          : 'bg-slate-50 border border-app-border text-muted-txt hover:bg-cancelled-bg hover:text-cancelled hover:border-cancelled/30'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      {med.takenToday === 'skipped' ? '✗ Omitida' : 'Marcar omitida'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Add medication modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end md:items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-app-border flex items-center justify-between">
              <h3 className="font-display font-bold text-app-text">Nuevo medicamento</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddMed} className="p-5 space-y-4">
              {[
                { label: 'Nombre del medicamento', field: 'name' as const, placeholder: 'Ej: Enalapril' },
                { label: 'Dosis', field: 'dose' as const, placeholder: 'Ej: 10 mg' },
                { label: 'Frecuencia', field: 'frequency' as const, placeholder: 'Ej: Cada 8 horas' },
              ].map((f) => (
                <div key={f.field}>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={newMed[f.field]}
                    onChange={(e) => setNewMed({ ...newMed, [f.field]: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
                    required={f.field === 'name' || f.field === 'dose'}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1.5">Duración del tratamiento (días)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={newMed.durationDays}
                  onChange={(e) => setNewMed({ ...newMed, durationDays: parseInt(e.target.value) || 30 })}
                  className="w-full border border-app-border rounded-xl px-4 py-3 text-sm text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 transition-all"
                />
              </div>
              <button type="submit" className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary-hover transition-colors font-display">
                Agregar medicamento
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}
