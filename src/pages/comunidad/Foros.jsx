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
      
      {/* Fondo con gradiente teal-cyan */}
      <div className="min-h-screen pt-24 px-4 pb-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-coal dark:via-night dark:to-coal">
        <div className="max-w-7xl mx-auto">
          
          {/* Encabezado mejorado */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
              Foros Académicos
            </h1>
            <p className="text-slate dark:text-slate/70 mb-6">Únete a discusiones académicas con tus compañeros</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 border-2 border-green-400/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Foro
            </button>
          </div>

          {/* Tabs mejorados */}
          <div className="flex justify-center mb-8">
            <div className="bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 p-2 border border-gray-200 dark:border-slate/20 inline-flex">
              <button
                onClick={() => setView('all')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 inline-flex items-center gap-2 ${
                  view === 'all'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105'
                    : 'text-slate dark:text-slate/70 hover:bg-gray-100 dark:hover:bg-slate/10'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Todos los Foros
              </button>
              <button
                onClick={() => setView('my')}
                className={`px-6 py-3 rounded-xl transition-all duration-300 inline-flex items-center gap-2 ${
                  view === 'my'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105'
                    : 'text-slate dark:text-slate/70 hover:bg-gray-100 dark:hover:bg-slate/10'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mis Foros
              </button>
            </div>
          </div>

          {/* Filtros mejorados (solo en vista "all") */}
          {view === 'all' && (
            <form onSubmit={handleSearch} className="bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 p-6 mb-8 border border-gray-200 dark:border-slate/20 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl">
                  <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-ink dark:text-slate">Filtros de Búsqueda</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Buscar por título..."
                  value={filters.titulo}
                  onChange={(e) => setFilters({ ...filters, titulo: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-slate/30 rounded-lg bg-white dark:bg-night/50 text-ink dark:text-slate focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <select
                  value={filters.programa}
                  onChange={(e) => setFilters({ ...filters, programa: e.target.value })}
                  className="px-4 py-2 border border-gray-300 dark:border-slate/30 rounded-lg bg-white dark:bg-night/50 text-ink dark:text-slate focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 font-medium"
                  >
                    Buscar
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 border-2 border-gray-300 dark:border-slate/30 text-ink dark:text-slate rounded-lg hover:bg-gray-50 dark:hover:bg-night/50 transition-all duration-300 font-medium"
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
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-900"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 dark:border-t-teal-400 animate-spin"></div>
              </div>
              <p className="text-slate dark:text-slate/70 font-medium">Cargando foros...</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
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
            <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white dark:bg-night rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in border border-gray-200 dark:border-slate/20">
                
                {/* Header del modal con gradiente */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 relative">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-white">Crear Nuevo Foro</h2>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-white/80 hover:text-white transition-colors text-3xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)] custom-scrollbar">
                  <form onSubmit={handleCreateForo} className="space-y-5">
                    
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-bold text-ink dark:text-slate mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Título del Foro <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Programación en Python para principiantes"
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        maxLength={100}
                        required
                      />
                      <p className="text-xs text-slate dark:text-slate/70 mt-1">
                        {formData.title.length}/100 caracteres
                      </p>
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-bold text-ink dark:text-slate mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Descripción <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe de qué tratará este foro..."
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                        rows={4}
                        maxLength={250}
                        required
                      />
                      <p className="text-xs text-slate dark:text-slate/70 mt-1">
                        {formData.description.length}/250 caracteres
                      </p>
                    </div>

                    {/* Programa Académico */}
                    <div>
                      <label className="block text-sm font-bold text-ink dark:text-slate mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Programa Académico <span className="text-red-500 dark:text-red-400">*</span>
                      </label>
                      <select
                        value={formData.associated_program}
                        onChange={(e) => setFormData({ ...formData, associated_program: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
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

                    {/* Nota informativa */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                          Tu foro será revisado por un empleado antes de publicarse
                        </p>
                      </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-slate/30 text-ink dark:text-slate rounded-xl hover:bg-gray-50 dark:hover:bg-night/50 transition-all duration-300 font-medium"
                        disabled={creating}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                        disabled={creating}
                      >
                        {creating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Enviar para Aprobación
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
