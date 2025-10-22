// src/pages/comunidad/Foros.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarForos, misForos, unirmeForo, salirForo, crearForo } from '../../services/community';
import { ACADEMIC_PROGRAMS, FORUM_STATES } from '../../constants/community';
import CardForo from '../../components/comunidad/CardForo';
import EmptyState from '../../components/comunidad/EmptyState';
import CommunityNav from '../../components/comunidad/CommunityNav';
import { showToast } from '../../utils/toast';

export default function Foros() {
  const navigate = useNavigate();
  const [foros, setForos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('all'); // 'all' | 'my'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    titulo: '',
    programa: '',
  });

  // Formulario de crear foro
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    associated_program: '',
  });

  useEffect(() => {
    loadForos();
  }, [view]);

  const loadForos = async () => {
    setLoading(true);
    try {
      let data;
      if (view === 'my') {
        data = await misForos();
      } else {
        data = await listarForos(filters);
      }
      setForos(data);
    } catch (error) {
      console.error('Error al cargar foros:', error);
      showToast('Error al cargar los foros', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (forumId) => {
    try {
      await unirmeForo(forumId);
      showToast('Te has unido al foro exitosamente', 'success');
      loadForos();
    } catch (error) {
      console.error('Error al unirse al foro:', error);
      showToast('Error al unirse al foro', 'error');
    }
  };

  const handleLeave = async (forumId) => {
    if (!window.confirm('¿Estás seguro de que quieres salir de este foro?')) {
      return;
    }
    try {
      await salirForo(forumId);
      showToast('Has salido del foro', 'success');
      loadForos();
    } catch (error) {
      console.error('Error al salir del foro:', error);
      showToast('Error al salir del foro', 'error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadForos();
  };

  const handleClearFilters = () => {
    setFilters({ titulo: '', programa: '' });
    setTimeout(() => loadForos(), 0);
  };

  const handleCreateForo = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.title.trim()) {
      showToast('El título es requerido', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('La descripción es requerida', 'error');
      return;
    }
    if (!formData.associated_program) {
      showToast('El programa académico es requerido', 'error');
      return;
    }

    setCreating(true);
    try {
      await crearForo({
        ...formData,
        state: 'Pendiente', // Los estudiantes crean foros en estado pendiente
        creation_date: new Date().toISOString().split('T')[0],
      });
      showToast('Foro enviado para aprobación', 'success');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        associated_program: '',
      });
      loadForos();
    } catch (error) {
      console.error('Error al crear foro:', error);
      showToast('Error al crear el foro', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <CommunityNav />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Foros Comunitarios</h1>
            <p className="text-gray-600">
              Únete a la conversación y comparte conocimientos con otros estudiantes
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Crear Foro
          </button>
        </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setView('all')}
          className={`px-4 py-2 font-medium transition ${
            view === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Todos los foros
        </button>
        <button
          onClick={() => setView('my')}
          className={`px-4 py-2 font-medium transition ${
            view === 'my'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mis foros
        </button>
      </div>

      {/* Filtros (solo en vista "all") */}
      {view === 'all' && (
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Buscar por título..."
              value={filters.titulo}
              onChange={(e) => setFilters({ ...filters, titulo: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.programa}
              onChange={(e) => setFilters({ ...filters, programa: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los programas</option>
              {ACADEMIC_PROGRAMS.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Limpiar
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Lista de foros */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando foros...</p>
        </div>
      ) : foros.length === 0 ? (
        <EmptyState
          message={
            view === 'my'
              ? 'No te has unido a ningún foro aún'
              : 'No se encontraron foros'
          }
          icon="📚"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foros.map((foro) => (
            <CardForo
              key={foro.id}
              foro={foro}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          ))}
        </div>
      )}

      {/* Modal Crear Foro */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Foro</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateForo} className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Foro <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Programación en Python para principiantes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/100 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe de qué tratará este foro..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  maxLength={250}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/250 caracteres
                </p>
              </div>

              {/* Programa Académico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programa Académico <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.associated_program}
                  onChange={(e) => setFormData({ ...formData, associated_program: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona un programa</option>
                  {ACADEMIC_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                  disabled={creating}
                >
                  {creating ? 'Enviando...' : 'Enviar para Aprobación'}
                </button>
              </div>

              {/* Nota informativa */}
              <p className="text-sm text-gray-600 mt-2 text-center">
                <span className="text-yellow-600">ℹ️</span> Tu foro será revisado por un empleado antes de publicarse
              </p>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
