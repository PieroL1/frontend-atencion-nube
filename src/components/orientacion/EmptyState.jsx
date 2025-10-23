import React from 'react';

/**
 * Estado vacío para orientación vocacional
 */
const EmptyState = ({ 
  icon = '📭', 
  title = 'No hay datos disponibles', 
  message = 'No se encontró información para mostrar.',
  action = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      <p className="text-gray-600 text-center max-w-md">{message}</p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
