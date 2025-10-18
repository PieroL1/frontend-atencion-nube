// src/pages/bienestar/Instructor/BienestarInstructor.jsx
import { useState } from "react";
import TutoriasInstructorLista from "./TutoriasInstructorLista";

const TABS = [
  { id: "pendientes", label: "Pendientes / Agendadas", icon: "⏳" },
  { id: "hoy", label: "Hoy", icon: "📅" },
  { id: "historial", label: "Historial", icon: "📚" },
];

const FILTROS_FECHA = [
  { value: "todo", label: "Todo" },
  { value: "hoy", label: "Hoy" },
  { value: "proximos7", label: "Próximos 7 días" },
];

export default function BienestarInstructor() {
  const [tabActivo, setTabActivo] = useState("pendientes");
  const [filtroFecha, setFiltroFecha] = useState("todo");
  const [refresh, setRefresh] = useState(0);

  // Definir filtros de estado según el tab
  const getFiltroEstado = () => {
    switch (tabActivo) {
      case "pendientes":
        return ["Pendiente", "Agendada"];
      case "hoy":
        return null; // Se filtra por fecha en el componente
      case "historial":
        return ["Realizada", "Cancelada"];
      default:
        return null;
    }
  };

  const getFiltroFechaTab = () => {
    if (tabActivo === "hoy") return "hoy";
    return filtroFecha;
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">
            Bienestar - Panel Instructor
          </h1>
          <p className="text-slate">
            Gestiona tus tutorías agendadas y registra asistencias
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setTabActivo(tab.id);
                  // Reset filtro de fecha al cambiar de tab
                  if (tab.id !== "hoy") setFiltroFecha("todo");
                }}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  tabActivo === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate hover:text-ink hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filtros de fecha (solo visible en tabs que no sean "hoy") */}
        {tabActivo !== "hoy" && (
          <div className="mb-6 flex items-center gap-3">
            <span className="text-sm font-medium text-ink">Filtrar por:</span>
            <div className="flex gap-2">
              {FILTROS_FECHA.map((filtro) => (
                <button
                  key={filtro.value}
                  onClick={() => setFiltroFecha(filtro.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroFecha === filtro.value
                      ? "bg-primary text-white"
                      : "bg-white text-ink border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Info del tab actual */}
        <div className="mb-6">
          {tabActivo === "pendientes" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Tip:</strong> Aquí aparecen las tutorías pendientes de
                aceptar y las ya agendadas que aún no han ocurrido.
              </p>
            </div>
          )}
          {tabActivo === "hoy" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>📅 Hoy:</strong> Tutorías programadas para el día de hoy.
              </p>
            </div>
          )}
          {tabActivo === "historial" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>📚 Historial:</strong> Tutorías realizadas y canceladas.
              </p>
            </div>
          )}
        </div>

        {/* Lista de tutorías */}
        <TutoriasInstructorLista
          filtroEstado={getFiltroEstado()}
          filtroFecha={getFiltroFechaTab()}
          refresh={refresh}
        />
      </div>
    </div>
  );
}
