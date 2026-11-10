import { useState, useMemo } from 'react';
import type {
  UserProfile,
  MedFile,
  AllergyItem,
  MedicalBackgroundItem,
  ClinicalDiagnosisItem,
  ClinicalProcedureItem,
  UserRole,
} from '../types';
import FileViewerModal from '../components/FileViewerModal';
import {
  ShieldCheck,
  FileText,
  FileDown,
  Upload,
  AlertTriangle,
  Stethoscope,
  Activity,
  FileImage,
  Paperclip,
  Check,
  X,
  Lock,
  Search,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Clock,
  UserCheck,
  KeyRound,
  Database,
  ArrowRight,
  Eye,
  Info,
  Building,
  CheckCircle2,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import {
  validateClinicalDescription,
  validateDoctorName,
  validateRelationship,
  validateHistoricalDate,
  getTodayDateString,
} from '../utils/validation';

interface ClinicalHistoryScreenProps {
  user: UserProfile;
  files: MedFile[];
  allergies: AllergyItem[];
  backgrounds: MedicalBackgroundItem[];
  diagnoses: ClinicalDiagnosisItem[];
  procedures: ClinicalProcedureItem[];
  currentRole?: UserRole;
  onAddFile: (file: Omit<MedFile, 'id' | 'patientId'>) => void;
  onUpdateFile?: (id: string, updated: Partial<MedFile>) => void;
  onDeleteFile?: (id: string) => void;
  onAddAllergy: (allergy: Omit<AllergyItem, 'id'>) => void;
  onUpdateAllergy?: (id: string, updated: Partial<AllergyItem>) => void;
  onDeleteAllergy?: (id: string) => void;
  onAddBackground: (bg: Omit<MedicalBackgroundItem, 'id'>) => void;
  onUpdateBackground?: (id: string, updated: Partial<MedicalBackgroundItem>) => void;
  onDeleteBackground?: (id: string) => void;
  onAddDiagnosis: (diag: Omit<ClinicalDiagnosisItem, 'id'>) => void;
  onUpdateDiagnosis?: (id: string, updated: Partial<ClinicalDiagnosisItem>) => void;
  onAddProcedure: (proc: Omit<ClinicalProcedureItem, 'id'>) => void;
  onUpdateProcedure?: (id: string, updated: Partial<ClinicalProcedureItem>) => void;
  onOpenReportModal: () => void;
}

type TabType = 'resumen' | 'antecedentes' | 'diagnosticos' | 'boveda' | 'seguridad_api';

export default function ClinicalHistoryScreen({
  user,
  files,
  allergies,
  backgrounds,
  diagnoses,
  procedures,
  currentRole = 'patient',
  onAddFile,
  onUpdateFile,
  onDeleteFile,
  onAddAllergy,
  onUpdateAllergy,
  onDeleteAllergy,
  onAddBackground,
  onUpdateBackground,
  onDeleteBackground,
  onAddDiagnosis,
  onUpdateDiagnosis,
  onAddProcedure,
  onUpdateProcedure,
  onOpenReportModal,
}: ClinicalHistoryScreenProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<TabType>('resumen');

  // Filters for Files Vault
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Modals
  const [selectedFileForView, setSelectedFileForView] = useState<MedFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddAllergyModal, setShowAddAllergyModal] = useState(false);
  const [showAddBackgroundModal, setShowAddBackgroundModal] = useState(false);
  const [showAddDiagnosisModal, setShowAddDiagnosisModal] = useState(false);
  const [showAddProcedureModal, setShowAddProcedureModal] = useState(false);

  // New File Form State
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<'Laboratorio' | 'Imagenología' | 'Diagnóstico' | 'Receta'>('Laboratorio');
  const [newFileInstitution, setNewFileInstitution] = useState('Laboratorios El Bosque');
  const [newFileNotes, setNewFileNotes] = useState('');
  const [uploadedPreviewData, setUploadedPreviewData] = useState<string | null>(null);

  // Form states for clinical entities
  const [newAllergen, setNewAllergen] = useState('');
  const [newReaction, setNewReaction] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Leve' | 'Moderada' | 'Severa / Anafilaxia'>('Moderada');
  const [newAllergyYear, setNewAllergyYear] = useState('2026');

  const [newBgCategory, setNewBgCategory] = useState<'Patológico' | 'Farmacológico' | 'Quirúrgico' | 'Familiar' | 'Tóxico-Alérgico'>('Patológico');
  const [newBgTitle, setNewBgTitle] = useState('');
  const [newBgDesc, setNewBgDesc] = useState('');
  const [newBgYear, setNewBgYear] = useState('2026');
  const [newBgRel, setNewBgRel] = useState('');

  const [newDiagCode, setNewDiagCode] = useState('I10');
  const [newDiagTitle, setNewDiagTitle] = useState('');
  const [newDiagCategory, setNewDiagCategory] = useState('Medicina General');
  const [newDiagStatus, setNewDiagStatus] = useState<'Activo' | 'En tratamiento' | 'Controlado' | 'Resuelto'>('Activo');
  const [newDiagDoctor, setNewDiagDoctor] = useState('Dr. Andrés Morales');

  const [newProcTitle, setNewProcTitle] = useState('');
  const [newProcType, setNewProcType] = useState<'Cirugía' | 'Examen Diagnóstico' | 'Procedimiento Menor' | 'Hospitalización'>('Examen Diagnóstico');
  const [newProcInstitution, setNewProcInstitution] = useState('Clínica del Norte');
  const [newProcDoctor, setNewProcDoctor] = useState('Dra. Claudia Vega');
  const [newProcOutcome, setNewProcOutcome] = useState('');

  // Simulated REST API Inspector State
  const [activeApiView, setActiveApiView] = useState<'post_historia' | 'get_adjuntos' | 'post_adjuntos' | 'rbac'>('post_historia');
  const [showDecryptedPayload, setShowDecryptedPayload] = useState(false);

  // Estados para Edición de Entidades Clínicas
  const [editingDiagnosis, setEditingDiagnosis] = useState<ClinicalDiagnosisItem | null>(null);
  const [editingAllergy, setEditingAllergy] = useState<AllergyItem | null>(null);
  const [editingBackground, setEditingBackground] = useState<MedicalBackgroundItem | null>(null);
  const [editingProcedure, setEditingProcedure] = useState<ClinicalProcedureItem | null>(null);
  const [editingFile, setEditingFile] = useState<MedFile | null>(null);
  const [historyToast, setHistoryToast] = useState<string | null>(null);

  const handleUpdateDiagnosisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiagnosis) return;
    const descCheck = validateClinicalDescription(editingDiagnosis.title, 'Diagnóstico', true);
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }
    if (editingDiagnosis.doctor && editingDiagnosis.doctor.trim()) {
      const docCheck = validateDoctorName(editingDiagnosis.doctor.trim(), 'Profesional médico', false);
      if (!docCheck.isValid) {
        alert(docCheck.error);
        return;
      }
    }
    if (onUpdateDiagnosis) onUpdateDiagnosis(editingDiagnosis.id, editingDiagnosis);
    setEditingDiagnosis(null);
    setHistoryToast('✓ Diagnóstico médico actualizado correctamente.');
    setTimeout(() => setHistoryToast(null), 3500);
  };

  const handleUpdateAllergySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAllergy) return;
    const descCheck = validateClinicalDescription(editingAllergy.allergen, 'Alergias', true);
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }
    if (onUpdateAllergy) onUpdateAllergy(editingAllergy.id, editingAllergy);
    setEditingAllergy(null);
    setHistoryToast('✓ Alergia clínica actualizada correctamente.');
    setTimeout(() => setHistoryToast(null), 3500);
  };

  const handleUpdateBackgroundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBackground) return;
    const descCheck = validateClinicalDescription(editingBackground.title, 'Antecedentes', true);
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }
    if (editingBackground.relationship && editingBackground.relationship.trim()) {
      const relCheck = validateRelationship(editingBackground.relationship.trim(), 'Parentesco', false);
      if (!relCheck.isValid) {
        alert(relCheck.error);
        return;
      }
    }
    if (onUpdateBackground) onUpdateBackground(editingBackground.id, editingBackground);
    setEditingBackground(null);
    setHistoryToast('✓ Antecedente médico modificado exitosamente.');
    setTimeout(() => setHistoryToast(null), 3500);
  };

  const handleUpdateProcedureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProcedure) return;
    const descCheck = validateClinicalDescription(editingProcedure.title, 'Procedimiento', true);
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }
    if (editingProcedure.doctor && editingProcedure.doctor.trim()) {
      const docCheck = validateDoctorName(editingProcedure.doctor.trim(), 'Profesional médico', false);
      if (!docCheck.isValid) {
        alert(docCheck.error);
        return;
      }
    }
    if (editingProcedure.date) {
      const dateCheck = validateHistoricalDate(editingProcedure.date, 'Fecha del procedimiento');
      if (!dateCheck.isValid) {
        alert(dateCheck.error);
        return;
      }
    }
    if (onUpdateProcedure) onUpdateProcedure(editingProcedure.id, editingProcedure);
    setEditingProcedure(null);
    setHistoryToast('✓ Procedimiento quirúrgico / examen actualizado.');
    setTimeout(() => setHistoryToast(null), 3500);
  };

  const handleUpdateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;
    if (onUpdateFile) onUpdateFile(editingFile.id, editingFile);
    setEditingFile(null);
    setHistoryToast('✓ Metadatos del documento clínico actualizados.');
    setTimeout(() => setHistoryToast(null), 3500);
  };

  // Filtered files logic
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Category filter
      if (selectedCategory !== 'all' && file.category !== selectedCategory) {
        return false;
      }
      // Date range filter
      if (dateFrom && file.date < dateFrom) {
        return false;
      }
      if (dateTo && file.date > dateTo) {
        return false;
      }
      // Text search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = file.name.toLowerCase().includes(query);
        const matchesInst = file.institution.toLowerCase().includes(query);
        const matchesNotes = file.notes ? file.notes.toLowerCase().includes(query) : false;
        if (!matchesName && !matchesInst && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [files, selectedCategory, dateFrom, dateTo, searchQuery]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    // Generar hash SHA-256 simulado de 64 caracteres
    const simulatedSha256 = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    onAddFile({
      name: newFileName.trim(),
      type: newFileCategory === 'Imagenología' ? 'Imagen' : 'PDF',
      category: newFileCategory,
      date: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      encrypted: true,
      institution: newFileInstitution.trim(),
      notes: newFileNotes.trim() || 'Documento adjunto verificado con protocolo OMS de ciberseguridad.',
      sha256: simulatedSha256,
      cipherAlgorithm: 'AES-256-GCM',
    });

    setNewFileName('');
    setNewFileNotes('');
    setUploadedPreviewData(null);
    setShowUploadModal(false);
  };

  const handleAddAllergySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergen.trim()) return;
    const descCheck = validateClinicalDescription(newAllergen.trim(), 'Alergias', true);
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }
    onAddAllergy({
      allergen: newAllergen.trim(),
      reaction: newReaction.trim() || 'Reacción alérgica reportada',
      severity: newSeverity,
      diagnosedYear: newAllergyYear,
      status: 'Activa',
    });
    setNewAllergen('');
    setNewReaction('');
    setShowAddAllergyModal(false);
  };

  const handleAddBackgroundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBgTitle.trim()) return;
    const descCheck = validateClinicalDescription(newBgTitle.trim(), 'Antecedentes', true);
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }
    if (newBgCategory === 'Familiar' && newBgRel.trim()) {
      const relCheck = validateRelationship(newBgRel.trim(), 'Parentesco', false);
      if (!relCheck.isValid) {
        alert(relCheck.error);
        return;
      }
    }
    onAddBackground({
      category: newBgCategory,
      title: newBgTitle.trim(),
      description: newBgDesc.trim(),
      year: newBgYear,
      relationship: newBgCategory === 'Familiar' ? newBgRel.trim() : undefined,
    });
    setNewBgTitle('');
    setNewBgDesc('');
    setNewBgRel('');
    setShowAddBackgroundModal(false);
  };

  const handleAddDiagnosisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagTitle.trim()) return;
    const descCheck = validateClinicalDescription(newDiagTitle.trim(), 'Diagnóstico', true);
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }
    if (newDiagDoctor.trim()) {
      const docCheck = validateDoctorName(newDiagDoctor.trim(), 'Profesional médico', false);
      if (!docCheck.isValid) {
        alert(docCheck.error);
        return;
      }
    }
    onAddDiagnosis({
      code: newDiagCode.trim(),
      title: newDiagTitle.trim(),
      category: newDiagCategory.trim(),
      diagnosedDate: new Date().toISOString().split('T')[0],
      status: newDiagStatus,
      doctor: newDiagDoctor.trim(),
      specialty: newDiagCategory.trim(),
    });
    setNewDiagTitle('');
    setShowAddDiagnosisModal(false);
  };

  const handleAddProcedureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcTitle.trim()) return;
    const descCheck = validateClinicalDescription(newProcTitle.trim(), 'Procedimiento', true);
    if (!descCheck.isValid) {
      alert(descCheck.error);
      return;
    }
    if (newProcDoctor.trim()) {
      const docCheck = validateDoctorName(newProcDoctor.trim(), 'Profesional médico', false);
      if (!docCheck.isValid) {
        alert(docCheck.error);
        return;
      }
    }
    onAddProcedure({
      title: newProcTitle.trim(),
      type: newProcType,
      date: new Date().toISOString().split('T')[0],
      institution: newProcInstitution.trim(),
      doctor: newProcDoctor.trim(),
      outcome: newProcOutcome.trim() || 'Procedimiento finalizado satisfactoriamente.',
    });
    setNewProcTitle('');
    setNewProcOutcome('');
    setShowAddProcedureModal(false);
  };

  return (
    <div className="px-3.5 py-4 sm:px-6 sm:py-6 space-y-5 max-w-4xl mx-auto pb-28 relative">
      {/* Toast Feedback */}
      {historyToast && (
        <div className="fixed top-16 right-4 left-4 max-w-md mx-auto z-50 bg-indigo-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fadeIn border border-indigo-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{historyToast}</span>
        </div>
      )}

      {/* Header & Export PDF CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-app-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Historia Clínica Personal
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Cifrado AES-256
            </span>
          </div>
          <h2 className="font-display font-bold text-app-text text-xl sm:text-2xl mt-1">
            Expediente Médico Interactivo
          </h2>
          <p className="text-xs text-muted-txt">
            Gestión confidencial de antecedentes, alergias, diagnósticos y bóveda de documentos adjuntos.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center justify-center gap-2 bg-primary text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-hover transition-all shadow-sm cursor-pointer shrink-0"
        >
          <FileDown className="w-4 h-4" />
          Exportar Resumen PDF
        </button>
      </div>

      {/* Security Protocol & RBAC Access Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5 sm:mt-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Bóveda Médica Cifrada (OMS / Ley Estatutaria 1581 de 2012)
            </p>
            <p className="text-[11px] text-emerald-700">
              Almacenamiento seguro con cifrado en reposo (AES-256-GCM), hashes SHA-256 de integridad y control de acceso estricto RBAC.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
          <span className="text-[10px] font-mono bg-white border border-emerald-300 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
            Rol Activo: {currentRole.toUpperCase()}
          </span>
          <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-1 rounded-lg">
            AES-256
          </span>
        </div>
      </div>

      {/* Navigation Tabs - Deslizables de forma táctil en celulares */}
      <div className="touch-scroll-x gap-2 pb-2 border-b border-app-border select-none">
        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('resumen');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-90 touch-manipulation cursor-pointer ${
            activeTab === 'resumen'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-surface text-muted-txt hover:bg-slate-100 border border-app-border'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Resumen Clínico
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('antecedentes');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-90 touch-manipulation cursor-pointer ${
            activeTab === 'antecedentes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-surface text-muted-txt hover:bg-slate-100 border border-app-border'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Antecedentes y Alergias ({allergies.length + backgrounds.length})
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('diagnosticos');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-90 touch-manipulation cursor-pointer ${
            activeTab === 'diagnosticos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-surface text-muted-txt hover:bg-slate-100 border border-app-border'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
          Diagnósticos y Cronología ({diagnoses.length + procedures.length})
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('boveda');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-90 touch-manipulation cursor-pointer ${
            activeTab === 'boveda'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-surface text-muted-txt hover:bg-slate-100 border border-app-border'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          Bóveda de Archivos ({files.length})
        </button>

        <button
          onClick={() => {
            triggerHaptic('selection');
            setActiveTab('seguridad_api');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-90 touch-manipulation cursor-pointer ${
            activeTab === 'seguridad_api'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          Auditoría de Cifrado & API REST
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RESUMEN GENERAL                                   */}
      {/* ======================================================== */}
      {activeTab === 'resumen' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Key KPI Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface border border-app-border rounded-2xl p-4 text-center shadow-xs">
              <p className="text-xs text-muted-txt font-medium">Grupo Sanguíneo</p>
              <p className="text-2xl font-display font-bold text-red-600 mt-1">{user.bloodType}</p>
              <span className="text-[10px] text-slate-500">Donante universal</span>
            </div>

            <div className="bg-surface border border-app-border rounded-2xl p-4 text-center shadow-xs">
              <p className="text-xs text-muted-txt font-medium">Alergias Críticas</p>
              <p className="text-2xl font-display font-bold text-amber-600 mt-1">{allergies.length}</p>
              <span className="text-[10px] text-amber-700 font-semibold">1 anafilaxia severa</span>
            </div>

            <div className="bg-surface border border-app-border rounded-2xl p-4 text-center shadow-xs">
              <p className="text-xs text-muted-txt font-medium">Diagnósticos Activos</p>
              <p className="text-2xl font-display font-bold text-indigo-600 mt-1">{diagnoses.length}</p>
              <span className="text-[10px] text-indigo-600 font-semibold">CIE-10 Registrados</span>
            </div>

            <div className="bg-surface border border-app-border rounded-2xl p-4 text-center shadow-xs">
              <p className="text-xs text-muted-txt font-medium">Archivos Cifrados</p>
              <p className="text-2xl font-display font-bold text-emerald-600 mt-1">{files.length}</p>
              <span className="text-[10px] text-emerald-700 font-semibold">AES-256 en reposo</span>
            </div>
          </div>

          {/* Quick Snapshot: Identification & Caregivers */}
          <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-app-border pb-3">
              <h3 className="font-display font-bold text-app-text text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" /> Ficha de Identificación del Paciente
              </h3>
              <span className="text-xs bg-slate-100 font-mono text-slate-600 px-2.5 py-1 rounded-lg">
                ID: {user.id} · C.C. {user.idNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-txt block text-[11px]">Paciente:</span>
                <span className="font-bold text-app-text">{user.name}</span>
              </div>
              <div>
                <span className="text-muted-txt block text-[11px]">EPS / IPS Asignada:</span>
                <span className="font-semibold text-app-text">{user.eps} · {user.ips}</span>
              </div>
              <div>
                <span className="text-muted-txt block text-[11px]">Contacto de Emergencia:</span>
                <span className="font-semibold text-app-text">
                  {user.emergencyContact.name} ({user.emergencyContact.relation}) - {user.emergencyContact.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Allergies Alert */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-display font-bold text-slate-900 text-sm">
                  Alergias y Reacciones Adversas Principales
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('antecedentes')}
                className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Gestionar todas <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allergies.map((alg) => (
                <div
                  key={alg.id}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
                    alg.severity === 'Severa / Anafilaxia'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : alg.severity === 'Moderada'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      alg.severity === 'Severa / Anafilaxia'
                        ? 'bg-red-600'
                        : alg.severity === 'Moderada'
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span>
                    <strong>{alg.allergen}</strong> ({alg.reaction})
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    [{alg.severity}]
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Procedural Timeline preview */}
          <div className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h4 className="font-display font-bold text-app-text text-sm">
                  Últimos Procedimientos Registrados
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('diagnosticos')}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                Ver cronología completa <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-app-border">
              {procedures.slice(0, 3).map((proc) => (
                <div key={proc.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-app-text">{proc.title}</p>
                    <p className="text-[11px] text-muted-txt">
                      {proc.type} · {proc.institution} · {proc.doctor}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                    {proc.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ANTECEDENTES Y ALERGIAS                          */}
      {/* ======================================================== */}
      {activeTab === 'antecedentes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section: Alergias con Severidad */}
          <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-app-border pb-3">
              <div>
                <h3 className="font-display font-bold text-app-text text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Alergias y Contraindicaciones Médicas
                </h3>
                <p className="text-xs text-muted-txt">
                  Registro de sustancias alergénicas con grado de severidad clínica y fecha de detección.
                </p>
              </div>
              <button
                onClick={() => setShowAddAllergyModal(true)}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Alergia
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allergies.map((alg) => (
                <div
                  key={alg.id}
                  className="bg-white border border-app-border rounded-xl p-3.5 shadow-xs flex items-start justify-between gap-3 hover:border-red-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-app-text">{alg.allergen}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alg.severity === 'Severa / Anafilaxia'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : alg.severity === 'Moderada'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {alg.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <strong>Reacción:</strong> {alg.reaction}
                    </p>
                    <p className="text-[11px] text-muted-txt">
                      Año de detección: {alg.diagnosedYear} · Estado: {alg.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingAllergy(alg)}
                      title="Editar registro de alergia"
                      className="text-slate-400 hover:text-primary p-1 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteAllergy && (
                      <button
                        onClick={() => onDeleteAllergy(alg.id)}
                        title="Eliminar alergia"
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Antecedentes Diferenciados */}
          <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-app-border pb-3">
              <div>
                <h3 className="font-display font-bold text-app-text text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Antecedentes Médicos Clasificados
                </h3>
                <p className="text-xs text-muted-txt">
                  Patológicos, Farmacológicos, Quirúrgicos, Familiares y Tóxico-Alérgicos.
                </p>
              </div>
              <button
                onClick={() => setShowAddBackgroundModal(true)}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Antecedente
              </button>
            </div>

            {/* Clasificación por categoría */}
            {(['Patológico', 'Farmacológico', 'Quirúrgico', 'Familiar'] as const).map((cat) => {
              const items = backgrounds.filter((b) => b.category === cat);
              if (items.length === 0) return null;

              return (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        cat === 'Patológico'
                          ? 'bg-indigo-100 text-indigo-800'
                          : cat === 'Farmacológico'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cat === 'Quirúrgico'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      Antecedentes {cat}s
                    </span>
                    <div className="h-px bg-app-border flex-1" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-app-border rounded-xl p-3 shadow-xs flex items-start justify-between gap-2 hover:border-primary/40 transition-all"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-app-text">{item.title}</p>
                          <p className="text-[11px] text-slate-700">{item.description}</p>
                          <p className="text-[10px] text-muted-txt">
                            {item.year && `Año: ${item.year}`}
                            {item.relationship && ` · Familiar: ${item.relationship}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setEditingBackground(item)}
                            title="Editar antecedente"
                            className="text-slate-400 hover:text-primary p-1 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteBackground && (
                            <button
                              onClick={() => onDeleteBackground(item.id)}
                              title="Eliminar antecedente"
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DIAGNÓSTICOS PREVIOS Y CRONOLOGÍA DE PROCEDIMIENTOS*/}
      {/* ======================================================== */}
      {activeTab === 'diagnosticos' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Diagnósticos previos estructurados */}
          <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-app-border pb-3">
              <div>
                <h3 className="font-display font-bold text-app-text text-base flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-indigo-600" /> Diagnósticos Previos y Condiciones Clínicas
                </h3>
                <p className="text-xs text-muted-txt">
                  Codificación estandarizada CIE-10, estado actual y profesional tratante.
                </p>
              </div>
              <button
                onClick={() => setShowAddDiagnosisModal(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Diagnóstico
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {diagnoses.map((diag) => (
                <div
                  key={diag.id}
                  className="bg-white border border-app-border rounded-xl p-3.5 shadow-xs space-y-1.5 hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                      CIE-10: {diag.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        diag.status === 'Controlado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : diag.status === 'En tratamiento'
                          ? 'bg-amber-100 text-amber-800'
                          : diag.status === 'Resuelto'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {diag.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-app-text">{diag.title}</p>
                  <p className="text-[11px] text-muted-txt">
                    Especialidad: {diag.specialty} · Médico: {diag.doctor}
                  </p>
                  {diag.notes && (
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded-md border border-slate-100">
                      "{diag.notes}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400">Fecha diagnóstico: {diag.diagnosedDate}</p>
                    <button
                      onClick={() => setEditingDiagnosis(diag)}
                      className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cronología interactiva de procedimientos (Timeline) */}
          <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-app-border pb-3">
              <div>
                <h3 className="font-display font-bold text-app-text text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Cronología Interactiva de Procedimientos
                </h3>
                <p className="text-xs text-muted-txt">
                  Línea de tiempo detallada de cirugías, exámenes diagnósticos y atenciones hospitalarias.
                </p>
              </div>
              <button
                onClick={() => setShowAddProcedureModal(true)}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Procedimiento
              </button>
            </div>

            {/* Timeline Visual */}
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {procedures.map((proc) => (
                <div key={proc.id} className="relative group">
                  {/* Timeline point */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white bg-primary shadow-xs flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="bg-white border border-app-border rounded-2xl p-4 shadow-xs hover:border-primary/50 transition-all space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-bold text-app-text flex items-center gap-2">
                        {proc.title}
                        <span className="text-[10px] font-semibold text-primary bg-primary-50 px-2 py-0.5 rounded-md">
                          {proc.type}
                        </span>
                      </span>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-auto">
                        {proc.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700">
                      <strong>Institución / IPS:</strong> {proc.institution} · <strong>Tratante:</strong> {proc.doctor}
                    </p>

                    {proc.outcome && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-2 rounded-xl">
                        <strong>Resultado / Hallazgos:</strong> {proc.outcome}
                      </div>
                    )}

                    {proc.notes && (
                      <p className="text-[11px] text-muted-txt">
                        <strong>Notas:</strong> {proc.notes}
                      </p>
                    )}

                    <div className="flex justify-end pt-1 border-t border-slate-100">
                      <button
                        onClick={() => setEditingProcedure(proc)}
                        className="text-[11px] font-semibold text-primary bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Editar Procedimiento
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BÓVEDA DE ARCHIVOS ADJUNTOS CON BÚSQUEDA Y FECHAS */}
      {/* ======================================================== */}
      {activeTab === 'boveda' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Bóveda */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-app-text text-base sm:text-lg flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" /> Bóveda de Exámenes y Fórmulas Cifradas
              </h3>
              <p className="text-xs text-muted-txt">
                Almacenamiento seguro con cifrado en reposo (AES-256), hash de integridad SHA-256 y visor integrado.
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Adjuntar Archivo Cifrado
            </button>
          </div>

          {/* Motor de Búsqueda y Filtrado por Rango de Fechas */}
          <div className="bg-surface rounded-2xl border border-app-border p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-app-text flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-primary" /> Motor de Búsqueda y Filtros de Bóveda
              </span>
              {(selectedCategory !== 'all' || searchQuery || dateFrom || dateTo) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-primary font-semibold hover:underline cursor-pointer"
                >
                  Restablecer filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Text search */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-muted-txt absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, IPS o diagnóstico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-app-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary bg-white text-app-text"
                />
              </div>

              {/* Date From */}
              <div className="sm:col-span-3">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-muted-txt font-medium shrink-0">Desde:</label>
                  <input
                    type="date"
                    max={getTodayDateString()}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-app-border rounded-xl focus:border-primary bg-white text-app-text"
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="sm:col-span-4">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-muted-txt font-medium shrink-0">Hasta:</label>
                  <input
                    type="date"
                    max={getTodayDateString()}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-app-border rounded-xl focus:border-primary bg-white text-app-text"
                  />
                </div>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pt-1">
              {['all', 'Laboratorio', 'Imagenología', 'Diagnóstico', 'Receta'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-app-border text-muted-txt hover:bg-slate-50'
                  }`}
                >
                  {cat === 'all' ? 'Todos los tipos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-2.5">
            {filteredFiles.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-app-border p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-muted-txt mx-auto" />
                <p className="text-xs font-semibold text-app-text">No se encontraron archivos clínicos</p>
                <p className="text-[11px] text-muted-txt max-w-sm mx-auto">
                  Ajusta los términos de búsqueda o el rango de fechas para visualizar los documentos almacenados.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-surface rounded-2xl border border-app-border p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${
                        file.type === 'PDF' || file.category === 'Receta'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-primary-50 text-primary'
                      }`}
                    >
                      {file.type === 'PDF' || file.category === 'Receta' ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <FileImage className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-xs sm:text-sm text-app-text truncate">{file.name}</p>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-md">
                          AES-256
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-txt">
                        <strong>{file.category}</strong> · {file.institution} · {file.date} · {file.size}
                      </p>
                      {file.notes && (
                        <p className="text-[11px] text-slate-600 line-clamp-1">{file.notes}</p>
                      )}
                      {file.sha256 && (
                        <p className="text-[9px] font-mono text-slate-400 truncate max-w-md">
                          SHA-256: {file.sha256}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setSelectedFileForView(file)}
                      className="bg-primary text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl hover:bg-primary-hover transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver examen
                    </button>
                    <button
                      onClick={() => setEditingFile(file)}
                      title="Editar notas o metadatos del archivo"
                      className="text-slate-500 hover:text-primary bg-slate-100 hover:bg-slate-200 p-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteFile && (
                      <button
                        onClick={() => onDeleteFile(file.id)}
                        title="Eliminar archivo"
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: AUDITORÍA DE CIFRADO, ENDPOINTS REST Y RBAC      */}
      {/* ======================================================== */}
      {activeTab === 'seguridad_api' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Security */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cifrado y Almacenamiento Seguro (Backend & Criptografía)
              </span>
              <span className="text-[11px] font-mono text-slate-400">RFC 7516 / NIST SP 800-38D</span>
            </div>
            <p className="text-xs text-slate-300">
              Implementación del servicio de almacenamiento de archivos adjuntos con cifrado en reposo (AES-256-GCM) y control de acceso por roles (RBAC) para garantizar la privacidad y confidencialidad médica del paciente.
            </p>
          </div>

          {/* Endpoints Nav */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveApiView('post_historia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeApiView === 'post_historia'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-app-border text-muted-txt'
              }`}
            >
              POST /api/historia-clinica
            </button>
            <button
              onClick={() => setActiveApiView('get_adjuntos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeApiView === 'get_adjuntos'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-app-border text-muted-txt'
              }`}
            >
              GET /api/historia-clinica/adjuntos
            </button>
            <button
              onClick={() => setActiveApiView('post_adjuntos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeApiView === 'post_adjuntos'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-app-border text-muted-txt'
              }`}
            >
              POST /api/historia-clinica/adjuntos
            </button>
            <button
              onClick={() => setActiveApiView('rbac')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeApiView === 'rbac'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-app-border text-muted-txt'
              }`}
            >
              Matriz RBAC (Habeas Data)
            </button>
          </div>

          {/* Endpoint Details */}
          {activeApiView === 'post_historia' && (
            <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-app-border pb-2">
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  POST /api/historia-clinica
                </span>
                <span className="text-slate-500 font-sans">Controlador: HistoryController.saveHistory</span>
              </div>
              <p className="font-sans text-slate-700 text-xs">
                Registra o actualiza antecedentes patológicos, quirúrgicos, diagnósticos CIE-10 y alergias. Los datos sensibles se almacenan cifrados con AES-256-GCM antes de persistir en PostgreSQL.
              </p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto text-[11px]">
                <pre>{`// Payload enviado desde el Frontend:
{
  "bloodType": "${user.bloodType}",
  "newAllergy": {
    "allergen": "Penicilina",
    "reaction": "Anafilaxia leve",
    "severity": "Severa / Anafilaxia",
    "diagnosedYear": "2012"
  },
  "newDiagnosis": {
    "code": "I10",
    "title": "Hipertensión arterial esencial",
    "status": "Controlado"
  }
}`}</pre>
              </div>
            </div>
          )}

          {activeApiView === 'get_adjuntos' && (
            <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-app-border pb-2">
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  GET /api/historia-clinica/adjuntos?dateFrom=2026-01-01&dateTo=2026-12-31
                </span>
                <span className="text-slate-500 font-sans">Controlador: HistoryController.getAdjuntos</span>
              </div>
              <p className="font-sans text-slate-700 text-xs">
                Devuelve la lista de adjuntos filtrados por rango de fechas y categoría diagnóstica, verificando la firma SHA-256 de cada archivo en reposo.
              </p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto text-[11px]">
                <pre>{`// Respuesta REST:
{
  "count": ${files.length},
  "encryptionStandard": "AES-256-GCM / SHA-256 Integrity Verification",
  "attachments": [
    {
      "id": "doc-001",
      "name": "Resultado Hemograma Completo y Glucemia",
      "category": "Laboratorio",
      "date": "2026-08-28",
      "encrypted": true,
      "sha256": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
    }
  ]
}`}</pre>
              </div>
            </div>
          )}

          {activeApiView === 'post_adjuntos' && (
            <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-app-border pb-2">
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  POST /api/historia-clinica/adjuntos
                </span>
                <span className="text-slate-500 font-sans">Controlador: HistoryController.uploadAdjunto</span>
              </div>
              <p className="font-sans text-slate-700 text-xs">
                Recibe el archivo (PDF, radiografía, foto de fórmula médica), calcula su digest SHA-256, genera un vector de inicialización IV (16 bytes) y cifra el contenido en reposo con AES-256-GCM.
              </p>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto text-[11px]">
                <pre>{`// Cifrado simétrico en HistoryService:
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
let encrypted = cipher.update(fileBuffer, 'binary', 'hex') + cipher.final('hex');
const authTag = cipher.getAuthTag();
// Almacena formato seguro: iv:authTag:encryptedData`}</pre>
              </div>
            </div>
          )}

          {activeApiView === 'rbac' && (
            <div className="bg-surface rounded-2xl border border-app-border p-4 sm:p-5 shadow-xs space-y-3 text-xs">
              <h4 className="font-display font-bold text-app-text text-sm">
                Control de Acceso por Roles (RBAC) y Habeas Data Médico
              </h4>
              <p className="text-muted-txt">
                Conforme a la Ley 1581 de 2012 y la Resolución 1995 de 1999 (Ministerio de Salud), el acceso a la historia clínica está estrictamente segregado:
              </p>
              <div className="border border-app-border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Rol de Usuario</th>
                      <th className="p-2.5">Lectura de Expediente</th>
                      <th className="p-2.5">Carga de Adjuntos</th>
                      <th className="p-2.5">Justificación Legal / Ciberseguridad</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border">
                    <tr className="bg-white">
                      <td className="p-2.5 font-bold text-emerald-800">Paciente (Titular)</td>
                      <td className="p-2.5 text-emerald-700 font-semibold">✓ Permitido Total</td>
                      <td className="p-2.5 text-emerald-700 font-semibold">✓ Permitido Total</td>
                      <td className="p-2.5 text-slate-600">Titular legítimo del dato según Habeas Data.</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-2.5 font-bold text-indigo-800">Familiar Cuidador</td>
                      <td className="p-2.5 text-indigo-700 font-semibold">✓ Solo si paciente delegó permiso</td>
                      <td className="p-2.5 text-indigo-700 font-semibold">✓ Solo si delegado</td>
                      <td className="p-2.5 text-slate-600">Consentimiento informado expreso y revocable.</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-bold text-red-700">Administrador (ADMIN)</td>
                      <td className="p-2.5 text-red-700 font-bold">✗ PROHIBIDO (403)</td>
                      <td className="p-2.5 text-red-700 font-bold">✗ PROHIBIDO (403)</td>
                      <td className="p-2.5 text-slate-600">
                        Reserva legal y secreto médico. El admin solo gestiona tutoriales y logs sin acceso clínico.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Interactive Encryption Payload Visualizer */}
          <div className="bg-white border border-app-border rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-bold text-app-text text-xs sm:text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Visualizador de Cifrado en Reposo en Tiempo Real
              </h4>
              <button
                onClick={() => setShowDecryptedPayload(!showDecryptedPayload)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3 py-1 rounded-xl transition-colors cursor-pointer"
              >
                {showDecryptedPayload ? 'Ocultar payload desencriptado' : 'Simular desencriptación con clave privada'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl space-y-1 overflow-x-auto">
                <p className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                  Bóveda Cifrada en Almacenamiento (AES-256-GCM):
                </p>
                <p className="break-all text-[10px]">
                  iv:e84f7b2c91a03d12f56e
                  <br />
                  authTag:c7b891a24d5e6f018a
                  <br />
                  encryptedData:
                  7a9f81bc2049d5ef82b611e93cba5201d4fe6288a14b55c2d987e024b899af13cde561b3...
                </p>
                <div className="pt-2 text-[10px] text-slate-500 font-sans flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cifrado en reposo activo
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 text-slate-800 p-3 rounded-xl space-y-1 overflow-x-auto">
                <p className="text-[10px] text-slate-500 uppercase font-sans font-bold">
                  Estado Desencriptado para Vista Médica Autorizada:
                </p>
                {showDecryptedPayload ? (
                  <pre className="text-[10px] text-slate-900 leading-tight">{`{
  "bloodType": "${user.bloodType}",
  "allergies": ${JSON.stringify(allergies.map((a) => a.allergen))},
  "diagnosesCount": ${diagnoses.length},
  "verifiedBy": "OMS / Ley 1581"
}`}</pre>
                ) : (
                  <div className="py-4 text-center text-slate-400 font-sans text-xs">
                    🔒 Payload protegido por clave simétrica. Haz clic en el botón superior para inspeccionar.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADJUNTAR ARCHIVO CIFRADO                       */}
      {/* ======================================================== */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Adjuntar Documento Médico</h3>
                  <p className="text-[11px] text-muted-txt">Cifrado seguro automático con AES-256 en reposo</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre del examen, radiografía o fórmula *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Perfil Lipídico y Hemoglobina Glicosilada"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Categoría diagnóstica *
                  </label>
                  <select
                    value={newFileCategory}
                    onChange={(e) =>
                      setNewFileCategory(
                        e.target.value as 'Laboratorio' | 'Imagenología' | 'Diagnóstico' | 'Receta'
                      )
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2.5 text-xs text-app-text focus:border-primary bg-white"
                  >
                    <option value="Laboratorio">Laboratorio Clínico (Sangre, Orina)</option>
                    <option value="Imagenología">Imagenología (Rayos X, Ecografía, TAC)</option>
                    <option value="Diagnóstico">Diagnóstico Clínico / Especialista</option>
                    <option value="Receta">Fórmula / Orden Médica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Institución emisora / IPS *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Laboratorios El Bosque"
                    value={newFileInstitution}
                    onChange={(e) => setNewFileInstitution(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3 py-2.5 text-xs text-app-text focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Observaciones médicas o notas clínicas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Ayuno de 10 horas, glucosa dentro de rangos esperados..."
                  value={newFileNotes}
                  onChange={(e) => setNewFileNotes(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text focus:border-primary"
                />
              </div>

              {/* Interactive File Drag & Drop / Preview Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50 flex flex-col items-center justify-center space-y-1.5">
                <Paperclip className="w-6 h-6 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">
                  {uploadedPreviewData ? 'Archivo cargado con éxito' : 'Selecciona o arrastra tu archivo (PDF, JPG, PNG)'}
                </p>
                <p className="text-[10px] text-muted-txt">
                  Formatos soportados: Exámenes de laboratorio, fórmulas o imágenes de rayos X (máx. 15 MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadedPreviewData(file.name);
                      if (!newFileName) {
                        setNewFileName(file.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100 cursor-pointer pt-1"
                />
              </div>

              <div className="bg-emerald-50 text-emerald-800 text-[11px] p-2.5 rounded-xl flex items-center gap-2 border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>El archivo se cifrará con AES-256-GCM y se generará hash de integridad SHA-256.</span>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-xl transition-colors font-display text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" /> Cifrar y Almacenar en Historia Clínica
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: REGISTRAR ALERGIA                              */}
      {/* ======================================================== */}
      {showAddAllergyModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowAddAllergyModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-red-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Registrar Alergia Médica</h3>
                  <p className="text-[11px] text-muted-txt">Registro seguro con severidad clínica</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAllergyModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAllergySubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Sustancia o Medicamento Alergénico *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sulfas, Penicilina, Mariscos, Yodo..."
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Grado de Severidad *
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) =>
                    setNewSeverity(e.target.value as 'Leve' | 'Moderada' | 'Severa / Anafilaxia')
                  }
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text bg-white"
                >
                  <option value="Leve">Leve (Prurito, enrojecimiento localizado)</option>
                  <option value="Moderada">Moderada (Broncoespasmo leve, urticaria difusa)</option>
                  <option value="Severa / Anafilaxia">Severa / Anafilaxia (Riesgo vital, edema glotis)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Tipo de Reacción Clínica
                </label>
                <input
                  type="text"
                  placeholder="Ej: Edema de labios, dificultad respiratoria, ronchas..."
                  value={newReaction}
                  onChange={(e) => setNewReaction(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Año de detección
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2024"
                  value={newAllergyYear}
                  onChange={(e) => setNewAllergyYear(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors font-display text-xs sm:text-sm shadow-md cursor-pointer"
              >
                Guardar en Expediente Médico
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REGISTRAR ANTECEDENTE                          */}
      {/* ======================================================== */}
      {showAddBackgroundModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowAddBackgroundModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-primary/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Registrar Antecedente</h3>
                  <p className="text-[11px] text-muted-txt">Clasificación en historia clínica</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBackgroundModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBackgroundSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Categoría del Antecedente *
                </label>
                <select
                  value={newBgCategory}
                  onChange={(e) =>
                    setNewBgCategory(
                      e.target.value as 'Patológico' | 'Farmacológico' | 'Quirúrgico' | 'Familiar' | 'Tóxico-Alérgico'
                    )
                  }
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text bg-white"
                >
                  <option value="Patológico">Patológico (Enfermedad previa / crónica)</option>
                  <option value="Farmacológico">Farmacológico (Tratamiento continuo)</option>
                  <option value="Quirúrgico">Quirúrgico (Operación / Intervención)</option>
                  <option value="Familiar">Familiar (Padres, hermanos, abuelos)</option>
                  <option value="Tóxico-Alérgico">Tóxico-Alérgico (Exposición ambiental o sustancias)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Título / Condición *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Hipotiroidismo subclínico / Colecistectomía"
                  value={newBgTitle}
                  onChange={(e) => setNewBgTitle(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Descripción o tratamiento asociado
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Diagnosticada en chequeo laboral, en manejo con Levotiroxina 50mcg..."
                  value={newBgDesc}
                  onChange={(e) => setNewBgDesc(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2 text-xs text-app-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Año
                  </label>
                  <input
                    type="text"
                    placeholder="2022"
                    value={newBgYear}
                    onChange={(e) => setNewBgYear(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                  />
                </div>
                {newBgCategory === 'Familiar' && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                      Parentesco
                    </label>
                    <input
                      type="text"
                      placeholder="Madre / Padre"
                      value={newBgRel}
                      onChange={(e) => setNewBgRel(e.target.value)}
                      className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors font-display text-xs sm:text-sm shadow-md cursor-pointer"
              >
                Guardar Antecedente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: REGISTRAR DIAGNÓSTICO (CIE-10)                 */}
      {/* ======================================================== */}
      {showAddDiagnosisModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowAddDiagnosisModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-indigo-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Registrar Diagnóstico CIE-10</h3>
                  <p className="text-[11px] text-muted-txt">Registro codificado en historia médica</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDiagnosisModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDiagnosisSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    CIE-10 *
                  </label>
                  <input
                    type="text"
                    placeholder="E11.9"
                    value={newDiagCode}
                    onChange={(e) => setNewDiagCode(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-800"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Nombre del Diagnóstico *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Gastritis crónica no especificada"
                    value={newDiagTitle}
                    onChange={(e) => setNewDiagTitle(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    placeholder="Gastroenterología"
                    value={newDiagCategory}
                    onChange={(e) => setNewDiagCategory(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Estado Clínico
                  </label>
                  <select
                    value={newDiagStatus}
                    onChange={(e) =>
                      setNewDiagStatus(
                        e.target.value as 'Activo' | 'En tratamiento' | 'Controlado' | 'Resuelto'
                      )
                    }
                    className="w-full border border-app-border rounded-xl px-2 py-2 text-xs text-app-text bg-white"
                  >
                    <option value="Activo">Activo</option>
                    <option value="En tratamiento">En tratamiento</option>
                    <option value="Controlado">Controlado</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Médico Tratante
                </label>
                <input
                  type="text"
                  placeholder="Dr. Andrés Morales"
                  value={newDiagDoctor}
                  onChange={(e) => setNewDiagDoctor(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors font-display text-xs sm:text-sm shadow-md cursor-pointer"
              >
                Registrar Diagnóstico
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: REGISTRAR PROCEDIMIENTO                        */}
      {/* ======================================================== */}
      {showAddProcedureModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setShowAddProcedureModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-primary/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Registrar Procedimiento</h3>
                  <p className="text-[11px] text-muted-txt">Incorporación a cronología médica</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddProcedureModal(false)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProcedureSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre del Procedimiento / Cirugía *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Endoscopia Digestiva Alta con Biopsia"
                  value={newProcTitle}
                  onChange={(e) => setNewProcTitle(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3.5 py-2.5 text-xs text-app-text"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Tipo de Procedimiento *
                </label>
                <select
                  value={newProcType}
                  onChange={(e) =>
                    setNewProcType(
                      e.target.value as 'Cirugía' | 'Examen Diagnóstico' | 'Procedimiento Menor' | 'Hospitalización'
                    )
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text bg-white"
                >
                  <option value="Cirugía">Cirugía Mayor / Intervención</option>
                  <option value="Examen Diagnóstico">Examen Diagnóstico Especializado</option>
                  <option value="Procedimiento Menor">Procedimiento Menor Ambulatorio</option>
                  <option value="Hospitalización">Hospitalización / Observación</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Institución / IPS
                  </label>
                  <input
                    type="text"
                    placeholder="Clínica del Norte"
                    value={newProcInstitution}
                    onChange={(e) => setNewProcInstitution(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Médico Realizador
                  </label>
                  <input
                    type="text"
                    placeholder="Dra. Claudia Vega"
                    value={newProcDoctor}
                    onChange={(e) => setNewProcDoctor(e.target.value)}
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Resultado o Hallazgos Clínicos
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Mucosa gástrica con signos leves de eritema antral..."
                  value={newProcOutcome}
                  onChange={(e) => setNewProcOutcome(e.target.value)}
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs text-app-text"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-colors font-display text-xs sm:text-sm shadow-md cursor-pointer"
              >
                Agregar a Cronología
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALES DE EDICIÓN DE HISTORIA CLÍNICA                   */}
      {/* ======================================================== */}

      {/* 1. Modal Editar Diagnóstico */}
      {editingDiagnosis && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setEditingDiagnosis(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-indigo-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Editar Diagnóstico Clínico</h3>
                  <p className="text-[11px] text-muted-txt">Modificar información diagnóstica codificada</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDiagnosis(null)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDiagnosisSubmit} className="p-5 space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    CIE-10 *
                  </label>
                  <input
                    type="text"
                    value={editingDiagnosis.code}
                    onChange={(e) =>
                      setEditingDiagnosis({ ...editingDiagnosis, code: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-indigo-800"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Diagnóstico *
                  </label>
                  <input
                    type="text"
                    value={editingDiagnosis.title}
                    onChange={(e) =>
                      setEditingDiagnosis({ ...editingDiagnosis, title: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Especialidad
                  </label>
                  <input
                    type="text"
                    value={editingDiagnosis.specialty}
                    onChange={(e) =>
                      setEditingDiagnosis({
                        ...editingDiagnosis,
                        specialty: e.target.value,
                        category: e.target.value,
                      })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Estado Clínico
                  </label>
                  <select
                    value={editingDiagnosis.status}
                    onChange={(e) =>
                      setEditingDiagnosis({
                        ...editingDiagnosis,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full border border-app-border rounded-xl px-2 py-2 text-xs bg-white"
                  >
                    <option value="Activo">Activo</option>
                    <option value="En tratamiento">En tratamiento</option>
                    <option value="Controlado">Controlado</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Médico Tratante
                </label>
                <input
                  type="text"
                  value={editingDiagnosis.doctor}
                  onChange={(e) =>
                    setEditingDiagnosis({ ...editingDiagnosis, doctor: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Notas / Observaciones Clínicas
                </label>
                <textarea
                  rows={2}
                  value={editingDiagnosis.notes || ''}
                  onChange={(e) =>
                    setEditingDiagnosis({ ...editingDiagnosis, notes: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDiagnosis(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Editar Alergia */}
      {editingAllergy && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setEditingAllergy(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-red-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Editar Alergia</h3>
                  <p className="text-[11px] text-muted-txt">Actualizar alérgeno y severidad médica</p>
                </div>
              </div>
              <button
                onClick={() => setEditingAllergy(null)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAllergySubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Alérgeno / Sustancia *
                </label>
                <input
                  type="text"
                  value={editingAllergy.allergen}
                  onChange={(e) =>
                    setEditingAllergy({ ...editingAllergy, allergen: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Reacción Alérgica / Síntomas *
                </label>
                <input
                  type="text"
                  value={editingAllergy.reaction}
                  onChange={(e) =>
                    setEditingAllergy({ ...editingAllergy, reaction: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Severidad Clínica
                  </label>
                  <select
                    value={editingAllergy.severity}
                    onChange={(e) =>
                      setEditingAllergy({ ...editingAllergy, severity: e.target.value as any })
                    }
                    className="w-full border border-app-border rounded-xl px-2 py-2 text-xs bg-white"
                  >
                    <option value="Leve">Leve</option>
                    <option value="Moderada">Moderada</option>
                    <option value="Severa / Anafilaxia">Severa / Anafilaxia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Año de Detección
                  </label>
                  <input
                    type="text"
                    value={editingAllergy.diagnosedYear}
                    onChange={(e) =>
                      setEditingAllergy({ ...editingAllergy, diagnosedYear: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Estado
                </label>
                <select
                  value={editingAllergy.status}
                  onChange={(e) =>
                    setEditingAllergy({ ...editingAllergy, status: e.target.value as any })
                  }
                  className="w-full border border-app-border rounded-xl px-2 py-2 text-xs bg-white"
                >
                  <option value="Activa">Activa</option>
                  <option value="En desensibilización">En desensibilización</option>
                  <option value="Resuelta">Resuelta</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAllergy(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Editar Antecedente */}
      {editingBackground && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setEditingBackground(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-primary-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Editar Antecedente Médico</h3>
                  <p className="text-[11px] text-muted-txt">Modificar antecedentes clasificados</p>
                </div>
              </div>
              <button
                onClick={() => setEditingBackground(null)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBackgroundSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Categoría de Antecedente
                </label>
                <select
                  value={editingBackground.category}
                  onChange={(e) =>
                    setEditingBackground({
                      ...editingBackground,
                      category: e.target.value as any,
                    })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs bg-white"
                >
                  <option value="Patológico">Patológico (Enfermedad previa o crónica)</option>
                  <option value="Farmacológico">Farmacológico (Tratamientos previos)</option>
                  <option value="Quirúrgico">Quirúrgico (Operaciones pasadas)</option>
                  <option value="Familiar">Familiar (Herencia genética)</option>
                  <option value="Tóxico-Alérgico">Tóxico-Alérgico (Hábitos o exposiciones)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Título / Condición *
                </label>
                <input
                  type="text"
                  value={editingBackground.title}
                  onChange={(e) =>
                    setEditingBackground({ ...editingBackground, title: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Descripción Detallada
                </label>
                <textarea
                  rows={2}
                  value={editingBackground.description}
                  onChange={(e) =>
                    setEditingBackground({ ...editingBackground, description: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Año aproximado
                  </label>
                  <input
                    type="text"
                    value={editingBackground.year || ''}
                    onChange={(e) =>
                      setEditingBackground({ ...editingBackground, year: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                {editingBackground.category === 'Familiar' && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                      Parentesco
                    </label>
                    <input
                      type="text"
                      value={editingBackground.relationship || ''}
                      onChange={(e) =>
                        setEditingBackground({
                          ...editingBackground,
                          relationship: e.target.value,
                        })
                      }
                      placeholder="Ej: Padre, Madre"
                      className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingBackground(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal Editar Procedimiento */}
      {editingProcedure && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setEditingProcedure(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-primary-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Editar Procedimiento Clínico</h3>
                  <p className="text-[11px] text-muted-txt">Cirugías, exámenes o atenciones</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProcedure(null)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProcedureSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre del Procedimiento *
                </label>
                <input
                  type="text"
                  value={editingProcedure.title}
                  onChange={(e) =>
                    setEditingProcedure({ ...editingProcedure, title: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Tipo de Atención
                  </label>
                  <select
                    value={editingProcedure.type}
                    onChange={(e) =>
                      setEditingProcedure({ ...editingProcedure, type: e.target.value as any })
                    }
                    className="w-full border border-app-border rounded-xl px-2 py-2 text-xs bg-white"
                  >
                    <option value="Cirugía">Cirugía</option>
                    <option value="Examen Diagnóstico">Examen Diagnóstico</option>
                    <option value="Procedimiento Menor">Procedimiento Menor</option>
                    <option value="Hospitalización">Hospitalización</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Fecha Realización
                  </label>
                  <input
                    type="date"
                    max={getTodayDateString()}
                    value={editingProcedure.date}
                    onChange={(e) =>
                      setEditingProcedure({ ...editingProcedure, date: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-2 py-2 text-xs"
                  />
                  <p className="text-[10px] text-muted-txt mt-0.5">Hasta hoy</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Institución / IPS
                  </label>
                  <input
                    type="text"
                    value={editingProcedure.institution}
                    onChange={(e) =>
                      setEditingProcedure({ ...editingProcedure, institution: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Médico Realizador
                  </label>
                  <input
                    type="text"
                    value={editingProcedure.doctor}
                    onChange={(e) =>
                      setEditingProcedure({ ...editingProcedure, doctor: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Resultado / Hallazgos Clínicos
                </label>
                <textarea
                  rows={2}
                  value={editingProcedure.outcome || ''}
                  onChange={(e) =>
                    setEditingProcedure({ ...editingProcedure, outcome: e.target.value })
                  }
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProcedure(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Editar Archivo de la Bóveda */}
      {editingFile && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setEditingFile(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-app-border flex items-center justify-between bg-primary-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-app-text text-base">Editar Documento Adjunto</h3>
                  <p className="text-[11px] text-muted-txt">Actualizar notas o nombre del archivo</p>
                </div>
              </div>
              <button
                onClick={() => setEditingFile(null)}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateFileSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Nombre del Documento *
                </label>
                <input
                  type="text"
                  value={editingFile.name}
                  onChange={(e) => setEditingFile({ ...editingFile, name: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Categoría
                  </label>
                  <select
                    value={editingFile.category}
                    onChange={(e) =>
                      setEditingFile({ ...editingFile, category: e.target.value as any })
                    }
                    className="w-full border border-app-border rounded-xl px-2 py-2 text-xs bg-white"
                  >
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Imagenología">Imagenología</option>
                    <option value="Diagnóstico">Diagnóstico</option>
                    <option value="Receta">Receta Médica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                    Institución Emisora
                  </label>
                  <input
                    type="text"
                    value={editingFile.institution}
                    onChange={(e) =>
                      setEditingFile({ ...editingFile, institution: e.target.value })
                    }
                    className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-txt uppercase tracking-wider mb-1">
                  Notas / Observaciones del Documento
                </label>
                <textarea
                  rows={2}
                  value={editingFile.notes || ''}
                  onChange={(e) => setEditingFile({ ...editingFile, notes: e.target.value })}
                  className="w-full border border-app-border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
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
