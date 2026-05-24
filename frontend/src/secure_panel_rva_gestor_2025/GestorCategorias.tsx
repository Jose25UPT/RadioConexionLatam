import React, { useState, useEffect, useRef } from 'react';
import { Tag, Plus, Trash2, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PANEL_BASE } from './secureRoute';
import { fetchJson } from '../lib/api';

interface Toast { type: 'ok' | 'err'; msg: string }

const GestorCategorias: React.FC = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<string[]>([]);
  const [nuevo, setNuevo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const cargar = async () => {
    setCargando(true);
    try {
      const data: string[] = await fetchJson('/api/noticias/categorias/');
      setCategorias(Array.isArray(data) ? data : []);
    } catch (e: any) {
      showToast('err', 'Error cargando categorías: ' + (e?.message || ''));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const agregar = async () => {
    const nombre = nuevo.trim();
    if (!nombre) return;
    setGuardando(true);
    try {
      await fetchJson(`/api/noticias/categorias/?nombre=${encodeURIComponent(nombre)}`, { method: 'POST' });
      setNuevo('');
      showToast('ok', `Categoría "${nombre}" creada`);
      await cargar();
      inputRef.current?.focus();
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('409') || msg.toLowerCase().includes('ya existe')) {
        showToast('err', `"${nombre}" ya existe`);
      } else {
        showToast('err', 'Error al crear: ' + msg);
      }
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (nombre: string) => {
    if (!window.confirm(`¿Eliminar la categoría "${nombre}"?`)) return;
    setEliminando(nombre);
    try {
      await fetchJson(`/api/noticias/categorias/?nombre=${encodeURIComponent(nombre)}`, { method: 'DELETE' });
      showToast('ok', `"${nombre}" eliminada`);
      setCategorias(prev => prev.filter(c => c !== nombre));
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('409') || msg.toLowerCase().includes('noticias')) {
        showToast('err', `"${nombre}" tiene noticias asignadas y no puede eliminarse`);
      } else if (msg.includes('404')) {
        showToast('err', `"${nombre}" no encontrada`);
      } else {
        showToast('err', 'Error al eliminar: ' + msg);
      }
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm
          ${toast.type === 'ok'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {toast.type === 'ok' ? <CheckCircle size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => navigate(PANEL_BASE)}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-stone-800">Gestión de categorías</h1>
            <p className="text-xs text-stone-500">Añade o elimina categorías para las noticias</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Formulario nueva categoría */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-stone-700">Nueva categoría</h2>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={nuevo}
              onChange={e => setNuevo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !guardando && agregar()}
              placeholder="Ej: entrevistas, eventos, reviews..."
              maxLength={60}
              className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              disabled={guardando}
              autoFocus
            />
            <button
              onClick={agregar}
              disabled={guardando || !nuevo.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {guardando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {guardando ? 'Añadiendo...' : 'Añadir'}
            </button>
          </div>
          <p className="text-xs text-stone-400">Presiona Enter o el botón para agregar.</p>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-700">Categorías activas</h2>
            {!cargando && (
              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{categorias.length}</span>
            )}
          </div>

          {cargando && (
            <div className="py-12 flex items-center justify-center gap-2 text-stone-400 text-sm">
              <Loader2 size={18} className="animate-spin" /> Cargando...
            </div>
          )}

          {!cargando && categorias.length === 0 && (
            <div className="py-12 text-center text-stone-400">
              <Tag size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No hay categorías todavía. ¡Agrega la primera!</p>
            </div>
          )}

          {!cargando && categorias.length > 0 && (
            <ul className="divide-y divide-stone-100">
              {categorias.map(cat => (
                <li key={cat} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 group transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-amber-100 rounded-md">
                      <Tag size={13} className="text-amber-700" />
                    </span>
                    <span className="text-sm font-medium text-stone-800">{cat}</span>
                  </div>
                  <button
                    onClick={() => eliminar(cat)}
                    disabled={eliminando === cat}
                    title="Eliminar categoría"
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                  >
                    {eliminando === cat
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Trash2 size={15} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-stone-400 text-center">
          Las categorías con noticias asignadas no pueden eliminarse hasta reasignarlas.
        </p>
      </div>
    </div>
  );
};

export default GestorCategorias;
