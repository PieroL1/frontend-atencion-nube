import { api as apiClient } from '../api';
import { showToast } from '../utils/toast';

/**
 * 🎯 Servicio de Orientación Vocacional
 * Conecta con el backend Laravel para el flujo de cuestionarios vocacionales
 */

// ==================== Helpers ====================

/**
 * Normaliza respuestas del backend que pueden venir como [] o { data: [] }
 */
const normalizeResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && response.data) {
    return Array.isArray(response.data) ? response.data : [response.data];
  }
  return [];
};

/**
 * Extrae data de respuesta exitosa del backend
 */
const extractData = (response) => {
  if (response.data && response.data.success !== undefined) {
    return response.data.data || response.data;
  }
  return response.data;
};

// ==================== Cuestionarios ====================

/**
 * Obtiene todos los cuestionarios vocacionales
 * @param {Object} params - Parámetros de filtro (activated, etc.)
 */
export const getAllQuestionnaires = async (params = {}) => {
  try {
    const response = await apiClient.get('/cuestionarios-vocacionales/getAll', { params });
    const data = extractData(response);
    return normalizeResponse(data);
  } catch (error) {
    console.error('Error al obtener cuestionarios:', error);
    showToast('Error al cargar cuestionarios', 'error');
    throw error;
  }
};

/**
 * Obtiene el cuestionario activo actual
 */
