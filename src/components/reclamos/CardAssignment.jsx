/**
 * CARD ASSIGNMENT
 * Tarjeta para mostrar una asignación/comentario en el detalle del reclamo
 */

import React from 'react';

const CardAssignment = ({ assignment }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-night/50 border border-gray-200 dark:border-slate/20 rounded-lg p-4">
      {/* Header: Responsable y fecha */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-sm font-semibold text-ink dark:text-slate">
            {assignment.responsible_name || `Responsable #${assignment.responsible_id}`}
          </div>
          {assignment.code && (
            <div className="text-xs text-slate dark:text-slate/70">
              Asignación #{assignment.code}
            </div>
          )}
        </div>
        <div className="text-xs text-slate dark:text-slate/70">
          {formatDate(assignment.event_date)}
        </div>
      </div>

      {/* Comentarios */}
      {assignment.comments && (
        <div className="text-sm text-slate dark:text-slate/70 mt-2">
          {assignment.comments}
        </div>
      )}
    </div>
  );
};

export default CardAssignment;
