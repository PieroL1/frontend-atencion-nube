// src/components/bienestar/CardTutoria.jsx
import { formatearFechaHora } from "./helpers";

const ESTADOS = {
  Pendiente: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  Agendada: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  Realizada: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800",
  Cancelada: "bg-gray-100 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const TIPOS = {
  Académica: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700",
  Psicológica: "bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20 text-pink-700 dark:text-pink-400 border-pink-300 dark:border-pink-700",
};

const ICONOS_TIPO = {
  Académica: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
    </svg>
  ),
  Psicológica: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  ),
};

export default function CardTutoria({ tutoria, onCancelar, showCancelar = true }) {
  const { fecha, hora } = formatearFechaHora(tutoria.scheduled_date);
  const puedeCancel = 
    showCancelar &&
    (tutoria.state === "Pendiente" || tutoria.state === "Agendada") &&
    new Date(tutoria.scheduled_date).getTime() >= Date.now();

  return (
    <div className="bg-white dark:bg-night rounded-2xl border-2 border-gray-200 dark:border-slate/20 p-6 hover:shadow-xl dark:hover:shadow-slate/10 transition-all duration-300 hover:scale-[1.02] group animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 flex items-center gap-1.5 ${TIPOS[tutoria.type] || "bg-gray-50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-400 border-gray-300"}`}>
            {ICONOS_TIPO[tutoria.type]}
            {tutoria.type}
          </span>
          {tutoria.code && (
            <span className="px-2 py-1 bg-slate/10 dark:bg-slate/20 rounded-lg text-xs font-mono text-slate dark:text-slate/70">
              #{tutoria.code}
            </span>
          )}
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 shadow-sm ${ESTADOS[tutoria.state] || "bg-gray-100 dark:bg-gray-800/30 text-gray-600 dark:text-gray-400 border-gray-200"}`}>
          {tutoria.state}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-center text-sm font-semibold text-ink dark:text-slate">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/30 rounded-lg mr-3">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-slate dark:text-slate/70 mb-0.5">Programada para</div>
            <div>{fecha} - {hora}</div>
          </div>
        </div>
        <div className="flex items-center text-sm font-semibold text-slate dark:text-slate/70">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-800/30 rounded-lg mr-3">
            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-slate dark:text-slate/70 mb-0.5">Instructor</div>
            <div>{tutoria.instructor?.name || 'Sin asignar'}</div>
          </div>
        </div>
      </div>

      {puedeCancel && onCancelar && (
        <button
          onClick={() => onCancelar(tutoria)}
          className="w-full py-3 px-4 border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar Tutoría
        </button>
      )}
    </div>
  );
}
