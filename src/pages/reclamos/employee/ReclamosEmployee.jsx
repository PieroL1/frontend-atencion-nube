/**
 * RECLAMOS EMPLOYEE
 * Página para que los empleados gestionen reclamos/sugerencias
 * Permite listar, filtrar, cambiar estado y agregar comentarios
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  listarClaims, 
  patchEstadoClaim, 
  crearAsignacion,
  listarAsignaciones,
  TIPOS, 
  ESTADOS, 
  PRIORIDADES 
} from '../../../services/reclamos';
import { CardClaim, CardAssignment, EmptyState, DemoBanner } from '../../../components/reclamos';
import { useDemoMode } from '../../../hooks/useDemoMode';

const ReclamosEmployee = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDemoMode = useDemoMode(); // Hook para detectar modo demo
  
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showChangeStateModal, setShowChangeStateModal] = useState(false);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    priority: searchParams.get('priority') || '',
    state: searchParams.get('state') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    q: searchParams.get('q') || '',
  });

  // Estados para formularios
  const [newState, setNewState] = useState('');
  const [stateNote, setStateNote] = useState('');
  const [commentText, setCommentText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadClaims();
  }, [searchParams]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const params = {
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      };

      const data = await listarClaims(params);
      setClaims(data);
    } catch (error) {
      console.error('Error al cargar reclamos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClaimDetail = async (claim) => {
    setSelectedClaim(claim);
    try {
      const assignmentsData = await listarAsignaciones(claim.id);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
      setAssignments([]);
    }
    setShowDetailModal(true);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      priority: '',
      state: '',
      from: '',
      to: '',
      q: '',
    });
    setSearchParams({});
  };

  const openChangeStateModal = (claim) => {
    setSelectedClaim(claim);
    setNewState(claim.state);
    setStateNote('');
    setShowChangeStateModal(true);
  };

  const openAddCommentModal = (claim) => {
    setSelectedClaim(claim);
    setCommentText('');
    setShowAddCommentModal(true);
  };

  const handleChangeState = async () => {
    if (!selectedClaim || !newState) return;

    setActionLoading(true);
    try {
      // 1. Actualizar estado y prioridad del claim
      await patchEstadoClaim(selectedClaim.id, {
        new_state: newState,
        priority: selectedClaim.priority, // Incluir prioridad actualizada
      });
      
      // 2. Si hay nota, crear asignación separada
      if (stateNote.trim()) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Validar que existe employee_id
        if (!user.employee_id) {
          alert('Error: No se encontró el ID de empleado. Por favor, cierra sesión e inicia sesión nuevamente.');
          setActionLoading(false);
          return;
        }
        
        await crearAsignacion(selectedClaim.id, {
          responsible_id: user.employee_id,
          comments: `Estado cambiado a ${newState}. ${stateNote.trim()}`,
        });
      }
      
      // 3. Actualizar lista
      await loadClaims();
      
      // 4. Cerrar modal
      setShowChangeStateModal(false);
      setSelectedClaim(null);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedClaim || !commentText.trim()) return;

    setActionLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('👤 Usuario desde localStorage:', user);
      console.log('🆔 employee_id:', user.employee_id, '| user.id:', user.id);
      
      // Validar que existe employee_id
      if (!user.employee_id) {
        alert('Error: No se encontró el ID de empleado. Por favor, cierra sesión e inicia sesión nuevamente.');
        setActionLoading(false);
        return;
      }
      
      await crearAsignacion(selectedClaim.id, {
        responsible_id: user.employee_id,
        comments: commentText.trim(),
      });
      
      // Actualizar lista
      await loadClaims();
      
      // Cerrar modal
      setShowAddCommentModal(false);
      setSelectedClaim(null);
      setCommentText('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      console.error('Detalles del error:', error.response?.data);
    } finally {
      setActionLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ink">
      {/* Header */}
      <div className="bg-white dark:bg-night border-b border-gray-200 dark:border-slate/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-ink dark:text-slate">
            Gestión de Reclamos y Sugerencias
          </h1>
          <p className="mt-1 text-sm text-slate dark:text-slate/70">
            Administra y da seguimiento a los reclamos/sugerencias
          </p>
        </div>
      </div>

      {/* Banner de modo demo */}
      {isDemoMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DemoBanner />
        </div>
      )}

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-night rounded-lg shadow-sm dark:shadow-slate/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary text-sm"
              >
                <option value="">Todos</option>
                <option value={TIPOS.RECLAMO}>Reclamo</option>
                <option value={TIPOS.SUGERENCIA}>Sugerencia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">Prioridad</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary text-sm"
              >
                <option value="">Todas</option>
                <option value="unassigned">🔔 Sin revisar</option>
                <option value={PRIORIDADES.ALTA}>Alta</option>
                <option value={PRIORIDADES.MEDIA}>Media</option>
                <option value={PRIORIDADES.BAJA}>Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">Estado</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary text-sm"
              >
                <option value="">Todos</option>
                <option value={ESTADOS.AGENDADA}>Pendiente</option>
                <option value={ESTADOS.REALIZADA}>Atendida</option>
                <option value={ESTADOS.CANCELADA}>Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">Desde</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">Hasta</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate placeholder:text-gray-400 dark:placeholder:text-slate/50 shadow-sm focus:border-primary focus:ring-primary text-sm"
              />
            </div>
          </div>

          {Object.values(filters).some(v => v !== '') && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : claims.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No hay reclamos/sugerencias"
            message="No se encontraron reclamos o sugerencias con los filtros seleccionados."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {claims.map((claim) => (
              <div key={claim.id} className="space-y-2">
                {/* Card del reclamo */}
                <div onClick={() => loadClaimDetail(claim)} className="cursor-pointer">
                  <CardClaim
                    claim={claim}
                    showStudent={true}
                  />
                </div>
                
                {/* Acciones rápidas - FUERA del card, debajo */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openChangeStateModal(claim);
                    }}
                    className="flex-1 px-3 py-2 bg-white dark:bg-night border border-gray-300 dark:border-slate/30 rounded-md shadow-sm hover:bg-blue-50 dark:hover:bg-primary/20 hover:border-blue-400 dark:hover:border-primary text-sm font-medium text-ink dark:text-slate transition-colors flex items-center justify-center gap-2"
                  >
                    🔄 <span className="hidden sm:inline">Cambiar estado</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddCommentModal(claim);
                    }}
                    className="flex-1 px-3 py-2 bg-white dark:bg-night border border-gray-300 dark:border-slate/30 rounded-md shadow-sm hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-700 text-sm font-medium text-ink dark:text-slate transition-colors flex items-center justify-center gap-2"
                  >
                    💬 <span className="hidden sm:inline">Comentar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Detalle del reclamo */}
      {showDetailModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-night rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-ink dark:text-slate">Detalle del Reclamo</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate dark:text-slate/70">Categoría</p>
                  <p className="text-base font-semibold text-ink dark:text-slate">{selectedClaim.category}</p>
                </div>

                <div>
                  <p className="text-sm text-slate dark:text-slate/70">Descripción</p>
                  <p className="text-base text-ink dark:text-slate">{selectedClaim.description}</p>
                </div>

                <div>
                  <p className="text-sm text-slate dark:text-slate/70 mb-2">Historial de Seguimiento</p>
                  {assignments.length === 0 ? (
                    <p className="text-sm text-slate dark:text-slate/70">Sin seguimiento</p>
                  ) : (
                    <div className="space-y-2">
                      {assignments.map((assignment) => (
                        <CardAssignment key={assignment.id} assignment={assignment} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar estado */}
      {showChangeStateModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-night rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-ink dark:text-slate mb-4">Cambiar Estado</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate dark:text-slate/70 mb-2">
                    Nuevo Estado
                  </label>
                  <select
                    value={newState}
                    onChange={(e) => setNewState(e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value={ESTADOS.AGENDADA}>Pendiente</option>
                    <option value={ESTADOS.REALIZADA}>Atendida</option>
                    <option value={ESTADOS.CANCELADA}>Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate dark:text-slate/70 mb-2">
                    Prioridad {!selectedClaim.priority && <span className="text-amber-600 dark:text-amber-400">(Sin asignar)</span>}
                  </label>
                  <select
                    value={selectedClaim.priority || ''}
                    onChange={(e) => {
                      // Actualizar prioridad en el claim seleccionado
                      setSelectedClaim({ ...selectedClaim, priority: e.target.value || null });
                    }}
                    className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary"
                  >
                    <option value="">Sin asignar</option>
                    <option value={PRIORIDADES.ALTA}>Alta</option>
                    <option value={PRIORIDADES.MEDIA}>Media</option>
                    <option value={PRIORIDADES.BAJA}>Baja</option>
                  </select>
                  <p className="mt-1 text-xs text-slate dark:text-slate/70">
                    La prioridad se guarda junto con el cambio de estado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate dark:text-slate/70 mb-2">
                    Nota (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={stateNote}
                    onChange={(e) => setStateNote(e.target.value)}
                    placeholder="Agrega una nota sobre el cambio..."
                    className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate placeholder:text-gray-400 dark:placeholder:text-slate/50 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowChangeStateModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 dark:border-slate/30 rounded-md text-sm font-medium text-ink dark:text-slate hover:bg-gray-50 dark:hover:bg-night/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeState}
                  disabled={actionLoading || !newState}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Agregar comentario */}
      {showAddCommentModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-night rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-ink dark:text-slate mb-4">Agregar Comentario</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate dark:text-slate/70 mb-2">
                  Comentario
                </label>
                <textarea
                  rows={5}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario sobre el seguimiento..."
                  maxLength={500}
                  className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate placeholder:text-gray-400 dark:placeholder:text-slate/50 shadow-sm focus:border-primary focus:ring-primary"
                />
                <p className="mt-1 text-xs text-slate dark:text-slate/70 text-right">
                  {commentText.length} / 500
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddCommentModal(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 dark:border-slate/30 rounded-md text-sm font-medium text-ink dark:text-slate hover:bg-gray-50 dark:hover:bg-night/50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={actionLoading || !commentText.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReclamosEmployee;
