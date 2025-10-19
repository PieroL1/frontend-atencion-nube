/**
 * EMPTY STATE
 * Componente para mostrar cuando no hay resultados
 */

import React from 'react';

const EmptyState = ({ 
  icon = '📋', 
  title = 'No hay resultados', 
  message = 'No se encontraron elementos', 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 text-center max-w-md mb-6">
        {message}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