export const getActiveQuestionnaire = async () => {
  try {
    console.log('🔍 Llamando a /vocational-questionnaires/active...');
    const response = await apiClient.get('/vocational-questionnaires/active');
    console.log('✅ Respuesta del backend:', response.data);
    
    const data = extractData(response);
    console.log('📦 Data extraída:', data);
    
    if (!data) {
      showToast('No hay cuestionario activo disponible', 'warning');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error al obtener cuestionario activo:', error);
    showToast('Error al cargar cuestionario activo', 'error');
    throw error;
  }
};

/**
 * Obtiene un cuestionario por ID
 */
export const getQuestionnaireById = async (id) => {
  try {
    const response = await apiClient.get(`/cuestionarios-vocacionales/get/${id}`);
    return extractData(response);
  } catch (error) {
    console.error(`Error al obtener cuestionario ${id}:`, error);
    showToast('Error al cargar cuestionario', 'error');
    throw error;
  }
};

// ==================== Preguntas ====================

/**
 * Obtiene todas las preguntas de un cuestionario
 */
export const getQuestionsByQuestionnaire = async (questionnaireId) => {
  try {
    const response = await apiClient.get(`/preguntas-vocacionales/getAllByQuestionnaire/${questionnaireId}`);
    const data = extractData(response);
    return normalizeResponse(data);
  } catch (error) {
    console.error(`Error al obtener preguntas del cuestionario ${questionnaireId}:`, error);
    showToast('Error al cargar preguntas', 'error');
    throw error;
  }
};

/**
 * Obtiene una pregunta por ID
 */
export const getQuestionById = async (id) => {
  try {
    const response = await apiClient.get(`/preguntas-vocacionales/get/${id}`);
    return extractData(response);
  } catch (error) {
    console.error(`Error al obtener pregunta ${id}:`, error);
    showToast('Error al cargar pregunta', 'error');
    throw error;
  }
};

/**
 * Obtiene la primera pregunta (Q1) de un cuestionario
 * @param {number} questionnaireId 
 */
export const getFirstQuestion = async (questionnaireId) => {
  try {
    console.log('🔍 Obteniendo primera pregunta para cuestionario:', questionnaireId);
    const response = await apiClient.get(`/vocational-questions/questionnaire/${questionnaireId}/first`);
    console.log('✅ Respuesta primera pregunta:', response.data);
    
    const data = extractData(response);
    console.log('📦 Data primera pregunta:', data);
    
    if (!data) {
      showToast('No se encontró la pregunta inicial', 'warning');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error al obtener primera pregunta:', error);
    showToast('Error al cargar la primera pregunta', 'error');
    throw error;
  }
};

/**
 * Obtiene preguntas hijas basadas en la respuesta del padre
 * @param {number} questionnaireId 
 * @param {number} parentResponseId - ID de la respuesta seleccionada en Q1
 */
export const getChildQuestions = async (questionnaireId, parentResponseId) => {
  try {
    console.log('🔍 Obteniendo preguntas hijas para respuesta:', parentResponseId);
    const response = await apiClient.get(`/vocational-questions/questionnaire/${questionnaireId}/children/${parentResponseId}`);
    console.log('✅ Respuesta preguntas hijas:', response.data);
    
    const data = extractData(response);
    console.log('📦 Data preguntas hijas:', data);
    
    return normalizeResponse(data);
  } catch (error) {
    console.error('❌ Error al obtener preguntas hijas:', error);
    showToast('Error al cargar preguntas de seguimiento', 'error');
    throw error;
  }
};

// ==================== Respuestas (opciones de cada pregunta) ====================

/**
 * Obtiene todas las respuestas/opciones de una pregunta
 */
export const getResponsesByQuestion = async (questionId) => {
  try {
    console.log('🔍 Obteniendo respuestas para pregunta:', questionId);
    const response = await apiClient.get(`/vocational-responses/question/${questionId}`);
    console.log('✅ Respuesta opciones:', response.data);
    
    const data = extractData(response);
    console.log('📦 Data opciones:', data);
    
    return normalizeResponse(data);
  } catch (error) {
    console.error(`❌ Error al obtener respuestas de la pregunta ${questionId}:`, error);
    showToast('Error al cargar opciones', 'error');
    throw error;
  }
};

/**
 * Obtiene una respuesta por ID
 */
export const getResponseById = async (id) => {
  try {
    const response = await apiClient.get(`/respuestas-vocacionales/get/${id}`);
    return extractData(response);
  } catch (error) {
    console.error(`Error al obtener respuesta ${id}:`, error);
    throw error;
  }
};

// ==================== Answers (respuestas del estudiante) ====================

/**
 * Registra una respuesta del estudiante
 * @param {Object} answerData - { student_id, questionnaire_id, question_id, response_id }
 */
export const createAnswer = async (answerData) => {
  try {
    const response = await apiClient.post('/vocational-answers/create', answerData);
    const data = extractData(response);
    
    return data;
  } catch (error) {
    console.error('Error al registrar respuesta:', error);
    showToast('Error al guardar respuesta', 'error');
    throw error;
  }
};

/**
 * Obtiene todas las respuestas de un estudiante
 */
export const getAnswersByStudent = async (studentId) => {
  try {
    const response = await apiClient.get(`/vocational-answers/by-student/${studentId}`);
    const data = extractData(response);
    return normalizeResponse(data);
  } catch (error) {
    console.error(`Error al obtener respuestas del estudiante ${studentId}:`, error);
    throw error;
  }
};

/**
 * Obtiene las respuestas de un estudiante para un cuestionario específico
 */
export const getAnswersByQuestionnaire = async (questionnaireId) => {
  try {
    const response = await apiClient.get(`/vocational-answers/by-questionnaire/${questionnaireId}`);
    const data = extractData(response);
    return normalizeResponse(data);
  } catch (error) {
    console.error(`Error al obtener respuestas del cuestionario ${questionnaireId}:`, error);
    throw error;
  }
};

/**
 * Elimina todas las respuestas de un cuestionario (reiniciar test)
 */
export const deleteAnswersByQuestionnaire = async (questionnaireId) => {
  try {
    const response = await apiClient.delete(`/vocational-answers/by-questionnaire/${questionnaireId}`);
    return extractData(response);
  } catch (error) {
    console.error('Error al eliminar respuestas:', error);
    showToast('Error al reiniciar test', 'error');
    throw error;
  }
};

// ==================== Response Courses (cursos asociados a respuestas) ====================

/**
 * Obtiene los cursos recomendados para una respuesta específica (objetivo)
 */
export const getCoursesByResponse = async (responseId) => {
  try {
    const response = await apiClient.get(`/vocational-response-courses/by-response/${responseId}`);
    const data = extractData(response);
    return normalizeResponse(data);
  } catch (error) {
    console.error(`Error al obtener cursos de la respuesta ${responseId}:`, error);
    throw error;
  }
};

// ==================== Cursos ====================

/**
 * Obtiene todos los cursos
 */
export const getAllCourses = async () => {
  try {
    const response = await apiClient.get('/cursos/getAll');
    const data = extractData(response);
    return normalizeResponse(data);
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    throw error;
  }
};

/**
 * Obtiene un curso por ID
 */
export const getCourseById = async (id) => {
  try {
    const response = await apiClient.get(`/cursos/get/${id}`);
    return extractData(response);
  } catch (error) {
    console.error(`Error al obtener curso ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene los prerrequisitos de un curso
 */
export const getCoursePrerequisites = async (courseId) => {
  try {
    const response = await apiClient.get(`/course-previous-requirements/by-course/${courseId}`);
    const data = extractData(response);
    return normalizeResponse(data);
  } catch (error) {
    console.error(`Error al obtener prerrequisitos del curso ${courseId}:`, error);
    throw error;
  }
};

// ==================== Results (resultados finales) ====================

/**
 * Crea un resultado final (snapshot del test)
 * @param {Object} resultData - { student_id, questionnaire_id, recommended_profile, recommendation, score }
 */
export const createResult = async (resultData) => {
  try {
    const response = await apiClient.post('/vocational-results/create', resultData);
    const data = extractData(response);
    
    showToast('Resultado guardado exitosamente', 'success');
    return data;
  } catch (error) {
    console.error('Error al crear resultado:', error);
    showToast('Error al guardar resultado', 'error');
    throw error;
  }
};

/**
 * Obtiene todos los resultados de un estudiante
 */
export const getResultsByStudent = async (studentId) => {
  try {
    const response = await apiClient.get(`/vocational-results/by-student/${studentId}`);
    const data = extractData(response);
    return normalizeResponse(data);
  } catch (error) {
    console.error(`Error al obtener resultados del estudiante ${studentId}:`, error);
    throw error;
  }
};

/**
 * Obtiene el resultado más reciente de un estudiante para un cuestionario
 * Incluye las rutas asociadas al resultado (recalculándolas desde las respuestas)
 */
export const getLatestResultByQuestionnaire = async (studentId, questionnaireId) => {
  try {
    const results = await getResultsByStudent(studentId);
    const filtered = results
      .filter(r => r.questionnaire_id === questionnaireId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const latestResult = filtered[0];
    
    if (!latestResult) {
      return null;
    }

    // Obtener las respuestas del estudiante para recalcular las rutas
    try {
      console.log(`🔍 Recalculando rutas para resultado ${latestResult.id}...`);
      
      // Obtener todas las respuestas del estudiante
      const answers = await getAnswersByStudent(studentId);
      
      // Filtrar respuestas de este cuestionario
      const questionnaireAnswers = answers.filter(a => a.questionnaire_id === questionnaireId);
      console.log(`� Respuestas encontradas:`, questionnaireAnswers);
      
      if (questionnaireAnswers.length === 0) {
        console.warn('⚠️ No se encontraron respuestas para este cuestionario');
        return {
          result: latestResult,
          routes: [],
          profile: latestResult.recommended_profile || 'Perfil definido',
          recommendation: latestResult.recommendation || 'Recomendaciones personalizadas'
        };
      }
      
      // Extraer Q1 y Q2 response IDs
      // Asumiendo que Q1 es la primera pregunta y Q2 es la segunda
      const sortedAnswers = questionnaireAnswers.sort((a, b) => a.id - b.id);
      const q1ResponseId = sortedAnswers[0]?.response_id;
      const q2ResponseId = sortedAnswers[1]?.response_id;
      
      console.log(`🎯 Response IDs: Q1=${q1ResponseId}, Q2=${q2ResponseId}`);
      
      if (!q1ResponseId || !q2ResponseId) {
        console.warn('⚠️ No se encontraron ambas respuestas (Q1 y Q2)');
        return {
          result: latestResult,
          routes: [],
          profile: latestResult.recommended_profile || 'Perfil definido',
          recommendation: latestResult.recommendation || 'Recomendaciones personalizadas'
        };
      }
      
      // Recalcular las rutas usando la misma lógica que al finalizar
      const routesData = await calculateRecommendedRoutes(
        studentId,
        questionnaireId,
        q1ResponseId,
        q2ResponseId
      );
      
      console.log(`✅ Rutas recalculadas exitosamente:`, routesData);
      
      return {
        result: latestResult,
        routes: routesData.routes || [],
        profile: latestResult.recommended_profile || routesData.profile,
        recommendation: latestResult.recommendation || routesData.recommendation
      };
    } catch (routeError) {
      console.error('❌ Error al recalcular rutas del resultado:', routeError);
      // Devolver el resultado aunque falle la recalculación de rutas
      return {
        result: latestResult,
        routes: [],
        profile: latestResult.recommended_profile || 'Perfil definido',
        recommendation: latestResult.recommendation || 'Recomendaciones personalizadas'
      };
    }
  } catch (error) {
    console.error('Error al obtener último resultado:', error);
    throw error;
  }
};

// ==================== Flujo completo ====================

/**
 * Calcula las rutas de cursos recomendadas basándose en las respuestas del estudiante
 * @param {number} studentId 
 * @param {number} questionnaireId 
 * @param {number} q1ResponseId - Respuesta a Q1 (área)
 * @param {number} q2ResponseId - Respuesta a Q2 (objetivo)
 * @returns {Object} { routes: [...], profile: "...", recommendation: "..." }
 */
export const calculateRecommendedRoutes = async (studentId, questionnaireId, q1ResponseId, q2ResponseId) => {
  try {
    // 1. Obtener cursos recomendados para el objetivo seleccionado (Q2)
    const responseCourses = await getCoursesByResponse(q2ResponseId);
    
    if (!responseCourses || responseCourses.length === 0) {
      showToast('No hay cursos configurados para este objetivo', 'warning');
      return {
        routes: [],
        profile: 'Sin perfil definido',
        recommendation: 'No se encontraron cursos recomendados para esta combinación.'
      };
    }

    // 2. Ordenar por rank (si existe) o weight
    const sortedResponseCourses = responseCourses.sort((a, b) => {
      if (a.rank && b.rank) return a.rank - b.rank;
      if (a.weight && b.weight) return b.weight - a.weight;
      return 0;
    });

    // 3. Obtener detalles completos de cada curso
    console.log('📚 Cursos asociados a la respuesta:', sortedResponseCourses);
    
    const courseDetailsPromises = sortedResponseCourses.map(rc => {
      console.log(`  Obteniendo curso ID: ${rc.course_id}`);
      return getCourseById(rc.course_id);
    });
    const courseDetails = await Promise.all(courseDetailsPromises);
    
    console.log('📦 Detalles de cursos obtenidos:', courseDetails);
    
    // Filtrar cursos que existen y tienen ID válido
    const validCourses = courseDetails.filter(course => course && course.id);
    
    if (validCourses.length === 0) {
      console.warn('⚠️ No se encontraron cursos válidos');
      return {
        routes: [],
        profile: 'Sin perfil definido',
        recommendation: 'No se pudieron cargar los cursos recomendados.'
      };
    }

    // 4. Obtener prerrequisitos de cada curso
    const prerequisitesPromises = validCourses.map(course => {
      console.log(`  Obteniendo prerrequisitos del curso ${course.id}: ${course.title || course.name}`);
      return getCoursePrerequisites(course.id).catch(err => {
        console.warn(`⚠️ No se pudieron obtener prerrequisitos del curso ${course.id}:`, err.message);
        return []; // Retornar array vacío si falla
      });
    });
    const allPrerequisites = await Promise.all(prerequisitesPromises);
    
    console.log('🔗 Prerrequisitos obtenidos:', allPrerequisites);

    // 5. Construir rutas (ordenar cursos respetando prerrequisitos)
    const routes = [{
      id: q2ResponseId,
      name: 'Ruta Recomendada',
      courses: buildOrderedCourseList(validCourses, allPrerequisites)
    }];

    // 6. Generar perfil y recomendación
    const q1Response = await getResponseById(q1ResponseId);
    const q2Response = await getResponseById(q2ResponseId);
    
    const profile = q1Response?.text_response || q1Response?.text || 'Perfil no especificado';
    const recommendation = `Basado en tu interés en ${profile} y tu objetivo de ${q2Response?.text_response || q2Response?.text || 'aprendizaje'}, te recomendamos seguir esta ruta de cursos.`;

    console.log('✅ Rutas calculadas exitosamente:', { routes, profile, recommendation });

    return {
      routes,
      profile,
      recommendation,
      totalCourses: validCourses.length
    };
  } catch (error) {
    console.error('Error al calcular rutas:', error);
    showToast('Error al calcular recomendaciones', 'error');
    throw error;
  }
};

/**
 * Ordena una lista de cursos respetando prerrequisitos
 * @param {Array} courses - Lista de cursos
 * @param {Array} allPrerequisites - Lista de arrays de prerrequisitos por curso
 * @returns {Array} Cursos ordenados
 */
const buildOrderedCourseList = (courses, allPrerequisites) => {
  // Crear mapa de curso ID -> prerrequisitos
  const prereqMap = new Map();
  courses.forEach((course, index) => {
    prereqMap.set(course.id, allPrerequisites[index] || []);
  });

  // Ordenamiento topológico simple
  const ordered = [];
  const visited = new Set();
  const visiting = new Set();

  const visit = (courseId) => {
    if (visited.has(courseId)) return;
    if (visiting.has(courseId)) {
      // Ciclo detectado - ignorar para evitar bucle infinito
      return;
    }

    visiting.add(courseId);
    
    const prereqs = prereqMap.get(courseId) || [];
    prereqs.forEach(prereq => {
      if (prereqMap.has(prereq.previous_course_id)) {
        visit(prereq.previous_course_id);
      }
    });

    visiting.delete(courseId);
    visited.add(courseId);
    
    const course = courses.find(c => c.id === courseId);
    if (course && !ordered.find(c => c.id === courseId)) {
      ordered.push(course);
    }
  };

  courses.forEach(course => visit(course.id));

  return ordered;
};

/**
 * Finaliza el cuestionario: guarda resultado y retorna recomendaciones
 * @param {number} studentId 
 * @param {number} questionnaireId 
 * @param {number} q1ResponseId 
 * @param {number} q2ResponseId 
 */
export const finalizeQuestionnaire = async (studentId, questionnaireId, q1ResponseId, q2ResponseId) => {
  try {
    // 1. Calcular rutas
    const { routes, profile, recommendation, totalCourses } = await calculateRecommendedRoutes(
      studentId, 
      questionnaireId, 
      q1ResponseId, 
      q2ResponseId
    );

    // 2. Guardar resultado
    const resultData = {
      student_id: studentId,
      questionnaire_id: questionnaireId,
      recommended_profile: profile,
      recommendation: recommendation,
      score: totalCourses // Opcional: usar cantidad de cursos como score
    };

    const savedResult = await createResult(resultData);

    return {
      result: savedResult,
      routes,
      profile,
      recommendation
    };
  } catch (error) {
    console.error('Error al finalizar cuestionario:', error);
    throw error;
  }
};

/**
 * Reinicia el test de un estudiante (elimina respuestas y resultados)
 */
export const resetTest = async (studentId, questionnaireId) => {
  try {
    await deleteAnswersByQuestionnaire(questionnaireId);
    showToast('Test reiniciado exitosamente', 'success');
    return true;
  } catch (error) {
    console.error('Error al reiniciar test:', error);
    throw error;
  }
};

export default {
  // Cuestionarios
  getAllQuestionnaires,
  getActiveQuestionnaire,
  getQuestionnaireById,
  
  // Preguntas
  getQuestionsByQuestionnaire,
  getQuestionById,
  getFirstQuestion,
  getChildQuestions,
  
  // Respuestas (opciones)
  getResponsesByQuestion,
  getResponseById,
  
  // Answers (respuestas del estudiante)
  createAnswer,
  getAnswersByStudent,
  getAnswersByQuestionnaire,
  deleteAnswersByQuestionnaire,
  
  // Cursos
  getAllCourses,
  getCourseById,
  getCoursePrerequisites,
  getCoursesByResponse,
  
  // Resultados
  createResult,
  getResultsByStudent,
  getLatestResultByQuestionnaire,
  
  // Flujo completo
  calculateRecommendedRoutes,
  finalizeQuestionnaire,
  resetTest
};
