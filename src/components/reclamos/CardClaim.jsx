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
      className={`bg-white dark:bg-night rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] animate-fade-in ${
        !claim.priority 
          ? 'border-2 border-amber-400 dark:border-amber-600 shadow-lg shadow-amber-500/20' 
          : 'border-2 border-gray-200 dark:border-slate/20'
      }`}
    >
      {/* Badge "Sin revisar" mejorado */}
      {!claim.priority && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/30 text-amber-700 dark:text-amber-400 border-2 border-amber-300 dark:border-amber-700 shadow-sm animate-pulse">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Sin revisar
          </span>
        </div>
      )}

      {/* Header mejorado: Tipo, ID y Prioridad */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${
              claim.type === 'Reclamo'
                ? 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700'
                : 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
            }`}
          >
            {claim.type === 'Reclamo' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
            {claim.type}
          </span>
          {claim.code && (
            <span className="px-2 py-1 bg-slate/10 dark:bg-slate/20 rounded-lg text-xs font-mono font-bold text-slate dark:text-slate/70">
              #{claim.code}
            </span>
          )}
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border-2 shadow-sm ${getPrioridadColor(claim.priority)}`}>
          {claim.priority || 'Sin asignar'}
        </span>
      </div>

      {/* Categoría mejorada */}
      {claim.category && (
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg">
            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-ink dark:text-slate">
            {claim.category}
          </span>
        </div>
      )}

      {/* Descripción */}
      <p className="text-sm text-slate dark:text-slate/80 mb-4 line-clamp-3 leading-relaxed">
        {claim.description}
      </p>

      {/* Footer mejorado: Estado, fecha y datos adicionales */}
      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 dark:border-slate/10">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getEstadoColor(claim.state)}`}>
            {getEstadoLabel(claim.state)}
          </span>
          <div className="flex items-center gap-1 text-slate dark:text-slate/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">{formatDate(claim.creation_date)}</span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Info adicional según contexto */}
      {(showStudent || showResponsible) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate/10">
          {showStudent && claim.student_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate dark:text-slate/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{claim.student_name}</span>
            </div>
          )}
          {showResponsible && claim.responsible_name && (
            <div className="flex items-center gap-1.5 text-xs text-slate dark:text-slate/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="font-medium">{claim.responsible_name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CardClaim;
