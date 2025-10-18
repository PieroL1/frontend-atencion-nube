import { api } from "../api";

// --- Mappers (respetar columnas reales) ---
export const mapTutoria = (t) => {
  // Extraer IDs de las relaciones si están populated
  const studentId = t.student?.id || t.estudent_id || null;
  const instructorId = t.instructor?.id || t.instructor_id || null;
  
  return {
    id: t.id,
    code: t.id_tutorial ?? null,
    student_id: studentId,
    student: t.student || null,
    instructor_id: instructorId,
    instructor: t.instructor || null,
    scheduled_date: t.scheduled_date,
    type: t.type_tutorial,
    state: t.state,
    created_at: t.created_at,
    updated_at: t.updated_at,
  };
};

export const mapActividad = (x) => ({
  id: x.id,
  code: x.id_activity ?? null,
  name: x.activity_name,
  type: x.activity_type,
  description: x.description ?? "",
  event_date: x.event_date,
  student_creator_id: x.student_creator_id,
  student_creator: x.student_creator || null,
});

export const mapAsistencia = (a) => ({
  id: a.id,
  code: a.id_assistance ?? null,
  tutoring_id: a.tutoring_id,
  attended: a.attended,
  observations: a.observations ?? "",
  registration_date: a.registration_date,
  tutoring: a.tutoring || null,
});

// --- Tutorías ---

/**
 * Listar tutorías con filtros opcionales
 * @param {object} params - { student_id, instructor_id, state, type, from, to }
 */
export const listarTutorias = async (params = {}) => {
  try {
    // Ruta real: GET /api/tutorias/getAll
    const { data } = await api.get("/tutorias/getAll");
    
    // Normalizar respuesta (backend usa { success: true, data: [...] })
    let arr = Array.isArray(data) ? data : data?.data ?? [];
    
    // Mapear a formato frontend
    arr = arr.map(mapTutoria);
    
    // Filtrar en frontend (backend no implementa filtros en query params)
    if (params.student_id) {
      arr = arr.filter(t => t.student_id === params.student_id);
    }
    if (params.instructor_id) {
      arr = arr.filter(t => t.instructor_id === params.instructor_id);
    }
    if (params.state) {
      arr = arr.filter(t => t.state === params.state);
    }
    if (params.type) {
      arr = arr.filter(t => t.type === params.type);
    }
    if (params.from) {
      arr = arr.filter(t => new Date(t.scheduled_date) >= new Date(params.from));
    }
    if (params.to) {
      arr = arr.filter(t => new Date(t.scheduled_date) <= new Date(params.to));
    }
    
    return arr;
  } catch (error) {
    console.error('Error al listar tutorías:', error);
    throw error;
  }
};

/**
 * Listar tutorías de un estudiante específico
 * @param {number} studentId - ID del estudiante
 */
export const listarTutoriasPorEstudiante = async (studentId) => {
  try {
    // Ruta real: GET /api/tutorias/getByUser/{studentId}
    const { data } = await api.get(`/tutorias/getByUser/${studentId}`);
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return arr.map(mapTutoria);
  } catch (error) {
    console.error('Error al listar tutorías del estudiante:', error);
    throw error;
  }
};

/**
 * Obtener una tutoría específica
 * @param {number} id - ID de la tutoría
 */
export const obtenerTutoria = async (id) => {
  try {
    const { data } = await api.get(`/tutorias/get/${id}`);
    const tutoria = data?.data || data;
    return mapTutoria(tutoria);
  } catch (error) {
    console.error('Error al obtener tutoría:', error);
    throw error;
  }
};

/**
 * Crear una nueva tutoría
 * @param {object} payload - { student_id, instructor_id, scheduled_date, type, state }
 */
export const crearTutoria = async (payload) => {
  try {
    // IMPORTANTE: Backend NO acepta "Pendiente", mapear a "Agendada"
    let state = payload.state ?? "Pendiente";
    if (state === "Pendiente") {
      state = "Agendada"; // Gap #1: mapeo temporal
    }
    
    // Ruta real: POST /api/tutorias/create
    const response = await api.post("/tutorias/create", {
      estudent_id: payload.student_id,
      instructor_id: payload.instructor_id,
      scheduled_date: payload.scheduled_date,
      type_tutorial: payload.type,
      state: state,
    });
    
    return response;
  } catch (error) {
    console.error('Error al crear tutoría:', error);
    throw error;
  }
};

/**
 * Actualizar tutoría completa
 * @param {number} id - ID de la tutoría
 * @param {object} payload - Campos a actualizar
 */
