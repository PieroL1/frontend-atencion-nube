/**
 * SERVICIO DE RECLAMOS/SUGERENCIAS
 * 
 * Maneja la comunicación con el backend para:
 * - Claims (reclamos/sugerencias)
 * - Claim Assignments (asignaciones/comentarios)
 * 
 * NOTAS:
 * - Usa /api/claims (no /api/reclamos) según backend actual
 * - Mappers bidireccionales para estudent_id ↔ student_id
 * - Maneja arrays directos o wrapeados en { data: [] }
 * - Estados de BD: 'Agendada', 'Realizada', 'Cancelada'
 * 
 * MODO DEMO:
 * - Detecta automáticamente si backend no responde
 * - Usa datos mock para desarrollo sin backend
 * - Notifica al usuario cuando está en modo demo
 */

import { api } from '../api';
import { showToast } from '../utils/toast';
import * as mock from './reclamosMock';

// Flag para modo demo (detecta automáticamente si backend está caído)
let demoMode = false;

// Helper para activar modo demo y notificar
const enableDemoMode = () => {
  if (!demoMode) {
    demoMode = true;
    showToast('⚠️ Modo Demo: Backend no disponible. Usando datos de prueba.', 'warning');
    // Emitir evento para que los componentes se actualicen
    window.dispatchEvent(new CustomEvent('demoModeChanged', { detail: { active: true } }));
  }
};

// Helper para desactivar modo demo cuando backend vuelve a funcionar
const disableDemoMode = () => {
  if (demoMode) {
    demoMode = false;
    console.log('✅ Backend conectado - modo demo desactivado');
    window.dispatchEvent(new CustomEvent('demoModeChanged', { detail: { active: false } }));
  }
};

// Helper para verificar si debe activarse modo demo
const shouldUseDemoMode = (error) => {
  // Error de red/conexión
  if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
    return true;
  }
  // Error 404 = ruta no implementada en backend
  if (error.response?.status === 404) {
    return true;
  }
  return false;
};

/**
 * Mapper: DB → Frontend
 * Convierte el formato del backend al formato usado en el frontend
 */
const mapClaim = (c) => ({
  id: c.id,
  code: c.id_claim ?? null,
  student_id: c.estudent_id, // Corrige typo de BD
  type: c.type, // 'Reclamo' | 'Sugerencia'
  category: c.category ?? '',
  priority: c.priority, // 'Alta' | 'Media' | 'Baja' | null
  description: c.description ?? '',
  state: c.state, // 'Agendada' | 'Realizada' | 'Cancelada'
  creation_date: c.creation_date,
  // Campos adicionales que puedan venir
  responsible_id: c.responsible_id ?? null,
  responsible_name: c.responsible_name ?? null,
  // Mapeo de relación student desde ClaimResource
  student_name: c.student 
    ? `${c.student.first_name} ${c.student.last_name}`.trim() 
    : (c.student_name ?? null),
});

/**
 * Mapper: DB → Frontend (Assignments)
 */
const mapAssignment = (a) => ({
  id: a.id,
  code: a.id_assignment ?? null,
  claim_id: a.claim_id,
  responsible_id: a.responsible_id,
  // El backend ahora envía responsible_name directamente
  responsible_name: a.responsible_name || `Responsable #${a.responsible_id}`,
  comments: a.comments ?? '',
  event_date: a.event_date,
});

/**
 * Normaliza respuesta: array directo o { data: [] }
 */
const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
};

/**
 * LISTAR CLAIMS
 * 
 * @param {Object} params - Filtros de búsqueda
 * @param {number} params.student_id - ID del estudiante
 * @param {number} params.responsible_id - ID del responsable
 * @param {string} params.type - 'Reclamo' | 'Sugerencia'
 * @param {string} params.category - Categoría
 * @param {string} params.priority - 'Alta' | 'Media' | 'Baja'
 * @param {string} params.state - 'Agendada' | 'Realizada' | 'Cancelada'
 * @param {string} params.from - Fecha inicio (YYYY-MM-DD)
 * @param {string} params.to - Fecha fin (YYYY-MM-DD)
 * @param {string} params.q - Búsqueda general
 * @returns {Promise<Array>}
 */
