// src/components/atencion/EstadoBadge.jsx
// Helpers y componente visual del "chip" de estado para Atención.

export function normalizeStateUI(value) {
  if (!value) return 'Recibido';
  // Si llega en inglés desde la BD, lo traduzco:
  if (value === 'in_progress') return 'En proceso';
  if (value === 'completed')   return 'Resuelto';
  if (value === 'received')    return 'Recibido';
  // Si ya viene en español, lo dejo:
  return value;
}

export function formatDate(d) {
  try {
    const dt = new Date(d);
    return dt.toLocaleString();
  } catch {
    return d;
  }
}

export function renderStateChange(prev, next) {
  const p = normalizeStateUI(prev);
  const n = normalizeStateUI(next);
  if (!prev && next) return `→ ${n}`;
  if (prev && next)  return `${p} → ${n}`;
  return '';
}

export default function EstadoBadge({ value }) {
  const v = normalizeStateUI(value);
  
  // Configuración de estilos e iconos según estado
  const config = {
    'Resuelto': {
      bg: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700/30',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    'En proceso': {
      bg: 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
      text: 'text-yellow-700 dark:text-yellow-400',
      border: 'border-yellow-300 dark:border-yellow-700/30',
      icon: (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    'Recibido': {
      bg: 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-300 dark:border-blue-700/30',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )
    }
  };

  const currentConfig = config[v] || {
    bg: 'bg-gray-100 dark:bg-slate/20',
    text: 'text-gray-700 dark:text-slate',
    border: 'border-gray-300 dark:border-slate/30',
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border-2 whitespace-nowrap shadow-sm ${currentConfig.bg} ${currentConfig.text} ${currentConfig.border}`}>
      {currentConfig.icon}
      {v}
    </span>
  );
}