export const actualizarTutoria = async (id, payload) => {
  try {
    // Ruta real: PUT /api/tutorias/{id}
    const body = {};
    
    if (payload.student_id !== undefined) body.estudent_id = payload.student_id;
    if (payload.instructor_id !== undefined) body.instructor_id = payload.instructor_id;
    if (payload.scheduled_date !== undefined) body.scheduled_date = payload.scheduled_date;
    if (payload.type !== undefined) body.type_tutorial = payload.type;
    if (payload.state !== undefined) {
      let state = payload.state;
      if (state === "Pendiente") state = "Agendada";
      body.state = state;
    }
    
    const response = await api.put(`/tutorias/${id}`, body);
    return response;
  } catch (error) {
    console.error('Error al actualizar tutoría:', error);
    throw error;
  }
};

/**
 * Cambiar solo el estado de una tutoría
 * @param {number} id - ID de la tutoría
 * @param {string} newState - Nuevo estado
 * @param {string} note - Nota opcional
 */
export const cambiarEstadoTutoria = async (id, newState, note = "") => {
  try {
    // Gap #2: No existe PATCH /api/tutorias/{id}/estado
    // Solución temporal: obtener tutoría completa y hacer PUT
    const tutoria = await obtenerTutoria(id);
    
    let state = newState;
    if (state === "Pendiente") state = "Agendada";
    
    const response = await api.put(`/tutorias/${id}`, {
      estudent_id: tutoria.student_id,
      instructor_id: tutoria.instructor_id,
      scheduled_date: tutoria.scheduled_date,
      type_tutorial: tutoria.type,
      state: state,
    });
    
    return response;
  } catch (error) {
    console.error('Error al cambiar estado de tutoría:', error);
    throw error;
  }
};

/**
 * Cancelar tutoría (wrapper de cambiarEstadoTutoria)
 * @param {number} id - ID de la tutoría
 * @param {string} note - Motivo de cancelación
 */
export const cancelarTutoria = (id, note = "") => {
  return cambiarEstadoTutoria(id, "Cancelada", note);
};

/**
 * Eliminar tutoría
 * @param {number} id - ID de la tutoría
 */
export const eliminarTutoria = async (id) => {
  try {
    const response = await api.delete(`/tutorias/${id}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar tutoría:', error);
    throw error;
  }
};

// --- Asistencias ---

/**
 * Listar todas las asistencias
 */
export const listarTodasAsistencias = async () => {
  try {
    // Ruta real: GET /api/asistencias-tutorias/getAll
    const { data } = await api.get("/asistencias-tutorias/getAll");
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return arr.map(mapAsistencia);
  } catch (error) {
    console.error('Error al listar asistencias:', error);
    throw error;
  }
};

/**
 * Listar asistencias de una tutoría
 * @param {number} tutoringId - ID de la tutoría
 */
export const listarAsistencias = async (tutoringId) => {
  try {
    // Ruta real: GET /api/asistencias-tutorias/getByTutoring/{tutoring_id}
    const { data } = await api.get(`/asistencias-tutorias/getByTutoring/${tutoringId}`);
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return arr.map(mapAsistencia);
  } catch (error) {
    // Si no hay asistencias, retornar array vacío en vez de error
    if (error.response?.status === 404) {
      return [];
    }
    console.error('Error al listar asistencias:', error);
    throw error;
  }
};

/**
 * Obtener una asistencia específica
 * @param {number} id - ID de la asistencia
 */
export const obtenerAsistencia = async (id) => {
  try {
    const { data } = await api.get(`/asistencias-tutorias/get/${id}`);
    const asistencia = Array.isArray(data) ? data[0] : data;
    return mapAsistencia(asistencia);
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    throw error;
  }
};

/**
 * Registrar asistencia de una tutoría
 * @param {number} tutoringId - ID de la tutoría
 * @param {object} payload - { attended: boolean, observations: string }
 */
export const registrarAsistencia = async (tutoringId, payload) => {
  try {
    // Gap #3: Backend requiere registration_date (debería ser automático)
    // Solución temporal: enviarlo desde frontend
    const response = await api.post("/asistencias-tutorias/create", {
      tutoring_id: tutoringId,
      attended: payload.attended,
      observations: payload.observations ?? "",
      registration_date: new Date().toISOString().slice(0, 19).replace('T', ' '), // formato: YYYY-MM-DD HH:MM:SS
    });
    
    return response;
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    throw error;
  }
};

/**
 * Actualizar asistencia
 * @param {number} id - ID de la asistencia
 * @param {object} payload - Campos a actualizar
 */
export const actualizarAsistencia = async (id, payload) => {
  try {
    const body = {};
    if (payload.attended !== undefined) body.attended = payload.attended;
    if (payload.observations !== undefined) body.observations = payload.observations;
    if (payload.tutoring_id !== undefined) body.tutoring_id = payload.tutoring_id;
    
    const response = await api.put(`/asistencias-tutorias/${id}`, body);
    return response;
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    throw error;
  }
};

/**
 * Eliminar asistencia
 * @param {number} id - ID de la asistencia
 */
export const eliminarAsistencia = async (id) => {
  try {
    const response = await api.delete(`/asistencias-tutorias/${id}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar asistencia:', error);
    throw error;
  }
};

// --- Actividades Extracurriculares ---

/**
 * Listar todas las actividades con filtros opcionales
 * @param {object} params - { type, from, to, created_by }
 */
export const listarActividades = async (params = {}) => {
  try {
    // Ruta real: GET /api/actividades-extracurriculares/getAll
    const { data } = await api.get("/actividades-extracurriculares/getAll");
    let arr = Array.isArray(data) ? data : data?.data ?? [];
    
    // Mapear
    arr = arr.map(mapActividad);
    
    // Filtrar en frontend (backend no implementa filtros)
    if (params.type) {
      arr = arr.filter(a => a.type === params.type);
    }
    if (params.created_by) {
      arr = arr.filter(a => a.student_creator_id === params.created_by);
    }
    if (params.from) {
      arr = arr.filter(a => new Date(a.event_date) >= new Date(params.from));
    }
    if (params.to) {
      arr = arr.filter(a => new Date(a.event_date) <= new Date(params.to));
    }
    if (params.q) {
      const query = params.q.toLowerCase();
      arr = arr.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      );
    }
    
    return arr;
  } catch (error) {
    console.error('Error al listar actividades:', error);
    throw error;
  }
};