export const listarClaims = async (params = {}) => {
  try {
    let url = '/reclamos/getAll';
    let queryParams = { ...params };
    
    // Si es estudiante (tiene student_id), usar ruta segura que usa token
    if (params.student_id) {
      url = '/reclamos/getMyClaims'; // Nueva ruta que usa usuario autenticado
      // Remover student_id de query params (no se necesita, se toma del token)
      const { student_id, ...rest } = params;
      queryParams = rest;
    }
    
    console.log('🔍 Filtros enviados al backend:', queryParams);
    
    const { data } = await api.get(url, { params: queryParams });
    const arr = normalizeArray(data);
    
    console.log('✅ Data recibida del backend:', arr);
    
    // Backend funcionando correctamente
    disableDemoMode();
    
    return arr.map(mapClaim);
  } catch (error) {
    // Si backend no responde o ruta no existe, activar modo demo
    if (shouldUseDemoMode(error)) {
      enableDemoMode();
      const mockData = await mock.mockListarClaims(params);
      return mockData.map(mapClaim);
    }
    
    // Si no es un caso de modo demo, entonces sí es un error real
    console.error('Error al listar reclamos:', error);
    const msg = error.response?.data?.message || 'Error al cargar reclamos';
    showToast(msg, 'error');
    throw error;
  }
};

/**
 * CREAR CLAIM
 * 
 * @param {Object} payload
 * @param {number} payload.student_id - ID del estudiante
 * @param {string} payload.type - 'Reclamo' | 'Sugerencia'
 * @param {string} payload.category - Categoría
 * @param {string} payload.priority - 'Alta' | 'Media' | 'Baja'
 * @param {string} payload.description - Descripción (max 250 chars)
 * @param {string} [payload.state] - Estado inicial (default: 'Agendada')
 * @returns {Promise<Object>}
 */
export const crearClaim = async (payload) => {
  try {
    const requestData = {
      // ❌ NO enviar estudent_id - el backend lo deriva del token
      type: payload.type,
      category: payload.category,
      priority: payload.priority,
      description: payload.description,
      state: payload.state ?? 'Agendada', // Estado por defecto
    };
    
    console.log('📤 Enviando reclamo:', requestData);
    
    const { data } = await api.post('/reclamos/create', requestData);
    
    // Backend funcionando
    disableDemoMode();
    
    showToast(
      `${payload.type} creado exitosamente`,
      'success'
    );
    
    // El backend devuelve { message, data: ClaimResource }
    return mapClaim(data.data || data);
  } catch (error) {
    // Modo demo
    if (shouldUseDemoMode(error)) {
      enableDemoMode();
      // En modo demo sí necesitamos student_id del localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const mockData = await mock.mockCrearClaim({
        estudent_id: user.id,
        type: payload.type,
        category: payload.category,
        priority: payload.priority,
        description: payload.description,
        state: payload.state ?? 'Agendada',
      });
      showToast(`${payload.type} creado (Modo Demo)`, 'success');
      return mapClaim(mockData);
    }
    
    console.error('❌ Error al crear reclamo:', error);
    console.error('📋 Detalles validación:', error.response?.data);
    const msg = error.response?.data?.message 
      || error.response?.data?.error 
      || `Error al crear ${payload.type?.toLowerCase()}`;
    showToast(msg, 'error');
    throw error;
  }
};

/**
 * OBTENER DETALLE DE CLAIM
 * 
 * @param {number} id - ID del claim
 * @returns {Promise<Object>}
 */
export const getClaim = async (id) => {
  try {
    const { data } = await api.get(`/reclamos/get/${id}`);
    console.log('🔍 Data del claim desde backend:', data);
    
    // El backend puede devolver {data: ClaimResource} o ClaimResource directamente
    const claimData = data.data || data;
    console.log('📦 Claim data desempaquetado:', claimData);
    
    const mapped = mapClaim(claimData);
    console.log('✅ Claim mapeado:', mapped);
    return mapped;
  } catch (error) {
    // Modo demo
    if (shouldUseDemoMode(error)) {
      enableDemoMode();
      const mockData = await mock.mockGetClaim(id);
      return mapClaim(mockData);
    }
    
    console.error('Error al obtener detalle del reclamo:', error);
    const msg = error.response?.data?.message || 'Error al cargar el detalle';
    showToast(msg, 'error');
    throw error;
  }
};

/**
 * ACTUALIZAR ESTADO DE CLAIM
 * 
 * @param {number} id - ID del claim
 * @param {Object} payload
 * @param {string} payload.new_state - Nuevo estado: 'Agendada' | 'Realizada' | 'Cancelada'
 * @param {string} [payload.priority] - Prioridad: 'Alta' | 'Media' | 'Baja' | null
 * @param {string} [payload.note] - Nota opcional sobre el cambio
 * @returns {Promise<Object>}
 */
export const patchEstadoClaim = async (id, { new_state, priority, note }) => {
  try {
    const { data } = await api.put(`/reclamos/${id}`, {
      state: new_state,  // Backend espera 'state', no 'new_state'
      priority,
      // Nota: backend no maneja 'note' en update, se guarda como asignación separada
    });
    
    showToast('Estado actualizado correctamente', 'success');
    
    // El backend devuelve { message, data: ClaimResource }
    return mapClaim(data.data || data);
  } catch (error) {
    // Modo demo
    if (shouldUseDemoMode(error)) {
      enableDemoMode();
      const mockData = await mock.mockPatchEstadoClaim(id, { new_state, priority, note });
      showToast('Estado actualizado (Modo Demo)', 'success');
      return mapClaim(mockData);
    }
    
    console.error('Error al actualizar estado:', error);
    const msg = error.response?.data?.message || 'Error al actualizar el estado';
    showToast(msg, 'error');
    throw error;
  }
};

