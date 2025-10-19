// src/services/atencion.js
import { api } from '../api';
import { isBypass } from '../auth';

/* ===========================================================
   1) Estados de negocio: Recibido / En proceso / Resuelto
   =========================================================== */
const DB_TO_UI = {
  received: 'Recibido',
  in_progress: 'En proceso',
  completed: 'Resuelto',
  failed: 'Fallido',
};
const UI_TO_DB = {
  'Recibido': 'received',
  'En proceso': 'in_progress',
  'Resuelto': 'completed',
  'Fallido': 'failed',
};

/* ===========================================================
   2) MOCKS (solo si VITE_AUTH_BYPASS=true)
   =========================================================== */
const delay = (ms) => new Promise(r => setTimeout(r, ms));

let mockTipos = [
  // Nota: tu tabla real usa id_type como PK (no id). Respeto eso aquí.
  { id_type: 1, name_type: 'Matrícula', description: 'Trámites de matrícula' },
  { id_type: 2, name_type: 'Constancias', description: 'Constancias y certificados' },
  { id_type: 3, name_type: 'Pagos', description: 'Tesorería y recibos' },
];

// La tabla real de solicitudes NO tiene subject/canal/prioridad.
// Aquí solo uso los campos que existen en tu BD.
let mockSolicitudes = [
  {
    id: 101, student_id: 1, type_id: 2,
    description: 'Necesito constancia firmada',
    creation_date: new Date().toISOString(),
    update_date: new Date().toISOString(),
    current_state: 'received',  // UI -> Recibido
    final_answer: null,
  },
  {
    id: 102, student_id: 1, type_id: 1,
    description: 'No carga mi horario de prematrícula',
    creation_date: new Date().toISOString(),
    update_date: new Date().toISOString(),
    current_state: 'in_progress', // UI -> En proceso
    final_answer: null,
  },
];

// Historial alineado a tu tabla: id_history, id_attention_students_request, previous_state, new_state, comment, change_date, id_employee_responsible
let mockHist = {
  101: [
    { id_history: 1, id_attention_students_request: 101, previous_state: null, new_state: 'received', comment: 'Registro inicial', change_date: new Date().toISOString(), id_employee_responsible: null },
  ],
  102: [
    { id_history: 2, id_attention_students_request: 102, previous_state: null, new_state: 'received', comment: 'Registro inicial', change_date: new Date().toISOString(), id_employee_responsible: null },
    { id_history: 3, id_attention_students_request: 102, previous_state: 'received', new_state: 'in_progress', comment: 'Se está revisando el caso', change_date: new Date().toISOString(), id_employee_responsible: 12 },
  ],
};

// Notificaciones opcionales (si las usan)
let mockNotifs = [
  { id: 1, id_request: 102, message: 'Tu solicitud pasó a En proceso', date_sent: new Date().toISOString(), view_status: false },
];

/* ===========================================================
   3) Utilidades
   =========================================================== */
function decorateSolicitudForUI(sol) {
  const type = mockTipos.find(t => t.id_type === sol.type_id);
  return {
    ...sol,
    type_name: type?.name_type || '',
    state_ui: DB_TO_UI[sol.current_state] || sol.current_state, // si ya viene en español, se muestra tal cual
  };
}

/* ===========================================================
   4) Tipos (CRUD para empleado)
   Backend: /tipos-solicitud/getAll, /create, /{id}, etc.
   Backend devuelve: { success, data, message }
   Backend usa "id" en vez de "id_type"
   =========================================================== */

// GET /tipos-solicitud/getAll
export async function tipos_list() {
  if (isBypass()) {
    await delay(120);
    return mockTipos.slice();
  }
  const { data: response } = await api.get('/tipos-solicitud/getAll');
  // Backend devuelve: { success, data: [...], message }
  // Necesitamos mapear "id" a "id_type" para compatibilidad con frontend
  return (response.data || []).map(t => ({
    id_type: t.id,
    name_type: t.name_type,
    description: t.description,
  }));
}

