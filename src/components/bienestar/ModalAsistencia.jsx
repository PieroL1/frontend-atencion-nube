// src/components/bienestar/ModalAsistencia.jsx
import { useState } from "react";
import { registrarAsistencia } from "../../services/bienestar";
import { toast } from "../../utils/toast";

export default function ModalAsistencia({ tutoria, onClose, onExito }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    attended: true,
    observations: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registrarAsistencia(tutoria.id, form);
      toast.success("Asistencia registrada exitosamente");
      if (onExito) onExito();
      onClose();
    } catch (err) {
      console.error("Error al registrar asistencia:", err);
      toast.error("Error al registrar la asistencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-ink">Registrar Asistencia</h3>
            <p className="text-sm text-slate mt-1">
              Tutoría #{tutoria.code || tutoria.id} - {tutoria.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate hover:text-ink transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asistió */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              ¿El estudiante asistió? *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="attended"
                  checked={form.attended === true}
                  onChange={() => setForm({ ...form, attended: true })}
                  className="mr-2"
                />
                <span className="text-sm">Sí, asistió</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="attended"
                  checked={form.attended === false}
                  onChange={() => setForm({ ...form, attended: false })}
                  className="mr-2"
                />
                <span className="text-sm">No asistió</span>
              </label>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Observaciones
            </label>
            <textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              rows={4}
              placeholder="Comentarios sobre la sesión, temas tratados, seguimiento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Guardando..." : "Guardar Asistencia"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 border border-gray-300 text-ink rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
