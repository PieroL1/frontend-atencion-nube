// src/components/comunidad/EmptyState.jsx
export default function EmptyState({ message, icon = '📭', action }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-gray-600 mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
