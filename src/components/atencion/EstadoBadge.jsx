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
    v === 'Resuelto'   ? 'bg-green-100 text-green-700 border-green-300' :
    v === 'En proceso' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                         'bg-gray-100 text-gray-700 border-gray-300';
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full border ${cls}`}>
      {v}
    </span>
  );
}
