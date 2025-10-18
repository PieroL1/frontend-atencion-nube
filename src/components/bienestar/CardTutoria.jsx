// src/components/bienestar/CardTutoria.jsx
import { formatearFechaHora } from "./helpers";

const ESTADOS = {
  Pendiente: "bg-yellow-100 text-yellow-800",
  Agendada: "bg-blue-100 text-blue-800",
  Realizada: "bg-green-100 text-green-800",
  Cancelada: "bg-gray-100 text-gray-600",
};

const TIPOS = {
  Académica: "bg-purple-50 text-purple-700 border-purple-200",
  Psicológica: "bg-pink-50 text-pink-700 border-pink-200",
};

export default function CardTutoria({ tutoria, onCancelar, showCancelar = true }) {
  const { fecha, hora } = formatearFechaHora(tutoria.scheduled_date);
  const puedeCancel = 
    showCancelar &&
    (tutoria.state === "Pendiente" || tutoria.state === "Agendada") &&
    new Date(tutoria.scheduled_date).getTime() >= Date.now();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-md text-xs font-medium border ${TIPOS[tutoria.type] || "bg-gray-50 text-gray-700"}`}>
            {tutoria.type}
          </span>
          {tutoria.code && (
            <span className="text-xs text-slate">#{tutoria.code}</span>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADOS[tutoria.state] || "bg-gray-100 text-gray-600"}`}>
          {tutoria.state}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-ink">
          <svg className="w-4 h-4 mr-2 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fecha} - {hora}
        </div>
        <div className="flex items-center text-sm text-slate">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {tutoria.instructor ? (
            `Instructor: ${tutoria.instructor.first_name || ''} ${tutoria.instructor.last_name || ''}`.trim()
          ) : (
            `Instructor ID: ${tutoria.instructor_id}`
          )}
        </div>
      </div>

      {puedeCancel && onCancelar && (
        <button
          onClick={() => onCancelar(tutoria)}
          className="w-full py-2 px-4 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors"
        >
          Cancelar Tutoría
        </button>
      )}
    </div>
  );
}
