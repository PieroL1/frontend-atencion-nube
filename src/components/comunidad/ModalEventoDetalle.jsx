// src/components/comunidad/ModalEventoDetalle.jsx
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ModalEventoDetalle({ isOpen, onClose, evento }) {
  if (!isOpen || !evento) return null;

  const formatEventDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  const isPastEvent = new Date(evento.event_date) < new Date();

  return (
    <div 
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-night rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b border-gray-200 dark:border-slate/20 ${isPastEvent ? 'bg-gray-50 dark:bg-night/50' : 'bg-blue-50 dark:bg-primary/10'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{isPastEvent ? '📋' : '🎉'}</span>
                <h2 className="text-2xl font-bold text-ink dark:text-slate">
                  {evento.titulo}
                </h2>
              </div>
              <div className="flex items-center text-lg font-medium mt-2">
                <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className={isPastEvent ? 'text-slate dark:text-slate/70' : 'text-primary'}>
                  {formatEventDate(evento.event_date)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate transition ml-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Estado del evento */}
          <div className="mb-6">
            {isPastEvent ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-slate/20 text-slate dark:text-slate/80">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Evento finalizado
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Próximo evento
              </span>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-ink dark:text-slate mb-3">Descripción</h3>
            <p className="text-slate dark:text-slate/70 leading-relaxed whitespace-pre-wrap">
              {evento.description}
            </p>
          </div>

          {/* Organizador */}
          {evento.creator_name && (
            <div className="border-t border-gray-200 dark:border-slate/20 pt-4">
              <div className="flex items-center text-slate dark:text-slate/70">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">
                  <span className="font-medium">Organizado por:</span> {evento.creator_name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-night/50 px-6 py-4 border-t border-gray-200 dark:border-slate/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
