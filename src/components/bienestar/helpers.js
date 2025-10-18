// src/components/bienestar/helpers.js

/**
 * Verifica si una fecha ISO es futura
 */
export const esFutura = (iso) => new Date(iso).getTime() >= Date.now();

/**
 * Divide tutorías en próximas y pasadas según la fecha
 */
export const dividirTutorias = (arr) => ({
  proximas: arr.filter((t) => esFutura(t.scheduled_date)),
  pasadas: arr.filter((t) => !esFutura(t.scheduled_date)),
});

/**
 * Formatea una fecha ISO a formato legible
 */
export const formatearFechaHora = (isoDate) => {
  const d = new Date(isoDate);
  const fecha = d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { fecha, hora };
};

/**
 * Genera slots de hora sugeridos para una fecha dada
 */
export const generarHorasSugeridas = () => [
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
];
