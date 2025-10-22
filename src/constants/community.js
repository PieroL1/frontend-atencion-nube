// src/constants/community.js

// Estados de foros (según backend)
export const FORUM_STATES = ['Pendiente', 'Activo', 'Finalizado', 'Rechazado'];

export const FORUM_STATE_LABELS = {
  'Pendiente': 'Pendiente de Aprobación',
  'Activo': 'Activo',
  'Finalizado': 'Finalizado',
  'Rechazado': 'Rechazado',
};

// Tipos de vinculación
export const VINCULATION_TYPES = {
  MEMBER: 'Miembro',
  MODERATOR: 'Moderador',
};

// Acciones de moderación
export const MODERATION_ACTIONS = {
  APPROVE: 'aprobar',
  REJECT: 'rechazar',
  REMOVE: 'eliminar',
  WARN: 'advertir',
};

// Colores para estados de foros
export const FORUM_STATE_COLORS = {
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'Activo': 'bg-green-100 text-green-800',
  'Finalizado': 'bg-blue-100 text-blue-800',
  'Rechazado': 'bg-red-100 text-red-800',
};

// Programas académicos (ajustar según necesidad)
export const ACADEMIC_PROGRAMS = [
  'Sistemas',
  'Industrial',
  'Civil',
  'Mecánica',
  'Electrónica',
  'Administración',
  'Contaduría',
  'Otro',
];

// Helpers
export const getForumStateColor = (state) => {
  return FORUM_STATE_COLORS[state] || 'bg-gray-100 text-gray-800';
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  // Parsear la fecha del servidor (que está en hora de Perú)
  // Si viene en formato ISO, parsearlo directamente
  const serverDate = new Date(dateString);
  
  // Obtener la hora actual en zona horaria de Perú
  const nowInPeru = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
  
  // Calcular la diferencia
  const diffMs = nowInPeru - serverDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return formatDate(dateString);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
