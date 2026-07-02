import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Trash2, Pencil, CheckCircle,
  AlertCircle, Loader2, Trophy, Users, Tag, Star, X, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PANEL_BASE } from './secureRoute';
import { fetchJson, API_BASE } from '../lib/api';

interface Categoria { id: number; nombre: string }
interface Participante {
  id: number; nombre: string; periodo_tiempo: string | null;
  es_ganador: boolean; imagen_url: string | null;
  categoria_id: number; categoria_nombre: string | null;
}
interface Evento { id: number; anio: number; titulo_evento: string; participantes: Participante[] }

type Tab = 'eventos' | 'categorias';
type Toast = { type: 'ok' | 'err'; msg: string };

function ToastBox({ toast }: { toast: Toast }) {
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm
      ${toast.type === 'ok'
        ? 'bg-green-50 border border-green-200 text-green-800'
        : 'bg-red-50 border border-red-200 text-red-800'}`}>
      {toast.type === 'ok'
        ? <CheckCircle size={16} className="flex-shrink-0" />
        : <AlertCircle size={16} className="flex-shrink-0" />}
      {toast.msg}
    </div>
  );
}

const VACIO_PARTICIPANTE = {
  nombre: '', periodo_tiempo: '', es_ganador: false,
  imagen_url: '', categoria_id: 0, evento_id: 0,
};

export default function GestorTimeline() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('eventos');
  const [toast, setToast] = useState<Toast | null>(null);

  // Datos
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  // Selección de evento para ver/gestionar participantes
  const [eventoActivo, setEventoActivo] = useState<Evento | null>(null);

  // Formulario evento
  const [formEvento, setFormEvento] = useState({ anio: '', titulo_evento: '' });
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
  const [guardandoEvento, setGuardandoEvento] = useState(false);

  // Formulario participante
  const [modalParticipante, setModalParticipante] = useState(false);
  const [editandoParticipante, setEditandoParticipante] = useState<Participante | null>(null);
  const [formP, setFormP] = useState({ ...VACIO_PARTICIPANTE });
  const [guardandoP, setGuardandoP] = useState(false);
  const [subiendoImg, setSubiendoImg] = useState(false);

  // Formulario categoría
  const [nuevaCat, setNuevaCat] = useState('');
  const [guardandoCat, setGuardandoCat] = useState(false);

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const cargar = async () => {
    setCargando(true);
    try {
      const [evs, cats] = await Promise.all([
        fetchJson<Evento[]>('/api/timeline/eventos'),
        fetchJson<Categoria[]>('/api/timeline/categorias'),
      ]);
      setEventos(evs);
      setCategorias(cats);
      // Actualizar evento activo si existe
      if (eventoActivo) {
        const actualizado = evs.find(e => e.id === eventoActivo.id);
        setEventoActivo(actualizado ?? null);
      }
    } catch (e: any) {
      showToast('err', 'Error cargando datos: ' + (e?.message || ''));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Eventos ────────────────────────────────────────────────────────────────

  const abrirFormEvento = (ev?: Evento) => {
    if (ev) {
      setEditandoEvento(ev);
      setFormEvento({ anio: String(ev.anio), titulo_evento: ev.titulo_evento });
    } else {
      setEditandoEvento(null);
      setFormEvento({ anio: '', titulo_evento: '' });
    }
  };

  const guardarEvento = async () => {
    const anio = parseInt(formEvento.anio);
    if (!anio || !formEvento.titulo_evento.trim()) {
      showToast('err', 'Año y título son requeridos'); return;
    }
    setGuardandoEvento(true);
    try {
      if (editandoEvento) {
        await fetchJson(`/api/timeline/eventos/${editandoEvento.id}`, {
          method: 'PUT', body: JSON.stringify({ anio, titulo_evento: formEvento.titulo_evento.trim() }),
        });
        showToast('ok', 'Evento actualizado');
      } else {
        await fetchJson('/api/timeline/eventos', {
          method: 'POST', body: JSON.stringify({ anio, titulo_evento: formEvento.titulo_evento.trim() }),
        });
        showToast('ok', `Evento ${anio} creado`);
      }
      setEditandoEvento(null);
      setFormEvento({ anio: '', titulo_evento: '' });
      await cargar();
    } catch (e: any) {
      showToast('err', e?.message || 'Error guardando evento');
    } finally {
      setGuardandoEvento(false);
    }
  };

  const eliminarEvento = async (ev: Evento) => {
    if (!window.confirm(`¿Eliminar el evento "${ev.titulo_evento}" y todos sus participantes?`)) return;
    try {
      await fetchJson(`/api/timeline/eventos/${ev.id}`, { method: 'DELETE' });
      showToast('ok', 'Evento eliminado');
      if (eventoActivo?.id === ev.id) setEventoActivo(null);
      await cargar();
    } catch (e: any) {
      showToast('err', e?.message || 'Error eliminando evento');
    }
  };

  // ─── Participantes ───────────────────────────────────────────────────────────

  const abrirModalParticipante = (p?: Participante) => {
    if (!eventoActivo) return;
    if (p) {
      setEditandoParticipante(p);
      setFormP({
        nombre: p.nombre,
        periodo_tiempo: p.periodo_tiempo ?? '',
        es_ganador: p.es_ganador,
        imagen_url: p.imagen_url ?? '',
        categoria_id: p.categoria_id,
        evento_id: eventoActivo.id,
      });
    } else {
      setEditandoParticipante(null);
      setFormP({ ...VACIO_PARTICIPANTE, evento_id: eventoActivo.id });
    }
    setModalParticipante(true);
  };

  const subirImagen = async (file: File) => {
    setSubiendoImg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/uploads/imagen', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) throw new Error('Error subiendo imagen');
      const data = await res.json();
      setFormP(prev => ({ ...prev, imagen_url: data.url ?? data.filename ?? '' }));
    } catch (e: any) {
      showToast('err', 'Error subiendo imagen: ' + (e?.message || ''));
    } finally {
      setSubiendoImg(false);
    }
  };

  const guardarParticipante = async () => {
    if (!formP.nombre.trim() || !formP.categoria_id || !formP.evento_id) {
      showToast('err', 'Nombre, categoría y evento son requeridos'); return;
    }
    setGuardandoP(true);
    try {
      const body = {
        nombre: formP.nombre.trim(),
        periodo_tiempo: formP.periodo_tiempo || null,
        es_ganador: formP.es_ganador,
        imagen_url: formP.imagen_url || null,
        categoria_id: formP.categoria_id,
        evento_id: formP.evento_id,
      };
      if (editandoParticipante) {
        await fetchJson(`/api/timeline/participantes/${editandoParticipante.id}`, {
          method: 'PUT', body: JSON.stringify(body),
        });
        showToast('ok', 'Participante actualizado');
      } else {
        await fetchJson('/api/timeline/participantes', {
          method: 'POST', body: JSON.stringify(body),
        });
        showToast('ok', 'Participante agregado');
      }
      setModalParticipante(false);
      setEditandoParticipante(null);
      await cargar();
    } catch (e: any) {
      showToast('err', e?.message || 'Error guardando participante');
    } finally {
      setGuardandoP(false);
    }
  };

  const eliminarParticipante = async (p: Participante) => {
    if (!window.confirm(`¿Eliminar a "${p.nombre}"?`)) return;
    try {
      await fetchJson(`/api/timeline/participantes/${p.id}`, { method: 'DELETE' });
      showToast('ok', `"${p.nombre}" eliminado`);
      await cargar();
    } catch (e: any) {
      showToast('err', e?.message || 'Error eliminando participante');
    }
  };

  // ─── Categorías ───────────────────────────────────────────────────────────────

  const guardarCategoria = async () => {
    const nombre = nuevaCat.trim();
    if (!nombre) return;
    setGuardandoCat(true);
    try {
      await fetchJson('/api/timeline/categorias', {
        method: 'POST', body: JSON.stringify({ nombre }),
      });
      showToast('ok', `Categoría "${nombre}" creada`);
      setNuevaCat('');
      await cargar();
    } catch (e: any) {
      showToast('err', e?.message || 'Error creando categoría');
    } finally {
      setGuardandoCat(false);
    }
  };

  const eliminarCategoria = async (cat: Categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    try {
      await fetchJson(`/api/timeline/categorias/${cat.id}`, { method: 'DELETE' });
      showToast('ok', `"${cat.nombre}" eliminada`);
      await cargar();
    } catch (e: any) {
      showToast('err', e?.message || 'Error eliminando categoría');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-stone-50">
      {toast && <ToastBox toast={toast} />}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => eventoActivo ? setEventoActivo(null) : navigate(PANEL_BASE)}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-stone-800">
              {eventoActivo ? `Participantes — ${eventoActivo.titulo_evento}` : 'Línea de Tiempo'}
            </h1>
            <p className="text-xs text-stone-500">
              {eventoActivo
                ? `${eventoActivo.participantes.length} participante(s) en ${eventoActivo.anio}`
                : 'Gestión del Salón de la Fama'}
            </p>
          </div>
        </div>
      </header>

      {/* Vista de participantes de un evento */}
      {eventoActivo ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <button
            onClick={() => abrirModalParticipante()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Nuevo participante
          </button>

          {eventoActivo.participantes.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 py-16 text-center text-stone-400">
              <Users size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Sin participantes aún. ¡Agrega el primero!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventoActivo.participantes.map(p => (
                <div key={p.id} className={`bg-white rounded-xl border overflow-hidden shadow-sm ${p.es_ganador ? 'border-amber-300' : 'border-stone-200'}`}>
                  {p.imagen_url && (
                    <img
                      src={p.imagen_url.startsWith('http') ? p.imagen_url : `${API_BASE}${p.imagen_url}`}
                      alt={p.nombre}
                      className="w-full h-36 object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div className="p-3 space-y-1">
                    {p.es_ganador && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        <Star size={10} className="fill-amber-500 text-amber-500" /> Ganador
                      </span>
                    )}
                    <p className="font-bold text-stone-800 text-sm">{p.nombre}</p>
                    {p.categoria_nombre && <p className="text-xs text-purple-600">{p.categoria_nombre}</p>}
                    {p.periodo_tiempo && <p className="text-xs text-stone-400">{p.periodo_tiempo}</p>}
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => abrirModalParticipante(p)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors">
                        <Pencil size={12} /> Editar
                      </button>
                      <button onClick={() => eliminarParticipante(p)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors">
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-stone-200 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 pt-1">
              {([['eventos', Trophy, 'Eventos'], ['categorias', Tag, 'Categorías']] as const).map(([key, Icon, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === key
                      ? 'border-purple-600 text-purple-700'
                      : 'border-transparent text-stone-500 hover:text-stone-700'
                  }`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

            {/* ─── Tab Eventos ─── */}
            {tab === 'eventos' && (
              <div className="space-y-4">
                {/* Formulario crear/editar evento */}
                <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-stone-700">
                    {editandoEvento ? `Editando evento ${editandoEvento.anio}` : 'Nuevo evento'}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <input
                      type="number"
                      value={formEvento.anio}
                      onChange={e => setFormEvento(prev => ({ ...prev, anio: e.target.value }))}
                      placeholder="Año (ej: 2025)"
                      min={2000} max={2100}
                      className="w-32 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      value={formEvento.titulo_evento}
                      onChange={e => setFormEvento(prev => ({ ...prev, titulo_evento: e.target.value }))}
                      placeholder="Ej: LATAM Awards 2025"
                      className="flex-1 min-w-[180px] px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={guardarEvento} disabled={guardandoEvento}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium">
                        {guardandoEvento ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                        {editandoEvento ? 'Actualizar' : 'Crear'}
                      </button>
                      {editandoEvento && (
                        <button onClick={() => { setEditandoEvento(null); setFormEvento({ anio: '', titulo_evento: '' }); }}
                          className="px-3 py-2 text-stone-500 hover:bg-stone-100 rounded-lg text-sm transition-colors">
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista eventos */}
                {cargando ? (
                  <div className="py-12 flex items-center justify-center gap-2 text-stone-400 text-sm">
                    <Loader2 size={18} className="animate-spin" /> Cargando...
                  </div>
                ) : eventos.length === 0 ? (
                  <div className="bg-white rounded-xl border border-stone-200 py-16 text-center text-stone-400">
                    <Trophy size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No hay eventos aún. ¡Crea el primero!</p>
                  </div>
                ) : (
                  <ul className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
                    {eventos.map(ev => (
                      <li key={ev.id} className="flex items-center gap-3 px-5 py-4 hover:bg-stone-50 group transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-black text-purple-700">{ev.anio}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-stone-800 text-sm truncate">{ev.titulo_evento}</p>
                          <p className="text-xs text-stone-400">{ev.participantes.length} participante(s)</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEventoActivo(ev)}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors font-medium">
                            <Users size={13} /> Participantes
                          </button>
                          <button onClick={() => abrirFormEvento(ev)}
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => eliminarEvento(ev)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* ─── Tab Categorías ─── */}
            {tab === 'categorias' && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
                  <h2 className="text-sm font-semibold text-stone-700">Nueva categoría</h2>
                  <div className="flex gap-2">
                    <input
                      value={nuevaCat}
                      onChange={e => setNuevaCat(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !guardandoCat && guardarCategoria()}
                      placeholder="Ej: Mejor Locutor"
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <button onClick={guardarCategoria} disabled={guardandoCat || !nuevaCat.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium">
                      {guardandoCat ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                      Agregar
                    </button>
                  </div>
                </div>

                <ul className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
                  {categorias.map(cat => (
                    <li key={cat.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 group transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 bg-purple-100 rounded-md"><Tag size={13} className="text-purple-700" /></span>
                        <span className="text-sm font-medium text-stone-800">{cat.nombre}</span>
                      </div>
                      <button onClick={() => eliminarCategoria(cat)}
                        className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                  {categorias.length === 0 && (
                    <li className="py-12 text-center text-stone-400">
                      <Tag size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Sin categorías. ¡Agrega la primera!</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal participante */}
      {modalParticipante && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
              <h2 className="font-bold text-stone-800">
                {editandoParticipante ? 'Editar participante' : 'Nuevo participante'}
              </h2>
              <button onClick={() => { setModalParticipante(false); setEditandoParticipante(null); }}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Nombre *</label>
                <input
                  value={formP.nombre}
                  onChange={e => setFormP(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del participante"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Categoría *</label>
                <select
                  value={formP.categoria_id}
                  onChange={e => setFormP(prev => ({ ...prev, categoria_id: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                >
                  <option value={0}>Seleccionar categoría...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              {/* Período */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Período de tiempo</label>
                <input
                  value={formP.periodo_tiempo}
                  onChange={e => setFormP(prev => ({ ...prev, periodo_tiempo: e.target.value }))}
                  placeholder="Ej: 2023–2024"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              {/* Imagen */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Imagen</label>
                <div className="flex gap-2 items-center">
                  <input
                    value={formP.imagen_url}
                    onChange={e => setFormP(prev => ({ ...prev, imagen_url: e.target.value }))}
                    placeholder="URL de imagen o sube un archivo"
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <label className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    subiendoImg ? 'opacity-50 cursor-not-allowed' : 'border-stone-300 hover:bg-stone-50 text-stone-600'
                  }`}>
                    {subiendoImg ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    <span className="hidden sm:inline">Subir</span>
                    <input type="file" accept="image/*" className="hidden" disabled={subiendoImg}
                      onChange={e => { const f = e.target.files?.[0]; if (f) subirImagen(f); e.target.value = ''; }} />
                  </label>
                </div>
                {formP.imagen_url && (
                  <img
                    src={formP.imagen_url.startsWith('http') ? formP.imagen_url : `${API_BASE}${formP.imagen_url}`}
                    alt="preview"
                    className="mt-2 h-20 w-20 rounded-lg object-cover border border-stone-200"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Ganador */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formP.es_ganador}
                  onChange={e => setFormP(prev => ({ ...prev, es_ganador: e.target.checked }))}
                  className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="text-sm font-medium text-stone-700 flex items-center gap-1">
                    <Star size={14} className="text-amber-500" /> Marcar como ganador
                  </span>
                  <p className="text-xs text-stone-400">Se destacará con badge dorado en la vista pública</p>
                </div>
              </label>
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button onClick={() => { setModalParticipante(false); setEditandoParticipante(null); }}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-sm transition-colors">
                Cancelar
              </button>
              <button onClick={guardarParticipante} disabled={guardandoP}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm font-medium">
                {guardandoP ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                {editandoParticipante ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
