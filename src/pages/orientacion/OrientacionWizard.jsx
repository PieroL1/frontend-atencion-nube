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

      console.log('🔍 Resultado existente encontrado:', existingResult);

      if (existingResult && existingResult.result) {
        // Si hay un resultado previo, cargar las rutas completas
        console.log('✅ Mostrando resultados previos');
        setResults(existingResult);
        setStep('results');
        return;
      }

      console.log('➡️ No hay resultados previos, iniciando cuestionario');

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-coal dark:to-ink py-12">
        <Loader message="Cargando cuestionario vocacional..." />
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-coal dark:to-ink py-12">
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-purple-50/30 to-pink-50/30 dark:from-coal dark:to-ink py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-ink dark:text-slate mb-2">
                  Orientación Vocacional
                </h1>
                <p className="text-slate dark:text-slate/70 text-lg">
                  Descubre tu ruta de aprendizaje personalizada ✨
                </p>
              </div>
            </div>
            
            {step !== 'results' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-xl text-slate dark:text-slate/70 hover:bg-white dark:hover:bg-night hover:text-ink dark:hover:text-slate transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
            )}
          </div>

          {questionnaire && (
            <div className="bg-white dark:bg-night rounded-2xl p-6 shadow-lg border-2 border-purple-200 dark:border-purple-900/30">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h2 className="font-bold text-ink dark:text-slate text-lg">{questionnaire.title}</h2>
                  {questionnaire.description && (
                    <p className="text-slate dark:text-slate/70 mt-1">{questionnaire.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-night rounded-xl shadow-lg dark:shadow-slate/10">
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
                  className="text-primary hover:text-primary/80 font-medium disabled:opacity-50"
                >
                  ← Volver a la pregunta anterior
                </button>
              </div>
            </>
          )}

          {step === 'results' && (
            <div className="p-8">
              {/* Results header con animación */}
              <div className="mb-10 text-center animate-fade-in">
                <div className="text-7xl mb-6 animate-bounce">🎉</div>
                <h2 className="text-4xl font-bold text-ink dark:text-slate mb-4">
                  ¡Tu Ruta de Aprendizaje está Lista!
                </h2>
                <p className="text-slate dark:text-slate/70 max-w-2xl mx-auto text-lg">
                  {results?.recommendation || 'Basado en tus respuestas, hemos generado una ruta personalizada para ti.'}
                </p>
              </div>

              {/* Profile badge mejorado */}
              {results?.profile && (
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700/30 text-purple-800 dark:text-purple-300 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Perfil: {results.profile}
                  </div>
                </div>
              )}

              {/* Routes */}
              {results?.routes && results.routes.length > 0 ? (
                <div className="space-y-6 mb-10">
                  {results.routes.map((route, idx) => (
                    <RouteCard key={route.id || idx} route={route} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="mb-10">
                  <EmptyState
                    icon="📚"
                    title="No hay rutas disponibles"
                    message="Aún no se han configurado rutas de cursos para esta combinación. Contáctanos para más información."
                  />
                </div>
              )}

              {/* Actions mejoradas */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t-2 border-gray-200 dark:border-slate/20">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white rounded-xl transition-all font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Volver al Dashboard
                </button>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-xl disabled:opacity-50 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reiniciar Test
                </button>
              </div>

              {/* Timestamp mejorado */}
              {results?.result?.created_at && (
                <div className="text-center mt-8 p-4 bg-gray-50 dark:bg-slate/10 rounded-xl">
                  <p className="text-sm text-slate dark:text-slate/70 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Resultado generado el {new Date(results.result.created_at).toLocaleString('es-PE', {
                      timeZone: 'America/Lima',
                      dateStyle: 'long',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrientacionWizard;
