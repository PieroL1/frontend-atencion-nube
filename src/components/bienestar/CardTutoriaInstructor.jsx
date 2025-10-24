// src/components/bienestar/CardTutoriaInstructor.jsx
import { useState } from "react";
import { formatearFechaHora } from "./helpers";
import { accionesDisponibles } from "./instructorHelpers";
import { patchEstadoTutoria } from "../../services/bienestar";
import { toast } from "../../utils/toast";

const ESTADOS = {
  Pendiente: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
  Agendada: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400",
  Realizada: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400",
  Cancelada: "bg-gray-100 dark:bg-slate/20 text-gray-600 dark:text-slate",
};

const TIPOS = {
  Académica: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700/30",
  Psicológica: "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-700/30",
};

export default function CardTutoriaInstructor({
  tutoria,
  onActualizar,
  onRegistrarAsistencia,
}) {
  const [loading, setLoading] = useState(false);
  const { fecha, hora } = formatearFechaHora(tutoria.scheduled_date);
  const acciones = accionesDisponibles(tutoria);

  const handleCambiarEstado = async (nuevoEstado) => {
    const confirmaciones = {
      Agendada: "¿Aceptar esta tutoría?",
      Cancelada: "¿Cancelar esta tutoría?",
      Realizada: "¿Marcar como realizada?",
    };

    if (!window.confirm(confirmaciones[nuevoEstado])) return;

    setLoading(true);
    try {
      await patchEstadoTutoria(tutoria.id, nuevoEstado, `Cambiado a ${nuevoEstado}`);
      toast.success(`Tutoría marcada como ${nuevoEstado}`);
      if (onActualizar) onActualizar();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      toast.error("Error al actualizar la tutoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-night rounded-lg border border-gray-200 dark:border-slate/20 p-5 hover:shadow-md dark:hover:shadow-slate/20 transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-md text-xs font-medium border ${
              TIPOS[tutoria.type] || "bg-gray-50 dark:bg-slate/20 text-gray-700 dark:text-slate"
            }`}
          >
            {tutoria.type}
          </span>
          {tutoria.code && <span className="text-xs text-slate dark:text-slate/70">#{tutoria.code}</span>}
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            ESTADOS[tutoria.state] || "bg-gray-100 dark:bg-slate/20 text-gray-600 dark:text-slate"
          }`}
        >
          {tutoria.state}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-ink dark:text-slate">
          <svg
            className="w-4 h-4 mr-2 text-slate dark:text-slate/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {fecha} - {hora}
        </div>
        <div className="flex items-center text-sm text-slate dark:text-slate/70">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          {tutoria.student ? (
            `Estudiante: ${tutoria.student.first_name || ''} ${tutoria.student.last_name || ''}`.trim()
          ) : (
            `Estudiante ID: ${tutoria.student_id}`
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="space-y-2">
        {acciones.puedeAceptar && (
          <button
            onClick={() => handleCambiarEstado("Agendada")}
            disabled={loading}
            className="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            ✓ Aceptar
          </button>
        )}

        {acciones.puedeMarcarRealizada && (
          <button
            onClick={() => handleCambiarEstado("Realizada")}
            disabled={loading}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            ✓ Marcar Realizada
          </button>
        )}

        {acciones.puedeRegistrarAsistencia && onRegistrarAsistencia && (
          <button
            onClick={() => onRegistrarAsistencia(tutoria)}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            📝 Registrar Asistencia
          </button>
        )}

        {acciones.puedeCancelar && (
          <button
            onClick={() => handleCambiarEstado("Cancelada")}
            disabled={loading}
            className="w-full py-2 px-4 border border-red-300 dark:border-red-700/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors disabled:opacity-50"
          >
            ✕ Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
