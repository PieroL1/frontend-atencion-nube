import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StepQuestion from '../../components/orientacion/StepQuestion';
import RouteCard from '../../components/orientacion/RouteCard';
import Loader from '../../components/orientacion/Loader';
import EmptyState from '../../components/orientacion/EmptyState';
import ErrorState from '../../components/orientacion/ErrorState';
import { showToast } from '../../utils/toast';
import { getUser } from '../../auth';
import {
  getActiveQuestionnaire,
  getFirstQuestion,
  getChildQuestions,
  getResponsesByQuestion,
  createAnswer,
  finalizeQuestionnaire,
  getLatestResultByQuestionnaire,
  resetTest
} from '../../services/orientacion';

/**
 * 🎯 Wizard de Orientación Vocacional
 * Flujo: Q1 (¿Qué quieres aprender?) → Q2 (¿Cuál es tu objetivo?) → Resultados
 */
const OrientacionWizard = () => {
  const navigate = useNavigate();
  
  // Estados del wizard
  const [step, setStep] = useState('loading'); // loading, q1, q2, results, error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Datos del cuestionario
  const [questionnaire, setQuestionnaire] = useState(null);
  const [q1Data, setQ1Data] = useState({ question: null, responses: [], selected: null });
  const [q2Data, setQ2Data] = useState({ question: null, responses: [], selected: null });
  const [results, setResults] = useState(null);

  // Usuario (obtener del contexto de auth)
  const [user, setUser] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setStep('loading');
      setError(null);

      // 1. Obtener usuario autenticado
      const userData = getCurrentUser();
      setUser(userData);

      // 2. Obtener cuestionario activo
      const activeQuestionnaire = await getActiveQuestionnaire();
      
      if (!activeQuestionnaire) {
        setStep('error');
        setError({ message: 'No hay un cuestionario activo disponible en este momento.' });
        return;
      }

      setQuestionnaire(activeQuestionnaire);

      // 3. Verificar si ya tiene resultados previos
      const existingResult = await getLatestResultByQuestionnaire(
        userData.student_id || userData.id,
        activeQuestionnaire.id
      );

      if (existingResult) {
        // Mostrar opción de retomar o reiniciar
        setResults(existingResult);
        setStep('results');
        return;
      }

      // 4. Cargar primera pregunta (Q1)
      await loadQ1(activeQuestionnaire.id);

    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
      setError(err);
      setStep('error');
    }
  };

  const loadQ1 = async (questionnaireId) => {
    try {
      setLoading(true);

      const q1 = await getFirstQuestion(questionnaireId);
      
      if (!q1) {
        throw new Error('No se encontró la pregunta inicial');
      }

      const responses = await getResponsesByQuestion(q1.id);

      setQ1Data({ question: q1, responses, selected: null });
      setStep('q1');
    } catch (err) {
      console.error('Error al cargar Q1:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadQ2 = async (questionnaireId, q1ResponseId) => {
    try {
      setLoading(true);

      // Obtener preguntas hijas basadas en la respuesta de Q1
      const childQuestions = await getChildQuestions(questionnaireId, q1ResponseId);

      if (!childQuestions || childQuestions.length === 0) {
        showToast('No hay preguntas de seguimiento configuradas', 'warning');
        // Ir directo a resultados con solo Q1
        await handleFinalize(q1ResponseId, null);
        return;
      }

      const q2 = childQuestions[0]; // Tomar la primera pregunta hija
      const responses = await getResponsesByQuestion(q2.id);

      setQ2Data({ question: q2, responses, selected: null });
      setStep('q2');
    } catch (err) {
      console.error('Error al cargar Q2:', err);
      showToast('Error al cargar la siguiente pregunta', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleQ1Select = async (response) => {
    try {
      setLoading(true);
      setQ1Data(prev => ({ ...prev, selected: response }));

      // Registrar respuesta en el backend
      await createAnswer({
        student_id: user.student_id || user.id,
        questionnaire_id: questionnaire.id,
        question_id: q1Data.question.id,
        response_id: response.id
      });

      showToast('Respuesta guardada', 'success');

      // Cargar Q2
      await loadQ2(questionnaire.id, response.id);
    } catch (err) {
      console.error('Error al seleccionar Q1:', err);
      showToast('Error al guardar respuesta', 'error');
      setLoading(false);
    }
  };

  const handleQ2Select = async (response) => {
    try {
      setLoading(true);
      setQ2Data(prev => ({ ...prev, selected: response }));

      // Registrar respuesta en el backend
      await createAnswer({
        student_id: user.student_id || user.id,
        questionnaire_id: questionnaire.id,
        question_id: q2Data.question.id,
        response_id: response.id
      });

      showToast('Respuesta guardada', 'success');

      // Finalizar y obtener resultados
      await handleFinalize(q1Data.selected.id, response.id);
    } catch (err) {
      console.error('Error al seleccionar Q2:', err);
      showToast('Error al guardar respuesta', 'error');
      setLoading(false);
    }
  };

  const handleFinalize = async (q1ResponseId, q2ResponseId) => {
    try {
      setLoading(true);

      if (!q2ResponseId) {
        // Si no hay Q2, usar solo Q1 para recomendaciones básicas
        showToast('Generando recomendaciones...', 'info');
        setResults({
          routes: [],
          profile: q1Data.selected?.text || 'Perfil definido',
          recommendation: 'Recomendaciones basadas en tu área de interés.'
        });
        setStep('results');
        return;
      }

      // Calcular y guardar resultados
      const finalResults = await finalizeQuestionnaire(
        user.student_id || user.id,
        questionnaire.id,
        q1ResponseId,
        q2ResponseId
      );

      setResults(finalResults);
      setStep('results');
      showToast('¡Test completado! 🎉', 'success');
    } catch (err) {
      console.error('Error al finalizar:', err);
      showToast('Error al generar resultados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Estás seguro de que quieres reiniciar el test? Se borrarán tus respuestas actuales.')) {
      return;
    }

    try {
      setLoading(true);
      await resetTest(user.student_id || user.id, questionnaire.id);
      
      // Recargar desde Q1
      await loadQ1(questionnaire.id);
    } catch (err) {
      console.error('Error al reiniciar:', err);
      showToast('Error al reiniciar test', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'q2') {
      setStep('q1');
      setQ2Data({ question: null, responses: [], selected: null });
    } else if (step === 'results') {
      navigate('/dashboard');
    }
  };

  // Helper para obtener usuario actual
  const getCurrentUser = () => {
    const user = getUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    return user;
  };

  // ==================== Renders ====================

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Loader message="Cargando cuestionario vocacional..." />
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <ErrorState
          title="Error al cargar cuestionario"
          message={error?.message || 'No se pudo cargar el cuestionario vocacional'}
          error={error}
          onRetry={loadInitialData}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🎓 Orientación Vocacional
              </h1>
              <p className="text-gray-600">
                Descubre tu ruta de aprendizaje personalizada
              </p>
            </div>
            
            {step !== 'results' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Volver al inicio
              </button>
            )}
          </div>

          {questionnaire && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold text-gray-900">{questionnaire.title}</h2>
              {questionnaire.description && (
                <p className="text-sm text-gray-600 mt-1">{questionnaire.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg">
          {step === 'q1' && (
            <StepQuestion
              question={q1Data.question}
              responses={q1Data.responses}
              onSelect={handleQ1Select}
              selectedId={q1Data.selected?.id}
              isLoading={loading}
              stepNumber={1}
              totalSteps={2}
            />
          )}

          {step === 'q2' && (
            <>
              <StepQuestion
                question={q2Data.question}
                responses={q2Data.responses}
                onSelect={handleQ2Select}
                selectedId={q2Data.selected?.id}
                isLoading={loading}
                stepNumber={2}
                totalSteps={2}
              />
              <div className="px-6 pb-6">
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  ← Volver a la pregunta anterior
                </button>
              </div>
            </>
          )}

          {step === 'results' && (
            <div className="p-6">
              {/* Results header */}
              <div className="mb-8 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Tu Ruta de Aprendizaje está Lista!
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {results?.recommendation || 'Basado en tus respuestas, hemos generado una ruta personalizada.'}
                </p>
              </div>

              {/* Profile badge */}
              {results?.profile && (
                <div className="mb-6 text-center">
                  <span className="inline-block bg-blue-100 text-blue-800 px-6 py-2 rounded-full font-semibold">
                    📊 Perfil: {results.profile}
                  </span>
                </div>
              )}

              {/* Routes */}
              {results?.routes && results.routes.length > 0 ? (
                <div className="space-y-6 mb-8">
                  {results.routes.map((route, idx) => (
                    <RouteCard key={route.id || idx} route={route} index={idx} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📚"
                  title="No hay rutas disponibles"
                  message="Aún no se han configurado rutas de cursos para esta combinación. Contáctanos para más información."
                />
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-center pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Volver al Dashboard
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  🔄 Reiniciar Test
                </button>
              </div>

              {/* Timestamp */}
              {results?.result?.created_at && (
                <p className="text-center text-sm text-gray-500 mt-6">
                  Resultado generado el {new Date(results.result.created_at).toLocaleString('es-PE', {
                    timeZone: 'America/Lima',
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrientacionWizard;