/**
 * Listar actividades de un estudiante
 * @param {number} studentId - ID del estudiante creador
 */
export const listarActividadesPorEstudiante = async (studentId) => {
  try {
    // Ruta real: GET /api/actividades-extracurriculares/getAllByStudent/{id}
    const { data } = await api.get(`/actividades-extracurriculares/getAllByStudent/${studentId}`);
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return arr.map(mapActividad);
  } catch (error) {
    console.error('Error al listar actividades del estudiante:', error);
    throw error;
  }
};

/**
 * Obtener una actividad específica
 * @param {number} id - ID de la actividad
 */
export const obtenerActividad = async (id) => {
  try {
    const { data } = await api.get(`/actividades-extracurriculares/get/${id}`);
    const actividad = Array.isArray(data) ? data[0] : data;
    return mapActividad(actividad);
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    throw error;
  }
};

/**
 * Crear nueva actividad
 * @param {object} payload - { name, type, description, event_date, student_creator_id }
 */
export const crearActividad = async (payload) => {
  try {
    // Ruta real: POST /api/actividades-extracurriculares/create
    const response = await api.post("/actividades-extracurriculares/create", {
      activity_name: payload.name,
      activity_type: payload.type,
      description: payload.description || "",
      event_date: payload.event_date,
      student_creator_id: payload.student_creator_id,
    });
    
    return response;
  } catch (error) {
    console.error('Error al crear actividad:', error);
    throw error;
  }
};

/**
 * Actualizar actividad
 * @param {number} id - ID de la actividad
 * @param {object} payload - Campos a actualizar
 */
export const actualizarActividad = async (id, payload) => {
  try {
    const body = {};
    if (payload.name !== undefined) body.activity_name = payload.name;
    if (payload.type !== undefined) body.activity_type = payload.type;
    if (payload.description !== undefined) body.description = payload.description;
    if (payload.event_date !== undefined) body.event_date = payload.event_date;
    if (payload.student_creator_id !== undefined) body.student_creator_id = payload.student_creator_id;
    
    const response = await api.put(`/actividades-extracurriculares/${id}`, body);
    return response;
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    throw error;
  }
};

/**
 * Eliminar actividad
 * @param {number} id - ID de la actividad
 */
export const eliminarActividad = async (id) => {
  try {
    const response = await api.delete(`/actividades-extracurriculares/${id}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    throw error;
  }
};

// --- Instructores ---

/**
 * Listar instructores activos
 */
export const listarInstructores = async () => {
  try {
    const { data } = await api.get("/instructores/lista");
    const arr = Array.isArray(data) ? data : data?.data ?? [];
    return arr;
  } catch (error) {
    console.error('Error al listar instructores:', error);
    throw error;
  }
};

// --- Funciones legacy (mantener compatibilidad) ---
export const patchEstadoTutoria = cambiarEstadoTutoria;
