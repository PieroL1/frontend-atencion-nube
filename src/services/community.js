// src/services/community.js
import { api } from '../api';
import { getUser } from '../auth';

// ============================================
// MAPPERS - respetan nombres de columnas de BD
// ============================================

const mapForo = (data) => ({
  id: data.id,
  code: data.id_forum ?? null,
  title: data.title,
  description: data.description,
  associated_program: data.associated_program,
  state: data.state,
  creation_date: data.creation_date,
  creator_id: data.creator_id ?? null,
  // Campos adicionales que pueden venir en detalle
  is_member: data.is_member ?? false,
  is_moderator: data.is_moderator ?? false,
  is_owner: data.is_owner ?? false,
  role: data.role ?? null, // 'Owner', 'Moderador', 'Miembro'
  posts_count: data.posts_count ?? 0,
  members_count: data.members_count ?? 0,
  creator_name: data.creator_name ?? null,
});

const mapVinculacion = (data) => ({
  id: data.id,
  forum_id: data.id_foro,
  student_id: data.id_estudiante,
  tipo: data.tipo,
  joined_at: data.fecha_vinculacion,
});

const mapPost = (data) => ({
  id: data.id,
  code: data.id_publicacion ?? null,
  forum_id: data.forum_id,
  student_id: data.student_id,
  content: data.content,
  creation_date: data.creation_date,
  moderado: data.moderado,
  // Datos del autor si vienen populados
  author_name: data.author_name ?? null,
  author_email: data.author_email ?? null,
});

const mapEvento = (data) => ({
  id: data.id,
  code: data.id_event ?? null,
  titulo: data.titulo,
  description: data.description,
  event_date: data.event_date,
  student_id: data.student_id,
  // Datos del creador si vienen
  creator_name: data.creator_name ?? null,
});

const mapMensaje = (data) => ({
  id: data.id,
  code: data.id_message ?? null,
  sender_id: data.sender_id,
  receiver_id: data.receiver_id,
  content: data.content,
  sent_date: data.sent_date,
  seen: data.seen,
  // Datos adicionales
  sender_name: data.sender_name ?? null,
  receiver_name: data.receiver_name ?? null,
});

// ============================================
// SERVICIOS - FOROS
// ============================================

/**
 * Listar todos los foros con filtros opcionales
 * Solo muestra foros aprobados (Activo o Finalizado)
 * @param {Object} params - { titulo, programa, state }
 */
export async function listarForos(params = {}) {
  try {
    const response = await api.get('/student-community-forums/getAll', { params });
    const foros = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    // Filtrar solo foros aprobados (no Pendiente ni Rechazado)
    return foros
      .filter(f => f.state === 'Activo' || f.state === 'Finalizado')
      .map(mapForo);
  } catch (error) {
    console.error('Error al listar foros:', error);
    throw error;
  }
}

/**
 * Obtener detalle de un foro específico
 * @param {number} id 
 */
export async function getForo(id) {
  try {
    const response = await api.get(`/student-community-forums/get/${id}`);
    return mapForo(response.data.data ?? response.data);
  } catch (error) {
    console.error(`Error al obtener foro ${id}:`, error);
    throw error;
  }
}

/**
 * Obtener foros donde el usuario está vinculado
 */
export async function misForos() {
  try {
    const user = getUser();
    if (!user || !user.id) {
      throw new Error('Usuario no autenticado');
    }
    const response = await api.get(`/student-community-forums/getByUser/${user.id}`);
    const foros = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    return foros.map(mapForo);
  } catch (error) {
    console.error('Error al obtener mis foros:', error);
    throw error;
  }
}

/**
 * Crear un nuevo foro
 * @param {Object} payload - { title, description, associated_program }
 */
export async function crearForo(payload) {
  try {
    const response = await api.post('/student-community-forums/create', {
      title: payload.title,
      description: payload.description,
      associated_program: payload.associated_program,
      // state y creation_date se asignan automáticamente en backend
      // creator_id se asigna automáticamente en backend
      // La vinculación Owner se crea automáticamente
    });
    return mapForo(response.data.data ?? response.data);
  } catch (error) {
    console.error('Error al crear foro:', error);
    throw error;
  }
}

/**
 * Actualizar estado de un foro (Pendiente→Activo/Rechazado, Activo→Finalizado)
 * @param {number} forumId 
 * @param {string} newState - 'Activo', 'Rechazado', 'Finalizado'
 */
