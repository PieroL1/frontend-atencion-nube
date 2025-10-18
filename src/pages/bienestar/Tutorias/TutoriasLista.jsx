// src/pages/bienestar/Tutorias/TutoriasLista.jsx
import { useState, useEffect } from "react";
import { listarTutorias, cancelarTutoria } from "../../../services/bienestar";
import { dividirTutorias } from "../../../components/bienestar/helpers";
import CardTutoria from "../../../components/bienestar/CardTutoria";
import EmptyState from "../../../components/bienestar/EmptyState";
import { getUser } from "../../../auth";
import { toast } from "../../../utils/toast";

export default function TutoriasLista({ refresh, onNuevaTutoria }) {
  const [loading, setLoading] = useState(true);
  const [tutorias, setTutorias] = useState({ proximas: [], pasadas: [] });
  const [cancelando, setCancelando] = useState(null);

  const cargarTutorias = async () => {
    setLoading(true);
    try {
      const user = getUser();
      // Usar student_id si está disponible, sino user.id como fallback
      const studentId = user.student_id || user.id;
      const data = await listarTutorias({ student_id: studentId });
      const divididas = dividirTutorias(data);
      setTutorias(divididas);
    } catch (err) {
      console.error("Error al cargar tutorías:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTutorias();
  }, [refresh]);

  const handleCancelar = async (tutoria) => {
    if (!window.confirm("¿Estás seguro de cancelar esta tutoría?")) return;

    setCancelando(tutoria.id);
    try {
      await cancelarTutoria(tutoria.id, "Cancelado por estudiante");
      toast.success("Tutoría cancelada exitosamente");
      await cargarTutorias(); // Recargar lista
    } catch (err) {
      console.error("Error al cancelar tutoría:", err);
      toast.error("Error al cancelar la tutoría. Intenta nuevamente.");
    } finally {
      setCancelando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalTutorias = tutorias.proximas.length + tutorias.pasadas.length;

  if (totalTutorias === 0) {
    return (
      <EmptyState
        title="No tienes tutorías agendadas"
        message="Crea tu primera tutoría para recibir apoyo académico o psicológico"
        actionLabel="Crear Tutoría"
        onAction={onNuevaTutoria}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Próximas Tutorías */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-ink">
            Próximas Tutorías
            {tutorias.proximas.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate">
                ({tutorias.proximas.length})
              </span>
            )}
          </h2>
        </div>

        {tutorias.proximas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-slate">No tienes tutorías próximas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorias.proximas.map((tutoria) => (
              <CardTutoria
                key={tutoria.id}
                tutoria={tutoria}
                onCancelar={handleCancelar}
                showCancelar={cancelando !== tutoria.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Tutorías Pasadas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-ink">
            Tutorías Pasadas
            {tutorias.pasadas.length > 0 && (
              <span className="ml-2 text-sm font-normal text-slate">
                ({tutorias.pasadas.length})
              </span>
            )}
          </h2>
        </div>

        {tutorias.pasadas.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-slate">No hay tutorías pasadas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tutorias.pasadas.map((tutoria) => (
              <CardTutoria
                key={tutoria.id}
                tutoria={tutoria}
                showCancelar={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
