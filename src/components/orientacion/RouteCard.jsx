import React from 'react';

/**
 * Componente para mostrar una ruta de cursos recomendada
 */
const RouteCard = ({ route, index = 0 }) => {
  if (!route || !route.courses || route.courses.length === 0) {
    return null;
  }

  const totalDuration = route.courses.reduce((acc, course) => {
    const duration = course.duration || course.duration_hours || 0;
    return acc + duration;
  }, 0);

  return (
    <div className="bg-white dark:bg-night rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-slate/20 hover:scale-[1.01] animate-fade-in">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
              <div className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center font-bold text-xl">
                {index + 1}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {route.name || 'Ruta Recomendada'}
              </h3>
              {route.description && (
                <p className="text-purple-100 text-sm leading-relaxed">{route.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats mejoradas */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-bold text-sm">
              {route.courses.length} curso{route.courses.length !== 1 ? 's' : ''}
            </span>
          </div>
          {totalDuration > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-sm">{totalDuration}h total</span>
            </div>
          )}
        </div>
      </div>

      {/* Course list */}
      <div className="space-y-3">
        {route.courses.map((course, idx) => (
          <div 
            key={course.id || idx}
            className="border-l-4 border-primary pl-4 py-3 hover:bg-gray-50 dark:hover:bg-night/50 rounded-r transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-blue-100 dark:bg-primary/20 text-blue-800 dark:text-primary text-xs font-semibold px-2 py-1 rounded">
                    Paso {idx + 1}
                  </span>
                  {course.level && (
                    <span className={`
                      text-xs font-semibold px-2 py-1 rounded
                      ${course.level === 'basic' || course.level === 'básico' || course.level === 'basico'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                        : course.level === 'intermediate' || course.level === 'intermedio'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }
                    `}>
                      {course.level === 'basic' ? 'Básico' : 
                       course.level === 'intermediate' ? 'Intermedio' : 
                       course.level === 'advanced' ? 'Avanzado' : 
                       course.level}
                    </span>
                  )}
                </div>
                
                <h4 className="font-semibold text-ink dark:text-slate mb-1">
                  {course.title || course.name || course.course_name || 'Curso sin nombre'}
                </h4>
                
                {course.description && (
                  <p className="text-sm text-slate dark:text-slate/70 mb-2 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="flex gap-4 text-xs text-slate dark:text-slate/70">
                  {(course.duration || course.duration_hours) && (
                    <span>⏱️ {course.duration || course.duration_hours}h</span>
                  )}
                  {course.sessions && (
                    <span>📖 {course.sessions} sesiones</span>
                  )}
                  {course.credits && (
                    <span>🎓 {course.credits} créditos</span>
                  )}
                  {(course.code || course.course_id) && (
                    <span>📚 {course.code || `#${course.course_id}`}</span>
                  )}
                </div>
              </div>

              {/* Prerequisites indicator */}
              {idx > 0 && (
                <div className="flex-shrink-0 ml-4">
                  <div className="text-xs text-slate dark:text-slate/70 bg-gray-100 dark:bg-night/50 px-2 py-1 rounded">
                    Requiere paso {idx}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate/20">
        <p className="text-sm text-slate dark:text-slate/70 italic">
          💡 Esta ruta está diseñada considerando los prerrequisitos entre cursos para maximizar tu aprendizaje.
        </p>
      </div>
    </div>
  );
};

export default RouteCard;
