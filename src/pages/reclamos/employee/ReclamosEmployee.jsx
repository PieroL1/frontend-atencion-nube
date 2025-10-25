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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-coal dark:to-ink">
      {/* Header mejorado */}
      <div className="bg-white dark:bg-night border-b-2 border-gray-200 dark:border-slate/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-ink dark:text-slate">
                Gestión de Reclamos y Sugerencias
              </h1>
              <p className="mt-1 text-lg text-slate dark:text-slate/70">
                Administra y da seguimiento a los reclamos/sugerencias de estudiantes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Banner de modo demo */}
      {isDemoMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DemoBanner />
        </div>
      )}

      {/* Filtros mejorados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 p-6 mb-8 border border-gray-200 dark:border-slate/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-ink dark:text-slate">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              >
                <option value="">Todos</option>
                <option value={TIPOS.RECLAMO}>Reclamo</option>
                <option value={TIPOS.SUGERENCIA}>Sugerencia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">Prioridad</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              >
                <option value="">Todas</option>
                <option value="unassigned">🔔 Sin revisar</option>
                <option value={PRIORIDADES.ALTA}>Alta</option>
                <option value={PRIORIDADES.MEDIA}>Media</option>
                <option value={PRIORIDADES.BAJA}>Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">Estado</label>
              <select
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              >
                <option value="">Todos</option>
                <option value={ESTADOS.AGENDADA}>Pendiente</option>
                <option value={ESTADOS.REALIZADA}>Atendida</option>
                <option value={ESTADOS.CANCELADA}>Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">Desde</label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">Hasta</label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate placeholder:text-slate/50 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              />
            </div>
          </div>

          {Object.values(filters).some(v => v !== '') && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors px-4 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 dark:border-orange-900/30"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 absolute top-0 left-0"></div>
            </div>
            <p className="mt-4 text-slate dark:text-slate/70 font-medium">Cargando reclamos...</p>
          </div>
        ) : claims.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No hay reclamos/sugerencias"
            message="No se encontraron reclamos o sugerencias con los filtros seleccionados."
          />
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-ink dark:text-slate">
                  Resultados
                </h2>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-bold">
                  {claims.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {claims.map((claim) => (
                <div key={claim.id} className="space-y-3">
                  {/* Card del reclamo */}
                  <div onClick={() => loadClaimDetail(claim)} className="cursor-pointer">
                    <CardClaim
                      claim={claim}
                      showStudent={true}
                    />
                  </div>
                  
                  {/* Acciones rápidas mejoradas */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openChangeStateModal(claim);
                      }}
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-night border-2 border-blue-300 dark:border-blue-700 rounded-xl shadow-sm hover:shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 text-sm font-bold text-blue-700 dark:text-blue-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="hidden sm:inline">Cambiar estado</span>
                      <span className="sm:hidden">Estado</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddCommentModal(claim);
                      }}
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-night border-2 border-green-300 dark:border-green-700 rounded-xl shadow-sm hover:shadow-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-600 text-sm font-bold text-green-700 dark:text-green-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="hidden sm:inline">Comentar</span>
                      <span className="sm:hidden">Nota</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Detalle del reclamo mejorado */}
      {showDetailModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-night rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-200 dark:border-slate/20 animate-scale-in custom-scrollbar">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 border-b-2 border-orange-600 dark:border-red-700 z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Detalle del Reclamo</h2>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border-2 border-orange-200 dark:border-orange-800">
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-1 uppercase tracking-wide">Categoría</p>
                <p className="text-lg font-bold text-ink dark:text-slate">{selectedClaim.category}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate/10 rounded-xl p-4 border-2 border-gray-200 dark:border-slate/20">
                <p className="text-xs font-bold text-slate dark:text-slate/70 mb-2 uppercase tracking-wide">Descripción</p>
                <p className="text-base text-ink dark:text-slate leading-relaxed">{selectedClaim.description}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-ink dark:text-slate uppercase tracking-wide">Historial de Seguimiento</p>
                </div>
                {assignments.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-slate/10 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate/30">
                    <svg className="w-12 h-12 text-gray-400 dark:text-slate/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-slate dark:text-slate/70">Sin seguimiento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <CardAssignment key={assignment.id} assignment={assignment} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar estado mejorado */}
      {showChangeStateModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-night rounded-2xl max-w-md w-full shadow-2xl border-2 border-gray-200 dark:border-slate/20 animate-scale-in">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 rounded-t-2xl border-b-2 border-blue-600 dark:border-purple-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Cambiar Estado</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-ink dark:text-slate mb-3">
                  Nuevo Estado
                </label>
                <select
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium py-3 px-4 transition-all"
                >
                  <option value={ESTADOS.AGENDADA}>Pendiente</option>
                  <option value={ESTADOS.REALIZADA}>Atendida</option>
                  <option value={ESTADOS.CANCELADA}>Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink dark:text-slate mb-3">
                  Prioridad {!selectedClaim.priority && <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs ml-2">Sin asignar</span>}
                </label>
                <select
                  value={selectedClaim.priority || ''}
                  onChange={(e) => {
                    setSelectedClaim({ ...selectedClaim, priority: e.target.value || null });
                  }}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium py-3 px-4 transition-all"
                >
                  <option value="">Sin asignar</option>
                  <option value={PRIORIDADES.ALTA}>Alta</option>
                  <option value={PRIORIDADES.MEDIA}>Media</option>
                  <option value={PRIORIDADES.BAJA}>Baja</option>
                </select>
                <p className="mt-2 text-xs text-slate dark:text-slate/70 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  La prioridad se guarda junto con el cambio de estado
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink dark:text-slate mb-3">
                  Nota <span className="text-slate dark:text-slate/70 font-normal">(opcional)</span>
                </label>
                <textarea
                  rows={4}
                  value={stateNote}
                  onChange={(e) => setStateNote(e.target.value)}
                  placeholder="Agrega una nota sobre el cambio..."
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate placeholder:text-slate/50 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 py-3 px-4 transition-all"
                />
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowChangeStateModal(false)}
                disabled={actionLoading}
                className="px-6 py-2.5 border-2 border-gray-300 dark:border-slate/30 rounded-xl text-sm font-bold text-ink dark:text-slate hover:bg-gray-50 dark:hover:bg-night/50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeState}
                disabled={actionLoading || !newState}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Agregar comentario mejorado */}
      {showAddCommentModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-night rounded-2xl max-w-md w-full shadow-2xl border-2 border-gray-200 dark:border-slate/20 animate-scale-in">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-6 py-4 rounded-t-2xl border-b-2 border-green-600 dark:border-teal-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Agregar Comentario</h2>
              </div>
            </div>
            
            <div className="p-6">
              <div>
                <label className="block text-sm font-bold text-ink dark:text-slate mb-3">
                  Comentario de Seguimiento
                </label>
                <textarea
                  rows={6}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe un comentario sobre el seguimiento del reclamo..."
                  maxLength={500}
                  className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate placeholder:text-slate/50 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 py-3 px-4 transition-all leading-relaxed"
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <p className="text-slate dark:text-slate/70 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Máximo 500 caracteres
                  </p>
                  <p className={`font-bold ${commentText.length > 450 ? 'text-orange-600 dark:text-orange-400' : 'text-slate dark:text-slate/70'}`}>
                    {commentText.length} / 500
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddCommentModal(false)}
                disabled={actionLoading}
                className="px-6 py-2.5 border-2 border-gray-300 dark:border-slate/30 rounded-xl text-sm font-bold text-ink dark:text-slate hover:bg-gray-50 dark:hover:bg-night/50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddComment}
                disabled={actionLoading || !commentText.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReclamosEmployee;
