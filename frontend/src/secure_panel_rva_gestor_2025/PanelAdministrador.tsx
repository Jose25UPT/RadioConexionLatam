import React, { useEffect, useState } from 'react';
import { FileText, Eye, Pencil, Trash2, Plus, Search, Clock, LogOut, History, Tag, MessageSquare, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PANEL_BASE } from './secureRoute';
import { getToken } from './auth';
import { fetchJson, API_BASE } from '../lib/api';

interface Noticia {
  id: number;
  slug?: string;
  titulo: string;
  resumen: string;
  autor: string;
  fecha: string;
  imagen: string;
  categoria: string;
  vistas: number;
  destacada: boolean;
  estado: string;
  tiempoLectura: number;
}

const PanelAdministrador: React.FC = () => {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const cargarNoticias = async () => {
    try {
      const token = getToken();
      if (!token) { setLoadError('No has iniciado sesión.'); return; }
      const data = await fetchJson('/api/noticias/admin/all');
      setNoticias(data.map((x: any) => ({
        id: x.id,
        slug: x.slug,
        titulo: x.titulo ?? '',
        resumen: x.resumen ?? '',
        autor: x.autor_info?.nombre ?? '—',
        fecha: x.fecha ?? '',
        imagen: x.imagen ?? '',
        categoria: x.categoria ?? '',
        vistas: x.vistas ?? 0,
        destacada: x.destacada ?? false,
        estado: x.estado ?? 'publicado',
        tiempoLectura: x.tiempo_lectura ?? 0,
      })));
      setLoadError(null);
    } catch (err: any) {
      setLoadError(err?.message || 'Error cargando noticias');
    }
  };

  const fetchHistorial = async (noticiaId: number) => {
    setHistoryLoading(true);
    setHistoryItems([]);
    setHistoryOpen(true);
    try {
      const data = await fetchJson(`/api/noticias/${noticiaId}/historial`);
      setHistoryItems(data);
    } catch (e: any) {
      alert('Error al obtener historial: ' + (e?.message || e));
      setHistoryOpen(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  const eliminarNoticia = async (id: number) => {
    if (!window.confirm('¿Eliminar esta noticia? Esta acción no se puede deshacer.')) return;
    try {
      await fetchJson(`/api/noticias/${id}`, { method: 'DELETE' });
      setNoticias(prev => prev.filter(n => n.id !== id));
    } catch (e: any) {
      alert('Error al eliminar: ' + (e?.message || ''));
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    navigate(`${PANEL_BASE}/login`);
  };

  useEffect(() => { cargarNoticias(); }, []);

  const noticiasFiltradas = noticias.filter(n =>
    n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.autor.toLowerCase().includes(busqueda.toLowerCase()) ||
    n.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-800">Panel Editorial</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to={`${PANEL_BASE}/notas`}
                className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-100 transition-all text-sm font-medium border border-purple-200"
                title="Gestionar notas">
                <MessageSquare size={16} />
                <span className="hidden sm:inline">Notas</span>
              </Link>
              <Link to={`${PANEL_BASE}/timeline`}
                className="flex items-center gap-1.5 bg-fuchsia-50 text-fuchsia-700 px-3 py-2 rounded-lg hover:bg-fuchsia-100 transition-all text-sm font-medium border border-fuchsia-200"
                title="Gestionar Línea de Tiempo">
                <Trophy size={16} />
                <span className="hidden sm:inline">Línea de Tiempo</span>
              </Link>
              <Link to={`${PANEL_BASE}/categorias`}
                className="flex items-center gap-1.5 bg-stone-100 text-stone-700 px-3 py-2 rounded-lg hover:bg-stone-200 transition-all text-sm font-medium"
                title="Gestionar categorías">
                <Tag size={16} />
                <span className="hidden sm:inline">Categorías</span>
              </Link>
              <Link to={`${PANEL_BASE}/agregar`}
                className="flex items-center gap-1.5 bg-amber-600 text-white px-3 sm:px-5 py-2 rounded-lg hover:bg-amber-700 transition-all text-sm font-medium">
                <Plus size={16} />
                <span className="hidden sm:inline">Nueva noticia</span>
                <span className="sm:hidden">Nueva</span>
              </Link>
              <button onClick={logout}
                className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-all text-red-600" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por título, autor o categoría..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-sm"
          />
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{loadError}</div>
        )}

        {/* Lista de noticias */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="font-semibold text-stone-800">Artículos <span className="text-stone-400 font-normal text-sm">({noticiasFiltradas.length})</span></h2>
          </div>

          {/* Vista tabla en desktop, tarjetas en mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Artículo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Categoría</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Métricas</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {noticiasFiltradas.map(n => (
                  <tr key={n.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {n.imagen && (
                          <img
                            src={n.imagen.startsWith('http') ? n.imagen : `${API_BASE}${n.imagen}`}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 text-sm line-clamp-1">{n.titulo}</p>
                          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{n.resumen}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {n.estado === 'publicado'
                              ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Publicada</span>
                              : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Borrador</span>}
                            <span className="text-xs text-stone-400 flex items-center gap-0.5"><Clock size={10}/>{n.tiempoLectura}min</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{n.categoria || '—'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <span className="flex items-center gap-1"><Eye size={12}/>{n.vistas}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-stone-500">
                      {n.fecha ? new Date(n.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => fetchHistorial(n.id)} title="Historial"
                          className="p-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors">
                          <History size={14}/>
                        </button>
                        <Link to={`${PANEL_BASE}/editar/${n.id}`} title="Editar"
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                          <Pencil size={14}/>
                        </Link>
                        {n.estado === 'publicado' && (
                          <Link to={`/noticia/${n.slug ?? n.id}`} title="Ver" target="_blank"
                            className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors">
                            <Eye size={14}/>
                          </Link>
                        )}
                        <button onClick={() => eliminarNoticia(n.id)} title="Eliminar"
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {noticiasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-stone-400">
                      <FileText size={36} className="mx-auto mb-3 opacity-40"/>
                      <p className="text-sm">No se encontraron noticias</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas mobile */}
          <div className="md:hidden divide-y divide-stone-100">
            {noticiasFiltradas.map(n => (
              <div key={n.id} className="p-4 space-y-3">
                <div className="flex gap-3">
                  {n.imagen && (
                    <img
                      src={n.imagen.startsWith('http') ? n.imagen : `${API_BASE}${n.imagen}`}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-800 text-sm line-clamp-2">{n.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {n.estado === 'publicado'
                        ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Publicada</span>
                        : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Borrador</span>}
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{n.categoria}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="flex items-center gap-1"><Eye size={12}/>{n.vistas}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => fetchHistorial(n.id)} className="p-1.5 bg-yellow-50 text-yellow-700 rounded-lg"><History size={14}/></button>
                    <Link to={`${PANEL_BASE}/editar/${n.id}`} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Pencil size={14}/></Link>
                    {n.estado === 'publicado' && (
                      <Link to={`/noticia/${n.slug ?? n.id}`} target="_blank" className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Eye size={14}/></Link>
                    )}
                    <button onClick={() => eliminarNoticia(n.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
            {noticiasFiltradas.length === 0 && (
              <div className="text-center py-10 text-stone-400">
                <FileText size={32} className="mx-auto mb-2 opacity-40"/>
                <p className="text-sm">No se encontraron noticias</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal historial */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-stone-800">Historial de cambios</h3>
              <button onClick={() => setHistoryOpen(false)} className="text-stone-500 hover:text-stone-800 text-sm">Cerrar</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {historyLoading && <div className="text-center text-stone-500 py-4">Cargando...</div>}
              {!historyLoading && historyItems.length === 0 && (
                <div className="text-stone-500 text-sm text-center py-4">Sin historial para esta noticia.</div>
              )}
              {!historyLoading && historyItems.map((h, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-stone-700">{h.usuario_nombre || 'Usuario ' + (h.usuario_id || 'anon')}</span>
                    <span className="text-xs text-stone-400">{new Date(h.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-stone-600">Acción: {h.accion}</div>
                  {h.cambios?.before?.titulo && <div className="text-xs text-stone-500 mt-1">Antes: {h.cambios.before.titulo}</div>}
                  {h.cambios?.after?.titulo && <div className="text-xs text-stone-600">Después: {h.cambios.after.titulo}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelAdministrador;
