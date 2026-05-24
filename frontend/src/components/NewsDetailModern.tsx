import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, User, Eye, Share2,
  Calendar, TrendingUp,
  Check, MessageSquare,
  Star, Globe, ChevronLeft
} from 'lucide-react';

import type { Noticia as NoticiaTipo } from '../types/Noticia';
import DOMPurify from 'dompurify';
import { fetchJson, API_BASE } from '../lib/api';
import { truncateWords } from '../lib/text';

// Dominios permitidos para iframes embebidos
const ALLOWED_EMBED_ORIGINS = new Set([
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://player.vimeo.com',
  'https://open.spotify.com',
  'https://w.soundcloud.com',
]);

function isSafeEmbedUrl(url: string): boolean {
  try {
    return ALLOWED_EMBED_ORIGINS.has(new URL(url).origin);
  } catch {
    return false;
  }
}

function resolveOembedToIframe(html: string): string {
  return html.replace(
    /<figure[^>]*class="[^"]*media[^"]*"[^>]*>\s*<oembed\s+url="([^"]+)"\s*><\/oembed>\s*<\/figure>/gi,
    (_match, url: string) => {
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
        return `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`;
      }
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        return `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0"><iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe></div>`;
      }
      // URL no reconocida: eliminar el bloque para evitar iframes arbitrarios
      return '';
    }
  );
}

// Hook de DOMPurify: restringe src de iframes a dominios conocidos
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'IFRAME') {
    const src = node.getAttribute('src') || '';
    if (!isSafeEmbedUrl(src)) {
      node.removeAttribute('src');
    }
  }
});

function generateSlug(titulo: string): string {
  return titulo
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
}

