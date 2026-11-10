import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initGlobalTouchInteractivity } from './utils/haptics'

// Activa el motor táctil y háptico en todo el dispositivo
initGlobalTouchInteractivity()

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error capturado en ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-3xl mb-4">
            ⚠️
          </div>
          <h1 className="text-xl font-bold mb-2">Error de Inicialización</h1>
          <p className="text-xs text-slate-400 max-w-md mb-4">
            Ocurrió un error al cargar la aplicación. Detalles técnicos:
          </p>
          <pre className="bg-black/50 p-4 rounded-xl text-left text-[11px] text-red-300 max-w-lg overflow-x-auto border border-red-500/30">
            {this.state.error?.stack || this.state.error?.message || 'Error desconocido'}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs"
          >
            Recargar Aplicación
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
