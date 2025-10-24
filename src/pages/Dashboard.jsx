// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import { getUser } from '../auth';

const items = [
  { 
    name: 'Atención y Trámites', 
    href: '/atencion', 
    desc: 'Gestiona tus solicitudes y consultas administrativas',
    longDesc: 'Realiza seguimiento a tus trámites, solicita certificados y obtén atención personalizada para resolver tus necesidades académicas.',
    icon: '📋',
    color: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  { 
    name: 'Orientación Vocacional', 
    href: '/orientacion', 
    desc: 'Descubre tu ruta de aprendizaje personalizada',
    longDesc: 'Completa cuestionarios vocacionales y recibe recomendaciones de cursos adaptadas a tus intereses y objetivos profesionales.',
    icon: '🎓',
    color: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  { 
    name: 'Bienestar Estudiantil', 
    href: '/bienestar', 
    desc: 'Actividades y tutorías para tu desarrollo',
    longDesc: 'Inscríbete en actividades recreativas, solicita tutorías personalizadas y accede a recursos para mejorar tu experiencia universitaria.',
    icon: '🌟',
    color: 'from-green-500 to-green-600',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  { 
    name: 'Reclamos & Sugerencias', 
    href: '/reclamos', 
    desc: 'Tu voz importa - Reporta y sugiere mejoras',
    longDesc: 'Registra reclamos, envía sugerencias y realiza el seguimiento de tus solicitudes para mejorar la calidad educativa.',
    icon: '💬',
    color: 'from-orange-500 to-orange-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  { 
    name: 'Comunidad Estudiantil', 
    href: '/comunidad', 
    desc: 'Conéctate con otros estudiantes',
    longDesc: 'Participa en foros temáticos, chatea con compañeros, asiste a eventos y forma parte de una comunidad activa.',
    icon: '👥',
    color: 'from-pink-500 to-pink-600',
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
];

export default function Dashboard() {
  const user = getUser();
  const name = user?.full_name || user?.first_name || 'Estudiante';
  const firstName = name.split(' ')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-coal dark:to-ink">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header mejorado */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary border border-primary/30">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Panel Principal
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-ink dark:text-slate mb-2">
                ¡Hola, {firstName}! 👋
              </h1>
              <p className="text-lg text-slate dark:text-slate/70">
                Elige un módulo para continuar con tus actividades
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
                className="group relative bg-white dark:bg-night rounded-2xl overflow-hidden shadow-lg dark:shadow-slate/10 hover:shadow-2xl dark:hover:shadow-slate/20 transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-slate/20 hover:border-primary/40 dark:hover:border-primary/60"
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
                  <h3 className="text-xl font-bold text-ink dark:text-slate mb-2 group-hover:text-primary transition-colors">
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
                  <div className="mt-4 flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300">
                    <span className="text-sm font-semibold">Ingresar al módulo</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                {/* Borde animado en hover */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-semibold text-ink dark:text-slate">¿Necesitas ayuda?</h4>
            </div>
            <p className="text-sm text-slate dark:text-slate/70">
              Visita el módulo de Atención para obtener soporte personalizado
            </p>
          </div>

          <div className="bg-white dark:bg-night rounded-xl p-6 border border-gray-200 dark:border-slate/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </div>
              <h4 className="font-semibold text-ink dark:text-slate">Comunidad activa</h4>
            </div>
            <p className="text-sm text-slate dark:text-slate/70">
              Únete a foros y conecta con otros estudiantes
            </p>
          </div>

          <div className="bg-white dark:bg-night rounded-xl p-6 border border-gray-200 dark:border-slate/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <h4 className="font-semibold text-ink dark:text-slate">Orientación disponible</h4>
            </div>
            <p className="text-sm text-slate dark:text-slate/70">
              Descubre tu ruta de aprendizaje personalizada
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
