import { Calendar, User, Eye, ExternalLink, MessageCircle, Share2, Heart, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson, API_BASE } from '../lib/api';
import type { Noticia as NoticiaTipo } from '../types/Noticia';

export default function News() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [news, setNews] = useState<NoticiaTipo[]>([]);

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

  const featuredNews = useMemo(() => {
    if (!news || news.length === 0) return [] as NoticiaTipo[];
    const poolSize = Math.min(30, news.length);
    const pool = news.slice(0, poolSize);
    const k = Math.min(6, pool.length);
    for (let i = poolSize - 1; i > Math.max(poolSize - k - 1, 0); i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, k);
  }, [news]);

  const handleNewsClick = (n: NoticiaTipo) => {
    const slugFinal = n.slug || generateSlug(n.titulo);
    navigate(`/noticia/${slugFinal}`);
  };

  const openAllNewsPage = () => navigate('/noticias');

  return (
    <section id="noticias" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-300 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-800 via-orange-600 to-red-600 bg-clip-text text-transparent mb-6">Últimas Noticias</h2>
        </div>

        <div className="flex justify-center mb-12">
          <button
            onClick={openAllNewsPage}
            className="group relative bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              <span>Ver Todas las Noticias</span>
              <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
          </button>
        </div>

        {loading && <div className="text-center text-stone-600">Cargando noticias…</div>}
        {error && !loading && <div className="text-center text-red-600">{error}</div>}

        {!loading && !error && featuredNews.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Izquierda: dos grandes apiladas */}
            <div className="lg:col-span-8 space-y-6">
              {/* Hero */}
              <div
                onClick={() => handleNewsClick(featuredNews[0])}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duración-500 cursor-pointer transform hover:scale-[1.02] border border-amber-100"
              >
                <div className="relative h-72 lg:h-[320px] overflow-hidden">
                  <img
                    src={featuredNews[0].imagen?.startsWith('http') ? featuredNews[0].imagen : `${API_BASE}${featuredNews[0].imagen}`}
                    alt={featuredNews[0].titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider shadow-lg">
                      {featuredNews[0].categoria}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-white/90 text-sm"><Calendar className="w-4 h-4" /><span>{new Date(featuredNews[0].fecha).toLocaleDateString('es-ES')}</span></div>
                      <div className="flex items-center gap-2 text-white/90 text-sm"><Clock className="w-4 h-4" /><span>{featuredNews[0].tiempo_lectura ?? 0} min</span></div>
                      <div className="flex items-center gap-2 text-white/90 text-sm"><Eye className="w-4 h-4" /><span>{featuredNews[0].vistas.toLocaleString()}</span></div>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-amber-200 transition-colors duration-300">{featuredNews[0].titulo}</h3>
                    <p className="text-white/90 text-lg leading-relaxed line-clamp-3 mb-4">{featuredNews[0].resumen}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
                        <div>
                          <p className="text-white font-semibold text-sm">{featuredNews[0].autor_info?.nombre || 'Autor'}</p>
                          <p className="text-white/70 text-xs">{featuredNews[0].programa || featuredNews[0].categoria}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-1"><Heart className="w-4 h-4" /><span className="text-sm">{featuredNews[0].likes}</span></div>
                        <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /><span className="text-sm">{featuredNews[0].comentarios}</span></div>
                        <div className="flex items-center gap-1"><Share2 className="w-4 h-4" /><span className="text-sm">{featuredNews[0].compartidos}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segunda grande */}
              {featuredNews.length > 1 && (
                <div
                  onClick={() => handleNewsClick(featuredNews[1])}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duración-500 cursor-pointer transform hover:scale-[1.02] border border-amber-100"
                >
                  <div className="relative h-72 lg:h-[320px] overflow-hidden">
                    <img
                      src={featuredNews[1].imagen?.startsWith('http') ? featuredNews[1].imagen : `${API_BASE}${featuredNews[1].imagen}`}
                      alt={featuredNews[1].titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute top-6 left-6"><span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider shadow-lg">{featuredNews[1].categoria}</span></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-4 mb-4 text-white/90 text-sm">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(featuredNews[1].fecha).toLocaleDateString('es-ES')}</span>
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{featuredNews[1].tiempo_lectura ?? 0} min</span>
                        <span className="flex items-center gap-2"><Eye className="w-4 h-4" />{featuredNews[1].vistas.toLocaleString()}</span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-amber-200 transition-colors duration-300">{featuredNews[1].titulo}</h3>
                      <p className="text-white/90 text-base leading-relaxed line-clamp-2 mb-3">{featuredNews[1].resumen}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
                        <span className="text-white text-sm">{featuredNews[1].autor_info?.nombre || 'Autor'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Derecha: 4 pequeñas en 2x2 */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredNews.slice(2, 6).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNewsClick(n)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow- xl transition-all duration-300 cursor-pointer border border-stone-100 hover:border-amber-200 flex flex-col"
                >
                  <div className="relative h-36 overflow-hidden flex-shrink-0">
                    <img src={n.imagen?.startsWith('http') ? n.imagen : `${API_BASE}${n.imagen}`} alt={n.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-3 left-3"><span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">{n.categoria}</span></div>
                    <div className="absolute top-3 right-3"><span className="bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" />{n.tiempo_lectura ?? 0}m</span></div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-2 text-xs text-stone-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(n.fecha).toLocaleDateString('es-ES')}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{n.vistas.toLocaleString()}</span>
                    </div>
                    <h4 className="font-bold text-md text-stone-800 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300">{n.titulo}</h4>
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-3 flex-1">{n.resumen}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2"><div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"><User className="w-3 h-3 text-white" /></div><span className="text-xs text-stone-600 font-medium">{n.autor_info?.nombre || 'Autor'}</span></div>
                      <div className="flex items-center gap-3 text-stone-400 text-xs"><span className="flex items-center gap-1"><Heart className="w-3 h-3" />{n.likes}</span><span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{n.comentarios}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
