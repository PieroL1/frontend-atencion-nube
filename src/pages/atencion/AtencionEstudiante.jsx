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
    <div className="max-w-5xl mx-auto px-6 py-6">
      <h1 className="text-2xl font-semibold text-ink dark:text-slate mb-3">Atención (Estudiante)</h1>

      {/* Formulario: creo solicitud con type_id + description */}
      <form onSubmit={createSolicitud} className="bg-white dark:bg-night border border-gray-200 dark:border-slate/20 rounded-2xl p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="text-xs text-slate dark:text-slate/70">Tipo</label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate text-sm"
              value={form.type_id}
              onChange={e => setForm(f => ({ ...f, type_id: e.target.value }))}
            >
              <option value="">Selecciona un tipo…</option>
              {tipos.map(t => <option key={t.id_type} value={t.id_type}>{t.name_type}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-slate dark:text-slate/70">Descripción</label>
            <input
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate text-sm"
              placeholder="Escribo brevemente lo que necesito…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-3">
          <button 
            type="submit"
            disabled={submitting || !form.type_id || !form.description.trim()}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm transition-colors disabled:bg-slate/30 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>

      {/* Mis solicitudes */}
      <div className="bg-white dark:bg-night border border-gray-200 dark:border-slate/20 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-ink/50 text-slate dark:text-slate/70">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-left px-4 py-2">Descripción</th>
              <th className="text-left px-4 py-2">Estado</th>
              <th className="text-left px-4 py-2">Creación</th>
              <th className="text-left px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map(row => (
              <tr key={row.id} className="border-t border-gray-100 dark:border-slate/10 hover:bg-gray-50 dark:hover:bg-night/50">
                <td className="px-4 py-2 text-ink dark:text-slate">{row.id}</td>
                <td className="px-4 py-2 text-ink dark:text-slate">{row.type_name || row.type_id}</td>
                <td className="px-4 py-2 text-ink dark:text-slate">{row.description}</td>
                <td className="px-4 py-2"><EstadoBadge value={row.state_ui || row.current_state} /></td>
                <td className="px-4 py-2 text-slate dark:text-slate/70">{formatDate(row.creation_date)}</td>
                <td className="px-4 py-2 text-right">
                  <button className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate/30 text-ink dark:text-slate hover:bg-gray-100 dark:hover:bg-night/50" onClick={() => openDetalle(row.id)}>Ver</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-slate dark:text-slate/70">Aún no he enviado solicitudes</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detalle + comentarios */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-night w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-slate/20">
              <div>
                <div className="text-sm text-slate dark:text-slate/70">Solicitud #{selected.id}</div>
                <div className="font-semibold text-ink dark:text-slate">{selected.type_name || selected.type_id}</div>
              </div>
              <button className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate/30 text-ink dark:text-slate hover:bg-gray-50 dark:hover:bg-night/50" onClick={() => setSelected(null)}>Cerrar</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 p-5">
              <div className="space-y-2">
                <div className="text-sm text-slate dark:text-slate/70">Descripción</div>
                <div className="text-ink dark:text-slate bg-gray-50 dark:bg-ink/50 rounded-xl p-3">{selected.description}</div>

                <div className="text-sm text-slate dark:text-slate/70 mt-3">Estado actual</div>
                <div className="flex items-center gap-2">
                  <EstadoBadge value={selected.state_ui || selected.current_state} />
                </div>
              </div>

              <div>
                <div className="font-semibold text-ink dark:text-slate mb-2">Historial</div>
                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                  {historial.map(ev => (
                    <div key={ev.id_history} className="border border-gray-200 dark:border-slate/20 rounded-xl p-3 bg-white dark:bg-night/50">
                      <div className="text-xs text-slate dark:text-slate/70">{formatDate(ev.change_date)}</div>
                      <div className="text-sm text-ink dark:text-slate">{ev.comment || <span className="text-slate dark:text-slate/50">sin comentario</span>}</div>
                      {(ev.previous_state || ev.new_state) && (
                        <div className="text-xs text-slate dark:text-slate/70 mt-1">
                          {renderStateChange(ev.previous_state, ev.new_state)}
                        </div>
                      )}
                    </div>
                  ))}
                  {historial.length === 0 && <div className="text-sm text-slate dark:text-slate/70">Sin eventos aún</div>}
                </div>

                <div className="flex gap-2 mt-3">
                  <input
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-slate/30 bg-white dark:bg-night/50 text-ink dark:text-slate text-sm"
                    placeholder="Dejo un comentario para seguimiento…"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !commenting && addComment()}
                  />
                  <button 
                    onClick={addComment} 
                    disabled={commenting || !comment.trim()}
                    className="px-3 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm transition-colors disabled:bg-slate/30 disabled:cursor-not-allowed"
                  >
                    {commenting ? 'Enviando...' : 'Comentar'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {loading && <div className="mt-4 text-sm text-slate dark:text-slate/70">Cargando…</div>}
    </div>
  );
}
