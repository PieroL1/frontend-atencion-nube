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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos Comunitarios</h1>
          <p className="text-gray-600">
            Descubre y participa en eventos organizados por la comunidad estudiantil
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          {showForm ? 'Cancelar' : 'Nuevo Evento'}
        </button>
      </div>

      {/* Formulario crear evento */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Nuevo Evento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del evento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Taller de Programación en Python"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.titulo.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el evento, qué actividades se realizarán..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={200}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora del evento <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Selecciona la fecha y hora en que se realizará el evento
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {creating ? 'Creando...' : 'Crear Evento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <form onSubmit={handleFilter} className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            placeholder="Desde"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            placeholder="Hasta"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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

      {/* Lista de eventos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando eventos...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <span className="text-6xl mb-4 block">📅</span>
          <p className="text-gray-600 text-lg mb-4">No se encontraron eventos</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Crear el primer evento
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Eventos próximos */}
          {upcomingEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎯</span>
                Próximos eventos ({upcomingEvents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((evento) => (
                  <div
                    key={evento.id}
                    onClick={() => handleEventoClick(evento)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 cursor-pointer hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
                        {evento.titulo}
                      </h3>
                      <span className="text-2xl ml-2">🎉</span>
                    </div>

                    <div className="flex items-center text-sm text-blue-600 mb-3 font-medium">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatEventDate(evento.event_date)}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {evento.description}
                    </p>

                    {evento.creator_name && (
                      <div className="flex items-center text-xs text-gray-500 pt-3 border-t mt-3">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Organizado por {evento.creator_name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eventos pasados */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span>
                Eventos anteriores ({pastEvents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((evento) => (
                  <div
                    key={evento.id}
                    onClick={() => handleEventoClick(evento)}
                    className="bg-gray-50 rounded-lg shadow-sm p-6 opacity-75 cursor-pointer hover:opacity-90 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-700 flex-1 line-clamp-2">
                        {evento.titulo}
                      </h3>
                      <span className="text-2xl ml-2 grayscale">🎉</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatEventDate(evento.event_date)}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {evento.description}
                    </p>

                    {evento.creator_name && (
                      <div className="flex items-center text-xs text-gray-500 pt-3 border-t mt-3">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Organizado por {evento.creator_name}
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

      {/* Modal de detalle */}
      <ModalEventoDetalle
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        evento={selectedEvento}
      />
    </>
  );
}