export async function actualizarEstadoForo(forumId, newState) {
  try {
    const response = await api.patch(`/student-community-forums/${forumId}/estado`, {
      state: newState,
    });
    return mapForo(response.data.data ?? response.data);
  } catch (error) {
    console.error(`Error al actualizar estado del foro ${forumId}:`, error);
    throw error;
  }
}

/**
 * Cerrar un foro (Solo Owner, cambia a Finalizado)
 * @param {number} forumId 
 */
export async function cerrarForo(forumId) {
  try {
    const response = await api.post(`/student-community-forums/${forumId}/cerrar`);
    return mapForo(response.data.data ?? response.data);
  } catch (error) {
    console.error(`Error al cerrar foro ${forumId}:`, error);
    throw error;
  }
}

/**
 * Eliminar un foro (Solo Owner)
 * @param {number} forumId 
 */
export async function eliminarForo(forumId) {
  try {
    const response = await api.delete(`/student-community-forums/delete/${forumId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar foro ${forumId}:`, error);
    throw error;
  }
}

// ============================================
// SERVICIOS - VINCULACIONES
// ============================================

/**
 * Unirse a un foro
 * @param {number} forumId 
 * @param {string} tipo - 'Miembro' por defecto
 */
export async function unirmeForo(forumId, tipo = 'Miembro') {
  try {
    // NOTA: Este endpoint será creado en backend
    // POST /api/student-community-forums/join-forum/{forumId}
    const response = await api.post(`/student-community-forums/join-forum/${forumId}`, {
      tipo,
    });
    return mapVinculacion(response.data.data ?? response.data);
  } catch (error) {
    console.error(`Error al unirse al foro ${forumId}:`, error);
    throw error;
  }
}

/**
 * Salir de un foro
 * @param {number} forumId 
 */
export async function salirForo(forumId) {
  try {
    // NOTA: Este endpoint será creado en backend
    // DELETE /api/student-community-forums/leave-forum/{forumId}
    const response = await api.delete(`/student-community-forums/leave-forum/${forumId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al salir del foro ${forumId}:`, error);
    throw error;
  }
}

/**
 * Obtener lista de miembros del foro
 * @param {number} forumId 
 */
export async function obtenerMiembrosForo(forumId) {
  try {
    const response = await api.get(`/student-community-forums/${forumId}/members`);
    const members = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    return members;
  } catch (error) {
    console.error(`Error al obtener miembros del foro ${forumId}:`, error);
    throw error;
  }
}

/**
 * Cambiar el rol de un miembro (Solo Owner)
 * @param {number} forumId 
 * @param {Object} payload - { student_id, new_role }
 */
