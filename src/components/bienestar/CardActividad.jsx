// src/components/bienestar/CardActividad.jsx
import { formatearFechaHora } from "./helpers";

const TIPOS_ACT = {
  Deportiva: "bg-blue-50 text-blue-700 border-blue-200",
  Cultural: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Integración: "bg-green-50 text-green-700 border-green-200",
};

export default function CardActividad({ actividad }) {
  const { fecha, hora } = formatearFechaHora(actividad.event_date);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-ink text-lg flex-1">{actividad.name}</h3>
        {actividad.code && (
          <span className="text-xs text-slate ml-2">#{actividad.code}</span>
        )}
      </div>

      <span className={`inline-block px-3 py-1 rounded-md text-xs font-medium border mb-3 ${TIPOS_ACT[actividad.type] || "bg-gray-50 text-gray-700"}`}>
        {actividad.type}
      </span>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-ink">
          <svg className="w-4 h-4 mr-2 text-slate flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fecha} - {hora}
        </div>
      </div>

      {actividad.description && (
        <p className="text-sm text-slate line-clamp-2">
          {actividad.description}
        </p>
      )}
    </div>
  );
}
