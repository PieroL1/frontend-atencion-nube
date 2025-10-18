// src/pages/bienestar/Instructor/TutoriasInstructorLista.jsx
import { useState, useEffect } from "react";
import { listarTutorias } from "../../../services/bienestar";
import { filtrarPorFecha } from "../../../components/bienestar/instructorHelpers";
import CardTutoriaInstructor from "../../../components/bienestar/CardTutoriaInstructor";
import ModalAsistencia from "../../../components/bienestar/ModalAsistencia";
import EmptyState from "../../../components/bienestar/EmptyState";
import { getUser } from "../../../auth";

export default function TutoriasInstructorLista({
  filtroEstado,
  filtroFecha = "todo",
  refresh,
}) {
  const [loading, setLoading] = useState(true);
  const [tutorias, setTutorias] = useState([]);
  const [tutoriaSeleccionada, setTutoriaSeleccionada] = useState(null);
  const [mostrarModalAsistencia, setMostrarModalAsistencia] = useState(false);

  const cargarTutorias = async () => {
    setLoading(true);
    try {
      const user = getUser();
      
      // Usar instructor_id si está disponible, sino user.id como fallback
      const instructorId = user.instructor_id || user.id;
      const params = { instructor_id: instructorId };

      // Aplicar filtro de estado si existe
      if (filtroEstado && filtroEstado.length > 0) {
        // Si hay múltiples estados, el backend debería soportar array
        // Por ahora, tomamos el primero o hacemos múltiples requests
        params.state = Array.isArray(filtroEstado) ? filtroEstado[0] : filtroEstado;
      }

      const data = await listarTutorias(params);

      // Aplicar filtro de fecha en cliente
      const filtradas = filtrarPorFecha(data, filtroFecha);

      setTutorias(filtradas);
    } catch (err) {
      console.error("Error al cargar tutorías:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTutorias();
  }, [refresh, filtroEstado, filtroFecha]);

  const handleRegistrarAsistencia = (tutoria) => {
    setTutoriaSeleccionada(tutoria);
    setMostrarModalAsistencia(true);
  };

  const handleCerrarModal = () => {
    setMostrarModalAsistencia(false);
    setTutoriaSeleccionada(null);
  };

  const handleExitoAsistencia = () => {
    cargarTutorias();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tutorias.length === 0) {
    return (
      <EmptyState
        title="No hay tutorías"
        message="No se encontraron tutorías con los filtros aplicados"
        icon={
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tutorias.map((tutoria) => (
          <CardTutoriaInstructor
            key={tutoria.id}
            tutoria={tutoria}
            onActualizar={cargarTutorias}
            onRegistrarAsistencia={handleRegistrarAsistencia}
          />
        ))}
      </div>

      {/* Modal de asistencia */}
      {mostrarModalAsistencia && tutoriaSeleccionada && (
        <ModalAsistencia
          tutoria={tutoriaSeleccionada}
          onClose={handleCerrarModal}
          onExito={handleExitoAsistencia}
        />
      )}
    </>
  );
}
