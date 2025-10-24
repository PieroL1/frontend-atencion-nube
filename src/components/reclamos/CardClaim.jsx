/**
 * CARD CLAIM
 * Tarjeta para mostrar un reclamo/sugerencia en el listado
 */

import React from 'react';
import { getEstadoColor, getPrioridadColor, getEstadoLabel } from '../../services/reclamos';

const CardClaim = ({ claim, onClick, showStudent = false, showResponsible = false }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-night border rounded-lg p-4 hover:shadow-md dark:hover:shadow-slate/20 transition-shadow cursor-pointer ${
        !claim.priority ? 'border-amber-300 dark:border-amber-700 border-2' : 'border-gray-200 dark:border-slate/20'
      }`}
    >
      {/* Badge "Sin revisar" para reclamos sin prioridad */}
      {!claim.priority && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
            ⚠️ Sin revisar
          </span>
        </div>
      )}

      {/* Header: Tipo y código */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              claim.type === 'Reclamo'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
            }`}
          >
            {claim.type}
          </span>
          {claim.code && (
            <span className="text-xs text-slate dark:text-slate/70">#{claim.code}</span>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPrioridadColor(claim.priority)}`}>
          {claim.priority || 'Sin asignar'}
        </span>
      </div>

      {/* Categoría */}
      {claim.category && (
        <div className="text-sm font-semibold text-ink dark:text-slate mb-2">
          {claim.category}
        </div>
      )}

      {/* Descripción */}
      <p className="text-sm text-slate dark:text-slate/70 mb-3 line-clamp-2">
        {claim.description}
      </p>

      {/* Footer: Estado, fecha y datos adicionales */}
      <div className="flex items-center justify-between text-xs text-slate dark:text-slate/70">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEstadoColor(claim.state)}`}>
            {getEstadoLabel(claim.state)}
          </span>
          <span>{formatDate(claim.creation_date)}</span>
        </div>

        {/* Info adicional según contexto */}
        <div className="flex items-center gap-2">
          {showStudent && claim.student_name && (
            <span className="text-slate dark:text-slate/70">
              {claim.student_name}
            </span>
          )}
          {showResponsible && claim.responsible_name && (
            <span className="text-slate dark:text-slate/70">
              {claim.responsible_name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardClaim;
