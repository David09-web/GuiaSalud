import { useState } from 'react';
import type { Medication, MedTakenStatus, MedDoseHistory } from '../types';
import { Pill, AlertTriangle, Plus, Check, X, Clock, Edit3, Bell, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import {
  validateMedicationName,
  validateMedicationDose,
  validateMedicationFrequency,
  validateDoctorName,
} from '../utils/validation';

interface MedicationsScreenProps {
  medications: Medication[];
  doseHistory: MedDoseHistory[];
  onAddMedication: (med: Omit<Medication, 'id' | 'patientId'>) => void;
  onUpdateMedication?: (id: string, updatedFields: Partial<Medication>) => void;
  onUpdateTakenStatus: (id: string, status: MedTakenStatus) => void;
  onDeleteMedication: (id: string) => void;
}

// Formatear hora 24h a formato 12h amigable (ej: "13:00" -> "1:00 PM")
function formatHour12(hhmm: string): string {
  try {
    const [hStr, mStr] = hhmm.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr ? mStr.padStart(2, '0') : '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${ampm}`;
  } catch {
    return hhmm;
  }
}

// Algoritmo de cálculo automático de horarios a partir de hora de inicio, intervalo y cantidad de tomas
function calculateSchedule(startTime: string, intervalHours: number, count: number): string[] {
  if (!startTime) return [];
  const [hStr, mStr] = startTime.split(':');
  const startH = parseInt(hStr, 10) || 0;
  const startM = parseInt(mStr, 10) || 0;

  const result: string[] = [];
  const safeCount = Math.max(1, Math.min(24, count));
  const safeInterval = Math.max(0.5, intervalHours);

  for (let i = 0; i < safeCount; i++) {
    const totalMinutes = Math.round(startH * 60 + startM + i * safeInterval * 60);
    const dayMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const h = Math.floor(dayMinutes / 60);
    const m = dayMinutes % 60;
    const hFormatted = String(h).padStart(2, '0');
    const mFormatted = String(m).padStart(2, '0');
    result.push(`${hFormatted}:${mFormatted}`);
  }
  return result;
}

// Deducir intervalo e inicio a partir de datos existentes
function deduceInterval(frequency: string, times: string[]): { interval: number; count: number } {
  if (times && times.length >= 2) {
    const [h1, m1] = times[0].split(':').map(Number);
    const [h2, m2] = times[1].split(':').map(Number);
    let diff = (h2 * 60 + m2 - (h1 * 60 + m1)) / 60;
    if (diff <= 0) diff += 24;
    const roundedDiff = Math.round(diff * 10) / 10;
    return { interval: roundedDiff, count: times.length };
  }

  const f = (frequency || '').toLowerCase();
  if (f.includes('2 hora') || f.includes('2h')) return { interval: 2, count: 3 };
  if (f.includes('4 hora') || f.includes('4h')) return { interval: 4, count: 6 };
  if (f.includes('6 hora') || f.includes('6h')) return { interval: 6, count: 4 };
  if (f.includes('8 hora') || f.includes('8h')) return { interval: 8, count: 3 };
  if (f.includes('12 hora') || f.includes('12h')) return { interval: 12, count: 2 };
  if (
    f.includes('24 hora') ||
    f.includes('una vez') ||
    f.includes('al día') ||
    f.includes('mañana') ||
    f.includes('noche')
  ) {
    return { interval: 24, count: 1 };
  }
  return { interval: 8, count: 3 };
}

export default function MedicationsScreen({
  medications,
  doseHistory,
  onAddMedication,
  onUpdateMedication,
  onUpdateTakenStatus,
  onDeleteMedication,
}: MedicationsScreenProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formulario de Nueva Receta con cálculo asistido de horarios
  const [newMed, setNewMed] = useState({
    name: '',
    dose: '',
    startTime: '08:00',
    intervalHours: 8,
    customIntervalHours: '',
    isCustomInterval: false,
    dosesCount: 3,
    durationDays: 30,
    prescribedBy: 'Dr. Andrés Morales (Medicina General)',
    calculatedTimes: ['08:00', '16:00', '00:00'] as string[],
  });

  // Formulario de Edición de Medicamento con cálculo asistido
  const [editForm, setEditForm] = useState({
    name: '',
    dose: '',
    startTime: '08:00',
    intervalHours: 8,
    customIntervalHours: '',
    isCustomInterval: false,
    dosesCount: 3,
    durationDays: 30,
    daysElapsed: 0,
    prescribedBy: '',
    calculatedTimes: ['08:00', '16:00', '00:00'] as string[],
  });

  const endingSoon = medications.filter((m) => m.daysElapsed / m.durationDays >= 0.8);

  // MANEJO DE CAMBIOS DE HORARIO EN "NUEVO MEDICAMENTO"
  const handleNewMedScheduleChange = (
    newStart: string,
    newInterval: number,
    newCount: number,
    isCustom = false,
    customStr = ''
  ) => {
    const times = calculateSchedule(newStart, newInterval, newCount);
    setNewMed((prev) => ({
      ...prev,
      startTime: newStart,
      intervalHours: newInterval,
      dosesCount: newCount,
      isCustomInterval: isCustom,
      customIntervalHours: customStr,
      calculatedTimes: times,
    }));
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Nombre Comercial del Fármaco (3 a 50 caracteres, alfanumérico + guiones)
    const nameCheck = validateMedicationName(newMed.name);
    if (!nameCheck.isValid) {
      alert(nameCheck.error);
      return;
    }

    // 2. Dosis / Presentación (2 a 30 caracteres, alfanumérico con unidades)
    const doseCheck = validateMedicationDose(newMed.dose);
    if (!doseCheck.isValid) {
      alert(doseCheck.error);
      return;
    }

    // 3. Frecuencia (1 a 24 horas, número entero estricto)
    const freqCheck = validateMedicationFrequency(newMed.intervalHours);
    if (!freqCheck.isValid) {
      alert(freqCheck.error);
      return;
    }

    // 4. Médico Prescriptor (sin números ni texto aleatorio)
    if (newMed.prescribedBy.trim()) {
      const docCheck = validateDoctorName(newMed.prescribedBy, 'Médico prescriptor', false);
      if (!docCheck.isValid) {
        alert(docCheck.error);
        return;
      }
    }

    const times =
      newMed.calculatedTimes.length > 0
        ? newMed.calculatedTimes
        : calculateSchedule(newMed.startTime, newMed.intervalHours, newMed.dosesCount);

    const frequencyStr = `Cada ${newMed.intervalHours} horas (${times.join(' / ')})`;

    onAddMedication({
      name: newMed.name.trim(),
      dose: newMed.dose.trim(),
      frequency: frequencyStr,
      timeOfDay: times,
      durationDays: Math.max(1, newMed.durationDays),
      daysElapsed: 0,
      takenToday: 'none',
      prescribedBy: newMed.prescribedBy.trim(),
    });

    // Resetear formulario
    setNewMed({
      name: '',
      dose: '',
      startTime: '08:00',
      intervalHours: 8,
      customIntervalHours: '',
      isCustomInterval: false,
      dosesCount: 3,
      durationDays: 30,
      prescribedBy: 'Dr. Andrés Morales (Medicina General)',
      calculatedTimes: ['08:00', '16:00', '00:00'],
    });
    setShowAddModal(false);
    setToastMessage(`✓ Receta de ${newMed.name} registrada con horarios calculados.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ABRIR MODAL DE EDICIÓN Y PREPARAR CÁLCULO
  const handleOpenEdit = (med: Medication) => {
    setEditingMed(med);
    const times = med.timeOfDay && med.timeOfDay.length > 0 ? med.timeOfDay : ['08:00'];
    const { interval, count } = deduceInterval(med.frequency || '', times);
    const start = times[0] || '08:00';
    const isStandard = [2, 4, 6, 8, 12, 24].includes(interval);

    setEditForm({
      name: med.name,
      dose: med.dose,
      startTime: start,
      intervalHours: interval,
      customIntervalHours: isStandard ? '' : String(interval),
      isCustomInterval: !isStandard,
      dosesCount: count,
      durationDays: med.durationDays,
      daysElapsed: med.daysElapsed,
      prescribedBy: med.prescribedBy || '',
      calculatedTimes: times,
    });
  };

  // MANEJO DE CAMBIOS DE HORARIO EN "EDITAR MEDICAMENTO"
  const handleEditScheduleChange = (
    newStart: string,
    newInterval: number,
    newCount: number,
    isCustom = false,
    customStr = ''
  ) => {
    const times = calculateSchedule(newStart, newInterval, newCount);
    setEditForm((prev) => ({
      ...prev,
      startTime: newStart,
      intervalHours: newInterval,
      dosesCount: newCount,
      isCustomInterval: isCustom,
      customIntervalHours: customStr,
      calculatedTimes: times,
    }));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMed) return;

    // 1. Nombre Comercial del Fármaco (3 a 50 caracteres)
    const nameCheck = validateMedicationName(editForm.name);
    if (!nameCheck.isValid) {
      alert(nameCheck.error);
      return;
    }

    // 2. Dosis / Presentación (2 a 30 caracteres)
    const doseCheck = validateMedicationDose(editForm.dose);
    if (!doseCheck.isValid) {
      alert(doseCheck.error);
      return;
    }

    // 3. Frecuencia (1 a 24 horas)
    const freqCheck = validateMedicationFrequency(editForm.intervalHours);
    if (!freqCheck.isValid) {
      alert(freqCheck.error);
      return;
    }

    // 4. Médico Prescriptor
    if (editForm.prescribedBy.trim()) {
      const docCheck = validateDoctorName(editForm.prescribedBy, 'Médico prescriptor', false);
      if (!docCheck.isValid) {
        alert(docCheck.error);
        return;
      }
    }

    const times =
      editForm.calculatedTimes.length > 0
        ? editForm.calculatedTimes
        : calculateSchedule(editForm.startTime, editForm.intervalHours, editForm.dosesCount);

    const frequencyStr = `Cada ${editForm.intervalHours} horas (${times.join(' / ')})`;

    const updatedData: Partial<Medication> = {
      name: editForm.name.trim(),
      dose: editForm.dose.trim(),
      frequency: frequencyStr,
      durationDays: Math.max(1, editForm.durationDays),
      daysElapsed: Math.min(editForm.durationDays, Math.max(0, editForm.daysElapsed)),
      prescribedBy: editForm.prescribedBy.trim(),
      timeOfDay: times,
    };

    if (onUpdateMedication) {
      onUpdateMedication(editingMed.id, updatedData);
    }

    setEditingMed(null);
    setToastMessage(`✓ Medicamento ${updatedData.name} actualizado con sus nuevos horarios.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-fadeIn backdrop-blur-md max-w-md">
          <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium tracking-tight">{toastMessage}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-app-text text-lg">Control de Medicamentos</h2>
          <p className="text-xs text-muted-txt">
            Cálculo asistido de horarios, posología y adherencia terapéutica
          </p>
        </div>
        <button
          onClick={() => {
            triggerHaptic('light');
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-primary-hover active:scale-90 transition-all shadow-xs cursor-pointer touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          Nueva Receta
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl select-none">
        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('current');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer touch-manipulation ${
            activeTab === 'current'
              ? 'bg-white text-primary shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tratamientos Activos ({medications.length})
        </button>
        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('history');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer touch-manipulation ${
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
                <AlertTriangle className="w-4 h-4 text-alert shrink-0" />
                <p className="text-xs font-bold text-alert uppercase tracking-wide">
                  Alerta: Fin de Tratamiento Próximo
                </p>
              </div>
              <div className="space-y-1.5">
                {endingSoon.map((m) => (
                  <div key={m.id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-700">
                      <strong>
                        {m.name} {m.dose}
                      </strong>{' '}
                      — Restan {m.durationDays - m.daysElapsed} día(s).
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
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2">
                  <Pill className="w-6 h-6" />
                </div>
                <p className="font-bold text-app-text text-sm">Sin medicamentos registrados</p>
                <p className="text-xs text-muted-txt mt-0.5">
                  Agrega tus recetas médicas para programar alertas y registrar tus tomas.
                </p>
              </div>
            ) : (
              medications.map((med) => {
                const progress = Math.min(
                  100,
                  Math.round((med.daysElapsed / med.durationDays) * 100)
                );
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
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-app-text">{med.name}</h3>
                            <span className="text-xs font-semibold text-secondary bg-secondary-50 px-2 py-0.5 rounded-md font-mono">
                              {med.dose}
                            </span>
                          </div>
                          <p className="text-xs text-muted-txt mt-0.5 font-medium">{med.frequency}</p>

                          {/* Chips visuales de horarios calculados */}
                          {med.timeOfDay && med.timeOfDay.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" /> Horarios de toma:
                              </span>
                              {med.timeOfDay.map((time, idx) => (
                                <span
                                  key={idx}
                                  className="bg-blue-50 text-primary border border-blue-200/80 text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-2xs flex items-center gap-1"
                                >
                                  <span>{time}</span>
                                  <span className="text-[9px] text-indigo-500 font-semibold opacity-80">
                                    {formatHour12(time)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}

                          {med.prescribedBy && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              Prescrito por: {med.prescribedBy}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción: Editar y Eliminar */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(med)}
                          className="text-xs text-primary hover:bg-primary-50 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Actualizar y editar medicamento"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => onDeleteMedication(med.id)}
                          className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar tratamiento"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Durations */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600 font-medium">Progreso del tratamiento</span>
                        <span
                          className={`font-bold text-xs ${
                            isComplete
                              ? 'text-cancelled'
                              : isAlmostDone
                              ? 'text-alert'
                              : 'text-secondary'
                          }`}
                        >
                          {isComplete ? 'Completado' : `${daysLeft} día(s) restante(s)`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete
                              ? 'bg-cancelled'
                              : isAlmostDone
                              ? 'bg-alert'
                              : 'bg-secondary'
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

                    {/* Action button for today's intake */}
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          triggerHaptic('success');
                          onUpdateTakenStatus(
                            med.id,
                            med.takenToday === 'taken' ? 'none' : 'taken'
                          );
                        }}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-90 ${
                          med.takenToday === 'taken'
                            ? 'bg-done-bg text-done border-2 border-done/40 shadow-xs'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 active:bg-emerald-100'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {med.takenToday === 'taken' ? '✓ Toma Realizada' : 'Marcar como Tomada'}
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
            Registro Histórico de Tomas Clínicas
          </h3>
          {doseHistory.length === 0 ? (
            <p className="text-xs text-muted-txt text-center py-6">
              Aún no se registran tomas de medicamentos hoy.
            </p>
          ) : (
            <div className="space-y-2">
              {doseHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'taken' ? 'bg-done' : 'bg-cancelled'
                      }`}
                    />
                    <span className="font-semibold text-slate-800">{item.medicationName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-txt text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {item.date} {item.time}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'taken'
                          ? 'bg-done-bg text-done'
                          : 'bg-cancelled-bg text-cancelled'
                      }`}
                    >
                      {item.status === 'taken' ? 'Tomada' : 'Omitida'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: EDITAR Y ACTUALIZAR CADA MEDICAMENTO (CON CÁLCULO ASISTIDO)
          ========================================================================= */}
      {editingMed && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setEditingMed(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp border border-slate-100 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">
                    Editar y Actualizar Medicamento
                  </h3>
                  <p className="text-[11px] text-muted-txt">
                    Horarios de toma calculados automáticamente según frecuencia
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMed(null)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del fármaco / Medicamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Metformina"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Dosis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 500 mg / 1 tableta"
                    value={editForm.dose}
                    onChange={(e) => setEditForm({ ...editForm, dose: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Duración total (Días) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={editForm.durationDays}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        durationDays: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                </div>
              </div>

              {/* =========================================================================
                  SECCIÓN ASISTIDA: CÁLCULO AUTOMÁTICO DE HORARIOS DE TOMA
                  ========================================================================= */}
              <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-slate-50 p-4 rounded-2xl border border-blue-200/90 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Cálculo Automático de Horarios
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      El paciente no necesita calcular las horas: indica cuándo inicia y el intervalo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. Hora de inicio */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      1. Primera toma <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={editForm.startTime}
                      onChange={(e) =>
                        handleEditScheduleChange(
                          e.target.value,
                          editForm.intervalHours,
                          editForm.dosesCount,
                          editForm.isCustomInterval,
                          editForm.customIntervalHours
                        )
                      }
                      className="w-full border border-blue-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary-50 shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {formatHour12(editForm.startTime)}
                    </span>
                  </div>

                  {/* 2. Intervalo */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      2. Cada cuánto tiempo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editForm.isCustomInterval ? 'custom' : editForm.intervalHours}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          handleEditScheduleChange(
                            editForm.startTime,
                            parseInt(editForm.customIntervalHours) || 3,
                            editForm.dosesCount,
                            true,
                            editForm.customIntervalHours || '3'
                          );
                        } else {
                          const intHours = parseInt(val, 10);
                          const defaultCount =
                            intHours === 2 ? 3 : intHours === 24 ? 1 : Math.max(1, Math.floor(24 / intHours));
                          handleEditScheduleChange(
                            editForm.startTime,
                            intHours,
                            defaultCount,
                            false,
                            ''
                          );
                        }
                      }}
                      className="w-full border border-blue-200 bg-white rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary-50 shadow-2xs"
                    >
                      <option value={2}>Cada 2 horas</option>
                      <option value={4}>Cada 4 horas</option>
                      <option value={6}>Cada 6 horas</option>
                      <option value={8}>Cada 8 horas</option>
                      <option value={12}>Cada 12 horas</option>
                      <option value={24}>Cada 24 horas (1 al día)</option>
                      <option value="custom">Personalizado...</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Intervalo de espera
                    </span>
                  </div>

                  {/* 3. Tomas al día */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      3. Tomas / Pastas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={editForm.dosesCount}
                      onChange={(e) => {
                        const count = Math.max(1, parseInt(e.target.value) || 1);
                        handleEditScheduleChange(
                          editForm.startTime,
                          editForm.intervalHours,
                          count,
                          editForm.isCustomInterval,
                          editForm.customIntervalHours
                        );
                      }}
                      className="w-full border border-blue-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary-50 shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Total dosis por día
                    </span>
                  </div>
                </div>

                {/* Si es intervalo personalizado */}
                {editForm.isCustomInterval && (
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">Intervalo exacto:</span>
                    <input
                      type="number"
                      min={1}
                      max={48}
                      placeholder="Ej: 3"
                      value={editForm.customIntervalHours}
                      onChange={(e) => {
                        const customVal = e.target.value;
                        const intHours = Math.max(1, parseInt(customVal) || 1);
                        handleEditScheduleChange(
                          editForm.startTime,
                          intHours,
                          editForm.dosesCount,
                          true,
                          customVal
                        );
                      }}
                      className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-bold"
                    />
                    <span className="text-slate-600">horas entre cada toma</span>
                  </div>
                )}

                {/* PREVISUALIZACIÓN DE HORARIOS CALCULADOS */}
                <div className="bg-white rounded-xl p-3 border border-blue-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Horarios Calculados (
                      {editForm.calculatedTimes.length} tomas):
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                      Generados automáticamente
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {editForm.calculatedTimes.map((time, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-primary/20 text-primary rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-xs font-black">{time}</span>
                        <span className="text-[10px] text-indigo-600 font-semibold">
                          ({formatHour12(time)})
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                    ✓ Primera toma a las <strong>{editForm.startTime} ({formatHour12(editForm.startTime)})</strong>, repitiendo cada{' '}
                    <strong>{editForm.intervalHours} horas</strong> por <strong>{editForm.dosesCount} tomas</strong> al día.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Días transcurridos
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editForm.durationDays}
                    value={editForm.daysElapsed}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        daysElapsed: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Médico tratante
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Dr. Andrés Morales"
                    value={editForm.prescribedBy}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        prescribedBy: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                      })
                    }
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Solo letras (sin números)</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMed(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-xl transition-all font-display text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTRAR NUEVO MEDICAMENTO (CON CÁLCULO ASISTIDO)
          ========================================================================= */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp border border-slate-100 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-display font-bold text-app-text text-base">
                  Registrar Nuevo Medicamento
                </h3>
                <p className="text-[11px] text-muted-txt">
                  Ingresa los datos del tratamiento y deja que el sistema calcule los horarios
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMed} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre del fármaco / Medicamento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Losartán Potásico / Amoxicilina"
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Dosis <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 50 mg / 1 cápsula"
                    value={newMed.dose}
                    onChange={(e) => setNewMed({ ...newMed, dose: e.target.value })}
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Duración (Días) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={newMed.durationDays}
                    onChange={(e) =>
                      setNewMed({ ...newMed, durationDays: parseInt(e.target.value) || 30 })
                    }
                    className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                    required
                  />
                </div>
              </div>

              {/* =========================================================================
                  SECCIÓN ASISTIDA: CÁLCULO AUTOMÁTICO DE HORARIOS
                  ========================================================================= */}
              <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-slate-50 p-4 rounded-2xl border border-blue-200/90 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Cálculo Automático de Horarios
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      El paciente no necesita calcular las horas: indica cuándo inicia y el intervalo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. Hora de inicio */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      1. Primera toma <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={newMed.startTime}
                      onChange={(e) =>
                        handleNewMedScheduleChange(
                          e.target.value,
                          newMed.intervalHours,
                          newMed.dosesCount,
                          newMed.isCustomInterval,
                          newMed.customIntervalHours
                        )
                      }
                      className="w-full border border-blue-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary-50 shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {formatHour12(newMed.startTime)}
                    </span>
                  </div>

                  {/* 2. Intervalo */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      2. Cada cuánto tiempo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newMed.isCustomInterval ? 'custom' : newMed.intervalHours}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'custom') {
                          handleNewMedScheduleChange(
                            newMed.startTime,
                            parseInt(newMed.customIntervalHours) || 3,
                            newMed.dosesCount,
                            true,
                            newMed.customIntervalHours || '3'
                          );
                        } else {
                          const intHours = parseInt(val, 10);
                          const defaultCount =
                            intHours === 2 ? 3 : intHours === 24 ? 1 : Math.max(1, Math.floor(24 / intHours));
                          handleNewMedScheduleChange(
                            newMed.startTime,
                            intHours,
                            defaultCount,
                            false,
                            ''
                          );
                        }
                      }}
                      className="w-full border border-blue-200 bg-white rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary-50 shadow-2xs"
                    >
                      <option value={2}>Cada 2 horas</option>
                      <option value={4}>Cada 4 horas</option>
                      <option value={6}>Cada 6 horas</option>
                      <option value={8}>Cada 8 horas</option>
                      <option value={12}>Cada 12 horas</option>
                      <option value={24}>Cada 24 horas (1 al día)</option>
                      <option value="custom">Personalizado...</option>
                    </select>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Intervalo de espera
                    </span>
                  </div>

                  {/* 3. Tomas al día */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      3. Tomas / Pastas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newMed.dosesCount}
                      onChange={(e) => {
                        const count = Math.max(1, parseInt(e.target.value) || 1);
                        handleNewMedScheduleChange(
                          newMed.startTime,
                          newMed.intervalHours,
                          count,
                          newMed.isCustomInterval,
                          newMed.customIntervalHours
                        );
                      }}
                      className="w-full border border-blue-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary-50 shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Total dosis por día
                    </span>
                  </div>
                </div>

                {/* Si es intervalo personalizado */}
                {newMed.isCustomInterval && (
                  <div className="bg-white p-2.5 rounded-xl border border-blue-200 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700">Intervalo exacto:</span>
                    <input
                      type="number"
                      min={1}
                      max={48}
                      placeholder="Ej: 3"
                      value={newMed.customIntervalHours}
                      onChange={(e) => {
                        const customVal = e.target.value;
                        const intHours = Math.max(1, parseInt(customVal) || 1);
                        handleNewMedScheduleChange(
                          newMed.startTime,
                          intHours,
                          newMed.dosesCount,
                          true,
                          customVal
                        );
                      }}
                      className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-xs text-center font-bold"
                    />
                    <span className="text-slate-600">horas entre cada toma</span>
                  </div>
                )}

                {/* PREVISUALIZACIÓN DE HORARIOS CALCULADOS */}
                <div className="bg-white rounded-xl p-3 border border-blue-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Horarios Calculados (
                      {newMed.calculatedTimes.length} tomas):
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                      Generados automáticamente
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {newMed.calculatedTimes.map((time, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-primary/20 text-primary rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-xs font-black">{time}</span>
                        <span className="text-[10px] text-indigo-600 font-semibold">
                          ({formatHour12(time)})
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                    ✓ Primera toma a las <strong>{newMed.startTime} ({formatHour12(newMed.startTime)})</strong>, repitiendo cada{' '}
                    <strong>{newMed.intervalHours} horas</strong> por <strong>{newMed.dosesCount} tomas</strong> al día.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Médico que prescribió la receta
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dr. Andrés Morales"
                  value={newMed.prescribedBy}
                  onChange={(e) =>
                    setNewMed({
                      ...newMed,
                      prescribedBy: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]/g, ''),
                    })
                  }
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                />
                <p className="text-[10px] text-muted-txt mt-0.5">Solo letras (sin números)</p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors font-display text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Guardar Medicamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
