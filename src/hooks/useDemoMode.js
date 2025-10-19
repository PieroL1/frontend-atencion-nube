import { useState, useEffect } from 'react';

/**
 * Hook para detectar si el modo demo está activo
 * Escucha eventos de cambio de modo desde el service
 */
export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Función que se llamará cuando cambie el modo demo
    const handleDemoModeChange = (event) => {
      setIsDemoMode(event.detail.active);
    };

    // Escuchar eventos personalizados
    window.addEventListener('demoModeChanged', handleDemoModeChange);

    return () => {
      window.removeEventListener('demoModeChanged', handleDemoModeChange);
    };
  }, []);

  return isDemoMode;
};
