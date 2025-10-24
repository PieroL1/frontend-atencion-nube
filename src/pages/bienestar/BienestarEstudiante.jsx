// src/pages/bienestar/BienestarEstudiante.jsx
import { useState } from "react";
import TutoriaForm from "./Tutorias/TutoriaForm";
import TutoriasLista from "./Tutorias/TutoriasLista";
import ActividadForm from "./Actividades/ActividadForm";
import ActividadesLista from "./Actividades/ActividadesLista";

const TABS = [
  { id: "tutorias", label: "Tutorías", icon: "📚" },
  { id: "historial", label: "Historial", icon: "📋" },
  { id: "actividades", label: "Actividades", icon: "🎯" },
];

export default function BienestarEstudiante() {
  const [tabActivo, setTabActivo] = useState("tutorias");
  const [mostrarFormTutoria, setMostrarFormTutoria] = useState(false);
  const [mostrarFormActividad, setMostrarFormActividad] = useState(false);
  const [refreshTutorias, setRefreshTutorias] = useState(0);
  const [refreshActividades, setRefreshActividades] = useState(0);

  const handleCrearTutoriaSuccess = () => {
    setMostrarFormTutoria(false);
    setRefreshTutorias((prev) => prev + 1);
  };

  const handleCrearActividadSuccess = () => {
    setMostrarFormActividad(false);
    setRefreshActividades((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink dark:text-slate mb-2">
            Bienestar Estudiantil
          </h1>
          <p className="text-slate dark:text-slate/70">
            Gestiona tus tutorías y participa en actividades extracurriculares
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-slate/20">
          <nav className="flex space-x-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActivo(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  tabActivo === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate dark:text-slate/70 hover:text-ink dark:hover:text-slate hover:border-gray-300 dark:hover:border-slate/40"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido según tab activo */}
        <div>
          {/* TAB: Tutorías */}
          {tabActivo === "tutorias" && (
            <div className="space-y-6">
              {/* Botón crear */}
              <div className="flex justify-end">
                <button
                  onClick={() => setMostrarFormTutoria(!mostrarFormTutoria)}
                  className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {mostrarFormTutoria ? "Cancelar" : "Nueva Tutoría"}
                </button>
              </div>

              {/* Formulario */}
              {mostrarFormTutoria && (
                <TutoriaForm
                  onSuccess={handleCrearTutoriaSuccess}
                  onCancel={() => setMostrarFormTutoria(false)}
                />
              )}

              {/* Lista */}
              <TutoriasLista
                refresh={refreshTutorias}
                onNuevaTutoria={() => setMostrarFormTutoria(true)}
              />
            </div>
          )}

          {/* TAB: Historial */}
          {tabActivo === "historial" && (
            <div className="bg-white dark:bg-night rounded-lg border border-gray-200 dark:border-slate/20 p-6">
              <h3 className="text-lg font-semibold text-ink dark:text-slate mb-4">
                Historial de Tutorías
              </h3>
              <p className="text-slate dark:text-slate/70 mb-4">
                Aquí se mostrarán todas tus tutorías pasadas para que puedas
                revisarlas.
              </p>
              {/* Reutilizamos la lista pero mostrando solo las pasadas */}
              <TutoriasLista
                refresh={refreshTutorias}
                onNuevaTutoria={() => {
                  setTabActivo("tutorias");
                  setMostrarFormTutoria(true);
                }}
              />
            </div>
          )}

          {/* TAB: Actividades */}
          {tabActivo === "actividades" && (
            <div className="space-y-6">
              {/* Botón crear */}
              <div className="flex justify-end">
                <button
                  onClick={() => setMostrarFormActividad(!mostrarFormActividad)}
                  className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  {mostrarFormActividad ? "Cancelar" : "Nueva Actividad"}
                </button>
              </div>

              {/* Formulario */}
              {mostrarFormActividad && (
                <ActividadForm
                  onSuccess={handleCrearActividadSuccess}
                  onCancel={() => setMostrarFormActividad(false)}
                />
              )}

              {/* Lista */}
              <ActividadesLista
                refresh={refreshActividades}
                onNuevaActividad={() => setMostrarFormActividad(true)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
