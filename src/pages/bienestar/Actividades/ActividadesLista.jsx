// src/pages/bienestar/Actividades/ActividadesLista.jsx
import { useState, useEffect } from "react";
import { listarActividades } from "../../../services/bienestar";
import CardActividad from "../../../components/bienestar/CardActividad";
import EmptyState from "../../../components/bienestar/EmptyState";

export default function ActividadesLista({ refresh, onNuevaActividad }) {
  const [loading, setLoading] = useState(true);
  const [actividades, setActividades] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("Todas");

  const cargarActividades = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtroTipo !== "Todas") {
        params.type = filtroTipo;
      }
      const data = await listarActividades(params);
      // Ordenar por fecha descendente (más recientes primero)
      const ordenadas = data.sort(
        (a, b) => new Date(b.event_date) - new Date(a.event_date)
      );
      setActividades(ordenadas);
    } catch (err) {
      console.error("Error al cargar actividades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarActividades();
  }, [refresh, filtroTipo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (actividades.length === 0 && filtroTipo === "Todas") {
    return (
      <EmptyState
        title="No hay actividades disponibles"
        message="Sé el primero en crear una actividad extracurricular"
        actionLabel="Crear Actividad"
        onAction={onNuevaActividad}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {["Todas", "Deportiva", "Cultural", "Integración"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroTipo === tipo
                ? "bg-primary text-white"
                : "bg-white dark:bg-night text-ink dark:text-slate border border-gray-300 dark:border-slate/30 hover:bg-gray-50 dark:hover:bg-night/70"
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Lista de actividades */}
      {actividades.length === 0 ? (
        <div className="bg-white dark:bg-night rounded-lg border border-gray-200 dark:border-slate/20 p-8 text-center">
          <p className="text-slate dark:text-slate/70">No hay actividades de tipo "{filtroTipo}"</p>
          <button
            onClick={() => setFiltroTipo("Todas")}
            className="mt-3 text-primary hover:underline text-sm"
          >
            Ver todas las actividades
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actividades.map((actividad) => (
            <CardActividad key={actividad.id} actividad={actividad} />
          ))}
        </div>
      )}
    </div>
  );
}
