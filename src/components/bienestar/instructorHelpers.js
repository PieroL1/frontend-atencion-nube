// src/components/bienestar/instructorHelpers.js

/**
 * Helpers específicos para instructor
 */

/**
 * Verifica si una tutoría es de hoy
 */
export const esHoy = (isoDate) => {
  const fecha = new Date(isoDate);
  const hoy = new Date();
  return (
    fecha.getDate() === hoy.getDate() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getFullYear() === hoy.getFullYear()
  );
};

/**
 * Filtra tutorías por rango de fecha
 */
export const filtrarPorFecha = (tutorias, filtro) => {
  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  switch (filtro) {
    case "hoy":
      return tutorias.filter((t) => esHoy(t.scheduled_date));

    case "proximos7":
      const en7dias = new Date(hoy);
      en7dias.setDate(en7dias.getDate() + 7);
      return tutorias.filter((t) => {
        const fecha = new Date(t.scheduled_date);
        return fecha >= hoy && fecha <= en7dias;
      });

    case "todo":
    default:
      return tutorias;
  }
};

/**
 * Verifica si la tutoría ya pasó (hora ya transcurrió)
 */
export const yaPaso = (isoDate) => {
  return new Date(isoDate).getTime() < Date.now();
};

/**
 * Agrupa tutorías por tabs
 */
export const agruparPorTabs = (tutorias) => {
  const pendientesAgendadas = tutorias.filter(
    (t) =>
      (t.state === "Pendiente" || t.state === "Agendada") &&
      !yaPaso(t.scheduled_date)
  );

  const hoy = tutorias.filter((t) => esHoy(t.scheduled_date));

  const historial = tutorias.filter(
    (t) => t.state === "Realizada" || t.state === "Cancelada" || yaPaso(t.scheduled_date)
  );

  return {
    pendientesAgendadas,
    hoy,
    historial,
  };
};

/**
 * Determina acciones disponibles según estado y fecha
 */
export const accionesDisponibles = (tutoria) => {
  const acciones = {
    puedeAceptar: false,
    puedeCancelar: false,
    puedeMarcarRealizada: false,
    puedeRegistrarAsistencia: false,
  };

  const pasado = yaPaso(tutoria.scheduled_date);

  if (tutoria.state === "Pendiente" && !pasado) {
    acciones.puedeAceptar = true;
    acciones.puedeCancelar = true;
  }

  if (tutoria.state === "Agendada") {
    if (pasado) {
      acciones.puedeMarcarRealizada = true;
    } else {
      acciones.puedeCancelar = true;
    }
  }

  if (tutoria.state === "Realizada") {
    acciones.puedeRegistrarAsistencia = true;
  }

  return acciones;
};
