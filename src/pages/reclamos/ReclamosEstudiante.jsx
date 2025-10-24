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
      
      const params = {
        student_id: user.id,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-coal dark:to-ink">
      {/* Header */}
      <div className="bg-white dark:bg-night border-b border-gray-200 dark:border-slate/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ink dark:text-slate">
                Mis Reclamos y Sugerencias
              </h1>
              <p className="mt-1 text-sm text-slate dark:text-slate/70">
                Gestiona tus reclamos y sugerencias
              </p>
            </div>
            <button
              onClick={handleNewClaim}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              + Nuevo
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

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-night rounded-lg shadow-sm dark:shadow-slate/10 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Tipo */}
            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">
                Tipo
              </label>
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

            {/* Prioridad */}
            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">
                Prioridad
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-ink text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary text-sm"
              >
                <option value="">Todas</option>
                <option value={PRIORIDADES.ALTA}>Alta</option>
                <option value={PRIORIDADES.MEDIA}>Media</option>
                <option value={PRIORIDADES.BAJA}>Baja</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">
                Estado
              </label>
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

            {/* Desde */}
            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary text-sm"
              />
            </div>

            {/* Hasta */}
            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate shadow-sm focus:border-primary focus:ring-primary text-sm"
              />
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-xs font-medium text-slate dark:text-slate/70 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.q}
                onChange={(e) => handleFilterChange('q', e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate placeholder:text-slate/50 shadow-sm focus:border-primary focus:ring-primary text-sm"
              />
            </div>
          </div>

          {/* Botón limpiar filtros */}
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
            message="No se encontraron reclamos o sugerencias con los filtros seleccionados. Crea uno nuevo para comenzar."
            action={
              <button
                onClick={handleNewClaim}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                + Crear Nuevo
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {claims.map((claim) => (
              <CardClaim
                key={claim.id}
                claim={claim}
                onClick={() => handleClaimClick(claim.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReclamosEstudiante;
