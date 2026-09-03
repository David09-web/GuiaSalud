import { useState } from 'react';
import type { UserProfile, MedFile } from '../types';
import FileViewerModal from '../components/FileViewerModal';

interface ClinicalHistoryScreenProps {
  user: UserProfile;
  files: MedFile[];
  onAddFile: (file: Omit<MedFile, 'id' | 'patientId'>) => void;
  onOpenReportModal: () => void;
}

export default function ClinicalHistoryScreen({
  user,
  files,
  onAddFile,
  onOpenReportModal,
}: ClinicalHistoryScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileForView, setSelectedFileForView] = useState<MedFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<'Laboratorio' | 'Imagenología' | 'Diagnóstico' | 'Receta'>('Laboratorio');
  const [newFileInstitution, setNewFileInstitution] = useState('Laboratorios El Bosque');

  const filteredFiles = files.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;
    onAddFile({
      name: newFileName,
      type: newFileCategory === 'Imagenología' ? 'Imagen' : 'PDF',
      category: newFileCategory,
      date: new Date().toISOString().split('T')[0],
      size: '1.5 MB',
      encrypted: true,
      institution: newFileInstitution,
    });
    setNewFileName('');
    setShowUploadModal(false);
  };

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto pb-24">
      {/* Top Header & Export PDF CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-app-text text-lg">Historia Clínica Personal</h2>
          <p className="text-xs text-muted-txt">Expediente médico confidencial y seguro (AES-256)</p>
        </div>
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-primary-hover transition-all shadow-xs"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
          Exportar PDF
        </button>
      </div>

      {/* Security & OMS Digital Health Badge */}
      <div className="bg-secondary-50 border border-secondary/25 rounded-2xl p-3.5 flex items-center justify-between text-secondary shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
              Bóveda Médica Cifrada (OMS / Ley 1581)
            </p>
            <p className="text-[11px] text-muted-txt">
              Tus antecedentes y archivos están protegidos con cifrado de nivel bancario.
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-secondary text-white font-bold px-2 py-0.5 rounded-full">
          AES-256
        </span>
      </div>

      {/* Essential Health Indicators */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-surface border border-app-border rounded-2xl p-3 text-center shadow-xs">
          <p className="text-xs text-muted-txt font-medium">Tipo de Sangre</p>
          <p className="text-xl font-display font-bold text-red-600 mt-0.5">{user.bloodType}</p>
        </div>
        <div className="bg-surface border border-app-border rounded-2xl p-3 text-center shadow-xs">
          <p className="text-xs text-muted-txt font-medium">Alergias</p>
          <p className="text-xl font-display font-bold text-amber-600 mt-0.5">{user.allergies.length}</p>
        </div>
        <div className="bg-surface border border-app-border rounded-2xl p-3 text-center shadow-xs">
          <p className="text-xs text-muted-txt font-medium">Archivos</p>
          <p className="text-xl font-display font-bold text-primary mt-0.5">{files.length}</p>
        </div>
      </div>

      {/* Allergies and Critical Alerts */}
      <section className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-base">⚠️</span>
          <h3 className="font-display font-bold text-app-text text-sm">Alergias y Contraindicaciones</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.allergies.map((allergy) => (
            <span
              key={allergy}
              className="bg-red-50 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-xl"
            >
              ⚠ {allergy}
            </span>
          ))}
        </div>
      </section>

      {/* Chronic Conditions (CIE-10) */}
      <section className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-base">🩺</span>
          <h3 className="font-display font-bold text-app-text text-sm">
            Diagnósticos Activos y Condiciones Crónicas
          </h3>
        </div>
        <ul className="space-y-2">
          {user.conditions.map((condition, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2.5 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              {condition}
            </li>
          ))}
        </ul>
      </section>

      {/* Surgical History */}
      <section className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-primary text-base">🏥</span>
          <h3 className="font-display font-bold text-app-text text-sm">
            Antecedentes Quirúrgicos y Procedimientos
          </h3>
        </div>
        <ul className="space-y-2">
          {user.surgeries.map((s, idx) => (
            <li
              key={idx}
              className="flex items-center gap-2.5 text-xs text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Encrypted Diagnostic Files Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-app-text text-sm">
              Bóveda de Exámenes y Documentos
            </h3>
            <p className="text-[11px] text-muted-txt">Almacenamiento personal con visor seguro integrado</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 bg-secondary-50 text-secondary border border-secondary-200 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-secondary-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Adjuntar Archivo
          </button>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['all', 'Laboratorio', 'Imagenología', 'Diagnóstico'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-surface border border-app-border text-muted-txt hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'Todos los archivos' : cat}
            </button>
          ))}
        </div>

        {/* Files list */}
        <div className="space-y-2.5">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-surface rounded-2xl border border-app-border p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${
                    file.type === 'PDF' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary'
                  }`}
                >
                  {file.type === 'PDF' ? '📄' : '🩻'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-app-text truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-txt">
                    {file.category} · {file.institution} · {file.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md hidden sm:inline-block">
                  ✓ Cifrado
                </span>
                <button
                  onClick={() => setSelectedFileForView(file)}
                  className="bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
                >
                  Ver examen
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-display font-bold text-app-text text-base">Adjuntar Nuevo Documento</h3>
                <p className="text-[11px] text-muted-txt">Se almacenará con cifrado seguro AES-256</p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre del examen o informe
                </label>
                <input
                  type="text"
                  placeholder="Ej: Cuadro Hemático y Perfil Lipídico"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Categoría diagnóstica
                </label>
                <select
                  value={newFileCategory}
                  onChange={(e) =>
                    setNewFileCategory(
                      e.target.value as 'Laboratorio' | 'Imagenología' | 'Diagnóstico' | 'Receta'
                    )
                  }
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50 bg-white"
                >
                  <option value="Laboratorio">Laboratorio Clínico (Sangre, Orina)</option>
                  <option value="Imagenología">Imagenología (Rayos X, Ecografía, TAC)</option>
                  <option value="Diagnóstico">Diagnóstico Clínico / Especialista</option>
                  <option value="Receta">Fórmula / Orden Médica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Institución emisora / IPS
                </label>
                <input
                  type="text"
                  placeholder="Ej: Laboratorios El Bosque"
                  value={newFileInstitution}
                  onChange={(e) => setNewFileInstitution(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-2 focus:ring-primary-50"
                  required
                />
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50">
                <span className="text-2xl">📎</span>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  Archivo seleccionado: muestra_digital_firmada.pdf
                </p>
                <p className="text-[10px] text-muted-txt">Cifrado automático antes de guardar</p>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors font-display text-sm shadow-md"
              >
                Cifrar y Guardar en Historia Clínica
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal File Viewer */}
      <FileViewerModal
        file={selectedFileForView}
        isOpen={Boolean(selectedFileForView)}
        onClose={() => setSelectedFileForView(null)}
      />
    </div>
  );
}
