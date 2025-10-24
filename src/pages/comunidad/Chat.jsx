// src/pages/comunidad/Chat.jsx
import { useState, useEffect } from 'react';
import { listarConversaciones, listarMensajes, enviarMensaje, marcarVisto, buscarEstudiantes } from '../../services/community';
import { getUser } from '../../auth';
import ChatThread from '../../components/comunidad/ChatThread';
import EmptyState from '../../components/comunidad/EmptyState';
import CommunityNav from '../../components/comunidad/CommunityNav';
import { showToast } from '../../utils/toast';

export default function Chat() {
  const currentUser = getUser();
  const [conversaciones, setConversaciones] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  useEffect(() => {
    loadConversaciones();
    loadCurrentStudentId();
  }, []);

  useEffect(() => {
    if (selectedPeer) {
      loadMensajes(selectedPeer.peer_id);
    }
  }, [selectedPeer]);

  // Polling automático para actualizar mensajes en tiempo real
  useEffect(() => {
    if (!selectedPeer) return;

    // Hacer polling cada 3 segundos
    const intervalId = setInterval(async () => {
      try {
        const data = await listarMensajes(selectedPeer.peer_id);
        const sorted = data.sort((a, b) => new Date(a.sent_date) - new Date(b.sent_date));
        
        // Solo actualizar si hay mensajes nuevos
        if (sorted.length > mensajes.length) {
          setMensajes(sorted);
          // Marcar como visto si hay nuevos mensajes
          await marcarVisto(selectedPeer.peer_id);
          // Actualizar lista de conversaciones
          loadConversaciones();
        }
      } catch (error) {
        // Silenciar errores de polling para no spamear la consola
        console.debug('Polling error:', error.message);
      }
    }, 3000); // 3 segundos

    // Cleanup: detener polling cuando cambias de conversación o sales del chat
    return () => clearInterval(intervalId);
  }, [selectedPeer, mensajes.length]);

  const loadConversaciones = async () => {
    setLoading(true);
    try {
      const data = await listarConversaciones();
      setConversaciones(data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      // Si el endpoint no existe, mantener array vacío
      setConversaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentStudentId = async () => {
    try {
      const response = await buscarEstudiantes('', 1000); // Buscar todos los estudiantes
      const myStudent = response.find(s => s.user_id === currentUser?.id);
      if (myStudent) {
        setCurrentStudentId(myStudent.id);
      }
    } catch (error) {
      console.error('Error al obtener student_id:', error);
    }
  };

  const loadMensajes = async (peerId) => {
    setLoadingMessages(true);
    try {
      const data = await listarMensajes(peerId);
      // Ordenar por fecha ascendente
      const sorted = data.sort((a, b) => new Date(a.sent_date) - new Date(b.sent_date));
      setMensajes(sorted);
      
      // Marcar como visto
      await marcarVisto(peerId);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      showToast('Error al cargar los mensajes', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedPeer) return;

    try {
      await enviarMensaje({
        receiver_student_id: selectedPeer.student_id,
        content,
      });
      // Recargar mensajes
      await loadMensajes(selectedPeer.peer_id);
      // Recargar conversaciones para actualizar la lista
      await loadConversaciones();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      showToast('Error al enviar el mensaje', 'error');
    }
  };

  const handleSelectPeer = (peer) => {
    setSelectedPeer(peer);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await buscarEstudiantes(searchQuery, 20);
      // Filtrar al usuario actual
      const filteredResults = results.filter(s => s.user_id !== currentUser?.id);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
      showToast('Error al buscar estudiantes', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectStudent = (student) => {
    // Guardar tanto user_id como student_id
    setSelectedPeer({
      peer_id: student.user_id,
      user_id: student.user_id,
      student_id: student.id, // ID del estudiante en la tabla students
      peer_name: student.full_name, // Cambiar 'name' por 'peer_name'
      email: student.email,
    });
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <>
      <CommunityNav />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-ink dark:text-slate mb-2">Chat</h1>
            <p className="text-slate dark:text-slate/70">
              Conversa directamente con otros estudiantes
            </p>
          </div>
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar estudiante
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de conversaciones */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-night rounded-lg shadow-sm dark:shadow-slate/10 overflow-hidden">
            <div className="bg-primary text-white p-4">
              <h2 className="font-semibold">Conversaciones</h2>
            </div>

            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : conversaciones.length === 0 ? (
              <div className="p-6 text-center text-slate dark:text-slate/70">
                <p>No hay conversaciones</p>
                <p className="text-sm mt-2">
                  Inicia una conversación desde los foros
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate/20 max-h-[600px] overflow-y-auto">
                {conversaciones.map((conv) => (
                  <button
                    key={conv.peer_id}
                    onClick={() => handleSelectPeer(conv)}
                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-night/50 transition ${
                      selectedPeer?.peer_id === conv.peer_id ? 'bg-blue-50 dark:bg-primary/10' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-primary/20 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary font-semibold">
                          {conv.peer_name ? conv.peer_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink dark:text-slate truncate">
                          {conv.peer_name || `Usuario ${conv.peer_id}`}
                        </p>
                        {conv.last_message && (
                          <p className="text-sm text-slate dark:text-slate/70 truncate">
                            {conv.last_message}
                          </p>
                        )}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Thread de mensajes */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-night rounded-lg shadow-sm dark:shadow-slate/10 overflow-hidden h-[600px] flex flex-col">
            {!selectedPeer ? (
              <EmptyState
                message="Selecciona una conversación para comenzar"
                icon="💬"
              />
            ) : loadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-slate dark:text-slate/70 mt-4">Cargando mensajes...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header del chat */}
                <div className="bg-primary text-white p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <span className="font-semibold">
                        {selectedPeer.peer_name ? selectedPeer.peer_name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-semibold">
                        {selectedPeer.peer_name || `Usuario ${selectedPeer.peer_id}`}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Thread de mensajes */}
                <ChatThread
                  messages={mensajes}
                  onSendMessage={handleSendMessage}
                  currentUserId={currentStudentId}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nota informativa si no hay endpoint de conversaciones */}
      {!loading && conversaciones.length === 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/20 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-primary">
            <strong>Nota:</strong> Para iniciar una conversación, puedes enviar un mensaje directo
            a otros usuarios desde los foros comunitarios o usa el botón "Buscar estudiante".
          </p>
        </div>
      )}
      </div>

      {/* Modal de búsqueda de estudiantes */}
      {showSearchModal && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="bg-white dark:bg-night rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate/20 bg-blue-50 dark:bg-primary/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-ink dark:text-slate">Buscar estudiante</h2>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Buscador */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {searching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Resultados */}
            <div className="p-6 overflow-y-auto max-h-96">
              {searchResults.length === 0 && searchQuery && !searching && (
                <div className="text-center py-8 text-slate dark:text-slate/70">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>No se encontraron estudiantes</p>
                </div>
              )}

              {!searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-slate dark:text-slate/70">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>Escribe un nombre o email para buscar</p>
                </div>
              )}

              <div className="space-y-2">
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate/20 rounded-lg hover:bg-blue-50 dark:hover:bg-primary/10 hover:border-blue-300 dark:hover:border-primary/30 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-primary/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-ink dark:text-slate">{student.full_name}</p>
                        <p className="text-sm text-slate dark:text-slate/70">{student.email}</p>
                        {student.academic_program && (
                          <p className="text-xs text-slate dark:text-slate/70 mt-0.5">{student.academic_program}</p>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate dark:text-slate/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
