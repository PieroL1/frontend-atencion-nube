// src/constants/bienestar.js
// Constantes para el módulo de Bienestar Estudiantil

export const TIPOS_TUTORIA = {
  ACADEMICA: "Académica",
  PSICOLOGICA: "Psicológica",
};

export const ESTADOS_TUTORIA = {
  PENDIENTE: "Pendiente",
  AGENDADA: "Agendada",
  REALIZADA: "Realizada",
  CANCELADA: "Cancelada",
};

export const TIPOS_ACTIVIDAD = {
  DEPORTIVA: "Deportiva",
  CULTURAL: "Cultural",
  INTEGRACION: "Integración",
};

// Mapeo de estilos para badges
export const ESTILOS_ESTADO = {
  [ESTADOS_TUTORIA.PENDIENTE]: "bg-yellow-100 text-yellow-800",
  [ESTADOS_TUTORIA.AGENDADA]: "bg-blue-100 text-blue-800",
  [ESTADOS_TUTORIA.REALIZADA]: "bg-green-100 text-green-800",
  [ESTADOS_TUTORIA.CANCELADA]: "bg-gray-100 text-gray-600",
};

export const ESTILOS_TIPO_TUTORIA = {
  [TIPOS_TUTORIA.ACADEMICA]: "bg-purple-50 text-purple-700 border-purple-200",
  [TIPOS_TUTORIA.PSICOLOGICA]: "bg-pink-50 text-pink-700 border-pink-200",
};

export const ESTILOS_TIPO_ACTIVIDAD = {
  [TIPOS_ACTIVIDAD.DEPORTIVA]: "bg-blue-50 text-blue-700 border-blue-200",
  [TIPOS_ACTIVIDAD.CULTURAL]: "bg-yellow-50 text-yellow-700 border-yellow-200",
  [TIPOS_ACTIVIDAD.INTEGRACION]: "bg-green-50 text-green-700 border-green-200",
};
