import { useState } from 'react';
import type { Medication, MedTakenStatus, MedDoseHistory } from '../types';

interface MedicationsScreenProps {
  medications: Medication[];
  doseHistory: MedDoseHistory[];
  onAddMedication: (med: Omit<Medication, 'id' | 'patientId'>) => void;
  onUpdateTakenStatus: (id: string, status: MedTakenStatus) => void;
  onDeleteMedication: (id: string) => void;
}

export default function MedicationsScreen({
  medications,
  doseHistory,
  onAddMedication,
  onUpdateTakenStatus,
  onDeleteMedication,
}: MedicationsScreenProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    frequency: 'Cada 12 horas',
    durationDays: 30,
    prescribedBy: 'Dr. Andrés Morales',
    timeOfDay: ['08:00', '20:00'],
  });

  const endingSoon = medications.filter((m) => m.daysElapsed / m.durationDays >= 0.8);

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name || !newMed.dose) return;
    onAddMedication({
      name: newMed.name,
      dose: newMed.dose,
      frequency: newMed.frequency,
      timeOfDay: newMed.timeOfDay,
      durationDays: newMed.durationDays,
      daysElapsed: 0,
      takenToday: 'none',
      prescribedBy: newMed.prescribedBy,
    });
    setNewMed({
      name: '',
      dose: '',
      frequency: 'Cada 12 horas',
      durationDays: 30,
      prescribedBy: 'Dr. Andrés Morales',
      timeOfDay: ['08:00', '20:00'],
    });
    setShowAddModal(false);
  };

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-app-text text-lg">Control de Medicamentos</h2>
          <p className="text-xs text-muted-txt">Monitoreo de tratamientos y adherencia terapéutica</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Receta
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'current'
              ? 'bg-white text-primary shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tratamientos Activos ({medications.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-white text-primary shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Historial de Tomas ({doseHistory.length})
        </button>
      </div>

      {activeTab === 'current' ? (
        <>
          {/* Prescriptions ending soon warning */}
          {endingSoon.length > 0 && (
            <div className="bg-alert-bg border border-alert/30 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-alert text-lg">⚠️</span>
                <p className="text-xs font-bold text-alert uppercase tracking-wide">
                  Alerta: Fin de Tratamiento Próximo
                </p>
              </div>
              <div className="space-y-1.5">
                {endingSoon.map((m) => (
                  <div key={m.id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-700">
                      <strong>{m.name} {m.dose}</strong> — Restan {m.durationDays - m.daysElapsed} día(s).
                    </span>
                    <span className="text-[10px] bg-alert/15 text-alert font-bold px-2 py-0.5 rounded-full">
                      Renovar fórmula
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medication Cards List */}
          <div className="space-y-3">
            {medications.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-2xl border border-app-border p-6">
                <p className="text-4xl mb-2">💊</p>
                <p className="font-bold text-app-text text-sm">Sin medicamentos registrados</p>
                <p className="text-xs text-muted-txt mt-0.5">
                  Agrega tus recetas médicas para programar alertas y registrar tus tomas.
                </p>
              </div>
            ) : (
              medications.map((med) => {
                const progress = Math.min(100, Math.round((med.daysElapsed / med.durationDays) * 100));
                const isAlmostDone = progress >= 80 && progress < 100;
                const isComplete = progress >= 100;
                const daysLeft = med.durationDays - med.daysElapsed;

                return (
                  <div
                    key={med.id}
                    className="bg-surface rounded-2xl border border-app-border shadow-xs p-4 space-y-3 hover:border-slate-300 transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary flex items-center justify-center font-bold text-base flex-shrink-0">
                          💊
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-app-text">{med.name}</h3>
                            <span className="text-xs font-semibold text-secondary bg-secondary-50 px-2 py-0.5 rounded-md">
                              {med.dose}
                            </span>
                          </div>
                          <p className="text-xs text-muted-txt mt-0.5">{med.frequency}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteMedication(med.id)}
                        className="text-xs text-slate-400 hover:text-red-500 p-1"
                        title="Eliminar tratamiento"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Progress Bar & Durations */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600 font-medium">Progreso del tratamiento</span>
                        <span
                          className={`font-bold text-xs ${
                            isComplete ? 'text-cancelled' : isAlmostDone ? 'text-alert' : 'text-secondary'
                          }`}
                        >
                          {isComplete ? 'Completado' : `${daysLeft} día(s) restante(s)`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-cancelled' : isAlmostDone ? 'bg-alert' : 'bg-secondary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-txt mt-1">
                        <span>Día {med.daysElapsed}</span>
                        <span>{progress}% acumulado</span>
                        <span>Total {med.durationDays} días</span>
                      </div>
                    </div>

                    {/* Action buttons for today's intake */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() =>
                          onUpdateTakenStatus(
                            med.id,
                            med.takenToday === 'taken' ? 'none' : 'taken'
                          )
                        }
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          med.takenToday === 'taken'
                            ? 'bg-done-bg text-done border-2 border-done/40 shadow-xs'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {med.takenToday === 'taken' ? '✓ Toma Realizada' : 'Marcar como Tomada'}
                      </button>

                      <button
                        onClick={() =>
                          onUpdateTakenStatus(
                            med.id,
                            med.takenToday === 'skipped' ? 'none' : 'skipped'
                          )
                        }
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          med.takenToday === 'skipped'
                            ? 'bg-cancelled-bg text-cancelled border-2 border-cancelled/40 shadow-xs'
                            : 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        {med.takenToday === 'skipped' ? '✗ Toma Omitida' : 'Marcar Omitida'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Dose History Tab */
        <div className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
          <h3 className="font-display font-bold text-app-text text-sm">
            Registro Histórico de Adherencia y Tomas
          </h3>
          <p className="text-xs text-muted-txt">
            Historial cronológico de medicamentos tomados y omitidos para control del especialista.
          </p>

          <div className="divide-y divide-slate-100">
            {doseHistory.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      item.status === 'taken'
                        ? 'bg-done-bg text-done'
                        : 'bg-cancelled-bg text-cancelled'
                    }`}
                  >
                    {item.status === 'taken' ? '✓' : '✕'}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{item.medicationName}</p>
                    <p className="text-[11px] text-muted-txt">{item.date} a las {item.time}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    item.status === 'taken'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {item.status === 'taken' ? 'Realizada' : 'Omitida'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Medication */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-display font-bold text-app-text text-base">Registrar Nuevo Medicamento</h3>
                <p className="text-[11px] text-muted-txt">Ingresa los datos de la receta médica</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMed} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre del fármaco / Medicamento
                </label>
                <input
                  type="text"
                  placeholder="Ej: Losartán Potásico"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Dosis
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 50 mg"
                    value={newMed.dose}
                    onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Duración (Días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newMed.durationDays}
                    onChange={(e) =>
                      setNewMed({ ...newMed, durationDays: parseInt(e.target.value) || 30 })
                    }
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Frecuencia de administración
                </label>
                <select
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                >
                  <option value="Cada 8 horas">Cada 8 horas (3 veces al día)</option>
                  <option value="Cada 12 horas">Cada 12 horas (2 veces al día)</option>
                  <option value="Una vez al día (Mañana)">Una vez al día (Mañana / Ayunas)</option>
                  <option value="Una vez al día (Noche)">Una vez al día (Noche)</option>
                  <option value="Cada 6 horas">Cada 6 horas (4 veces al día)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Médico que prescribió la receta
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Andrés Morales"
                  value={newMed.prescribedBy}
                  onChange={(e) => setNewMed({ ...newMed, prescribedBy: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors font-display text-sm shadow-md"
              >
                Guardar Medicamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
