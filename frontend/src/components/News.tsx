import { Calendar, User, Eye, ExternalLink, MessageCircle, Share2, Heart, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson, API_BASE } from '../lib/api';
import { truncateWords } from '../lib/text';
import type { Noticia as NoticiaTipo } from '../types/Noticia';

export default function News() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [news, setNews] = useState<NoticiaTipo[]>([]);
  const [showFab, setShowFab] = useState(false);

  const generateSlug = (titulo: string) =>
    titulo
      .toLowerCase()
      .replace(/[áäàâã]/g, 'a')
      .replace(/[éëèê]/g, 'e')
      .replace(/[íïìî]/g, 'i')
      .replace(/[óöòôõ]/g, 'o')
      .replace(/[úüùû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchJson<NoticiaTipo[]>('/api/noticias/?limite=60');
        if (!mounted) return;
        setNews(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message || 'Error cargando noticias');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Filtrar noticias de anime recientes
  const animeNews = useMemo(() => {
    if (!news || news.length === 0) return [] as NoticiaTipo[];
    const filtradas = news.filter(n => {
      const categoria = n.categoria?.toLowerCase() || '';
      const titulo = n.titulo.toLowerCase();
      const resumen = n.resumen.toLowerCase();
      const tags = (n.tags || []).map(t => t.toLowerCase());
      return categoria.includes('anime') || titulo.includes('anime') || resumen.includes('anime') || tags.some(t => t.includes('anime'));
    });
    return filtradas
      .sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10);
  }, [news]);

  const handleNewsClick = (n: NoticiaTipo) => {
    const slugFinal = n.slug || generateSlug(n.titulo);
    navigate(`/noticia/${slugFinal}`);
  };

  const openAllNewsPage = () => navigate('/noticias');

  return (
    <section id="noticias" className="py-20 bg-gradient-to-br from-indigo-950 via-slate-900 to-fuchsia-900 relative overflow-hidden scroll-mt-24 md:scroll-mt-28">
      <div className="absolute inset-0 opacity-[0.15]">
        <div className="absolute -top-10 left-1/4 w-72 h-72 bg-cyan-600/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-fuchsia-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-5">
            <span className="text-xs font-semibold tracking-wider text-cyan-300">ANIME</span>
            <span className="text-[10px] text-white/40">Recientes</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent mb-3">Noticias de Anime Recientes</h2>
          <p className="text-white/60 max-w-2xl mx-auto text-sm md:text-base">Estrenos, anuncios de temporadas, estudios y eventos clave de la industria anime.</p>
        </div>

        {/* Botón circular creativo (FAB) con silueta anime dentro del contenedor */}
        <div className="relative z-20">
          <div className="flex justify-end">
            <div className="relative">
              {!showFab && (
                <div className="absolute -left-24 md:-left-28 top-1/2 -translate-y-1/2 pointer-events-none select-none">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-[12px] border border-white/10 backdrop-blur-sm">abre aquí</span>
                </div>
              )}
              <button
                type="button"
                aria-label={showFab ? 'Cerrar panel de anime' : 'Abrir panel de anime'}
                aria-expanded={showFab}
                aria-controls="anime-fab-panel"
                onClick={() => setShowFab(v => !v)}
                className="relative w-16 h-16 md:w-18 md:h-18 rounded-full overflow-hidden grid place-items-center bg-gradient-to-br from-blue-600 to-fuchsia-700 text-white shadow-2xl shadow-fuchsia-700/30 border border-white/10 ring-2 ring-white/10 hover:ring-white/20 transition transform hover:scale-105"
              >
                <span className={`absolute inset-0 rounded-full bg-fuchsia-500/20 blur-md ${showFab ? 'opacity-60' : 'opacity-40'} animate-pulse`} aria-hidden></span>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="relative text-white drop-shadow">
                  <path d="M12 3c-2 0-3.8 1.2-4.5 3C5.2 6.4 4 7.9 4 9.7c0 1.9 1.4 3.5 3.2 3.8C7.9 17 9.7 19 12 19s4.1-2 4.8-5.5c1.8-.3 3.2-2 3.2-3.8 0-1.8-1.2-3.3-3.5-3.7-.7-1.8-2.5-3-4.5-3Z" />
                  <path d="M9 22c1 .6 2 .9 3 .9s2-.3 3-.9" />
                </svg>
              </button>
              {showFab && (
                <div className="absolute bottom-[110%] right-0">
                  <div id="anime-fab-panel" role="dialog" aria-modal="false" className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md p-3 w-64">
                    <div className="px-1 pb-2">
                      <p className="text-[11px] text-white/60">Explora más contenido de anime</p>
                    </div>
                    <button
                      onClick={openAllNewsPage}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white text-sm font-semibold shadow-lg hover:shadow-fuchsia-500/30 transition group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-6 h-6 rounded-full bg-white/10 grid place-items-center">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                        Ver todas las noticias
                      </span>
                      <span className="text-white/80 group-hover:translate-x-0.5 transition">→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading && <div className="text-center text-cyan-300">Cargando noticias…</div>}
        {error && !loading && <div className="text-center text-red-400">{error}</div>}

        {!loading && !error && animeNews.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div
                onClick={() => handleNewsClick(animeNews[0])}
                className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] border border-blue-900/40"
              >
                <div className="relative h-72 lg:h-[320px] overflow-hidden">
                  <img
                    src={animeNews[0].imagen?.startsWith('http') ? animeNews[0].imagen : `${API_BASE}${animeNews[0].imagen}`}
                    alt={animeNews[0].titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg">
                      {animeNews[0].categoria}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-white/90 text-xs md:text-sm"><Calendar className="w-4 h-4" /><span>{new Date(animeNews[0].fecha).toLocaleDateString('es-ES')}</span></div>
                      <div className="flex items-center gap-2 text-white/90 text-xs md:text-sm"><Clock className="w-4 h-4" /><span>{animeNews[0].tiempo_lectura ?? 0} min</span></div>
                      <div className="flex items-center gap-2 text-white/90 text-xs md:text-sm"><Eye className="w-4 h-4" /><span>{animeNews[0].vistas.toLocaleString()}</span></div>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-cyan-200 transition-colors duration-300">{animeNews[0].titulo}</h3>
                    <p className="text-white/90 text-sm md:text-base leading-relaxed line-clamp-3 mb-4">{truncateWords(animeNews[0].resumen, 50)}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-fuchsia-600 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
                        <div>
                          <p className="text-white font-semibold text-xs md:text-sm">{animeNews[0].autor_info?.nombre || 'Autor'}</p>
                          <p className="text-white/70 text-[11px] md:text-xs">{animeNews[0].programa || animeNews[0].categoria}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-1"><Heart className="w-4 h-4" /><span className="text-xs md:text-sm">{animeNews[0].likes}</span></div>
                        <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /><span className="text-xs md:text-sm">{animeNews[0].comentarios}</span></div>
                        <div className="flex items-center gap-1"><Share2 className="w-4 h-4" /><span className="text-xs md:text-sm">{animeNews[0].compartidos}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {animeNews.length > 1 && (
                <div
                  onClick={() => handleNewsClick(animeNews[1])}
                  className="group relative bg-slate-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] border border-blue-900/40"
                >
                  <div className="relative h-72 lg:h-[320px] overflow-hidden">
                    <img
                      src={animeNews[1].imagen?.startsWith('http') ? animeNews[1].imagen : `${API_BASE}${animeNews[1].imagen}`}
                      alt={animeNews[1].titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute top-6 left-6"><span className="bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg">{animeNews[1].categoria}</span></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-4 mb-4 text-white/90 text-xs md:text-sm">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(animeNews[1].fecha).toLocaleDateString('es-ES')}</span>
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{animeNews[1].tiempo_lectura ?? 0} min</span>
                        <span className="flex items-center gap-2"><Eye className="w-4 h-4" />{animeNews[1].vistas.toLocaleString()}</span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-200 transition-colors duración-300">{animeNews[1].titulo}</h3>
                      <p className="text-white/90 text-base leading-relaxed line-clamp-2 mb-3">{truncateWords(animeNews[1].resumen, 50)}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-fuchsia-600 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
                        <span className="text-white text-sm">{animeNews[1].autor_info?.nombre || 'Autor'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {animeNews.slice(2, 6).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNewsClick(n)}
                  className="group bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-blue-900/40 hover:border-cyan-500/40 flex flex-col"
                >
                  <div className="relative h-36 overflow-hidden flex-shrink-0">
                    <img src={n.imagen?.startsWith('http') ? n.imagen : `${API_BASE}${n.imagen}`} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute top-3 left-3"><span className="bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white px-3 py-1 rounded-full text-[10px] font-semibold uppercase">{n.categoria}</span></div>
                    <div className="absolute top-3 right-3"><span className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] flex items-center gap-1"><Clock className="w-3 h-3" />{n.tiempo_lectura ?? 0}m</span></div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-2 text-[11px] text-white/40">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(n.fecha).toLocaleDateString('es-ES')}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{n.vistas.toLocaleString()}</span>
                    </div>
                    <h4 className="font-bold text-md text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors duration-300">{n.titulo}</h4>
                    <p className="text-white/70 text-xs leading-relaxed line-clamp-3 mb-3 flex-1">{truncateWords(n.resumen, 50)}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2"><div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-fuchsia-600 rounded-full flex items-center justify-center"><User className="w-3 h-3 text-white" /></div><span className="text-[11px] text-white/70 font-medium">{n.autor_info?.nombre || 'Autor'}</span></div>
                      <div className="flex items-center gap-3 text-white/40 text-[10px]"><span className="flex items-center gap-1"><Heart className="w-3 h-3" />{n.likes}</span><span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{n.comentarios}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && !error && animeNews.length === 0 && (
          <div className="text-center text-white/50 text-sm">No hay noticias de anime disponibles.</div>
        )}
      </div>
    </section>
  );
}