// POST /tipos-solicitud/create  { name_type, description }
export async function tipos_create(body) {
  if (isBypass()) {
    await delay(150);
    const id_type = (Math.max(0, ...mockTipos.map(t => t.id_type)) || 0) + 1;
    const obj = { id_type, name_type: body.name_type, description: body.description || '' };
    mockTipos.push(obj);
    return obj;
  }
  const { data: tipo } = await api.post('/tipos-solicitud/create', body);
  // Backend devuelve el Resource directamente, mapear id a id_type
  return {
    id_type: tipo.id,
    name_type: tipo.name_type,
    description: tipo.description,
  };
}

// PUT /tipos-solicitud/{id}  { name_type?, description? }
export async function tipos_update(id_type, body) {
  if (isBypass()) {
    await delay(150);
    const i = mockTipos.findIndex(t => t.id_type === Number(id_type));
    if (i < 0) throw new Error('Tipo no encontrado');
    mockTipos[i] = { ...mockTipos[i], ...body };
    return mockTipos[i];
  }
  const { data: tipo } = await api.put(`/tipos-solicitud/${id_type}`, body);
  // Backend devuelve el Resource, mapear id a id_type
  return {
    id_type: tipo.id,
    name_type: tipo.name_type,
    description: tipo.description,
  };
}

// DELETE /tipos-solicitud/{id_type}
export async function tipos_delete(id_type) {
  if (isBypass()) {
    await delay(120);
    mockTipos = mockTipos.filter(t => t.id_type !== Number(id_type));
    return { ok: true };
  }
  await api.delete(`/tipos-solicitud/${id_type}`);
  return { ok: true };
}

/* ===========================================================
   5) Solicitudes
   Backend: /solicitudes-atencion/getAll, /get/{id}, /create, /{id}
   NOTA: Backend NO soporta filtros en getAll(), se filtran en frontend
   =========================================================== */

// GET /solicitudes-atencion/getAll  (query: student_id?, type_id?, state?)
export async function solicitudes_list(params = {}) {
  if (isBypass()) {
    await delay(200);
    
    // PASO 1: Decorar cada solicitud con state_ui y type_name primero
    let out = mockSolicitudes.map(decorateSolicitudForUI);
    
    // PASO 2: Aplicar filtros sobre los datos decorados
    // Filtro por student_id
    if (params.student_id) {
      out = out.filter(x => x.student_id === Number(params.student_id));
    }
    
    // Filtro por type_id (forzar Number() para comparación exacta)
    if (params.type_id) {
      const typeIdNum = Number(params.type_id);
      out = out.filter(x => x.type_id === typeIdNum);
    }
    
    // Filtro por estado en UI (Recibido/En proceso/Resuelto)
    if (params.state_ui) {
      out = out.filter(x => x.state_ui === params.state_ui);
    }
    
    // Filtro por q → busca en description
    if (params.q) {
      const searchTerm = params.q.toLowerCase();
      out = out.filter(x => (x.description || '').toLowerCase().includes(searchTerm));
    }
    
    return { data: out, meta: { page: 1, per_page: out.length, total: out.length } };
  }

  // Backend real: obtener todas las solicitudes y filtrar en frontend
  const { data: response } = await api.get('/solicitudes-atencion/getAll');
  // Backend devuelve: { success, data: [...], message }
  // data contiene AttentionStudentsRequestResource con relaciones 'type' y 'student'
  let items = (response.data || []).map(item => {
    const tipo = mockTipos.find(t => t.id_type === item.type_id);
    return {
      ...item,
      type_name: item.type?.name_type || tipo?.name_type || '',
      state_ui: DB_TO_UI[item.current_state] || item.current_state,
    };
  });

  // APLICAR FILTROS EN FRONTEND (backend no los soporta aún)
  if (params.student_id) {
    items = items.filter(x => x.student_id === Number(params.student_id));
  }
  if (params.type_id) {
    const typeIdNum = Number(params.type_id);
    items = items.filter(x => x.type_id === typeIdNum);
  }
  if (params.state_ui) {
    items = items.filter(x => x.state_ui === params.state_ui);
  }
  if (params.q) {
    const searchTerm = params.q.toLowerCase();
    items = items.filter(x => (x.description || '').toLowerCase().includes(searchTerm));
  }

  return { data: items, meta: { page: 1, per_page: items.length, total: items.length } };
}

