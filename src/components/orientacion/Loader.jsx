import React from 'react';

/**
 * Loader genérico para orientación vocacional
 */
const Loader = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default Loader;
