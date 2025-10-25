import React from 'react';

/**
 * Componente para mostrar una pregunta del cuestionario con sus opciones
 * Tipo Platzi: botones grandes y claros
 */
const StepQuestion = ({ 
  question, 
  responses = [], 
  onSelect, 
  selectedId = null,
  isLoading = false,
  stepNumber = 1,
  totalSteps = 2
}) => {
  if (!question) return null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Progress indicator mejorado */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-bold text-ink dark:text-slate">
              Paso {stepNumber} de {totalSteps}
            </span>
          </div>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold">
            {Math.round((stepNumber / totalSteps) * 100)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate/20 rounded-full h-3 shadow-inner">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 shadow-md"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question mejorada */}
      <div className="mb-10 text-center">
        <div className="inline-block p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl mb-4">
          <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-ink dark:text-slate mb-4">
          {question.text_question || question.question_text || question.text}
        </h2>
        {question.description && (
          <p className="text-slate dark:text-slate/70 text-lg max-w-2xl mx-auto">
            {question.description}
          </p>
        )}
      </div>

      {/* Response options mejoradas */}
      <div className="space-y-4">
        {responses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate/10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate/30">
            <svg className="w-16 h-16 text-gray-400 dark:text-slate/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate dark:text-slate/70">No hay opciones disponibles para esta pregunta</p>
          </div>
        ) : (
          responses.map((response, idx) => (
            <button
              key={response.id}
              onClick={() => onSelect(response)}
              disabled={isLoading}
              className={`
                w-full p-6 rounded-2xl border-2 text-left transition-all duration-300
                hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] group
                ${selectedId === response.id
                  ? 'border-purple-500 dark:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg shadow-purple-500/20'
                  : 'border-gray-200 dark:border-slate/20 bg-white dark:bg-night hover:border-purple-300 dark:hover:border-purple-700/50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start">
                {/* Selection indicator mejorado */}
                <div className={`
                  flex-shrink-0 w-7 h-7 rounded-full border-2 mt-1 mr-4 flex items-center justify-center transition-all
                  ${selectedId === response.id 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-500 to-pink-500 shadow-md' 
                    : 'border-gray-300 dark:border-slate/30 group-hover:border-purple-400'
                  }
                `}>
                  {selectedId === response.id && (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Response content */}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1 transition-colors ${
                    selectedId === response.id 
                      ? 'text-purple-700 dark:text-purple-400' 
                      : 'text-ink dark:text-slate group-hover:text-purple-600 dark:group-hover:text-purple-400'
                  }`}>
                    {response.text_response || response.response_text || response.text}
                  </h3>
                  {response.description && (
                    <p className="text-sm text-slate dark:text-slate/70 leading-relaxed">
                      {response.description}
                    </p>
                  )}
                </div>

                {/* Arrow indicator mejorado */}
                <div className={`
                  flex-shrink-0 ml-4 transition-all
                  ${selectedId === response.id ? 'translate-x-1 scale-110' : 'group-hover:translate-x-1'}
                `}>
                  <svg 
                    className={`w-7 h-7 transition-colors ${
                      selectedId === response.id 
                        ? 'text-purple-500 dark:text-purple-400' 
                        : 'text-slate dark:text-slate/50 group-hover:text-purple-500'
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Helper text mejorado */}
      {responses.length > 0 && (
        <div className="text-center mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800/30">
          <p className="text-sm text-purple-700 dark:text-purple-400 font-medium flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Selecciona la opción que mejor se ajuste a tus intereses
          </p>
        </div>
      )}
    </div>
  );
};

export default StepQuestion;
