import { useState } from 'react';
import { user, medFiles } from '../data';
import type { MedFile } from '../types';

export default function ClinicalHistoryScreen() {
  const [files, setFiles] = useState<MedFile[]>(medFiles);
  const [expandedSection, setExpandedSection] = useState<string | null>('allergies');
  const [showExportConfirm, setShowExportConfirm] = useState(false);

  const toggleSection = (id: string) => setExpandedSection(expandedSection === id ? null : id);

  const handleFileUpload = () => {
    const mockFile: MedFile = {
      id: String(Date.now()),
      name: `Documento adjunto ${files.length + 1}`,
      type: 'PDF',
      date: new Date().toISOString().split('T')[0],
    };
    setFiles([mockFile, ...files]);
  };

  const sections = [
    {
      id: 'allergies',
      label: 'Alergias conocidas',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-cancelled" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      content: (
        <div className="flex flex-wrap gap-2 pt-1">
          {user.allergies.map((allergy) => (
            <span key={allergy} className="bg-cancelled-bg text-cancelled text-xs font-semibold px-3 py-1.5 rounded-full border border-cancelled/20">
              ⚠ {allergy}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'conditions',
      label: 'Enfermedades crónicas',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-pending" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ),
      content: (
        <ul className="pt-1 space-y-2">
          {user.conditions.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-app-text">
              <span className="w-1.5 h-1.5 rounded-full bg-pending mt-2 flex-shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
      {/* Header with security badge */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-app-text text-xl">Historia Clínica</h2>
        <div className="flex items-center gap-1.5 bg-secondary-50 text-secondary text-xs font-semibold px-3 py-1.5 rounded-full border border-secondary/20">
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="10" rx="2"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
          </svg>
          Alta seguridad
        </div>
      </div>

      {/* Key health info bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tipo de sangre', value: user.bloodType, color: 'bg-cancelled-bg text-cancelled' },
          { label: 'Alergias', value: `${user.allergies.length}`, color: 'bg-pending-bg text-pending' },
          { label: 'Condiciones', value: `${user.conditions.length}`, color: 'bg-primary-50 text-primary' },
        ].map((info) => (
          <div key={info.label} className={`${info.color} rounded-2xl p-3 text-center`}>
            <p className="text-2xl font-display font-bold">{info.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{info.label}</p>
          </div>
        ))}
      </div>

      {/* EPS info */}
      <div className="bg-surface rounded-2xl border border-app-border shadow-sm p-4">
        <p className="text-xs font-semibold text-muted-txt uppercase tracking-wider mb-2">Información de afiliación</p>
        <div className="space-y-2">
          {[
            { label: 'EPS', value: user.eps },
            { label: 'IPS Primaria', value: user.ips },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-muted-txt">{item.label}</span>
              <span className="font-semibold text-app-text">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion sections */}
      <section className="space-y-3">
        {sections.map((sec) => (
          <div key={sec.id} className="bg-surface rounded-2xl border border-app-border shadow-sm overflow-hidden">
            <button
              onClick={() => toggleSection(sec.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {sec.icon}
                <span className="font-semibold text-sm text-app-text">{sec.label}</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 text-muted-txt transition-transform ${expandedSection === sec.id ? 'rotate-180' : ''}`} stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {expandedSection === sec.id && (
              <div className="px-4 pb-4 border-t border-app-border/50">
                {sec.content}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Files section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-app-text">Archivos y exámenes</h3>
          <button
            onClick={handleFileUpload}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary-50 px-3 py-2 rounded-xl hover:bg-primary-100 transition-colors border border-primary-100"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Adjuntar
            <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-secondary" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="bg-surface rounded-2xl border border-app-border shadow-sm p-3.5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                file.type === 'PDF' ? 'bg-cancelled-bg' : 'bg-primary-50'
              }`}>
                {file.type === 'PDF' ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-cancelled" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-primary" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-app-text truncate">{file.name}</p>
                <p className="text-xs text-muted-txt">{file.type} · {new Date(file.date + 'T00:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-secondary" stroke="currentColor" strokeWidth="2" aria-label="Cifrado">
                  <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                <button className="text-xs text-primary font-medium hover:underline">Ver</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Export button */}
      <div className="pt-2">
        <button
          onClick={() => setShowExportConfirm(true)}
          className="w-full bg-primary text-white font-semibold py-4 rounded-2xl hover:bg-primary-hover transition-all shadow-md hover:shadow-lg font-display text-base flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exportar Resumen Clínico en PDF
        </button>
        <p className="text-center text-xs text-muted-txt mt-2">
          Genera un documento seguro con tu información médica esencial
        </p>
      </div>

      {/* Export confirm modal */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4" onClick={() => setShowExportConfirm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary" stroke="currentColor" strokeWidth="1.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/>
              </svg>
            </div>
            <h3 className="font-display font-bold text-app-text text-lg mb-2">Exportar historia clínica</h3>
            <p className="text-sm text-muted-txt mb-5">El PDF incluirá tus datos personales, alergias, condiciones, afiliación y archivos adjuntos. Está cifrado con tu contraseña.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowExportConfirm(false)} className="flex-1 py-3 rounded-xl border border-app-border text-sm font-semibold text-muted-txt hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowExportConfirm(false);
                  alert('Resumen clínico generado exitosamente. (Demo)');
                }}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}
