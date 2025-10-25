// src/pages/atencion/AtencionEstudiante.jsx
// Vista del estudiante: yo creo solicitudes (type_id + description), veo mis solicitudes y comento.
import { useEffect, useState } from 'react';
import { getUser } from '../../auth';
import EstadoBadge, { formatDate, renderStateChange } from '../../components/atencion/EstadoBadge';
import {
  tipos_list,
  solicitudes_list, solicitudes_create, solicitudes_get,
  historial_list, historial_addComentario,
} from '../../services/atencion';

export default function AtencionEstudiante() {
  const user = getUser();
  // Si tu backend no manda student_id en el user, durante mocks uso 1.
  const studentId = user?.student_id || 1;

  const [tipos, setTipos] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type_id: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selected, setSelected] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const t = await tipos_list();
        setTipos(t);
        await loadSolicitudes();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadSolicitudes() {
    const { data } = await solicitudes_list({ student_id: studentId });
    setItems(data);
  }

  async function createSolicitud(e) {
    e.preventDefault();
    if (!form.type_id || !form.description.trim() || submitting) return;
    
    setSubmitting(true);
    try {
      console.log('Creando solicitud con:', {
        student_id: studentId,
        type_id: Number(form.type_id),
        description: form.description.trim(),
      });
      
      const result = await solicitudes_create({
        student_id: studentId,
        type_id: Number(form.type_id),
        description: form.description.trim(),
      });
      
      console.log('Solicitud creada:', result);
      setForm({ type_id: '', description: '' });
      await loadSolicitudes();
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      console.error('Status HTTP:', error.response?.status);
      console.error('Detalles del error:', JSON.stringify(error.response?.data, null, 2));
      alert(`Error al crear solicitud: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function openDetalle(id) {
    const s = await solicitudes_get(id);
    setSelected(s);
    setHistorial(await historial_list(id));
  }

  async function addComment() {
    if (!selected || !comment.trim() || commenting) return;
    
    setCommenting(true);
    try {
      await historial_addComentario(selected.id, comment.trim());
      setComment('');
      setHistorial(await historial_list(selected.id));
    } finally {
      setCommenting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-slate-50 dark:from-coal dark:to-ink">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg shadow-primary/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-ink dark:text-slate">Centro de Atención</h1>
              <p className="text-slate dark:text-slate/70">Gestiona tus solicitudes y recibe ayuda personalizada</p>
            </div>
          </div>
        </div>

      {/* Formulario mejorado con diseño card */}
      <div className="bg-white dark:bg-night border-2 border-primary/20 dark:border-primary/30 rounded-2xl shadow-lg shadow-primary/10 dark:shadow-none mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="text-xl font-bold">Nueva Solicitud</h2>
          </div>
        </div>
        
        <form onSubmit={createSolicitud} className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-slate mb-2">
                <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tipo de Solicitud
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate/30 bg-gray-50 dark:bg-night/50 text-ink dark:text-slate focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all"
                value={form.type_id}
                onChange={e => setForm(f => ({ ...f, type_id: e.target.value }))}
              >
                <option value="">Selecciona un tipo…</option>
                {tipos.map(t => <option key={t.id_type} value={t.id_type}>{t.name_type}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-slate mb-2">
                <svg className="w-5 h-5 text-pink-500 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Descripción del problema
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate/30 bg-gray-50 dark:bg-night/50 text-ink dark:text-slate focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all"
                placeholder="Describe brevemente tu solicitud..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate dark:text-slate/70">
              💡 Sé específico para que podamos ayudarte mejor
            </p>
            <button 
              type="submit"
              disabled={submitting || !form.type_id || !form.description.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Mis solicitudes - Vista de tarjetas */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-2xl font-bold text-ink dark:text-slate">Mis Solicitudes</h2>
          <span className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30 rounded-full text-sm font-semibold">
            {items.length}
          </span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-night border-2 border-dashed border-gray-300 dark:border-slate/30 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400 dark:text-slate/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ink dark:text-slate mb-2">Aún no tienes solicitudes</h3>
            <p className="text-slate dark:text-slate/70">Crea tu primera solicitud usando el formulario de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(row => (
              <div 
                key={row.id} 
                className="bg-white dark:bg-night rounded-2xl border-2 border-gray-200 dark:border-slate/20 p-5 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
                onClick={() => openDetalle(row.id)}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-gradient-to-br from-primary to-blue-600 dark:from-primary dark:to-blue-500 rounded-xl text-white font-bold shadow-md text-sm">
                      #{row.id}
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink dark:text-slate group-hover:text-primary dark:group-hover:text-primary transition-colors">
                        {row.type_name || row.type_id}
                      </h3>
                      <p className="text-xs text-slate dark:text-slate/70">
                        {formatDate(row.creation_date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <p className="text-sm text-slate dark:text-slate/80 mb-4 line-clamp-2">
                  {row.description}
                </p>

                {/* Estado y acción */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate/10">
                  <EstadoBadge value={row.state_ui || row.current_state} />
                  <button 
                    className="text-primary dark:text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetalle(row.id);
                    }}
                  >
                    Ver detalle
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detalle mejorado con mejor diseño */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-night w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Header con gradiente usando primary */}
            <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-5 shadow-lg shadow-primary/20">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Solicitud #{selected.id}</div>
                    <div className="text-xl font-bold">{selected.type_name || selected.type_id}</div>
                  </div>
                </div>
                <button 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors" 
                  onClick={() => setSelected(null)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Columna izquierda - Información */}
              <div className="space-y-6">
                {/* Descripción */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-5 border-2 border-primary/20 dark:border-primary/30">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="font-semibold text-ink dark:text-slate">Descripción</h3>
                  </div>
                  <p className="text-ink dark:text-slate leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>

                {/* Estado actual */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-slate/10 dark:to-slate/5 rounded-xl p-5 border-2 border-gray-200 dark:border-slate/20">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-ink dark:text-slate">Estado Actual</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <EstadoBadge value={selected.state_ui || selected.current_state} />
                    <span className="text-sm text-slate dark:text-slate/70">
                      {selected.state_ui === 'Resuelto' && '✅ Tu solicitud ha sido resuelta'}
                      {selected.state_ui === 'En proceso' && '⏳ Estamos trabajando en ello'}
                      {selected.state_ui === 'Recibido' && '📥 Hemos recibido tu solicitud'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Historial y comentarios */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-bold text-ink dark:text-slate text-lg">Historial</h3>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800/30 rounded-full text-xs font-semibold">
                    {historial.length}
                  </span>
                </div>

                {/* Timeline de historial */}
                <div className="flex-1 space-y-3 max-h-64 overflow-auto pr-2 mb-4 custom-scrollbar">
                  {historial.length === 0 ? (
                    <div className="text-center py-8 text-slate dark:text-slate/70">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm">Sin eventos aún</p>
                    </div>
                  ) : (
                    historial.map((ev, idx) => (
                      <div className="relative pl-6 pb-3">
                        {/* Línea del timeline */}
                        {idx < historial.length - 1 && (
                          <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-blue-400/50 dark:from-primary/30 dark:to-blue-500/30"></div>
                        )}
                        
                        {/* Punto del timeline */}
                        <div className="absolute left-0 top-1 w-4 h-4 bg-gradient-to-br from-primary to-blue-600 rounded-full border-2 border-white dark:border-night shadow-md shadow-primary/30"></div>
                        
                        {/* Contenido */}
                        <div className="bg-gray-50 dark:bg-slate/10 rounded-lg p-3 border border-gray-200 dark:border-slate/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-primary dark:text-primary">
                              {formatDate(ev.change_date)}
                            </span>
                            {(ev.previous_state || ev.new_state) && (
                              <span className="text-xs text-slate dark:text-slate/70">
                                {renderStateChange(ev.previous_state, ev.new_state)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-ink dark:text-slate">
                            {ev.comment || <span className="italic text-slate dark:text-slate/50">Sin comentario</span>}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input de comentario mejorado */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate/10 dark:to-slate/5 rounded-xl p-4 border-2 border-gray-200 dark:border-slate/20">
                  <label className="block text-sm font-medium text-ink dark:text-slate mb-2">
                    💬 Agregar comentario
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night text-ink dark:text-slate focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
                      placeholder="Escribe tu comentario..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && !commenting && addComment()}
                    />
                    <button 
                      onClick={addComment} 
                      disabled={commenting || !comment.trim()}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {commenting ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {loading && <div className="mt-4 text-sm text-slate dark:text-slate/70">Cargando…</div>}
      </div>
    </div>
  );
}
