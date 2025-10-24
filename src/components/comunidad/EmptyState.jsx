// src/components/comunidad/EmptyState.jsx
export default function EmptyState({ message, icon = '📭', action }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-slate dark:text-slate/70 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