export async function cambiarRolMiembro(forumId, payload) {
  try {
    const response = await api.patch(`/student-community-forums/${forumId}/members/role`, {
      student_id: payload.student_id,
      new_role: payload.new_role,
    });
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar rol en foro ${forumId}:`, error);
    throw error;
  }
}

// ============================================
// SERVICIOS - POSTS
// ============================================

/**
 * Listar posts de un foro
 * @param {number} forumId 
 */
export async function listarPosts(forumId) {
  try {
    const response = await api.get(`/posts-comunidad-estudiantil/getAllByForum/${forumId}`);
    const posts = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    return posts.map(mapPost);
  } catch (error) {
    console.error(`Error al listar posts del foro ${forumId}:`, error);
    throw error;
  }
}

/**
 * Crear post en un foro
 * @param {number} forumId 
 * @param {Object} payload - { content }
 */
export async function crearPost(forumId, payload) {
  try {
    const response = await api.post('/posts-comunidad-estudiantil/create', {
      forum_id: forumId,
      content: payload.content,
    });
    return mapPost(response.data.data ?? response.data);
  } catch (error) {
    console.error(`Error al crear post en foro ${forumId}:`, error);
    throw error;
  }
}

/**
 * Eliminar post
 * @param {number} postId 
 */
export async function eliminarPost(postId) {
  try {
    const response = await api.delete(`/posts-comunidad-estudiantil/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar post ${postId}:`, error);
    throw error;
  }
}

// ============================================
// SERVICIOS - EVENTOS
// ============================================

/**
 * Listar eventos con filtros opcionales
 * @param {Object} params - { desde, hasta, titulo }
 */
export async function listarEventos(params = {}) {
  try {
    const response = await api.get('/eventos-comunidad-estudiantil/getAll', { params });
    const eventos = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    return eventos.map(mapEvento);
  } catch (error) {
    console.error('Error al listar eventos:', error);
    throw error;
  }
}

/**
 * Crear evento comunitario
 * @param {Object} payload - { titulo, description, event_date }
 */
export async function crearEvento(payload) {
  try {
    const response = await api.post('/eventos-comunidad-estudiantil/create', {
      titulo: payload.titulo,
      description: payload.description,
      event_date: payload.event_date,
    });
    return mapEvento(response.data.data ?? response.data);
  } catch (error) {
    console.error('Error al crear evento:', error);
    throw error;
  }
}

// ============================================
// SERVICIOS - CHAT / MENSAJES
// ============================================

/**
 * Listar mensajes con un usuario específico
 * @param {number} peerId - ID del otro usuario
 */
export async function listarMensajes(peerId) {
  try {
    const user = getUser();
    if (!user || !user.id) {
      throw new Error('Usuario no autenticado');
    }
    // Usar getConversation que requiere userId1 y userId2
    const response = await api.get(`/mensajes-chat-comunidad/getConversation/${user.id}/${peerId}`);
    const mensajes = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    return mensajes.map(mapMensaje);
  } catch (error) {
    console.error(`Error al listar mensajes con usuario ${peerId}:`, error);
    throw error;
  }
}

/**
 * Listar todas las conversaciones (peers)
 * Endpoint opcional - si existe, retorna lista de usuarios con los que hay chat
 */
export async function listarConversaciones() {
  try {
    // NOTA: Este endpoint será creado en backend
    // GET /api/mensajes-chat-comunidad/conversations
    const response = await api.get('/mensajes-chat-comunidad/conversations');
    const conversaciones = Array.isArray(response.data) ? response.data : response.data.data ?? [];
    return conversaciones; // Formato esperado: [{ peer_id, peer_name, last_message, unread_count }]
  } catch (error) {
    console.error('Error al listar conversaciones:', error);
    // Si no existe este endpoint, retornar array vacío
    return [];
  }
}

/**
 * Enviar mensaje a un usuario
 * @param {Object} payload - { receiver_student_id, content }
 */
export async function enviarMensaje(payload) {
  try {
    const user = getUser();
    if (!user) throw new Error('Usuario no autenticado');
    
    // Obtener student_id del usuario actual
    const currentStudent = await api.get(`/estudiantes/lista`);
    const myStudent = currentStudent.data.data.find(s => s.user_id === user.id);
    if (!myStudent) throw new Error('Estudiante no encontrado');
    
    // Crear fecha en zona horaria de Perú (UTC-5)
    const now = new Date();
    const peruTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }));
    
    const messageData = {
      sender_id: myStudent.id,
      receiver_id: payload.receiver_student_id,
      content: payload.content,
      sent_date: peruTime.toISOString().slice(0, 19).replace('T', ' '), // Formato: YYYY-MM-DD HH:mm:ss
      seen: false,
    };
    
    console.log('Enviando mensaje con datos:', messageData);
    
    const response = await api.post('/mensajes-chat-comunidad/create', messageData);
    return mapMensaje(response.data.data ?? response.data);
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
    throw error;
  }
}

/**
 * Marcar mensajes como vistos
 * @param {number} peerId - ID del otro usuario
 */
export async function marcarVisto(peerId) {
  try {
    // NOTA: Este endpoint será creado en backend
    // PUT /api/mensajes-chat-comunidad/markAsReadByPeer/{peerId}
    const response = await api.put(`/mensajes-chat-comunidad/markAsReadByPeer/${peerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al marcar vistos mensajes de usuario ${peerId}:`, error);
    throw error;
  }
}

// ============================================
// SERVICIOS - MODERACIÓN (OPCIONAL)
// ============================================

/**
 * Moderar una publicación
 * @param {Object} payload - { publicacion_id, action, comment }
 */
export async function moderarPublicacion(payload) {
  try {
    const response = await api.post('/moderaciones-comunidad-estudiantil/create', {
      publicacion_id: payload.publicacion_id,
      action: payload.action,
      comment: payload.comment,
    });
    return response.data;
  } catch (error) {
    console.error('Error al moderar publicación:', error);
    throw error;
  }
}

// ============================================
// SERVICIOS - BÚSQUEDA DE ESTUDIANTES
// ============================================

/**
 * Buscar estudiantes por nombre o email
 * @param {string} query - Término de búsqueda
 */
export async function buscarEstudiantes(query = '', limit = 20) {
  try {
    const response = await api.get('/estudiantes/search', {
      params: { q: query, limit }
    });
    if (response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error al buscar estudiantes:', error);
    throw error;
  }
}