/**
 * LISTAR ASIGNACIONES DE UN CLAIM
 * 
 * @param {number} id - ID del claim
 * @returns {Promise<Array>}
 */
export const listarAsignaciones = async (id) => {
  try {
    const { data } = await api.get(`/asignaciones-reclamos/getAllByClaim/${id}`);
    console.log('📋 Asignaciones desde backend:', data);
    const arr = normalizeArray(data);
    const mapped = arr.map(mapAssignment);
    console.log('✅ Asignaciones mapeadas:', mapped);
    return mapped;
  } catch (error) {
    // Modo demo
    if (shouldUseDemoMode(error)) {
      enableDemoMode();
      const mockData = await mock.mockListarAsignaciones(id);
      return mockData.map(mapAssignment);
    }
    
    console.error('Error al listar asignaciones:', error);
    const msg = error.response?.data?.message || 'Error al cargar asignaciones';
    showToast(msg, 'error');
    throw error;
  }
};

/**
 * CREAR ASIGNACIÓN (comentario/bitácora)
 * 
 * @param {number} id - ID del claim
 * @param {Object} payload
 * @param {number} payload.responsible_id - ID del empleado responsable
 * @param {string} payload.comments - Comentarios (max 500 chars)
 * @returns {Promise<Object>}
 */
export const crearAsignacion = async (id, { responsible_id, comments }) => {
  try {
    // Formato de fecha compatible con Laravel: YYYY-MM-DD HH:mm:ss
    const now = new Date();
    const eventDate = now.toISOString().slice(0, 19).replace('T', ' ');
    
    const payload = {
      claim_id: id,  // Backend espera claim_id, no id en URL
      responsible_id,
      comments,
      event_date: eventDate,  // Formato: 2025-10-19 01:50:25
    };
    
    console.log('📤 Enviando asignación:', payload);
    
    const { data } = await api.post('/asignaciones-reclamos/create', payload);
    
    showToast('Comentario agregado correctamente', 'success');
    
    return mapAssignment(data);
  } catch (error) {
    // Modo demo
    if (shouldUseDemoMode(error)) {
      enableDemoMode();
      const mockData = await mock.mockCrearAsignacion(id, { responsible_id, comments });
      showToast('Comentario agregado (Modo Demo)', 'success');
      return mapAssignment(mockData);
    }
    
    console.error('Error al crear asignación:', error);
    console.error('📋 Errores de validación:', error.response?.data);
    console.error('📋 Campos con error:', JSON.stringify(error.response?.data?.message, null, 2));
    const msg = error.response?.data?.message || 'Error al agregar comentario';
    showToast(msg, 'error');
    throw error;
  }
};

/**
 * CONSTANTES DE ESTADOS
 */
export const ESTADOS = {
  AGENDADA: 'Agendada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
};

/**
 * CONSTANTES DE PRIORIDADES
 */
export const PRIORIDADES = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

/**
 * CONSTANTES DE TIPOS
 */
export const TIPOS = {
  RECLAMO: 'Reclamo',
  SUGERENCIA: 'Sugerencia',
};

/**
 * Helper: Obtiene color para estado
 */
export const getEstadoColor = (state) => {
  switch (state) {
    case ESTADOS.AGENDADA:
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
    case ESTADOS.REALIZADA:
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    case ESTADOS.CANCELADA:
      return 'bg-gray-100 dark:bg-slate/20 text-gray-800 dark:text-slate';
    default:
      return 'bg-gray-100 dark:bg-slate/20 text-gray-800 dark:text-slate';
  }
};

/**
 * Helper: Obtiene color para prioridad
 */
export const getPrioridadColor = (priority) => {
  switch (priority) {
    case PRIORIDADES.ALTA:
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
    case PRIORIDADES.MEDIA:
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
    case PRIORIDADES.BAJA:
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
    default:
      return 'bg-gray-100 dark:bg-slate/20 text-gray-800 dark:text-slate';
  }
};

/**
 * Helper: Obtiene etiqueta amigable para estado
 */
export const getEstadoLabel = (state) => {
  switch (state) {
    case ESTADOS.AGENDADA:
      return 'Pendiente';
    case ESTADOS.REALIZADA:
      return 'Atendida';
    case ESTADOS.CANCELADA:
      return 'Cancelada';
    default:
      return state;
  }
};
