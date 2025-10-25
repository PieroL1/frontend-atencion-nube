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
      
      {/* Fondo con gradiente teal-cyan */}
      <div className="min-h-screen pt-24 px-4 pb-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-coal dark:via-night dark:to-coal">
        <div className="max-w-7xl mx-auto">
          
          {/* Encabezado mejorado */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
              Chat Estudiantil
            </h1>
            <p className="text-slate dark:text-slate/70 mb-6">Conversa directamente con otros estudiantes</p>
            <button
              onClick={() => setShowSearchModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 border-2 border-green-400/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar estudiante
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {/* Lista de conversaciones */}
            <div className="md:col-span-1">
              <div className="bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 overflow-hidden border border-gray-200 dark:border-slate/20">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    <h2 className="font-bold text-lg">Conversaciones</h2>
                  </div>
                </div>

                {loading ? (
                  <div className="p-6 text-center">
                    <div className="relative w-12 h-12 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-900"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 dark:border-t-teal-400 animate-spin"></div>
                    </div>
                  </div>
                ) : conversaciones.length === 0 ? (
                  <div className="p-6 text-center text-slate dark:text-slate/70">
                    <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl inline-block mb-3">
                      <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="font-medium">No hay conversaciones</p>
                    <p className="text-sm mt-2">
                      Inicia una conversación desde los foros
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-slate/20 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {conversaciones.map((conv) => (
                      <button
                        key={conv.peer_id}
                        onClick={() => handleSelectPeer(conv)}
                        className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-night/50 transition-all duration-300 ${
                          selectedPeer?.peer_id === conv.peer_id 
                            ? 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-l-4 border-teal-500' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                            selectedPeer?.peer_id === conv.peer_id
                              ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                              : 'bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 text-teal-600 dark:text-teal-400'
                          }`}>
                            <span className="font-bold text-lg">
                              {conv.peer_name ? conv.peer_name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-ink dark:text-slate truncate">
                              {conv.peer_name || `Usuario ${conv.peer_id}`}
                            </p>
                            {conv.last_message && (
                              <p className="text-sm text-slate dark:text-slate/70 truncate">
                                {conv.last_message}
                              </p>
                            )}
                          </div>
                          {conv.unread_count > 0 && (
                            <span className="ml-2 px-2.5 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
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
              <div className="bg-white dark:bg-night rounded-2xl shadow-lg dark:shadow-slate/10 overflow-hidden h-[600px] flex flex-col border border-gray-200 dark:border-slate/20">
                {!selectedPeer ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="p-6 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl inline-block mb-4">
                        <svg className="w-16 h-16 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-slate dark:text-slate/70">Selecciona una conversación para comenzar</p>
                    </div>
                  </div>
                ) : loadingMessages ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-900"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 dark:border-t-teal-400 animate-spin"></div>
                      </div>
                      <p className="text-slate dark:text-slate/70 font-medium">Cargando mensajes...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Header del chat */}
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-3 border-2 border-white/30">
                          <span className="font-bold text-lg">
                            {selectedPeer.peer_name ? selectedPeer.peer_name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div>
                          <h2 className="font-bold text-lg">
                            {selectedPeer.peer_name || `Usuario ${selectedPeer.peer_id}`}
                          </h2>
                          <div className="flex items-center gap-1 text-white/80 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>En línea</span>
                          </div>
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
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800/30 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    <strong>Nota:</strong> Para iniciar una conversación, puedes enviar un mensaje directo
                    a otros usuarios desde los foros comunitarios o usa el botón "Buscar estudiante".
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de búsqueda de estudiantes mejorado */}
      {showSearchModal && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="bg-white dark:bg-night rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-slate/20 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Buscar estudiante</h2>
                </div>
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="flex-1 px-4 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 rounded-xl focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 font-bold shadow-lg"
                >
                  {searching ? (
                    <>
                      <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
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
            <div className="p-6 overflow-y-auto max-h-96 custom-scrollbar">
              {searchResults.length === 0 && searchQuery && !searching && (
                <div className="text-center py-8 text-slate dark:text-slate/70">
                  <div className="p-4 bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 rounded-2xl inline-block mb-4">
                    <svg className="w-16 h-16 text-gray-400 dark:text-slate/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="font-medium">No se encontraron estudiantes</p>
                </div>
              )}

              {!searchQuery && searchResults.length === 0 && (
                <div className="text-center py-8 text-slate dark:text-slate/70">
                  <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl inline-block mb-4">
                    <svg className="w-16 h-16 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="font-medium">Escribe un nombre o email para buscar</p>
                </div>
              )}

              <div className="space-y-3">
                {searchResults.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-slate/20 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/20 dark:hover:to-cyan-900/20 hover:border-teal-300 dark:hover:border-teal-700 cursor-pointer transition-all duration-300 hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center group-hover:from-teal-500 group-hover:to-cyan-500 group-hover:text-white transition-all duration-300">
                        <svg className="w-6 h-6 text-teal-600 dark:text-teal-400 group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-ink dark:text-slate">{student.full_name}</p>
                        <p className="text-sm text-slate dark:text-slate/70">{student.email}</p>
                        {student.academic_program && (
                          <p className="text-xs text-slate dark:text-slate/70 mt-0.5 bg-gray-100 dark:bg-slate/10 px-2 py-0.5 rounded inline-block">
                            {student.academic_program}
                          </p>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate dark:text-slate/70 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