// ── Carrusel de artículos relacionados ─────────────────────────────────────
function RelacionadasCarrusel({ noticias, navigate }: { noticias: NoticiaTipo[]; navigate: ReturnType<typeof useNavigate> }) {
  const [slide, setSlide] = useState(0);
  const [cardW, setCardW] = useState(0);
  const [perView, setPerView] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);

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
  const prev = () => setSlide((s: number) => (s <= 0 ? maxSlide : s - 1));
  const next = () => setSlide((s: number) => (s >= maxSlide ? 0 : s + 1));

  const resolveImg = (n: NoticiaTipo) =>
    n.imagen?.startsWith('http') ? n.imagen : n.imagen ? `${API_BASE}${n.imagen}` : '/logo.jpg';

  if (noticias.length === 0) {
    return (
      <p className="text-center text-stone-400 py-8 text-sm">
        No hay artículos relacionados disponibles.
      </p>
    );
  }

  return (
    <div>
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${slide * cardW}px)` }}
        >
          {noticias.map((rel) => (
            <div
              key={rel.id}
              onClick={() => navigate(`/noticia/${rel.slug || generateSlug(rel.titulo)}`)}
              className="flex-none w-full sm:w-1/2 lg:w-1/3 px-3 cursor-pointer group"
            >
              <article className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-stone-100 hover:border-amber-200 transform hover:scale-[1.02] h-full flex flex-col">
                <div className="relative h-52 overflow-hidden flex-shrink-0">
                  <img
                    src={resolveImg(rel)}
                    alt={rel.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {rel.categoria && (
                    <span className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {rel.categoria}
                    </span>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-base font-['Cinzel'] line-clamp-2 group-hover:text-amber-200 transition-colors">
                      {rel.titulo}
                    </h3>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-stone-600 text-sm leading-relaxed font-['Cormorant_Garamond'] line-clamp-2 mb-4 flex-1">
                    {truncateWords(rel.resumen, 30)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(rel.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(rel.vistas ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Navegación */}
      {noticias.length > perView && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-amber-100 border border-stone-200 hover:border-amber-300 flex items-center justify-center text-stone-600 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: maxSlide + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slide ? 'w-6 h-2 bg-amber-500' : 'w-2 h-2 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-amber-100 border border-stone-200 hover:border-amber-300 flex items-center justify-center text-stone-600 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────
export default function NewsDetailModern() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [noticia, setNoticia] = useState<NoticiaTipo | null>(null);
  const [relacionadas, setRelacionadas] = useState<NoticiaTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch (_) {}
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (!slug) throw new Error('Slug inválido');
        let detalle: NoticiaTipo | null = null;
        try {
          detalle = await fetchJson<NoticiaTipo>(`/api/noticias/slug/${encodeURIComponent(slug)}`);
        } catch {
          try {
            const lista = await fetchJson<NoticiaTipo[]>(`/api/noticias/?limite=200`);
            const match = (lista || []).find(n => (n.slug && n.slug === slug) || generateSlug(n.titulo) === slug);
            if (match) {
              detalle = match;
              const canonical = match.slug || generateSlug(match.titulo);
              if (canonical && canonical !== slug) navigate(`/noticia/${canonical}` as any, { replace: true });
            }
          } catch {}
        }
        if (!mounted) return;
        if (!detalle) throw new Error('Artículo no encontrado');
        setNoticia(detalle);
        const cat = detalle?.categoria;
        if (cat) {
          const rel = await fetchJson<NoticiaTipo[]>(`/api/noticias/?categoria=${encodeURIComponent(cat)}&limite=10`);
          if (mounted) setRelacionadas((rel || []).filter(n => n.slug !== detalle!.slug && String(n.id) !== String(detalle!.id)).slice(0, 9));
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Error cargando noticia';
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  // Registrar vista tras 40 segundos de permanencia real en la página
  useEffect(() => {
    if (!noticia?.id) return;
    const timer = setTimeout(() => {
      fetch(`/api/noticias/${noticia.id}/vista`, { method: 'POST' }).catch(() => {});
    }, 40_000);
    return () => clearTimeout(timer);
  }, [noticia?.id]);

  // Artículos del mismo autor (desplegable)
  const [articulosAutor, setArticulosAutor] = useState<{ id: number; titulo: string; slug?: string }[]>([]);
  const [mostrarArticulos, setMostrarArticulos] = useState(false);
  const [cargandoArticulos, setCargandoArticulos] = useState(false);

  const toggleArticulosAutor = async () => {
    if (mostrarArticulos) { setMostrarArticulos(false); return; }
    if (articulosAutor.length > 0) { setMostrarArticulos(true); return; }
    const autorId = noticia?.autor_id;
    if (!autorId) return;
    setCargandoArticulos(true);
    try {
      const data = await fetchJson<{ id: number; titulo: string; slug?: string }[]>(`/api/noticias/?autor_id=${autorId}&limite=20`);
      setArticulosAutor((data || []).filter(a => a.slug !== noticia?.slug && String(a.id) !== String(noticia?.id)));
      setMostrarArticulos(true);
    } catch {}
    finally { setCargandoArticulos(false); }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareTitle = noticia?.titulo || 'Compartir noticia';
    const text = noticia?.resumen || 'Mira esta noticia';
    try {
      if (navigator.share) { await navigator.share({ title: shareTitle, text, url: currentUrl }); return; }
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const redesOrden = ['twitter', 'x', 'facebook', 'instagram', 'linkedin', 'youtube', 'twitch', 'web', 'site', 'pagina'];
  const ordenarRedes = (obj: Record<string, string>) => {
    const entries = Object.entries(obj).filter(([, v]) => !!v);
    entries.sort((a, b) => redesOrden.indexOf(a[0].toLowerCase()) - redesOrden.indexOf(b[0].toLowerCase()));
    return entries;
  };
  const normalizeUrl = (url: string) =>
    /^https?:\/\//i.test(url) ? url : `https://${url}`;

  // SEO / OG
  const siteName = 'Radio Conexión Latam';
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const img = noticia?.imagen
    ? (noticia.imagen.startsWith('http') ? noticia.imagen : `${API_BASE}${noticia.imagen}`)
    : '/logo.jpg';
  const title = noticia?.titulo || '';
  const description = noticia?.resumen || (noticia?.contenido ?? '').replace(/<[^>]+>/g, '').slice(0, 160) || '';
  const publishedTime = noticia?.fecha ? new Date(noticia.fecha).toISOString() : new Date().toISOString();
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title || 'Noticia',
    image: [img],
    datePublished: publishedTime,
    author: noticia?.autor_info?.nombre ? { '@type': 'Person', name: noticia.autor_info.nombre } : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: { '@type': 'ImageObject', url: '/logo.jpg' }
    },
    description,
    mainEntityOfPage: url
  }), [title, img, publishedTime, url, description, noticia?.autor_info?.nombre]);

  // Foto del autor
  const autorAvatar = noticia?.autor_info?.avatar
    ? (noticia.autor_info.avatar.startsWith('http')
        ? noticia.autor_info.avatar
        : `${API_BASE}${noticia.autor_info.avatar}`)
    : '/logo.jpg';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-stone-600">Cargando artículo…</div>
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-12 h-12 text-stone-400" />
          </div>
          <h2 className="text-3xl font-bold text-stone-800 mb-4">Artículo no encontrado</h2>
          <p className="text-stone-600 mb-6">{error || 'Lo sentimos, no pudimos encontrar el artículo que buscas.'}</p>
          <button
            onClick={() => navigate('/noticias')}
            className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition-colors duration-300"
          >
            Ver todas las noticias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Helmet>
        <title>{`${title} | ${siteName}`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${title} | ${siteName}`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={img} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="es_LA" />
        <meta property="article:published_time" content={publishedTime} />
        {noticia.categoria && <meta property="article:section" content={noticia.categoria} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | ${siteName}`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={img} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative min-h-screen overflow-visible pt-24 md:pt-28">
        <div className="absolute inset-0">
          <img
            src={noticia.imagen?.startsWith('http') ? noticia.imagen : `${API_BASE}${noticia.imagen}`}
            alt={noticia.titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/60" />
        </div>

        {/* Botón volver — top-left fijo dentro del hero */}
        <div className="absolute top-6 left-4 sm:left-8 z-30">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:bg-black/60 border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm">Volver</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 pb-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                {noticia.categoria}
              </span>
              {noticia.destacada && (
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4" /> DESTACADO
                </span>
              )}
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> TRENDING
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 font-['Cinzel'] leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
              {noticia.titulo}
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 font-['Cormorant_Garamond'] leading-relaxed max-w-4xl">
              {truncateWords(noticia.resumen, 50)}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-white/80 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{new Date(noticia.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span className="font-medium">{(noticia.vistas ?? 0).toLocaleString()} vistas</span>
              </div>
            </div>

            {/* Autor en hero */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-400/60">
                <img src={autorAvatar} alt={noticia.autor_info?.nombre || 'Autor'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base sm:text-lg truncate">{noticia.autor_info?.nombre || 'Redacción'}</p>
                {noticia.programa && <p className="text-white/80 text-sm truncate">{noticia.programa}</p>}
                {noticia.autor_info?.descripcion && (
                  <p className="text-white/60 text-xs line-clamp-1">{noticia.autor_info.descripcion}</p>
                )}
              </div>
            </div>

            {noticia.autor_info?.redes_sociales && Object.keys(noticia.autor_info.redes_sociales).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {ordenarRedes(noticia.autor_info.redes_sociales).map(([platform, platformUrl]) => (
                  <a
                    key={platform}
                    href={normalizeUrl(platformUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

      </section>

      {/* Botón flotante compartir */}
      <div className="fixed right-4 bottom-6 md:right-8 md:bottom-8 z-50">
        <button
          onClick={handleShare}
          title="Compartir"
          className="flex items-center justify-center rounded-full p-4 md:p-5 shadow-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-transform hover:scale-105"
        >
          <Share2 className="w-6 h-6" />
        </button>
        {copied && (
          <div className="mt-2 text-xs bg-black/80 text-white px-3 py-1 rounded-full shadow-lg text-center">
            <span className="inline-flex items-center gap-1">
              <Check className="w-3 h-3 text-green-400" /> Enlace copiado
            </span>
          </div>
        )}
      </div>

      {/* Contenido del artículo */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <style>{`
            .noticia-contenido img { max-width: 100%; height: auto; max-height: 480px; object-fit: contain; border-radius: 0.5rem; margin: 1rem auto; display: block; }
            .noticia-contenido figure { margin: 1.5rem 0; text-align: center; }
            .noticia-contenido figure figcaption { font-size: 0.85rem; color: #78716c; margin-top: 0.5rem; }
            .noticia-contenido .video-embed { max-width: 720px; margin-left: auto; margin-right: auto; }
          `}</style>
          <div className="prose prose-lg max-w-none">
            <div
              className="noticia-contenido text-stone-700 leading-relaxed font-['Cormorant_Garamond'] text-lg space-y-6"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(resolveOembedToIframe(noticia.contenido || ''), {
                  ADD_TAGS: ['iframe'],
                  ADD_ATTR: ['allowfullscreen', 'allow', 'frameborder', 'scrolling', 'src'],
                  FORCE_BODY: true,
                })
              }}
            />
          </div>

          {noticia.destacado && (
            <div className="my-12 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-8 rounded-r-2xl">
              <blockquote className="text-xl italic text-stone-700 font-['Cormorant_Garamond'] leading-relaxed">
                "{noticia.destacado}"
              </blockquote>
              <cite className="block mt-4 text-amber-700 font-semibold">— Del artículo</cite>
            </div>
          )}
        </div>
      </section>

      {/* Sección del autor */}
      {noticia.autor_info && (
        <section className="py-16 bg-gradient-to-br from-stone-50 via-amber-50/40 to-orange-50/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl border border-amber-100/60 overflow-hidden">
              {/* Banner superior */}
              <div className="h-20 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

              <div className="px-6 sm:px-8 pb-8">
                {/* Avatar + nombre */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
                    <img src={autorAvatar} alt={noticia.autor_info.nombre || 'Autor'} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center sm:text-left pb-1">
                    <h3 className="text-2xl font-bold text-stone-800 font-['Cinzel']">
                      {noticia.autor_info.nombre || 'Redacción'}
                    </h3>
                    {noticia.autor_info.titulo && (
                      <p className="text-amber-600 font-medium text-sm">{noticia.autor_info.titulo}</p>
                    )}
                    {noticia.programa && (
                      <p className="text-stone-500 text-xs mt-0.5">Programa: {noticia.programa}</p>
                    )}
                  </div>

                  {/* Métrica artículos */}
                  {(noticia.autor_info.articulos_total ?? 0) > 0 && (
                    <div className="sm:ml-auto flex-shrink-0 text-center bg-amber-50 rounded-xl px-4 py-2 border border-amber-100">
                      <p className="text-2xl font-bold text-amber-700 font-['Cinzel']">{noticia.autor_info.articulos_total}</p>
                      <p className="text-[10px] font-semibold text-amber-600 tracking-widest uppercase">artículos</p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {noticia.autor_info.descripcion && (
                  <p className="text-stone-600 leading-relaxed font-['Cormorant_Garamond'] text-lg mb-6">
                    {noticia.autor_info.descripcion}
                  </p>
                )}

                {/* Redes */}
                {noticia.autor_info.redes_sociales && Object.keys(noticia.autor_info.redes_sociales).length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      Presencia digital
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ordenarRedes(noticia.autor_info.redes_sociales).map(([platform, platformUrl]) => {
                        const styles: Record<string, string> = {
                          twitter: 'bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100',
                          facebook: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
                          instagram: 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100',
                          linkedin: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100',
                          youtube: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',
                          twitch: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100',
                          web: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',
                        };
                        const icons: Record<string, string> = {
                          twitter: '𝕏', facebook: 'f', instagram: '◎', linkedin: 'in',
                          youtube: '▶', twitch: '✦',
                        };
                        return (
                          <a
                            key={platform}
                            href={platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${styles[platform.toLowerCase()] || 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'}`}
                          >
                            {platform.toLowerCase() === 'web' ? <Globe className="w-4 h-4" /> : (
                              <span className="font-bold">{icons[platform.toLowerCase()] || platform[0].toUpperCase()}</span>
                            )}
                            <span className="capitalize">{platform}</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Más artículos del autor */}
                <div>
                  <button
                    onClick={toggleArticulosAutor}
                    className="px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold hover:bg-amber-100 transition-all text-sm flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {cargandoArticulos ? 'Cargando…' : `Más artículos de ${(noticia.autor_info.nombre || 'este autor').split(' ')[0]}`}
                    <span className="text-xs">{mostrarArticulos ? '▲' : '▼'}</span>
                  </button>
                  {mostrarArticulos && (
                    <div className="mt-3 bg-stone-50 border border-stone-100 rounded-xl overflow-hidden">
                      {articulosAutor.length === 0 ? (
                        <p className="text-sm text-stone-500 p-4">No hay más artículos de este autor.</p>
                      ) : (
                        <ul className="divide-y divide-stone-100">
                          {articulosAutor.map(a => (
                            <li key={a.id}>
                              <a
                                href={`/noticia/${a.slug ?? a.id}`}
                                className="block px-4 py-3 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors line-clamp-2"
                              >
                                {a.titulo}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Artículos relacionados — carrusel */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-stone-800 font-['Cinzel'] mb-4">Artículos Relacionados</h2>
            <p className="text-stone-600 font-['Cormorant_Garamond'] text-lg">
              Continúa explorando nuestro archivo de análisis profundos
            </p>
          </div>
          <RelacionadasCarrusel noticias={relacionadas} navigate={navigate} />
        </div>
      </section>
    </div>
  );
}
