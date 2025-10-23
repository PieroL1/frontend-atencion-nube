// src/pages/bienestar/Tutorias/TutoriaForm.jsx
import { useState, useEffect } from "react";
import { crearTutoria, listarInstructores } from "../../../services/bienestar";
import { generarHorasSugeridas } from "../../../components/bienestar/helpers";
import { getUser } from "../../../auth";
import { toast } from "../../../utils/toast";

export default function TutoriaForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [instructores, setInstructores] = useState([]);
  const [loadingInstructores, setLoadingInstructores] = useState(true);
  const [form, setForm] = useState({
    type: "Académica",
    fecha: "",
    hora: "09:00",
    instructor_id: "",
  });

  // Cargar instructores al montar el componente
  useEffect(() => {
    const fetchInstructores = async () => {
      try {
        const data = await listarInstructores();
        setInstructores(data);
      } catch (err) {
        console.error('Error al cargar instructores:', err);
        toast.error('Error al cargar instructores');
      } finally {
        setLoadingInstructores(false);
      }
    };

    fetchInstructores();
  }, []);

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
    if (!form.type) newErrors.type = "Selecciona un tipo de tutoría";
    if (!form.fecha) newErrors.fecha = "Selecciona una fecha";
    if (!form.hora) newErrors.hora = "Selecciona una hora";
    if (!form.instructor_id) newErrors.instructor_id = "Ingresa el ID del instructor";
    
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

      const scheduled_date = `${form.fecha}T${form.hora}:00-05:00`;

      await crearTutoria({
        student_id: user.student_id,
        instructor_id: parseInt(form.instructor_id),
        scheduled_date,
        type: form.type,
        state: "Agendada", // Cambiado de "Pendiente" a "Agendada"
      });

      // Reset form
      setForm({
        type: "Académica",
        fecha: "",
        hora: "09:00",
        instructor_id: "",
      });

      toast.success("¡Tutoría creada exitosamente!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error al crear tutoría:", err);
      const errorMsg = err.response?.data?.message || "Error al crear la tutoría";
      toast.error(errorMsg);
      setErrors({
        submit: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-ink mb-4">Nueva Tutoría</h3>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {errors.submit}
        </div>
      )}

      <div className="space-y-4">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Tipo de Tutoría *
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.type ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="Académica">Académica</option>
            <option value="Psicológica">Psicológica</option>
          </select>
          {errors.type && <p className="text-red-600 text-xs mt-1">{errors.type}</p>}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Fecha *
          </label>
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.fecha ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.fecha && <p className="text-red-600 text-xs mt-1">{errors.fecha}</p>}
        </div>

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Hora *
          </label>
          <select
            name="hora"
            value={form.hora}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              errors.hora ? "border-red-300" : "border-gray-300"
            }`}
          >
            {horas.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
          {errors.hora && <p className="text-red-600 text-xs mt-1">{errors.hora}</p>}
        </div>

        {/* Instructor */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Instructor *
          </label>
          {loadingInstructores ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg text-slate">
              Cargando instructores...
            </div>
          ) : (
            <select
              name="instructor_id"
              value={form.instructor_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.instructor_id ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Selecciona un instructor</option>
              {instructores.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.name} - {ins.expertise_area || 'Sin especialidad'}
                </option>
              ))}
            </select>
          )}
          {errors.instructor_id && (
            <p className="text-red-600 text-xs mt-1">{errors.instructor_id}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creando..." : "Crear Tutoría"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-300 text-ink rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
