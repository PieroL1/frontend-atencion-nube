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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-slate-50 dark:from-coal dark:to-ink">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg shadow-primary/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-ink dark:text-slate">Panel de Gestión</h1>
                <p className="text-slate dark:text-slate/70">Administra solicitudes, cambia estados y gestiona tipos</p>
              </div>
            </div>
            <button 
              onClick={() => setShowTipos(true)} 
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin. Tipos
            </button>
          </div>
        </div>

      {/* Filtros mejorados */}
      <div className="bg-white dark:bg-night border-2 border-primary/20 dark:border-primary/30 rounded-2xl shadow-lg shadow-primary/10 dark:shadow-none p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="font-semibold text-ink dark:text-slate">Filtros de búsqueda</h2>
        </div>
        
        {/* Filtros por estado */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-slate dark:text-slate/70 mr-2">Estado:</span>
          {['Todos', ...STATES_UI].map(t => (
            <button
              key={t}
              onClick={() => { 
                setTab(t); 
                loadSolicitudes({ tab: t }); 
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                tab === t 
                  ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md shadow-primary/30' 
                  : 'bg-gray-100 dark:bg-slate/20 text-slate dark:text-slate/70 hover:bg-gray-200 dark:hover:bg-slate/30 border border-gray-300 dark:border-slate/30'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Filtros adicionales */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-slate mb-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tipo de solicitud
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate/30 bg-gray-50 dark:bg-night/50 text-ink dark:text-slate focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all"
              value={typeFilter}
              onChange={e => { 
                setTypeFilter(e.target.value); 
                loadSolicitudes({ typeFilter: e.target.value }); 
              }}
            >
              <option value="">Todos los tipos</option>
              {tipos.map(t => <option key={t.id_type} value={t.id_type}>{t.name_type}</option>)}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-slate mb-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar en descripción
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate/30 bg-gray-50 dark:bg-night/50 text-ink dark:text-slate focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all"
                placeholder="Escribe para buscar..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadSolicitudes()}
              />
              <button 
                onClick={() => loadSolicitudes()} 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes - Vista de tarjetas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-2xl font-bold text-ink dark:text-slate">Solicitudes</h2>
            <span className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30 rounded-full text-sm font-semibold">
              {filtered.length}
            </span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-night border-2 border-dashed border-gray-300 dark:border-slate/30 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400 dark:text-slate/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-ink dark:text-slate mb-2">No se encontraron solicitudes</h3>
            <p className="text-slate dark:text-slate/70">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(row => (
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
                    Gestionar
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

      {/* Detalle mejorado */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-night w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-5 shadow-lg shadow-primary/20">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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

                {/* Estado actual con cambio */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border-2 border-purple-200 dark:border-purple-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-ink dark:text-slate">Gestión de Estado</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-slate dark:text-slate/70 mb-2 block">Estado Actual:</label>
                      <EstadoBadge value={selected.state_ui || selected.current_state} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink dark:text-slate mb-2 block">Cambiar a:</label>
                      <select
                        disabled={changing}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate/30 bg-white dark:bg-night text-ink dark:text-slate focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all disabled:opacity-50"
                        value={selected.state_ui || selected.current_state}
                        onChange={(e) => changeEstado(e.target.value)}
                      >
                        {STATES_UI.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
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
                      <div key={ev.id_history} className="relative pl-6 pb-3">
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
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-slate/30 bg-white dark:bg-night text-ink dark:text-slate focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 transition-all"
                      placeholder="Escribe tu comentario..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && !changing && addComment()}
                    />
                    <button
                      disabled={changing || !newComment.trim()}
                      onClick={addComment}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {changing ? (
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

      {/* Modal: Tipos mejorado */}
      {showTipos && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-night w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-5 shadow-lg shadow-purple-500/20">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Administración</div>
                    <div className="text-xl font-bold">Tipos de Solicitud</div>
                  </div>
                </div>
                <button 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors" 
                  onClick={() => setShowTipos(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Formulario crear/editar */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800/30 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h3 className="font-semibold text-ink dark:text-slate">
                    {tipoEdit ? 'Editar Tipo' : 'Nuevo Tipo'}
                  </h3>
                </div>
                
                <form onSubmit={saveTipo}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-slate mb-2">
                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Nombre del tipo
                      </label>
                      <input
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate/30 bg-white dark:bg-night text-ink dark:text-slate focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 transition-all"
                        placeholder="Ej: Consulta Académica"
                        value={tipoForm.name_type}
                        onChange={e => setTipoForm(f => ({ ...f, name_type: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-ink dark:text-slate mb-2">
                        <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Descripción
                      </label>
                      <input
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-slate/30 bg-white dark:bg-night text-ink dark:text-slate focus:border-pink-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-200 dark:focus:ring-pink-900/30 transition-all"
                        placeholder="Breve descripción"
                        value={tipoForm.description}
                        onChange={e => setTipoForm(f => ({ ...f, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {tipoEdit ? 'Actualizar' : 'Agregar'}
                    </button>
                    {tipoEdit && (
                      <button 
                        type="button"
                        onClick={() => { setTipoEdit(null); setTipoForm({ name_type: '', description: '' }); }} 
                        className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-slate/20 text-ink dark:text-slate hover:bg-gray-300 dark:hover:bg-slate/30 font-medium transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Lista de tipos */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <h3 className="font-semibold text-ink dark:text-slate">Tipos Existentes</h3>
                  <span className="px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold">
                    {tipos.length}
                  </span>
                </div>

                {tipos.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-slate/10 border-2 border-dashed border-gray-300 dark:border-slate/30 rounded-xl p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 dark:text-slate/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="text-slate dark:text-slate/70">No hay tipos creados aún</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tipos.map(t => (
                      <div key={t.id_type} className="bg-white dark:bg-night border-2 border-gray-200 dark:border-slate/20 rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-bold">
                                #{t.id_type}
                              </span>
                              <h4 className="font-semibold text-ink dark:text-slate">{t.name_type}</h4>
                            </div>
                            {t.description && (
                              <p className="text-sm text-slate dark:text-slate/70">{t.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate/10">
                          <button 
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 font-medium transition-colors flex items-center justify-center gap-1" 
                            onClick={() => startEditTipo(t)}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button 
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium transition-colors flex items-center justify-center gap-1" 
                            onClick={() => removeTipo(t.id_type)}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
