import type { MedFile } from '../types';

interface FileViewerModalProps {
  file: MedFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FileViewerModal({ file, isOpen, onClose }: FileViewerModalProps) {
  if (!isOpen || !file) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Visor de Archivo Clínico Cifrado (AES-256)</p>
              <h3 className="font-semibold text-sm truncate text-white">{file.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* File Simulated Viewer Content */}
        <div className="p-6 bg-slate-50 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-50 px-2.5 py-1 rounded-md">
                  {file.category}
                </span>
                <p className="text-xs text-slate-400 mt-1">Institución: {file.institution}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p><strong>Fecha:</strong> {file.date}</p>
                <p><strong>Tamaño:</strong> {file.size}</p>
              </div>
            </div>

            {/* Visual simulation based on file type */}
            {file.type === 'Radiografía' || file.type === 'Imagen' ? (
              <div className="bg-slate-900 rounded-xl p-4 text-center text-slate-300 my-2 relative overflow-hidden">
                <div className="h-56 flex flex-col items-center justify-center bg-radial from-slate-700 to-slate-950 rounded-lg border border-slate-800 p-4">
                  <svg viewBox="0 0 24 24" fill="none" className="w-16 h-16 text-slate-500 mb-2" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">Proyección diagnóstica en alta resolución</p>
                  <span className="mt-3 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                    VERIFIED_DIGITAL_SIGNATURE: OK
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-4 my-2 font-mono text-xs space-y-2">
                <div className="border-b border-slate-100 pb-2">
                  <p className="font-bold text-slate-800">INFORME DE LABORATORIO CLÍNICO / RESULTADOS</p>
                  <p className="text-[11px] text-slate-500">Paciente: María Rodríguez | CC: 1.024.567.890</p>
                </div>
                <div className="space-y-1.5 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Glucosa en ayunas:</span>
                    <span className="font-bold text-slate-900">110 mg/dL (Normal: 70 - 100)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Hemoglobina Glicosilada (HbA1c):</span>
                    <span className="font-bold text-amber-700">6.4% (Meta control &lt; 7.0%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Colesterol Total:</span>
                    <span className="font-bold text-slate-900">182 mg/dL (Deseable &lt; 200)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Triglicéridos:</span>
                    <span className="font-bold text-slate-900">145 mg/dL (Normal &lt; 150)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Creatinina Sérica:</span>
                    <span className="font-bold text-slate-900">0.85 mg/dL (Normal: 0.6 - 1.1)</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                  Firmado electrónicamente por: Dr. Roberto Suárez (Bacteriólogo Reg. 45892)
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Protocolo OMS Ciberseguridad
              </span>
              <span>Integridad SHA-256 Validada</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              alert('Descargando archivo médico cifrado para uso local...');
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover flex items-center gap-1.5"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar archivo seguro
          </button>
        </div>
      </div>
    </div>
  );
}
