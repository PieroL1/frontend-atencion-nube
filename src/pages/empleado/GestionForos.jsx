// src/pages/empleado/GestionForos.jsx
import { useState, useEffect } from 'react';
import { actualizarEstadoForo } from '../../services/community';
import { FORUM_STATE_COLORS, FORUM_STATE_LABELS, formatDate } from '../../constants/community';
import { showToast } from '../../utils/toast';
import { api } from '../../api';

export default function GestionForos() {
  const [foros, setForos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pendiente');
  const [selectedForo, setSelectedForo] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadForos = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'all' 
        ? '/student-community-forums/getAll'
        : `/student-community-forums/getByState/${filter}`;
      
      const response = await api.get(endpoint);
      const data = response.data.data || response.data;
      setForos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar foros:', error);
      showToast('Error al cargar foros', 'error');
      setForos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleViewDetail = (foro) => {
    setSelectedForo(foro);
    setShowDetailModal(true);
  };

  const handleAprobar = async (foroId) => {
    if (!window.confirm('¿Aprobar este foro? Se activará y será visible para todos los estudiantes.')) {
      return;
    }

    setActionLoading(true);
    try {
      await actualizarEstadoForo(foroId, 'Activo');
      showToast('Foro aprobado exitosamente', 'success');
      setShowDetailModal(false);
      loadForos();
    } catch (error) {
      console.error('Error al aprobar foro:', error);
      showToast('Error al aprobar foro', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (foroId) => {
    const motivo = window.prompt('Motivo del rechazo (opcional):');
    if (motivo === null) return;

    setActionLoading(true);
    try {
      await actualizarEstadoForo(foroId, 'Rechazado');
      showToast('Foro rechazado', 'success');
      setShowDetailModal(false);
      loadForos();
    } catch (error) {
      console.error('Error al rechazar foro:', error);
      showToast('Error al rechazar foro', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getEstadisticas = () => {
    return {
      pendientes: foros.filter(f => f.state === 'Pendiente').length,
      activos: foros.filter(f => f.state === 'Activo').length,
      rechazados: foros.filter(f => f.state === 'Rechazado').length,
      finalizados: foros.filter(f => f.state === 'Finalizado').length,
      total: foros.length,
    };
  };

  const stats = getEstadisticas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-coal dark:to-ink">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink dark:text-slate mb-2">Gestión de Foros</h1>
        <p className="text-slate dark:text-slate/70">
          Aprobar, rechazar y monitorear foros comunitarios
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pendientes}</div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400/80">Pendientes</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.activos}</div>
          <div className="text-sm text-green-600 dark:text-green-400/80">Activos</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rechazados}</div>
          <div className="text-sm text-red-600 dark:text-red-400/80">Rechazados</div>
        </div>
        <div className="bg-gray-50 dark:bg-slate/20 border border-gray-200 dark:border-slate/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-700 dark:text-slate">{stats.finalizados}</div>
          <div className="text-sm text-gray-600 dark:text-slate/70">Finalizados</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-blue-600 dark:text-blue-400/80">Total</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['Pendiente', 'Activo', 'Rechazado', 'Finalizado', 'all'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFilter(estado)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              filter === estado
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-night text-gray-700 dark:text-slate hover:bg-gray-200 dark:hover:bg-night/70'
            }`}
          >
            {estado === 'all' ? 'Todos' : estado}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-slate dark:text-slate/70 mt-4">Cargando foros...</p>
        </div>
      ) : foros.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-night rounded-lg shadow dark:shadow-slate/10">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-slate dark:text-slate/70 text-lg">No hay foros con el filtro seleccionado</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-night rounded-lg shadow dark:shadow-slate/10 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate/20">
            <thead className="bg-gray-50 dark:bg-ink">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate/70 uppercase tracking-wider">
                  Foro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate/70 uppercase tracking-wider">
                  Programa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate/70 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate/70 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate dark:text-slate/70 uppercase tracking-wider">
                  Posts
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate dark:text-slate/70 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-night divide-y divide-gray-200 dark:divide-slate/20">
              {foros.map((foro) => (
                <tr key={foro.id} className="hover:bg-gray-50 dark:hover:bg-night/70">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-ink dark:text-slate">{foro.title}</div>
                    <div className="text-sm text-slate dark:text-slate/70 truncate max-w-md">
                      {foro.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate dark:text-slate/70">
                    {foro.associated_program}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${FORUM_STATE_COLORS[foro.state] || 'bg-gray-100 text-gray-800'}`}>
                      {FORUM_STATE_LABELS[foro.state] || foro.state}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate dark:text-slate/70">
                    {formatDate(foro.creation_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate dark:text-slate/70">
                    {foro.posts_count || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetail(foro)}
                      className="text-primary hover:text-primary/80 mr-3"
                    >
                      Ver detalle
                    </button>
                    {foro.state === 'Pendiente' && (
                      <>
                        <button
                          onClick={() => handleAprobar(foro.id)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3"
                          disabled={actionLoading}
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazar(foro.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          disabled={actionLoading}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetailModal && selectedForo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-night rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-ink dark:text-slate">{selectedForo.title}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate dark:text-slate/70">Estado</label>
                <span className={`inline-block px-3 py-1 text-sm rounded-full mt-1 ${FORUM_STATE_COLORS[selectedForo.state]}`}>
                  {FORUM_STATE_LABELS[selectedForo.state]}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate dark:text-slate/70">Descripción</label>
                <p className="mt-1 text-sm text-ink dark:text-slate">{selectedForo.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate dark:text-slate/70">Programa Académico</label>
                  <p className="mt-1 text-sm text-ink dark:text-slate">{selectedForo.associated_program}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate dark:text-slate/70">Fecha de Creación</label>
                  <p className="mt-1 text-sm text-ink dark:text-slate">{formatDate(selectedForo.creation_date)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate dark:text-slate/70">Posts</label>
                  <p className="mt-1 text-sm text-ink dark:text-slate">{selectedForo.posts_count || 0} publicaciones</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate dark:text-slate/70">ID del Foro</label>
                  <p className="mt-1 text-sm text-slate dark:text-slate/70 font-mono">#{selectedForo.id}</p>
                </div>
              </div>

              {selectedForo.state === 'Pendiente' && (
                <div className="flex gap-3 pt-4 border-t dark:border-slate/20">
                  <button
                    onClick={() => handleRechazar(selectedForo.id)}
                    className="flex-1 px-4 py-2 border border-red-600 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Procesando...' : 'Rechazar'}
                  </button>
                  <button
                    onClick={() => handleAprobar(selectedForo.id)}
                    className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Procesando...' : 'Aprobar'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
