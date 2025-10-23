import React from 'react';

/**
 * Estado de error para orientación vocacional
 */
const ErrorState = ({ 
  title = 'Algo salió mal', 
  message = 'Ocurrió un error al cargar la información.',
  onRetry = null,
  error = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-2xl font-bold text-red-600">{title}</h3>
      <p className="text-gray-600 text-center max-w-md">{message}</p>
      
      {error && (
        <details className="mt-4 p-4 bg-red-50 rounded-lg max-w-md w-full">
          <summary className="cursor-pointer text-sm text-red-700 font-medium">
            Ver detalles técnicos
          </summary>
          <pre className="mt-2 text-xs text-red-600 overflow-auto">
            {error.message || JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          🔄 Reintentar
        </button>
      )}
    </div>
  );
};

export default ErrorState;
