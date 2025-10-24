/**
 * Utilidad para gestionar el tema de la aplicación (light/dark/system)
 */

const THEME_KEY = 'theme-preference';

/**
 * Obtiene el tema guardado en localStorage
 * @returns {'light' | 'dark' | 'system'}
 */
export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'system';
}

/**
 * Guarda el tema en localStorage
 * @param {'light' | 'dark' | 'system'} theme
 */
export function setStoredTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Detecta si el sistema prefiere modo oscuro
 * @returns {boolean}
 */
export function getSystemPreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Calcula el tema efectivo basado en la preferencia
 * @param {'light' | 'dark' | 'system'} preference
 * @returns {'light' | 'dark'}
 */
export function getEffectiveTheme(preference) {
  if (preference === 'system') {
    return getSystemPreference() ? 'dark' : 'light';
  }
  return preference;
}

/**
 * Aplica el tema al documento HTML
 * @param {'light' | 'dark'} theme
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Inicializa el tema al cargar la aplicación
 */
export function initTheme() {
  const storedTheme = getStoredTheme();
  const effectiveTheme = getEffectiveTheme(storedTheme);
  applyTheme(effectiveTheme);
  
  // Escuchar cambios en las preferencias del sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentPreference = getStoredTheme();
    if (currentPreference === 'system') {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}
