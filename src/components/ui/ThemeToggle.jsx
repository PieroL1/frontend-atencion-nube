import React, { useState, useEffect } from 'react';
import { getStoredTheme, setStoredTheme, getEffectiveTheme, applyTheme } from '../../utils/theme';

/**
 * 🌓 Componente toggle para cambiar entre modo claro/oscuro/sistema
 */
export default function ThemeToggle() {
  const [preference, setPreference] = useState('system');
  const [effectiveTheme, setEffectiveTheme] = useState('light');

  useEffect(() => {
    // Cargar preferencia guardada
    const stored = getStoredTheme();
    setPreference(stored);
    setEffectiveTheme(getEffectiveTheme(stored));

    // Escuchar cambios del sistema si está en modo 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preference === 'system') {
        const newTheme = getEffectiveTheme('system');
        setEffectiveTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preference]);

  const handleToggle = () => {
    // Ciclo: light → dark → system → light
    let newPreference;
    if (preference === 'light') {
      newPreference = 'dark';
    } else if (preference === 'dark') {
      newPreference = 'system';
    } else {
      newPreference = 'light';
    }

    setPreference(newPreference);
    setStoredTheme(newPreference);
    const newEffectiveTheme = getEffectiveTheme(newPreference);
    setEffectiveTheme(newEffectiveTheme);
    applyTheme(newEffectiveTheme);
  };

  const getIcon = () => {
    if (preference === 'light') return '☀️';
    if (preference === 'dark') return '🌙';
    return '💻'; // system
  };

  const getLabel = () => {
    if (preference === 'light') return 'Modo Claro';
    if (preference === 'dark') return 'Modo Oscuro';
    return 'Modo Sistema';
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                 bg-gray-100 hover:bg-gray-200 dark:bg-night dark:hover:bg-slate/20
                 text-ink dark:text-slate"
      title={`Cambiar tema (actual: ${getLabel()})`}
      aria-label={`Cambiar tema. Actual: ${getLabel()}`}
    >
      <span className="text-xl" role="img" aria-hidden="true">
        {getIcon()}
      </span>
      <span className="text-sm font-medium hidden sm:inline">
        {getLabel()}
      </span>
    </button>
  );
}
