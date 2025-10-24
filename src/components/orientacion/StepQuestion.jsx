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
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate dark:text-slate/70">
            Paso {stepNumber} de {totalSteps}
          </span>
          <span className="text-sm text-slate dark:text-slate/70">
            {Math.round((stepNumber / totalSteps) * 100)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-ink/50 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-ink dark:text-slate mb-2">
          {question.text_question || question.question_text || question.text}
        </h2>
        {question.description && (
          <p className="text-slate dark:text-slate/70 mt-2">
            {question.description}
          </p>
        )}
      </div>

      {/* Response options */}
      <div className="space-y-3">
        {responses.length === 0 ? (
          <div className="text-center py-8 text-slate dark:text-slate/70">
            No hay opciones disponibles para esta pregunta
          </div>
        ) : (
          responses.map((response) => (
            <button
              key={response.id}
              onClick={() => onSelect(response)}
              disabled={isLoading}
              className={`
                w-full p-6 rounded-xl border-2 text-left transition-all duration-200
                hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                ${selectedId === response.id
                  ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md'
                  : 'border-gray-200 dark:border-slate/20 bg-white dark:bg-night/50 hover:border-primary/50 dark:hover:border-primary/50'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start">
                {/* Selection indicator */}
                <div className={`
                  flex-shrink-0 w-6 h-6 rounded-full border-2 mt-1 mr-4 flex items-center justify-center
                  ${selectedId === response.id 
                    ? 'border-primary bg-primary' 
                    : 'border-gray-300 dark:border-slate/30'
                  }
                `}>
                  {selectedId === response.id && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Response content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-ink dark:text-slate mb-1">
                    {response.text_response || response.response_text || response.text}
                  </h3>
                  {response.description && (
                    <p className="text-sm text-slate dark:text-slate/70">
                      {response.description}
                    </p>
                  )}
                </div>

                {/* Arrow indicator */}
                <div className={`
                  flex-shrink-0 ml-4 transition-transform
                  ${selectedId === response.id ? 'translate-x-1' : ''}
                `}>
                  <svg 
                    className={`w-6 h-6 ${selectedId === response.id ? 'text-primary' : 'text-slate dark:text-slate/50'}`} 
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

      {/* Helper text */}
      {responses.length > 0 && (
        <p className="text-center text-sm text-slate dark:text-slate/70 mt-6">
          Selecciona la opción que mejor se ajuste a tus intereses
        </p>
      )}
    </div>
  );
};

export default StepQuestion;
