// src/components/comunidad/CardPost.jsx
import { formatDateTime } from '../../constants/community';
import { getUser } from '../../auth';

export default function CardPost({ post, isModerator = false, isOwner = false, onDelete }) {
  const currentUser = getUser();
  const isAuthor = currentUser && post.author_user_id === currentUser.id;
  const canDelete = isOwner || isModerator || isAuthor;
  
  return (
    <div className="bg-white dark:bg-night rounded-lg shadow-sm dark:shadow-slate/10 p-4 mb-3 border border-transparent dark:border-slate/20">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium text-ink dark:text-slate">
              {post.author_name || 'Usuario'}
            </p>
            <p className="text-xs text-slate dark:text-slate/70">
              {formatDateTime(post.creation_date)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-slate dark:text-slate/70 whitespace-pre-wrap mb-2">
        {post.content}
      </p>

      {/* Botón de eliminar (para autor, moderadores u owners) */}
      {canDelete && (
        <div className="flex justify-end mt-3 pt-3 border-t dark:border-slate/20">
          <button
            onClick={() => onDelete(post.id)}
            className="px-3 py-1 text-sm border border-red-600 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
