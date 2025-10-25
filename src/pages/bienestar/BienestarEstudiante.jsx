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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 dark:from-coal dark:to-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header mejorado */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-ink dark:text-slate">
                Bienestar Estudiantil
              </h1>
              <p className="text-slate dark:text-slate/70 mt-1 text-lg">
                Gestiona tus tutorías y participa en actividades extracurriculares
              </p>
            </div>
          </div>
        </div>

        {/* Tabs mejorados */}
        <div className="mb-8">
          <div className="bg-white dark:bg-night rounded-2xl shadow-lg p-2 border border-gray-200 dark:border-slate/20">
            <nav className="flex gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTabActivo(tab.id)}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    tabActivo === tab.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105"
                      : "text-slate dark:text-slate/70 hover:bg-gray-100 dark:hover:bg-slate/10"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido según tab activo */}
        <div>
          {/* TAB: Tutorías */}
          {tabActivo === "tutorias" && (
            <div className="space-y-6">
              {/* Botón crear mejorado */}
              <div className="flex justify-end">
                <button
                  onClick={() => setMostrarFormTutoria(!mostrarFormTutoria)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
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
                      d={mostrarFormTutoria ? "M6 18L18 6M6 6l12 12" : "M12 6v6m0 0v6m0-6h6m-6 0H6"}
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
            <div className="bg-white dark:bg-night rounded-2xl border border-gray-200 dark:border-slate/20 p-8 shadow-lg animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-ink dark:text-slate">
                    Historial de Tutorías
                  </h3>
                  <p className="text-slate dark:text-slate/70 text-sm">
                    Revisa todas tus tutorías anteriores
                  </p>
                </div>
              </div>
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
              {/* Botón crear mejorado */}
              <div className="flex justify-end">
                <button
                  onClick={() => setMostrarFormActividad(!mostrarFormActividad)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
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
                      d={mostrarFormActividad ? "M6 18L18 6M6 6l12 12" : "M12 6v6m0 0v6m0-6h6m-6 0H6"}
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
