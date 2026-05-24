import { Calendar, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJson, API_BASE } from '../lib/api';
import type { Noticia } from '../types/Noticia';
import NotaSidebar from './NotaSidebar';

const AUTOPLAY_MS = 5000;

export default function News() {
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(0);
  const [perView, setPerView] = useState(3);

  // Cargar las 9 noticias destacadas más recientes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchJson<Noticia[]>('/api/noticias/?destacada=true&limite=9');
        if (!mounted) return;
        const sorted = (Array.isArray(data) ? data : [])
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 9);
        setNoticias(sorted);
      } catch {}
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  // Medir el ancho real de una tarjeta y cuántas caben
  const measure = useCallback(() => {
    if (!trackRef.current) return;
    const card = trackRef.current.children[0] as HTMLElement | undefined;
    if (!card) return;
    setCardW(card.offsetWidth);
    const containerW = trackRef.current.parentElement?.offsetWidth ?? 0;
    const pv = containerW > 0 ? Math.round(containerW / card.offsetWidth) : 1;
    setPerView(Math.max(1, pv));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current?.parentElement) ro.observe(trackRef.current.parentElement);
    return () => ro.disconnect();
  }, [noticias, measure]);

  const maxSlide = Math.max(0, noticias.length - perView);

  const go = useCallback((idx: number) => {
    setSlide(Math.max(0, Math.min(idx, maxSlide)));
  }, [maxSlide]);

  const next = useCallback(() => go(slide >= maxSlide ? 0 : slide + 1), [slide, maxSlide, go]);
  const prev = useCallback(() => go(slide <= 0 ? maxSlide : slide - 1), [slide, maxSlide, go]);

  // Auto-play
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (noticias.length > perView) {
      timerRef.current = setInterval(next, AUTOPLAY_MS);
    }
  }, [next, noticias.length, perView]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleDot = (i: number) => { go(i); resetTimer(); };
  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };

  const handleClick = (n: Noticia) => {
    const slug = n.slug || n.titulo.toLowerCase()
      .replace(/[áäàâ]/g,'a').replace(/[éëèê]/g,'e').replace(/[íïìî]/g,'i')
      .replace(/[óöòô]/g,'o').replace(/[úüùû]/g,'u').replace(/ñ/g,'n')
      .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-');
    navigate(`/noticia/${slug}`);
  };

  const dots = Array.from({ length: maxSlide + 1 }, (_, i) => i);

  return (
    <section id="noticias" className="py-20 bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-700 relative overflow-hidden scroll-mt-24 md:scroll-mt-28">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -top-16 left-1/4 w-80 h-80 bg-cyan-400 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-fuchsia-400 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Columna carrusel (2/3) ── */}
        <div className="lg:col-span-2">

        {/* Encabezado */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-widest text-cyan-300 uppercase">Destacadas</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent leading-tight">
              Últimas Noticias<br className="hidden sm:block" /> Destacadas
            </h2>
          </div>

          {/* Flechas desktop */}
          <div className="hidden sm:flex items-center gap-2 mb-1">
            <button onClick={handlePrev} disabled={noticias.length === 0}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <button onClick={handleNext} disabled={noticias.length === 0}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition disabled:opacity-30">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carrusel */}
        {loading && (
          <div className="h-72 flex items-center justify-center text-cyan-300 text-sm animate-pulse">
            Cargando noticias destacadas…
          </div>
        )}

        {!loading && noticias.length === 0 && (
          <div className="h-48 flex items-center justify-center text-white/40 text-sm">
            No hay noticias destacadas disponibles.
          </div>
        )}

        {!loading && noticias.length > 0 && (
          <>
            <div className="overflow-hidden">
              <div
                ref={trackRef}
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${slide * cardW}px)` }}
              >
                {noticias.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className="flex-none w-full sm:w-1/2 lg:w-1/3 px-3 cursor-pointer group"
                  >
                    <div className="bg-slate-900/80 rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 h-full flex flex-col">
                      {/* Imagen */}
                      <div className="relative h-52 overflow-hidden flex-shrink-0">
                        <img
                          src={n.imagen?.startsWith('http') ? n.imagen : `${API_BASE}${n.imagen}`}
                          alt={n.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                        {/* Categoría */}
                        {n.categoria && (
                          <span className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                            {n.categoria}
                          </span>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 text-[11px] text-white/40 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(n.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <h3 className="text-white font-bold text-base leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors duration-200 mb-3 flex-1">
                          {n.titulo}
                        </h3>

                        <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-4">
                          {n.resumen || ''}
                        </p>

                        <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                          {n.autor_info?.avatar ? (
                            <img
                              src={n.autor_info.avatar.startsWith('http') ? n.autor_info.avatar : `${API_BASE}${n.autor_info.avatar}`}
                              alt={n.autor_info.nombre || ''}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0 border border-white/20"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
                              <User size={11} className="text-white" />
                            </div>
                          )}
                          <span className="text-[11px] text-white/60 truncate">{n.autor_info?.nombre || 'Redacción'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dots + flechas mobile */}
            <div className="flex items-center justify-center gap-4 mt-8">
              {/* Flecha izquierda solo mobile */}
              <button onClick={handlePrev}
                className="sm:hidden w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition">
                <ChevronLeft size={16} />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {dots.map(i => (
                  <button
                    key={i}
                    onClick={() => handleDot(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === slide
                        ? 'w-6 h-2 bg-cyan-400'
                        : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>

              {/* Flecha derecha solo mobile */}
              <button onClick={handleNext}
                className="sm:hidden w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
        </div>{/* fin col carrusel */}

        {/* ── Columna sidebar notas (1/3) ── */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <NotaSidebar />
          </div>
        </div>

        </div>{/* fin grid */}
      </div>
    </section>
  );
}
