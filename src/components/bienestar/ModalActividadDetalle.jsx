// src/components/bienestar/ModalActividadDetalle.jsx
import { formatearFechaHora } from "./helpers";

const TIPOS_ACT = {
  Deportiva: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800/50",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  Cultural: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800/50",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    )
  },
  Integración: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800/50",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
};

export default function ModalActividadDetalle({ actividad, onClose }) {
  if (!actividad) return null;

  const { fecha, hora } = formatearFechaHora(actividad.event_date);
  const tipoConfig = TIPOS_ACT[actividad.type] || {
    bg: "bg-gray-50 dark:bg-gray-800/30",
    text: "text-gray-700 dark:text-gray-400",
    border: "border-gray-200 dark:border-gray-700",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    )
  };

  // Función para procesar saltos de línea
  const formatDescription = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-night rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${tipoConfig.bg} ${tipoConfig.text}`}>
                {tipoConfig.icon}
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-medium border ${tipoConfig.bg} ${tipoConfig.text} ${tipoConfig.border}`}>
                  {actividad.type}
                </span>
                {actividad.code && (
                  <span className="ml-2 text-xs opacity-80">#{actividad.code}</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-2xl font-bold">{actividad.name}</h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Fecha y Hora */}
            <div className="flex items-start gap-3 bg-gray-50 dark:bg-slate/10 p-4 rounded-lg">
              <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-ink dark:text-slate mb-1">Fecha y Hora</h3>
                <p className="text-slate dark:text-slate/70">
                  <span className="font-medium">{fecha}</span>
                  <span className="mx-2">•</span>
                  <span>{hora}</span>
                </p>
              </div>
            </div>

            {/* Descripción */}
            {actividad.description && (
              <div>
                <h3 className="font-semibold text-ink dark:text-slate mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descripción
                </h3>
                <div className="bg-gray-50 dark:bg-slate/10 p-4 rounded-lg">
                  <p className="text-slate dark:text-slate/80 leading-relaxed whitespace-pre-wrap">
                    {formatDescription(actividad.description)}
                  </p>
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate/20">
              <div className="text-center p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
                <p className="text-xs text-slate dark:text-slate/70 mb-1">Estado</p>
                <p className="font-semibold text-ink dark:text-slate">
                  {new Date(actividad.event_date) > new Date() ? "Próximamente" : "Finalizada"}
                </p>
              </div>
              <div className="text-center p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
                <p className="text-xs text-slate dark:text-slate/70 mb-1">Categoría</p>
                <p className="font-semibold text-ink dark:text-slate">{actividad.type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate/10 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-slate/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-night border border-gray-300 dark:border-slate/30 text-ink dark:text-slate rounded-lg hover:bg-gray-50 dark:hover:bg-night/70 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
