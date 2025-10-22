// src/pages/comunidad/ForoDetalle.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getForo, listarPosts, crearPost, unirmeForo, salirForo, moderarPublicacion, eliminarPost } from '../../services/community';
import { getForumStateColor, formatDate } from '../../constants/community';
import CardPost from '../../components/comunidad/CardPost';
import EmptyState from '../../components/comunidad/EmptyState';
import ModalMiembros from '../../components/comunidad/ModalMiembros';
import { showToast } from '../../utils/toast';

export default function ForoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [foro, setForo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foroData, postsData] = await Promise.all([
        getForo(id),
        listarPosts(id),
      ]);
      setForo(foroData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error al cargar datos del foro:', error);
      showToast('Error al cargar el foro', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await unirmeForo(id);
      showToast('Te has unido al foro exitosamente', 'success');
      loadData();
    } catch (error) {
      console.error('Error al unirse al foro:', error);
      showToast('Error al unirse al foro', 'error');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('¿Estás seguro de que quieres salir de este foro?')) {
      return;
    }
    try {
      await salirForo(id);
      showToast('Has salido del foro', 'success');
      navigate('/comunidad/foros');
    } catch (error) {
      console.error('Error al salir del foro:', error);
      showToast('Error al salir del foro', 'error');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    if (!foro?.is_member) {
      showToast('Debes unirte al foro para publicar', 'error');
      return;
    }

    setPosting(true);
    try {
      await crearPost(id, { content: newPostContent });
      setNewPostContent('');
      showToast('Publicación creada exitosamente', 'success');
      loadData();
    } catch (error) {
      console.error('Error al crear publicación:', error);
      showToast('Error al crear la publicación', 'error');
    } finally {
      setPosting(false);
    }
  };

  const handleModerate = async (postId, action) => {
    try {
      await moderarPublicacion({
        publicacion_id: postId,
        action,
        comment: `Moderación: ${action}`,
      });
      showToast('Acción de moderación aplicada', 'success');
      loadData();
    } catch (error) {
      console.error('Error al moderar:', error);
      showToast('Error al moderar la publicación', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }
    try {
      await eliminarPost(postId);
      showToast('Publicación eliminada', 'success');
      loadData();
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      showToast('Error al eliminar la publicación', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Cargando foro...</p>
      </div>
    );
  }

  if (!foro) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <EmptyState message="Foro no encontrado" icon="❌" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header del foro */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <button
          onClick={() => navigate('/comunidad/foros')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a foros
        </button>

        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {foro.title}
            </h1>
            <p className="text-gray-600">{foro.description}</p>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full ${getForumStateColor(foro.state)}`}>
            {foro.state}
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex gap-6 text-sm text-gray-600">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              {foro.associated_program}
            </span>
            <span>Creado: {formatDate(foro.creation_date)}</span>
            <span>{posts.length} publicaciones</span>
            {/* Mostrar contador de miembros si es miembro del foro */}
            {foro.is_member && (
              <button
                onClick={() => setShowMembersModal(true)}
                className="flex items-center hover:text-blue-600 transition"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                {foro.members_count ?? 0} miembros
              </button>
            )}
          </div>

          {foro.is_member ? (
            <div className="flex gap-2">
              {foro.role && (
                <span className={`px-3 py-1 text-sm rounded ${
                  foro.role === 'Owner' 
                    ? 'bg-purple-100 text-purple-800' 
                    : foro.role === 'Moderador'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {foro.role === 'Owner' ? '👑 ' : foro.role === 'Moderador' ? '🛡️ ' : ''}
                  {foro.role}
                </span>
              )}
              {!foro.is_owner && (
                <button
                  onClick={handleLeave}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  Salir del foro
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleJoin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Unirme al foro
            </button>
          )}
        </div>
      </div>

      {/* Formulario crear post (solo si es miembro) */}
      {foro.is_member && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Nueva publicación</h2>
          <form onSubmit={handleCreatePost}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Escribe tu publicación..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={posting || !newPostContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {posting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de posts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Publicaciones ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <EmptyState
            message="No hay publicaciones aún"
            icon="💬"
            action={
              foro.is_member
                ? {
                    label: 'Sé el primero en publicar',
                    onClick: () => document.querySelector('textarea')?.focus(),
                  }
                : undefined
            }
          />
        ) : (
          posts.map((post) => (
            <CardPost
              key={post.id}
              post={post}
              isModerator={foro.role === 'Moderador'}
              isOwner={foro.role === 'Owner'}
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>

      {/* Modal de Miembros */}
      <ModalMiembros
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        forumId={id}
        isOwner={foro?.is_owner ?? false}
      />
    </div>
  );
}
