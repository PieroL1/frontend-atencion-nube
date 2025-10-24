// src/components/comunidad/CardForo.jsx
import { useNavigate } from 'react-router-dom';
import { getForumStateColor, formatDate, truncateText } from '../../constants/community';

export default function CardForo({ foro, onJoin, onLeave }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/comunidad/foros/${foro.id}`);
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    onJoin(foro.id);
  };

  const handleLeaveClick = (e) => {
    e.stopPropagation();
    onLeave(foro.id);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-night rounded-lg shadow-sm dark:shadow-slate/10 hover:shadow-md dark:hover:shadow-slate/20 transition-shadow cursor-pointer p-6"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-ink dark:text-slate flex-1">
          {foro.title}
        </h3>
        <span className={`px-2 py-1 text-xs rounded-full ${getForumStateColor(foro.state)}`}>
          {foro.state}
        </span>
      </div>

      <p className="text-slate dark:text-slate/70 text-sm mb-4">
        {truncateText(foro.description, 120)}
      </p>

      <div className="flex items-center justify-between text-sm text-slate dark:text-slate/70 mb-4">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          {foro.associated_program}
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          {foro.members_count ?? 0} miembros
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          {foro.posts_count ?? 0} posts
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate dark:text-slate/70">
          Creado: {formatDate(foro.creation_date)}
        </span>
        
        {/* Si eres Owner, mostrar badge */}
        {foro.is_owner ? (
          <span className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded font-medium">
            👑 Propietario
          </span>
        ) : foro.is_member ? (
          <button
            onClick={handleLeaveClick}
            className="px-3 py-1 text-sm border border-red-600 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Salir
          </button>
        ) : (
          <button
            onClick={handleJoinClick}
            className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition"
          >
            Unirme
          </button>
        )}
      </div>
    </div>
  );
}
