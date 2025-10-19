import { AlertTriangle } from 'lucide-react';

/**
 * Banner informativo para modo demo
 * Se muestra cuando el backend no está disponible y se usan datos mock
 */
export default function DemoBanner() {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded-r-lg shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">
            Modo Demo Activo
          </h3>
          <p className="text-sm text-amber-700">
            El backend no está disponible. Se están usando datos de prueba locales. 
            Los cambios que realices <strong>no se guardarán permanentemente</strong> y se perderán al recargar la página.
          </p>
          <p className="text-xs text-amber-600 mt-2">
            💡 Para conectar con el backend real, asegúrate de que el servidor esté corriendo en <code className="bg-amber-100 px-1 rounded">http://127.0.0.1:8000</code>
          </p>
        </div>
      </div>
    </div>
  );
}
