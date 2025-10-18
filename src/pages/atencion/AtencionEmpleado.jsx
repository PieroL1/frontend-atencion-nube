// src/pages/atencion/AtencionEmpleado.jsx
// Vista del empleado: yo filtro/listo solicitudes, cambio estado, comento y administro Tipos.
// Solo uso campos que tu BD tiene (description, current_state, etc.).
import { useEffect, useMemo, useState } from 'react';
import EstadoBadge, { formatDate, renderStateChange } from '../../components/atencion/EstadoBadge';
import {
  tipos_list, tipos_create, tipos_update, tipos_delete,
  solicitudes_list, solicitudes_get, solicitudes_cambiarEstado,
  historial_list, historial_addComentario,
} from '../../services/atencion';

const STATES_UI = ['Recibido', 'En proceso', 'Resuelto'];

export default function AtencionEmpleado() {
  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState('Todos');
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tipos, setTipos] = useState([]);
  const [items, setItems] = useState([]);

  const [selected, setSelected] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [changing, setChanging] = useState(false);

  // Admin Tipos
  const [showTipos, setShowTipos] = useState(false);
  const [tipoEdit, setTipoEdit] = useState(null);
  const [tipoForm, setTipoForm] = useState({ name_type: '', description: '' });

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

  // Recibe overrides opcionales para tab, typeFilter, q
  // Así evitamos problemas de setState asincrónico
  async function loadSolicitudes(overrides = {}) {
    const currentTab = overrides.tab !== undefined ? overrides.tab : tab;
    const currentType = overrides.typeFilter !== undefined ? overrides.typeFilter : typeFilter;
    const currentQ = overrides.q !== undefined ? overrides.q : q;
    
    const params = {};
    if (currentQ) params.q = currentQ;
    if (currentType) params.type_id = currentType;
    if (currentTab !== 'Todos') params.state_ui = currentTab;
    
    const { data } = await solicitudes_list(params);
    setItems(data);
  }

  async function openDetalle(id) {
    setChanging(true);
    try {
      const s = await solicitudes_get(id);
      setSelected(s);
      const h = await historial_list(id);
      setHistorial(h);
    } finally {
      setChanging(false);
    }
  }

  async function changeEstado(newState) {
    if (!selected) return;
    setChanging(true);
    try {
      const upd = await solicitudes_cambiarEstado(selected.id, newState, 'Actualizo estado');
      setSelected(upd);
      setHistorial(await historial_list(upd.id));
      await loadSolicitudes();
    } finally {
      setChanging(false);
    }
  }

  async function addComment() {
    if (!selected || !newComment.trim()) return;
    setChanging(true);
    try {
      await historial_addComentario(selected.id, newComment.trim());
      setNewComment('');
      setHistorial(await historial_list(selected.id));
    } finally {
      setChanging(false);
    }
  }

  // --- CRUD Tipos ---
  function startCreateTipo() {
    setTipoEdit(null);
    setTipoForm({ name_type: '', description: '' });
  }
  function startEditTipo(t) {
    setTipoEdit(t);
    setTipoForm({ name_type: t.name_type, description: t.description || '' });
  }
  async function saveTipo(e) {
    e?.preventDefault?.();
    if (!tipoForm.name_type?.trim()) return;
    if (tipoEdit) {
      const upd = await tipos_update(tipoEdit.id_type, tipoForm);
      setTipos(prev => prev.map(x => x.id_type === upd.id_type ? upd : x));
    } else {
      const created = await tipos_create(tipoForm);
      setTipos(prev => [...prev, created]);
    }
    setTipoEdit(null);
    setTipoForm({ name_type: '', description: '' });
  }
  async function removeTipo(id_type) {
    if (!confirm('¿Eliminar este tipo?')) return;
    await tipos_delete(id_type);
    setTipos(prev => prev.filter(x => x.id_type !== id_type));
    
    // Si el tipo eliminado era el filtrado, limpiarlo y recargar
    if (String(typeFilter) === String(id_type)) {
      setTypeFilter('');
      await loadSolicitudes({ typeFilter: '' });
    } else {
      await loadSolicitudes();
    }
  }

  const filtered = useMemo(() => items, [items]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111115]">Atenciones (Empleado)</h1>
          <p className="text-sm text-gray-600">Gestiono solicitudes: cambio estado, comento y administro tipos.</p>
        </div>
        <button onClick={() => setShowTipos(true)} className="text-xs px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10">
          Admin. Tipos
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {['Todos', ...STATES_UI].map(t => (
          <button
            key={t}
            onClick={() => { 
              setTab(t); 
              loadSolicitudes({ tab: t }); 
            }}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${tab === t ? 'bg-primary/10 text-primary border-primary/40' : 'border-gray-300 text-[#111115]/80 hover:bg-gray-100'}`}
          >
            {t}
          </button>
        ))}
        <select
          className="ml-2 px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-sm"
          value={typeFilter}
          onChange={e => { 
            setTypeFilter(e.target.value); 
            loadSolicitudes({ typeFilter: e.target.value }); 
          }}
        >
          <option value="">Todos los tipos</option>
          {tipos.map(t => <option key={t.id_type} value={t.id_type}>{t.name_type}</option>)}
        </select>
        <input
          className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm flex-1 min-w-[220px]"
          placeholder="Buscar en descripción…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadSolicitudes()}
        />
        <button onClick={() => loadSolicitudes()} className="px-3 py-2 rounded-xl bg-[#26BBFF] text-white text-sm">Buscar</button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
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
            {filtered.map(row => (
              <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2">{row.id}</td>
                <td className="px-4 py-2">{row.type_name || row.type_id}</td>
                <td className="px-4 py-2">{row.description}</td>
                <td className="px-4 py-2"><EstadoBadge value={row.state_ui || row.current_state} /></td>
                <td className="px-4 py-2">{formatDate(row.creation_date)}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => openDetalle(row.id)} className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100">Ver</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-500">No hay solicitudes</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <div className="text-sm text-gray-500">Solicitud #{selected.id}</div>
                <div className="font-semibold">{selected.type_name || selected.type_id}</div>
              </div>
              <button className="text-sm px-3 py-1.5 rounded-lg border" onClick={() => setSelected(null)}>Cerrar</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 p-5">
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Descripción</div>
                <div className="text-[#111115] bg-gray-50 rounded-xl p-3">{selected.description}</div>

                <div className="text-sm text-gray-500 mt-3">Estado actual</div>
                <div className="flex items-center gap-2">
                  <EstadoBadge value={selected.state_ui || selected.current_state} />
                  <select
                    disabled={changing}
                    className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
                    value={selected.state_ui || selected.current_state}
                    onChange={(e) => changeEstado(e.target.value)}
                  >
                    {STATES_UI.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">Historial</div>
                <div className="space-y-2 max-h-64 overflow-auto pr-1">
                  {historial.map(ev => (
                    <div key={ev.id_history} className="border border-gray-200 rounded-xl p-3">
                      <div className="text-xs text-gray-500">{formatDate(ev.change_date)}</div>
                      <div className="text-sm">{ev.comment || <span className="text-gray-400">sin comentario</span>}</div>
                      {(ev.previous_state || ev.new_state) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {renderStateChange(ev.previous_state, ev.new_state)}
                        </div>
                      )}
                    </div>
                  ))}
                  {historial.length === 0 && <div className="text-sm text-gray-500">Sin eventos aún</div>}
                </div>

                <div className="flex gap-2 mt-3">
                  <input
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
                    placeholder="Agrego un comentario…"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button
                    disabled={changing || !newComment.trim()}
                    onClick={addComment}
                    className="px-3 py-2 rounded-xl bg-[#26BBFF] text-white text-sm disabled:opacity-50"
                  >
                    Comentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tipos */}
      {showTipos && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div className="font-semibold">Tipos de Solicitud</div>
              <button className="text-sm px-3 py-1.5 rounded-lg border" onClick={() => setShowTipos(false)}>Cerrar</button>
            </div>

            <div className="p-5">
              <div className="flex items-end gap-2 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Nombre</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
                    value={tipoForm.name_type}
                    onChange={e => setTipoForm(f => ({ ...f, name_type: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Descripción</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-sm"
                    value={tipoForm.description}
                    onChange={e => setTipoForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <button onClick={saveTipo} className="px-3 py-2 rounded-xl bg-[#26BBFF] text-white text-sm">
                  {tipoEdit ? 'Actualizar' : 'Agregar'}
                </button>
                {tipoEdit && (
                  <button onClick={() => { setTipoEdit(null); setTipoForm({ name_type: '', description: '' }); }} className="px-3 py-2 rounded-xl border text-sm">
                    Cancelar
                  </button>
                )}
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-2">ID</th>
                      <th className="text-left px-4 py-2">Nombre</th>
                      <th className="text-left px-4 py-2">Descripción</th>
                      <th className="text-left px-4 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tipos.map(t => (
                      <tr key={t.id_type} className="border-t border-gray-100">
                        <td className="px-4 py-2">{t.id_type}</td>
                        <td className="px-4 py-2">{t.name_type}</td>
                        <td className="px-4 py-2">{t.description}</td>
                        <td className="px-4 py-2 text-right">
                          <button className="px-2 py-1.5 text-xs rounded-lg border mr-2" onClick={() => startEditTipo(t)}>Editar</button>
                          <button className="px-2 py-1.5 text-xs rounded-lg border" onClick={() => removeTipo(t.id_type)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                    {tipos.length === 0 && (
                      <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-500">Sin tipos</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}

      {loading && <div className="mt-4 text-sm text-gray-500">Cargando…</div>}
    </div>
  );
}
