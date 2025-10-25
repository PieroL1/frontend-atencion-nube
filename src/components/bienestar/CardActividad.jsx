// src/components/bienestar/CardActividad.jsx
import { useState } from "react";
import { formatearFechaHora } from "./helpers";
import ModalActividadDetalle from "./ModalActividadDetalle";

const TIPOS_ACT = {
  Deportiva: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50",
  Cultural: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50",
  Integración: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50",
};

export default function CardActividad({ actividad }) {
  const [showModal, setShowModal] = useState(false);
  const { fecha, hora } = formatearFechaHora(actividad.event_date);

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="bg-white dark:bg-night rounded-lg border border-gray-200 dark:border-slate/20 p-5 hover:shadow-md dark:hover:shadow-slate/10 transition-all cursor-pointer hover:scale-[1.02] hover:border-primary/50 dark:hover:border-primary/30"
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-ink dark:text-slate text-lg flex-1">{actividad.name}</h3>
          {actividad.code && (
            <span className="text-xs text-slate dark:text-slate/70 ml-2">#{actividad.code}</span>
          )}
        </div>

        <span className={`inline-block px-3 py-1 rounded-md text-xs font-medium border mb-3 ${TIPOS_ACT[actividad.type] || "bg-gray-50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-400"}`}>
          {actividad.type}
        </span>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-sm text-ink dark:text-slate">
            <svg className="w-4 h-4 mr-2 text-slate dark:text-slate/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {fecha} - {hora}
          </div>
        </div>

        {actividad.description && (
          <p className="text-sm text-slate dark:text-slate/70 line-clamp-2 mb-3">
            {actividad.description}
          </p>
        )}

        {/* Indicador de "Ver más" */}
        <div className="flex items-center justify-end text-primary text-sm font-medium group-hover:underline">
          <span className="mr-1">Ver detalles</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Modal de detalle */}
      {showModal && (
        <ModalActividadDetalle 
          actividad={actividad} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