// GET /solicitudes-atencion/get/{id}
export async function solicitudes_get(id) {
  if (isBypass()) {
    await delay(120);
    const s = mockSolicitudes.find(x => x.id === Number(id));
    if (!s) throw new Error('Not found');
    return decorateSolicitudForUI(s);
  }
  const { data: response } = await api.get(`/solicitudes-atencion/get/${id}`);
  // Backend devuelve: { success, data: {...}, message }
  const item = response.data;
  const tipo = mockTipos.find(t => t.id_type === item.type_id);
  return {
    ...item,
    type_name: item.type?.name_type || tipo?.name_type || '',
    state_ui: DB_TO_UI[item.current_state] || item.current_state,
  };
}

// POST /solicitudes-atencion/create { student_id, type_id, description }
export async function solicitudes_create(body) {
  if (isBypass()) {
    await delay(200);
    const id = (Math.max(100, ...mockSolicitudes.map(s => s.id)) || 100) + 1;
    const now = new Date().toISOString();

    // Estado inicial: Recibido (UI) en mocks
    const s = {
      id,
      student_id: body.student_id,
      type_id: body.type_id,
      description: body.description || '',
      creation_date: now,
      update_date: now,
      current_state: 'received', // Respeto los 3 estados: Recibido/En proceso/Resuelto → aquí arrancamos en Recibido
      final_answer: null,
    };
    mockSolicitudes.unshift(s);
    mockHist[id] = [
      { id_history: Date.now(), id_attention_students_request: id, previous_state: null, new_state: 'received', comment: 'Registro inicial', change_date: now, id_employee_responsible: null },
    ];
    return decorateSolicitudForUI(s);
  }

  // Backend: estado inicial es 'in_progress' (no tiene 'received')
  // El Resource se devuelve directamente (no envuelto en { success, data })
  const { data: item } = await api.post('/solicitudes-atencion/create', body);
  const tipo = mockTipos.find(t => t.id_type === item.type_id);
  return {
    ...item,
    type_name: item.type?.name_type || tipo?.name_type || '',
    state_ui: DB_TO_UI[item.current_state] || item.current_state,
  };
}

// PUT /solicitudes-atencion/{id}  { description?, current_state?, etc. }
export async function solicitudes_update(id, body) {
  if (isBypass()) {
    await delay(160);
    const i = mockSolicitudes.findIndex(x => x.id === Number(id));
    if (i < 0) throw new Error('Not found');
    mockSolicitudes[i] = { ...mockSolicitudes[i], ...body, update_date: new Date().toISOString() };
    return decorateSolicitudForUI(mockSolicitudes[i]);
  }

  const { data: item } = await api.put(`/solicitudes-atencion/${id}`, body);
  const tipo = mockTipos.find(t => t.id_type === item.type_id);
  return {
    ...item,
    type_name: item.type?.name_type || tipo?.name_type || '',
    state_ui: DB_TO_UI[item.current_state] || item.current_state,
  };
}

/* ===========================================================
   6) Estado (empleado)
   - solo permito: Recibido -> En proceso -> Resuelto
   - cada cambio genera historial
   =========================================================== */

