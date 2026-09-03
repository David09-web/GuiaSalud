import type { UserProfile, Appointment, Medication, MedFile } from '../types';

interface ClinicalReportModalProps {
  user: UserProfile;
  appointments: Appointment[];
  medications: Medication[];
  files: MedFile[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ClinicalReportModal({
  user,
  appointments,
  medications,
  files,
  isOpen,
  onClose,
}: ClinicalReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header toolbar (Hidden when printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-500/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary-300" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm">Resumen Clínico Consolidado</h3>
              <p className="text-xs text-slate-400">GuiaSalud Versión 1.0 - Formato de Consulta Médica</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Imprimir / Guardar PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-800 text-sm" id="printable-clinical-summary">
          {/* Official Document Header */}
          <div className="border-b-2 border-primary pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                  GS
                </div>
                <h1 className="font-display text-xl font-bold text-slate-900 tracking-tight">
                  GuiaSalud - Expediente Personal de Salud
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Documento de consolidación clínica para apoyo en consulta médica y continuidad asistencial
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p><strong>Fecha de emisión:</strong> {currentDate}</p>
              <p className="text-emerald-700 font-semibold">Cifrado de datos en reposo (AES-256)</p>
              <p className="text-[10px] text-slate-400">Ley 1581/2012 - Habeas Data</p>
            </div>
          </div>

          {/* Patient Identification Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
              1. Identificación del Paciente y Afiliación
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Nombre completo</p>
                <p className="font-bold text-slate-900">{user.name}</p>
              </div>
              <div>
                <p className="text-slate-500">Documento de Identidad</p>
                <p className="font-bold text-slate-900">CC {user.idNumber}</p>
              </div>
              <div>
                <p className="text-slate-500">Fecha de Nacimiento</p>
                <p className="font-bold text-slate-900">{user.birthDate}</p>
              </div>
              <div>
                <p className="text-slate-500">Tipo de Sangre</p>
                <p className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md inline-block">
                  {user.bloodType}
                </p>
              </div>
              <div>
                <p className="text-slate-500">EPS</p>
                <p className="font-bold text-slate-900">{user.eps}</p>
              </div>
              <div>
                <p className="text-slate-500">IPS Primaria Asignada</p>
                <p className="font-bold text-slate-900">{user.ips}</p>
              </div>
              <div>
                <p className="text-slate-500">Teléfono de Contacto</p>
                <p className="font-bold text-slate-900">{user.phone}</p>
              </div>
              <div>
                <p className="text-slate-500">Contacto de Emergencia</p>
                <p className="font-bold text-slate-900">{user.emergencyContact.name} ({user.emergencyContact.phone})</p>
              </div>
            </div>
          </div>

          {/* Critical Clinical Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-red-200 bg-red-50/50 p-4 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-2 flex items-center gap-1.5">
                <span>⚠</span> Alergias y Reacciones Adversas
              </h3>
              <ul className="space-y-1 text-xs">
                {user.allergies.map((a, i) => (
                  <li key={i} className="flex items-center gap-1.5 font-semibold text-red-900">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-amber-200 bg-amber-50/50 p-4 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                <span>🩺</span> Diagnósticos Activos y Condiciones Crónicas
              </h3>
              <ul className="space-y-1 text-xs">
                {user.conditions.map((c, i) => (
                  <li key={i} className="flex items-center gap-1.5 font-medium text-amber-950">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Surgeries and Antecedents */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              2. Antecedentes Quirúrgicos y Procedimientos Previos
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Procedimiento / Cirugía</th>
                    <th className="p-2.5">Detalles / Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {user.surgeries.map((s, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-900">{s}</td>
                      <td className="p-2.5 text-slate-600">Registrado en expediente clínico</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Medications */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              3. Esquema Terapéutico Activo (Control de Medicamentos)
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Medicamento</th>
                    <th className="p-2.5">Dosis</th>
                    <th className="p-2.5">Frecuencia / Horario</th>
                    <th className="p-2.5">Duración y Avance</th>
                    <th className="p-2.5">Prescrito Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {medications.map((m) => (
                    <tr key={m.id}>
                      <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                      <td className="p-2.5">{m.dose}</td>
                      <td className="p-2.5">{m.frequency}</td>
                      <td className="p-2.5">
                        Día {m.daysElapsed} de {m.durationDays}
                        {m.durationDays - m.daysElapsed <= 3 && (
                          <span className="ml-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                            Próx. a finalizar
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-600">{m.prescribedBy || 'Médico tratante'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Diagnostic Test Reports */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              4. Exámenes Diagnósticos y Archivos Adjuntos
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Estudio / Examen</th>
                    <th className="p-2.5">Categoría</th>
                    <th className="p-2.5">Fecha</th>
                    <th className="p-2.5">Institución Emisora</th>
                    <th className="p-2.5">Seguridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {files.map((f) => (
                    <tr key={f.id}>
                      <td className="p-2.5 font-semibold text-slate-900">{f.name}</td>
                      <td className="p-2.5 text-slate-600">{f.category}</td>
                      <td className="p-2.5 text-slate-600">{f.date}</td>
                      <td className="p-2.5 text-slate-600">{f.institution}</td>
                      <td className="p-2.5 text-emerald-700 font-medium">✓ Cifrado AES-256</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending and Recent Appointments */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              5. Agenda Médica Reciente y Programada
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Fecha y Hora</th>
                    <th className="p-2.5">Especialidad</th>
                    <th className="p-2.5">Profesional</th>
                    <th className="p-2.5">Sede / IPS</th>
                    <th className="p-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.slice(0, 4).map((a) => (
                    <tr key={a.id}>
                      <td className="p-2.5 font-medium text-slate-900">{a.date} ({a.time})</td>
                      <td className="p-2.5">{a.specialty}</td>
                      <td className="p-2.5">{a.doctor}</td>
                      <td className="p-2.5">{a.center}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : a.status === 'done'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {a.status === 'pending' ? 'Pendiente' : a.status === 'done' ? 'Realizada' : 'Cancelada'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Footer / Legal Note */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
            <div>
              <p><strong>GuiaSalud Versión 1.0</strong> | Proyecto de Ingeniería de Software II - FET Neiva</p>
              <p>Docente Gestor: Miguel Antonio Urbano Silva | Equipo de Desarrollo: David Ospina, Juan Ramírez, Francisco Trujillo</p>
            </div>
            <div className="text-right">
              <p>Datos confidenciales protegidos bajo secreto médico y normas OMS.</p>
              <p>Firma digital del paciente verificada.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
