/**
 * RECLAMO DETALLE
 * Página para ver el detalle de un reclamo/sugerencia y sus asignaciones
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaim, listarAsignaciones, getEstadoColor, getPrioridadColor, getEstadoLabel } from '../../services/reclamos';
import CardAssignment from '../../components/reclamos/CardAssignment';
import EmptyState from '../../components/reclamos/EmptyState';

const ReclamoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [claim, setClaim] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [claimData, assignmentsData] = await Promise.all([
        getClaim(id),
        listarAsignaciones(id),
      ]);
      
      setClaim(claimData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      // Si hay error 404, redirigir al listado
      if (error.response?.status === 404) {
        navigate('/reclamos', { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26BBFF]"></div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            icon="❌"
            title="Reclamo no encontrado"
            message="El reclamo que buscas no existe o no tienes permisos para verlo."
            action={
              <button
                onClick={() => navigate('/reclamos')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#26BBFF] hover:bg-[#1da9e6]"
              >
                Volver al listado
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/reclamos')}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← Volver al listado
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    claim.type === 'Reclamo'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {claim.type}
                </span>
                {claim.code && (
                  <span className="text-sm text-gray-500">#{claim.code}</span>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {claim.category || 'Sin categoría'}
              </h1>
              
              <p className="text-sm text-gray-500">
                Creado el {formatDate(claim.creation_date)}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${getEstadoColor(claim.state)}`}>
                {getEstadoLabel(claim.state)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${getPrioridadColor(claim.priority)}`}>
                {claim.priority ? `Prioridad: ${claim.priority}` : '⚠️ Sin revisar'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Descripción */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Descripción
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {claim.description}
          </p>
        </div>

        {/* Asignaciones / Historial */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Historial de Seguimiento
          </h2>
          
          {assignments.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Sin seguimiento"
              message="Aún no hay comentarios o actualizaciones para este reclamo."
            />
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <CardAssignment
                  key={assignment.id}
                  assignment={assignment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReclamoDetalle;
