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
  const cls =
    v === 'Resuelto'   ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700/30' :
    v === 'En proceso' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700/30' :
                         'bg-gray-100 dark:bg-slate/20 text-gray-700 dark:text-slate border-gray-300 dark:border-slate/30';
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border whitespace-nowrap ${cls}`}>
      {v}
    </span>
  );
}
