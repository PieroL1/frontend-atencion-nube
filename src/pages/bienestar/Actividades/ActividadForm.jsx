// src/pages/bienestar/Actividades/ActividadForm.jsx
import { useState } from "react";
import { crearActividad } from "../../../services/bienestar";
import { generarHorasSugeridas } from "../../../components/bienestar/helpers";
import { getUser } from "../../../auth";
import { toast } from "../../../utils/toast";

export default function ActividadForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    type: "Deportiva",
    fecha: "",
    hora: "09:00",
    description: "",
  });

  const horas = generarHorasSugeridas();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "El nombre es requerido";
    if (!form.type) newErrors.type = "Selecciona un tipo de actividad";
    if (!form.fecha) newErrors.fecha = "Selecciona una fecha";
    if (!form.hora) newErrors.hora = "Selecciona una hora";
    
    // Validar fecha futura
    if (form.fecha) {
      const selectedDate = new Date(`${form.fecha}T${form.hora}:00`);
      if (selectedDate <= new Date()) {
        newErrors.fecha = "La fecha debe ser futura";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = getUser();

      // Validar que el usuario tenga student_id
      if (!user.student_id) {
        toast.error('Tu cuenta no tiene un perfil de estudiante asociado. Contacta al administrador.');
        setErrors({
          submit: 'Tu cuenta no tiene un perfil de estudiante asociado. Contacta al administrador.'
        });
        setLoading(false);
        return;
      }

      const event_date = `${form.fecha}T${form.hora}:00-05:00`;

      await crearActividad({
        name: form.name,
        type: form.type,
        description: form.description,
        event_date,
        student_creator_id: user.student_id,
      });

      // Reset form
      setForm({
        name: "",
        type: "Deportiva",
        fecha: "",
        hora: "09:00",
        description: "",
      });

      toast.success("¡Actividad creada exitosamente!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error al crear actividad:", err);
      const errorMsg = err.response?.data?.message || "Error al crear la actividad";
      toast.error(errorMsg);
      setErrors({
        submit: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-night rounded-lg border border-gray-200 dark:border-slate/20 p-6">
      <h3 className="text-lg font-semibold text-ink dark:text-slate mb-4">Nueva Actividad</h3>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 text-sm rounded-lg">
          {errors.submit}
        </div>
      )}

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-ink dark:text-slate mb-1.5">
            Nombre de la Actividad *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej: Futsal Interfacultades"
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-night/50 text-ink dark:text-slate focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.name ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-slate/30"
            }`}
          />
          {errors.name && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-ink dark:text-slate mb-1.5">
            Tipo de Actividad *
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-night/50 text-ink dark:text-slate focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.type ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-slate/30"
            }`}
          >
            <option value="Deportiva">Deportiva</option>
            <option value="Cultural">Cultural</option>
            <option value="Integración">Integración</option>
          </select>
          {errors.type && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.type}</p>}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-ink dark:text-slate mb-1.5">
            Fecha del Evento *
          </label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-night/50 text-ink dark:text-slate focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.fecha ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-slate/30"
            }`}
          />
          {errors.fecha && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.fecha}</p>}
        </div>

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium text-ink dark:text-slate mb-1.5">
            Hora *
          </label>
          <select
            name="hora"
            value={form.hora}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-night/50 text-ink dark:text-slate focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.hora ? "border-red-300 dark:border-red-600" : "border-gray-300 dark:border-slate/30"
            }`}
          >
            {horas.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
          {errors.hora && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.hora}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-ink dark:text-slate mb-1.5">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe brevemente la actividad..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creando..." : "Crear Actividad"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-300 dark:border-slate/30 text-ink dark:text-slate rounded-lg hover:bg-gray-50 dark:hover:bg-night/50 font-medium transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