// PATCH /atencion/solicitudes/{id}/estado  { new_state, note }
export async function solicitudes_cambiarEstado(id, new_state_ui, note) {
  const new_state_db = UI_TO_DB[new_state_ui] || new_state_ui;

  if (isBypass()) {
    await delay(160);
    const s = mockSolicitudes.find(x => x.id === Number(id));
    if (!s) throw new Error('Not found');

    const prev = s.current_state;
    s.current_state = new_state_db;
    s.update_date = new Date().toISOString();

    mockHist[id] ??= [];
    mockHist[id].unshift({
      id_history: Date.now(),
      id_attention_students_request: id,
      previous_state: prev,
      new_state: new_state_db,
      comment: note || null, // “si se quiere, puedo guardar un detalle”
      change_date: new Date().toISOString(),
      id_employee_responsible: 12,
    });

    // Notificación simulada (opcional)
    mockNotifs.unshift({
      id: Date.now(),
      id_request: id,
      message: `Tu solicitud cambió a ${new_state_ui}`,
      date_sent: new Date().toISOString(),
      view_status: false,
    });

    return decorateSolicitudForUI(s);
  }

  // Backend real: 2 llamadas separadas (NO existe endpoint /estado)
  // 1) Obtener estado actual primero
  const { data: currentData } = await api.get(`/solicitudes-atencion/get/${id}`);
  const previous_state = currentData.data.current_state;

  // 2) Actualizar el estado de la solicitud
  const { data: updatedItem } = await api.put(`/solicitudes-atencion/${id}`, {
    current_state: new_state_db,
  });

  // 3) Crear registro en historial
  await api.post('/historial-solicitudes/create', {
    id_attention_students_request: id,
    previous_state: previous_state,
    new_state: new_state_db,
    comment: note || `Estado cambiado a ${new_state_ui}`,
    change_date: new Date().toISOString(),
    id_employee_responsible: null, // TODO: obtener del auth actual
  });

  // 4) Decorar y devolver
  const tipo = mockTipos.find(t => t.id_type === updatedItem.type_id);
  return {
    ...updatedItem,
    type_name: updatedItem.type?.name_type || tipo?.name_type || '',
    state_ui: DB_TO_UI[updatedItem.current_state] || updatedItem.current_state,
  };
}

/* ===========================================================
   7) Historial (comentarios / seguimiento)
   - No hay "prioridad" como columna. Si la quieren usar, yo la agrego como comentario libre
     tipo: "PRIORIDAD: Alta". (Se puede leer en UI si lo desean)
   Backend: /historial-solicitudes/getAll?request_id={id}
   =========================================================== */

// GET /historial-solicitudes/getAll?request_id={id}
export async function historial_list(id) {
  if (isBypass()) {
    await delay(120);
    // devuelvo copia para no mutar desde afuera
    return (mockHist[id] || []).slice();
  }
  const { data: response } = await api.get('/historial-solicitudes/getAll', {
    params: { request_id: id }
  });
  // Backend devuelve: { success, data: [...], message }
  // Ahora el Resource devuelve directamente con id_history
  return response.data || [];
}

// POST /historial-solicitudes/create  { comment }
export async function historial_addComentario(id, comment) {
  if (isBypass()) {
    await delay(120);
    mockHist[id] ??= [];
    const ev = {
      id_history: Date.now(),
      id_attention_students_request: id,
      previous_state: null,
      new_state: null,
      comment, // lo dejo tal cual lo escribo (“si se quiere poner PRIORIDAD: Alta, aquí lo anoto”)
      change_date: new Date().toISOString(),
      id_employee_responsible: 12,
    };
    mockHist[id].unshift(ev);
    return ev;
  }

  const { data: response } = await api.post('/historial-solicitudes/create', {
    id_attention_students_request: id,
    previous_state: null,
    new_state: null,
    comment: comment,
    change_date: new Date().toISOString(),
    id_employee_responsible: null,
  });
  // Backend devuelve: { success, data: {...}, message }
  // Ahora el Resource devuelve directamente con id_history
  return response.data;
}

/* ===========================================================
   8) Notificaciones (opcional, campanita)
   =========================================================== */

export async function notif_list() {
  if (isBypass()) {
    await delay(100);
    return mockNotifs.slice();
  }
  const { data } = await api.get('/atencion/notificaciones');
  return data;
}

export async function notif_markSeen(id) {
  if (isBypass()) {
    await delay(80);
    const i = mockNotifs.findIndex(n => n.id === Number(id));
    if (i >= 0) mockNotifs[i].view_status = true;
    return { ok: true };
  }
  const { data } = await api.patch(`/atencion/notificaciones/${id}/visto`, { view_status: true });
  return data;
}



