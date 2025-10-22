// src/components/comunidad/CardEvento.jsx
import { formatDate, truncateText } from '../../constants/community';

export default function CardEvento({ evento }) {
  const eventDate = new Date(evento.event_date);
  const isPastEvent = eventDate < new Date();

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${isPastEvent ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-center">
          <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${
            isPastEvent ? 'bg-gray-100' : 'bg-blue-100'
          }`}>
            <span className={`text-2xl font-bold ${isPastEvent ? 'text-gray-600' : 'text-blue-600'}`}>
              {eventDate.getDate()}
            </span>
            <span className={`text-xs ${isPastEvent ? 'text-gray-500' : 'text-blue-500'}`}>
              {eventDate.toLocaleDateString('es-CO', { month: 'short' }).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {evento.titulo}
            </h3>
            {isPastEvent && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                Finalizado
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-3">
            {truncateText(evento.description, 150)}
          </p>

          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>{formatDate(evento.event_date)}</span>
            {evento.creator_name && (
              <>
                <span className="mx-2">•</span>
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Por {evento.creator_name}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
