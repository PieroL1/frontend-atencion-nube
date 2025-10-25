/**
 * RECLAMOS ESTUDIANTE
 * Página principal para que el estudiante vea y gestione sus reclamos/sugerencias
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listarClaims, TIPOS, ESTADOS, PRIORIDADES } from '../../services/reclamos';
import { CardClaim, EmptyState, DemoBanner } from '../../components/reclamos';
import { useDemoMode } from '../../hooks/useDemoMode';

const ReclamosEstudiante = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDemoMode = useDemoMode(); // Hook para detectar modo demo
  
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    priority: searchParams.get('priority') || '',
    state: searchParams.get('state') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    q: searchParams.get('q') || '',
  });

  // Cargar claims al montar y cuando cambien filtros
  useEffect(() => {
    loadClaims();
  }, [searchParams]);

  const loadClaims = async () => {
    setLoading(true);
    try {
      // Obtener user actual del localStorage o context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Construir parámetros desde searchParams para asegurar que estén actualizados
      const params = {
        student_id: user.id,
      };

      // Agregar filtros desde searchParams
      const type = searchParams.get('type');
      const priority = searchParams.get('priority');
      const state = searchParams.get('state');
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      const q = searchParams.get('q');

      if (type) params.type = type;
      if (priority) params.priority = priority;
      if (state) params.state = state;
      if (from) params.from = from;
      if (to) params.to = to;
      if (q) params.q = q;

      const data = await listarClaims(params);
      setClaims(data);
    } catch (error) {
      console.error('Error al cargar reclamos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Actualizar URL
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

  const handleClaimClick = (claimId) => {
    navigate(`/reclamos/${claimId}`);
  };

  const handleNewClaim = () => {
    navigate('/reclamos/nuevo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-coal dark:to-ink">
      {/* Header mejorado */}
      <div className="bg-white dark:bg-night border-b-2 border-gray-200 dark:border-slate/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-ink dark:text-slate">
                  Mis Reclamos y Sugerencias
                </h1>
                <p className="mt-1 text-lg text-slate dark:text-slate/70">
                  Gestiona tus reclamos y sugerencias de forma rápida
                </p>
              </div>
            </div>
            <button
              onClick={handleNewClaim}
              className="inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo
            </button>
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
            {/* Tipo */}
            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">
                Tipo
              </label>
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

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">
                Prioridad
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              >
                <option value="">Todas</option>
                <option value={PRIORIDADES.ALTA}>Alta</option>
                <option value={PRIORIDADES.MEDIA}>Media</option>
                <option value={PRIORIDADES.BAJA}>Baja</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">
                Estado
              </label>
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

            {/* Desde */}
            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              />
            </div>

            {/* Hasta */}
            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              />
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-bold text-ink dark:text-slate mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate placeholder:text-slate/50 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm font-medium py-2 px-3 transition-all"
              />
            </div>
          </div>

          {/* Botón limpiar filtros mejorado */}
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
            message="No se encontraron reclamos o sugerencias con los filtros seleccionados. Crea uno nuevo para comenzar."
            action={
              <button
                onClick={handleNewClaim}
                className="inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Nuevo
              </button>
            }
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
                <CardClaim
                  key={claim.id}
                  claim={claim}
                  onClick={() => handleClaimClick(claim.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReclamosEstudiante;
