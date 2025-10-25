// src/pages/comunidad/Eventos.jsx
import { useState, useEffect } from 'react';
import { listarEventos, crearEvento } from '../../services/community';
import { showToast } from '../../utils/toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import CommunityNav from '../../components/comunidad/CommunityNav';
import ModalEventoDetalle from '../../components/comunidad/ModalEventoDetalle';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    description: '',
    event_date: '',
  });

  const [filters, setFilters] = useState({
    q: '',
    from: '',
    to: '',
  });

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    setLoading(true);
    try {
      const data = await listarEventos(filters);
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      showToast('Error al cargar los eventos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.titulo.trim()) {
      showToast('El título es requerido', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('La descripción es requerida', 'error');
      return;
    }
    if (!formData.event_date) {
      showToast('La fecha del evento es requerida', 'error');
      return;
    }

    // Validar que la fecha no sea en el pasado
    const eventDate = new Date(formData.event_date);
    const now = new Date();
    if (eventDate < now) {
      showToast('La fecha del evento no puede ser en el pasado', 'error');
      return;
    }

    setCreating(true);
    try {
      await crearEvento({
        titulo: formData.titulo,
        description: formData.description,
        event_date: formData.event_date,
      });
      showToast('Evento creado exitosamente', 'success');
      setFormData({ titulo: '', description: '', event_date: '' });
      setShowForm(false);
      loadEventos();
    } catch (error) {
      console.error('Error al crear evento:', error);
      showToast('Error al crear el evento', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadEventos();
  };

  const handleClearFilters = () => {
    setFilters({ q: '', from: '', to: '' });
    setTimeout(() => loadEventos(), 0);
  };

  const handleEventoClick = (evento) => {
    setSelectedEvento(evento);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedEvento(null);
  };

  const formatEventDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Separar eventos próximos y pasados
  const now = new Date();
  const upcomingEvents = eventos.filter((e) => new Date(e.event_date) >= now);
  const pastEvents = eventos.filter((e) => new Date(e.event_date) < now);

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
              Eventos Comunitarios
            </h1>
            <p className="text-slate dark:text-slate/70 mb-6">Descubre y participa en eventos organizados por la comunidad estudiantil</p>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 border-2 ${
                showForm 
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white border-red-400/20'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-green-400/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showForm ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
              {showForm ? 'Cancelar' : 'Nuevo Evento'}
            </button>
          </div>

          {/* Formulario crear evento mejorado */}
          {showForm && (
            <div className="bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 p-6 mb-8 border border-gray-200 dark:border-slate/20 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-ink dark:text-slate">Crear Nuevo Evento</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-ink dark:text-slate mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Título del evento <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ej: Taller de Programación en Python"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-slate dark:text-slate/70 mt-1">
                    {formData.titulo.length}/100 caracteres
                  </p>
                </div>

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
                    placeholder="Describe el evento, qué actividades se realizarán..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    maxLength={200}
                    required
                  />
                  <p className="text-xs text-slate dark:text-slate/70 mt-1">
                    {formData.description.length}/200 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink dark:text-slate mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Fecha y hora del evento <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-slate dark:text-slate/70 mt-1">
                    Selecciona la fecha y hora en que se realizará el evento
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-slate/30 text-ink dark:text-slate rounded-xl hover:bg-gray-50 dark:hover:bg-night/50 transition-all duration-300 font-medium"
                    disabled={creating}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Crear Evento
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filtros mejorados */}
          <form onSubmit={handleFilter} className="bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 p-6 mb-8 border border-gray-200 dark:border-slate/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-ink dark:text-slate">Buscar Eventos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="date"
                placeholder="Desde"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="date"
                placeholder="Hasta"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                className="px-4 py-2 border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 font-medium"
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

          {/* Lista de eventos */}
          {loading ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-900"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 dark:border-t-teal-400 animate-spin"></div>
              </div>
              <p className="text-slate dark:text-slate/70 font-medium">Cargando eventos...</p>
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 border border-gray-200 dark:border-slate/20">
              <span className="text-6xl mb-4 block">📅</span>
              <p className="text-slate dark:text-slate/70 text-lg mb-4 font-medium">No se encontraron eventos</p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear el primer evento
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Eventos próximos */}
              {upcomingEvents.length > 0 && (
                <div className="mb-8 animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl">
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-ink dark:text-slate">
                      Próximos eventos
                      <span className="ml-2 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm rounded-full">
                        {upcomingEvents.length}
                      </span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((evento) => (
                      <div
                        key={evento.id}
                        onClick={() => handleEventoClick(evento)}
                        className="bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 hover:shadow-xl dark:hover:shadow-slate/20 transition-all duration-300 p-6 cursor-pointer hover:scale-105 border border-gray-200 dark:border-slate/20 group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-ink dark:text-slate flex-1 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {evento.titulo}
                          </h3>
                          <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl ml-2">
                            <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>

                        <div className="flex items-center text-sm bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 text-teal-700 dark:text-teal-300 px-3 py-2 rounded-lg mb-3 font-medium border border-teal-200 dark:border-teal-800/30">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatEventDate(evento.event_date)}
                        </div>

                        <p className="text-slate dark:text-slate/70 text-sm line-clamp-3 mb-4">
                          {evento.description}
                        </p>

                        {evento.creator_name && (
                          <div className="flex items-center text-xs text-slate dark:text-slate/70 pt-3 border-t border-gray-200 dark:border-slate/20">
                            <div className="p-1.5 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg mr-2">
                              <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="font-medium">Organizado por {evento.creator_name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eventos pasados */}
              {pastEvents.length > 0 && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 rounded-xl">
                      <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-ink dark:text-slate">
                      Eventos anteriores
                      <span className="ml-2 px-3 py-1 bg-gradient-to-r from-gray-400 to-slate-400 text-white text-sm rounded-full">
                        {pastEvents.length}
                      </span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastEvents.map((evento) => (
                      <div
                        key={evento.id}
                        onClick={() => handleEventoClick(evento)}
                        className="bg-gray-50 dark:bg-night/50 rounded-2xl shadow-lg dark:shadow-slate/10 p-6 opacity-60 cursor-pointer hover:opacity-80 hover:shadow-xl dark:hover:shadow-slate/20 transition-all duration-300 border border-gray-200 dark:border-slate/20"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-slate dark:text-slate/80 flex-1 line-clamp-2">
                            {evento.titulo}
                          </h3>
                          <div className="p-2 bg-gray-200 dark:bg-gray-800/30 rounded-xl ml-2 opacity-50">
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-slate dark:text-slate/70 px-3 py-2 bg-gray-100 dark:bg-gray-800/30 rounded-lg mb-3">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {formatEventDate(evento.event_date)}
                        </div>

                        <p className="text-slate dark:text-slate/70 text-sm line-clamp-3 mb-4">
                          {evento.description}
                        </p>

                        {evento.creator_name && (
                          <div className="flex items-center text-xs text-slate dark:text-slate/70 pt-3 border-t border-gray-200 dark:border-slate/20">
                            <div className="p-1.5 bg-gray-200 dark:bg-gray-800/30 rounded-lg mr-2 opacity-50">
                              <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span>Organizado por {evento.creator_name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      <ModalEventoDetalle
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        evento={selectedEvento}
      />
    </>
  );
}
