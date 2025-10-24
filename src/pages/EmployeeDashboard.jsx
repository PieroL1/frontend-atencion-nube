// src/pages/EmployeeDashboard.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUser } from '../auth';
import { solicitudes_list } from '../services/atencion';
import { listarClaims } from '../services/reclamos';
import { api } from '../api';

const items = [
  { 
    name: 'Bandeja de Atenciones', 
    href: '/atencion', 
    desc: 'Gestiona solicitudes estudiantiles',
    longDesc: 'Revisa, prioriza y responde a las solicitudes de atención de los estudiantes. Cambia estados y proporciona seguimiento efectivo.',
    icon: '📥',
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  { 
    name: 'Reclamos y Sugerencias', 
    href: '/reclamos-employee', 
    desc: 'Gestiona feedback estudiantil',
    longDesc: 'Analiza reclamos, revisa sugerencias y toma acciones para mejorar la calidad del servicio educativo y la experiencia estudiantil.',
    icon: '📝',
    color: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  { 
    name: 'Gestión de Foros', 
    href: '/empleado/foros', 
    desc: 'Modera la comunidad estudiantil',
    longDesc: 'Aprueba foros, modera publicaciones y supervisa las interacciones en la comunidad para mantener un ambiente colaborativo y respetuoso.',
    icon: '🛡️',
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
];

export default function EmployeeDashboard() {
  const u = getUser();
  const name = u?.full_name || u?.first_name || 'Colaborador';
  const firstName = name.split(' ')[0];

  const [stats, setStats] = useState({
    atenciones: 0,
    reclamos: 0,
    foros: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Cargar atenciones activas (no resueltas)
      const atencionesResponse = await solicitudes_list({});
      const atencionesActivas = atencionesResponse.data?.filter(
        a => a.current_state !== 'Resuelto' && a.current_state !== 'Rechazado'
      ) || [];

      // Cargar reclamos pendientes
      const reclamosResponse = await listarClaims();
      const reclamosPendientes = reclamosResponse?.filter(
        r => r.estado !== 'Resuelto' && r.estado !== 'Cerrado'
      ) || [];

      // Cargar foros pendientes de aprobación (llamada directa al API)
      const forosResponse = await api.get('/student-community-forums/getAll', {
        params: { state: 'Pendiente' }
      });
      const forosPendientes = Array.isArray(forosResponse.data) 
        ? forosResponse.data 
        : forosResponse.data.data ?? [];

      setStats({
        atenciones: atencionesActivas.length,
        reclamos: reclamosPendientes.length,
        foros: forosPendientes.length,
        loading: false
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setStats({
        atenciones: 0,
        reclamos: 0,
        foros: 0,
        loading: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-coal dark:to-ink">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header mejorado */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Panel de Empleado
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-ink dark:text-slate mb-2">
                ¡Bienvenido, {firstName}! 💼
              </h1>
              <p className="text-lg text-slate dark:text-slate/70">
                Gestiona atenciones, reclamos y modera la comunidad estudiantil
              </p>
            </div>
          </div>
        </section>

        {/* Grid de módulos - Diseño mejorado */}
        <section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group relative bg-white dark:bg-night rounded-2xl overflow-hidden shadow-lg dark:shadow-slate/10 hover:shadow-2xl dark:hover:shadow-slate/20 transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-slate/20 hover:border-purple-400 dark:hover:border-purple-600"
              >
                {/* Gradient header */}
                <div className={`h-32 bg-gradient-to-br ${item.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  {/* Patrón decorativo */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Icono grande */}
                  <div className={`w-16 h-16 ${item.iconBg} rounded-2xl flex items-center justify-center -mt-14 mb-4 shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-4xl">{item.icon}</span>
                  </div>

                  {/* Título */}
                  <h3 className="text-xl font-bold text-ink dark:text-slate mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {item.name}
                  </h3>

                  {/* Descripción corta */}
                  <p className="text-sm text-slate dark:text-slate/70 font-medium mb-3">
                    {item.desc}
                  </p>

                  {/* Descripción larga */}
                  <p className="text-xs text-slate/80 dark:text-slate/60 leading-relaxed line-clamp-3">
                    {item.longDesc}
                  </p>

                  {/* Badge de acción */}
                  <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 group-hover:translate-x-2 transition-transform duration-300">
                    <span className="text-sm font-semibold">Acceder al módulo</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                {/* Borde animado en hover */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer informativo */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-night rounded-xl p-6 border border-gray-200 dark:border-slate/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                </svg>
              </div>
              <h4 className="font-semibold text-ink dark:text-slate">Solicitudes pendientes</h4>
            </div>
            <p className="text-sm text-slate dark:text-slate/70">
              Revisa tu bandeja de atenciones para gestionar solicitudes
            </p>
          </div>

          <div className="bg-white dark:bg-night rounded-xl p-6 border border-gray-200 dark:border-slate/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-ink dark:text-slate">Feedback estudiantil</h4>
            </div>
            <p className="text-sm text-slate dark:text-slate/70">
              Analiza reclamos y sugerencias para mejorar el servicio
            </p>
          </div>

          <div className="bg-white dark:bg-night rounded-xl p-6 border border-gray-200 dark:border-slate/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-ink dark:text-slate">Moderación activa</h4>
            </div>
            <p className="text-sm text-slate dark:text-slate/70">
              Supervisa foros y mantén un ambiente colaborativo
            </p>
          </div>
        </section>

        {/* Estadísticas rápidas (opcional - puede personalizarse con datos reales) */}
        <section className="mt-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-1">Panel de control</h3>
              <p className="text-purple-100">Vista general de tus responsabilidades</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">
                {stats.loading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  stats.atenciones
                )}
              </div>
              <div className="text-sm text-purple-100">Atenciones activas</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">
                {stats.loading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  stats.reclamos
                )}
              </div>
              <div className="text-sm text-purple-100">Reclamos pendientes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold mb-1">
                {stats.loading ? (
                  <div className="animate-pulse">...</div>
                ) : (
                  stats.foros
                )}
              </div>
              <div className="text-sm text-purple-100">Foros por aprobar</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
