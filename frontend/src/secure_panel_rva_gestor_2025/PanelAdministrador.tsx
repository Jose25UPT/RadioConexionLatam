import React, { useEffect, useState } from 'react';
import { FileText, Eye, Edit, Pencil, Trash2, Plus, Search, Filter, Heart, MessageCircle, Clock, Zap, LogOut, User, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PANEL_BASE } from './secureRoute';
import { getUserRole } from './auth';
import { getToken } from './auth';
import { fetchJson, API_BASE } from '../lib/api';

interface NoticiaExtendida {
  id: number;
  slug?: string;
  titulo: string;
  resumen: string;
  contenido: string;
  autor: string;
  fecha: string;
  imagen: string;
  categoria: string;
  vistas: number;
  destacada: boolean;
  programa?: string;
  editor: string;
  redactor?: string;
  comentarios: number;
  likes: number;
  compartidos: number;
  tiempoLectura: number;
  tags: string[];
}

const PanelAdministrador: React.FC = () => {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState<NoticiaExtendida[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  // Métricas eliminadas por requerimiento

  const noticiasDemo: NoticiaExtendida[] = [
    {
      id: 1,
      titulo: 'Hiroyuki Sawano: El compositor que redefinió la épica moderna del anime',
      resumen: 'A los 30 años de carrera, analizamos el legado musical de Sawano desde Attack on Titan hasta Blue Exorcist.',
      contenido: 'Análisis completo del compositor...',
      autor: 'Kenji Nakamura',
      fecha: '2025-09-25',
      imagen: '/logo.jpg',
      categoria: 'Clásicos',
      vistas: 2850,
      destacada: true,
      programa: 'Nostálgicos del Anime',
      editor: 'Carlos Mendoza',
      redactor: 'Ana Jiménez',
      comentarios: 127,
      likes: 445,
      compartidos: 89,
      tiempoLectura: 8,
      tags: ['hiroyuki-sawano', 'nostalgia', 'análisis-musical', 'legacy']
    },
    {
      id: 2,
      titulo: 'Studio Ghibli anuncia nueva película para 2026',
      resumen: 'Miyazaki regresa con una nueva obra que promete revolucionar la animación tradicional.',
      contenido: 'Noticia completa sobre Ghibli...',
      autor: 'Marina Suzuki',
      fecha: '2025-09-20',
      imagen: '/logo.jpg',
      categoria: 'Ghibli',
      vistas: 5420,
      destacada: true,
      programa: 'Noticias Anime',
      editor: 'Diego Ruiz',
      comentarios: 234,
      likes: 892,
      compartidos: 156,
      tiempoLectura: 5,
      tags: ['ghibli', 'miyazaki', 'película', '2026']
    },
    {
      id: 3,
      titulo: 'El impacto psicológico de Serial Experiments Lain en el anime moderno',
      resumen: 'Cómo esta obra de culto de los 90s sigue influenciando a creadores contemporáneos.',
      contenido: 'Análisis psicológico detallado...',
      autor: 'Dr. Takeshi Yamada',
      fecha: '2025-09-18',
      imagen: '/logo.jpg',
      categoria: 'Análisis',
      vistas: 1680,
      destacada: false,
      programa: 'Anime Profundo',
      editor: 'Laura García',
      comentarios: 78,
      likes: 312,
      compartidos: 45,
      tiempoLectura: 12,
      tags: ['lain', 'psicología', 'análisis', 'culto']
    }
  ];

  const obtenerNoticias = async () => {
    try {
      const token = getToken();
      if (token) {
        try {
          const data = await fetchJson(`/api/noticias/admin/all`);
          const mapped: NoticiaExtendida[] = data.map((x: any) => ({
            id: x.id,
            slug: x.slug,
            titulo: x.titulo,
            resumen: x.resumen || '',
            contenido: x.contenido || '',
            autor: x.autor_info?.nombre || '—',
            fecha: x.fecha || '',
            imagen: x.imagen || '/logo.jpg',
            categoria: x.categoria || '',
            vistas: x.vistas || 0,
            destacada: x.destacada || false,
            programa: x.programa || '',
            editor: x.last_edited_by || '',
            redactor: undefined,
            comentarios: 0,
            likes: x.likes || 0,
            compartidos: x.shares || 0,
            tiempoLectura: x.tiempo_lectura || 0,
            tags: x.tags || []
          }));
          setNoticias(mapped);
          setLoadError(null);
          setDemoMode(false);
          return;
        } catch (err: any) {
          console.error('Error cargando noticias del backend:', err);
          // Fallback si la ruta admin no existe (404): usar endpoint público con límite alto
          const msg = String(err?.message || '');
          if (msg.includes('404')) {
            try {
              const pub = await fetchJson(`/api/noticias/?limite=200&offset=0`);
              const mapped: NoticiaExtendida[] = pub.map((x: any) => ({
                id: x.id,
                slug: x.slug,
                titulo: x.titulo,
                resumen: x.resumen || '',
                contenido: x.contenido || '',
                autor: x.autor_info?.nombre || '—',
                fecha: x.fecha || '',
                imagen: x.imagen || '/logo.jpg',
                categoria: x.categoria || '',
                vistas: x.vistas || 0,
                destacada: x.destacada || false,
                programa: x.programa || '',
                editor: x.last_edited_by || '',
                redactor: undefined,
                comentarios: 0,
                likes: x.likes || 0,
                compartidos: x.compartidos || x.shares || 0,
                tiempoLectura: x.tiempo_lectura || 0,
                tags: x.tags || []
              }));
              setNoticias(mapped);
              setLoadError(null);
              setDemoMode(false);
              return;
            } catch (err2: any) {
              console.error('Fallback público también falló:', err2);
              setLoadError(err2?.message || 'Error cargando desde la BD');
              setDemoMode(true);
            }
          } else {
            setLoadError(msg || 'Error cargando desde la BD');
            setDemoMode(true);
          }
        }
      } else {
        setLoadError('No has iniciado sesión. Mostrando datos de demostración.');
        setDemoMode(true);
      }
      // Fallback: demo
      setNoticias(noticiasDemo);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
      setLoadError('Error inesperado. Mostrando datos de demostración.');
      setNoticias(noticiasDemo);
      setDemoMode(true);
    }
  };

  // History modal
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const fetchHistorial = async (noticiaId: number) => {
    setHistoryLoading(true);
    try {
      try {
        const data = await fetchJson(`/api/noticias/${noticiaId}/historial`);
        setHistoryItems(data);
        setHistoryOpen(true);
      } catch (err: any) {
        console.error('Error fetching historial', err);
        alert('Error al obtener historial: ' + (err?.message || err));
      }
    } catch (err) {
      console.error(err);
      alert('Error al obtener historial');
    } finally {
      setHistoryLoading(false);
    }
  };

  // calcularEstadisticas eliminado

  const eliminarNoticia = async (id: number) => {
    if (!window.confirm('¿Eliminar esta noticia?')) return;
    try {
      setNoticias(noticias.filter((n) => n.id !== id));
    } catch (error) {
      alert('Error al eliminar la noticia');
    }
  };

  useEffect(() => { obtenerNoticias(); }, []);

  const noticiasFiltradas = noticias.filter(noticia => {
    const coincideBusqueda = noticia.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      noticia.autor.toLowerCase().includes(busqueda.toLowerCase()) ||
      noticia.categoria.toLowerCase().includes(busqueda.toLowerCase());
    if (filtro === 'todas') return coincideBusqueda;
    if (filtro === 'publicadas') return coincideBusqueda && noticia.destacada;
    if (filtro === 'borradores') return coincideBusqueda && !noticia.destacada;
    return coincideBusqueda;
  });

  // Métricas eliminadas

  const logout = () => {
    localStorage.removeItem('auth_token');
    navigate(`${PANEL_BASE}/login`);
  };
  const role = getUserRole();
  const isAdmin = role === 'ADMIN';
  const canEdit = role === 'ADMIN' || role === 'EDITOR';
  const canDelete = role === 'EDITOR'; // ADMIN no elimina aquí

  useEffect(() => {
    if (isAdmin) setFiltro('todas');
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
      <header className="bg-gradient-to-r from-amber-100/90 via-stone-100/90 to-amber-100/90 backdrop-blur-md shadow-xl border-b-2 border-amber-200/60">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {isAdmin ? (
                <h1 className="font-otaku-title text-3xl font-bold text-stone-800">Corrección de Noticias Publicadas</h1>
              ) : (
                <h1 className="font-otaku-title text-4xl font-bold bg-gradient-to-r from-amber-700 via-stone-700 to-amber-700 bg-clip-text text-transparent">📜 Panel Editorial</h1>
              )}
            </div>
            <div className="flex items-center gap-4">
              {!isAdmin && (
                <Link to={`${PANEL_BASE}/mi-perfil`} className="flex items-center gap-2 bg-white/80 text-stone-700 px-4 py-3 rounded-xl hover:bg-white transition-all shadow-md font-otaku-elegant" title="Mi perfil">
                  <User size={20} /> Mi perfil
                </Link>
              )}
              {!isAdmin && canEdit && (
                <Link to={`${PANEL_BASE}/agregar`} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-stone-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-stone-600 transition-all shadow-lg font-otaku-elegant">
                  <Plus size={20} /> Nueva Noticia
                </Link>
              )}
              {/* Botón de estadísticas eliminado */}
              <button onClick={logout} className="p-3 bg-red-100 rounded-xl shadow-md hover:bg-red-200 transition-all text-red-600" title="Cerrar sesión">
                <LogOut size={20} />
              </button>
            </div>
              {/* Historial modal */}
              {historyOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-xl shadow-xl w-11/12 md:w-3/4 lg:w-2/3 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-otaku-title text-lg">Historial de cambios</h3>
                      <button onClick={() => setHistoryOpen(false)} className="text-stone-500 hover:text-stone-800">Cerrar</button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto space-y-3">
                      {historyLoading && <div>Cargando historial...</div>}
                      {!historyLoading && historyItems.length === 0 && <div className="text-stone-500">No hay historial para esta noticia.</div>}
                      {!historyLoading && historyItems.map((h, idx) => (
                        <div key={idx} className="border p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-stone-600">{h.usuario_nombre || ('Usuario ' + (h.usuario_id || 'anon'))}</div>
                            <div className="text-xs text-stone-400">{new Date(h.created_at).toLocaleString()}</div>
                          </div>
                          <div className="text-sm font-semibold mb-1">Acción: {h.accion}</div>
                          <div className="text-xs text-stone-700">{h.cambios?.before?.titulo ? (<><div className="text-xs text-stone-500">Antes: {h.cambios.before.titulo}</div></>) : null}
                          {h.cambios?.after?.titulo ? (<div className="text-xs text-stone-600">Después: {h.cambios.after.titulo}</div>) : null}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Breadcrumb eliminado por requerimiento */}
        <div className="mb-8">
          {isAdmin ? (
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-green-100 text-green-800 font-otaku-elegant">Viendo: Todas</span>
              <span className="text-stone-500 text-sm">Como administrador puedes corregir cualquier artículo.</span>
            </div>
          ) : (
            <div className="flex items-center gap-8 border-b border-amber-200/60">
              {[
                { id: 'todas', label: 'Todas las Noticias', icon: FileText },
                { id: 'publicadas', label: 'Publicadas', icon: Eye },
                { id: 'borradores', label: 'Borradores', icon: Edit }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setFiltro(tab.id)} className={`flex items-center gap-2 px-6 py-4 font-otaku-elegant font-medium transition-all border-b-2 ${filtro === tab.id ? 'border-amber-500 text-amber-700 bg-amber-50/50' : 'border-transparent text-stone-600 hover:text-amber-600 hover:border-amber-200'}`}>
                    <Icon size={18} /> {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {loadError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <div className="font-semibold mb-1">No se pudieron cargar noticias desde la BD</div>
            <div className="text-sm">{loadError}</div>
          </div>
        )}
        <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200/60">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
              <input type="text" placeholder="Buscar por título, autor o categoría..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-otaku-body bg-white/80" />
            </div>
            {!isAdmin && (
              <button className="flex items-center gap-2 px-6 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors font-otaku-elegant text-stone-700">
                <Filter size={18} /> Filtros Avanzados
              </button>
            )}
          </div>
        </div>
        {/* Métricas eliminadas */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200/60 overflow-hidden">
          <div className="p-6 border-b border-amber-200/60">
            <h3 className="font-otaku-title text-xl font-bold text-stone-800">📑 Gestión de Artículos</h3>
            {demoMode && (
              <p className="text-xs text-stone-500 mt-1">Modo demostración activo: inicia sesión con un usuario ADMIN/EDITOR para ver y editar noticias reales.</p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-50 to-stone-50 border-b border-amber-200/60">
                <tr>
                  <th className="text-left py-4 px-6 font-otaku-elegant font-semibold text-stone-700">Artículo</th>
                  <th className="text-left py-4 px-6 font-otaku-elegant font-semibold text-stone-700">Métricas</th>
                  <th className="text-left py-4 px-6 font-otaku-elegant font-semibold text-stone-700">Estado</th>
                  <th className="text-left py-4 px-6 font-otaku-elegant font-semibold text-stone-700">Equipo</th>
                  <th className="text-left py-4 px-6 font-otaku-elegant font-semibold text-stone-700">Fecha</th>
                  <th className="text-left py-4 px-6 font-otaku-elegant font-semibold text-stone-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {noticiasFiltradas.map((n) => (
                  <tr key={n.id} className="border-b border-stone-200/60 hover:bg-amber-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img src={n.imagen} alt="" className="w-16 h-16 rounded-xl object-cover shadow-md border-2 border-amber-200/60" />
                        <img src={n.imagen?.startsWith('http') ? n.imagen : `${API_BASE}${n.imagen}`} alt="" className="w-16 h-16 rounded-xl object-cover shadow-md border-2 border-amber-200/60" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-otaku-elegant font-semibold text-stone-800 mb-1 line-clamp-1">{n.titulo}</h4>
                          <p className="font-otaku-body text-sm text-stone-600 line-clamp-1 mb-2">{n.resumen}</p>
                          <div className="flex flex-wrap gap-1">{n.tags.slice(0, 2).map(tag => (<span key={tag} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-otaku-classic">#{tag}</span>))}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm"><Eye size={14} className="text-blue-500" /><span className="font-otaku-body text-stone-600">{n.vistas.toLocaleString()}</span></div>
                        <div className="flex items-center gap-2 text-sm"><Heart size={14} className="text-pink-500" /><span className="font-otaku-body text-stone-600">{n.likes}</span></div>
                        <div className="flex items-center gap-2 text-sm"><MessageCircle size={14} className="text-purple-500" /><span className="font-otaku-body text-stone-600">{n.comentarios}</span></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        {n.destacada ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-otaku-classic font-semibold"><Zap size={12} /> Publicado</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-otaku-classic font-semibold"><Edit size={12} /> Borrador</span>
                        )}
                        <div className="text-xs text-stone-500 font-otaku-body"><span className="inline-flex items-center gap-1"><Clock size={10} />{n.tiempoLectura} min lectura</span></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="font-otaku-elegant font-semibold text-stone-800 text-sm">{n.autor}</p>
                        <p className="font-otaku-body text-xs text-stone-600">Publicado por: <span className="font-semibold">{n.editor}</span></p>
                        {n.redactor && (<p className="font-otaku-body text-xs text-stone-500">Redactor: {n.redactor}</p>)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-otaku-body text-sm text-stone-600">{new Date(n.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      <div className="font-otaku-body text-xs text-stone-500">a las {new Date(n.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button onClick={() => fetchHistorial(n.id)} title="Ver historial" className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors"><History size={16} /></button>
                        {canEdit && (
                          <Link to={`${PANEL_BASE}/editar/${n.id}`} className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors" title="Editar"><Pencil size={16} /></Link>
                        )}
                        <Link to={`/noticia/${n.slug ?? n.id}`} className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors" title="Ver"><Eye size={16} /></Link>
                        {canDelete && (
                          <button onClick={() => eliminarNoticia(n.id)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors" title="Eliminar"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {noticiasFiltradas.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-stone-500"><div className="flex flex-col items-center gap-4"><FileText size={48} className="text-stone-300" /><p className="font-otaku-elegant text-lg">No se encontraron noticias</p><p className="font-otaku-body text-sm">Intenta ajustar los filtros o crear una nueva noticia</p></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelAdministrador;
