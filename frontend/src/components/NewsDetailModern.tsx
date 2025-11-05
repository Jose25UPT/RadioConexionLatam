import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, Clock, User, Eye, Heart, MessageCircle, Share2, Bookmark, 
  Facebook, Twitter, Calendar, Tag, TrendingUp,
  ChevronRight, Home, Copy, Check, MessageSquare,
  UserCircle, Mail, Globe, Star
} from 'lucide-react';

import type { Noticia as NoticiaTipo } from '../types/Noticia';
import DOMPurify from 'dompurify';
import { fetchJson, API_BASE } from '../lib/api';

interface AutorPerfil {
  nombre: string;
  bio: string;
  avatar?: string;
  rolPrincipal?: string;
  redes: {
    plataforma: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'twitch' | 'web';
    url: string;
    seguidores?: number;
    verificado?: boolean;
  }[];
  metrics?: {
    articulos: number;
    seguidores: number;
    aniosExperiencia: number;
  };
}

export default function NewsDetailModern() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(0);
  const [noticia, setNoticia] = useState<NoticiaTipo | null>(null);
  const [relacionadas, setRelacionadas] = useState<NoticiaTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Función para generar slug desde título
  const generateSlug = (titulo: string) => {
    return titulo
      .toLowerCase()
      .replace(/[áäàâã]/g, 'a')
      .replace(/[éëèê]/g, 'e')
      .replace(/[íïìî]/g, 'i')
      .replace(/[óöòôõ]/g, 'o')
      .replace(/[úüùû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\\s-]/g, '')
      .replace(/\\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  // Cargar detalle y relacionadas desde API
  useEffect(() => {
    // Asegurar que el usuario ve el inicio del artículo al entrar
    try { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); } catch {}
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (!slug) throw new Error('Slug inválido');
        const detalle = await fetchJson<NoticiaTipo>(`/api/noticias/slug/${encodeURIComponent(slug)}`);
        if (!mounted) return;
        setNoticia(detalle);
        // cargar relacionadas por categoría si hay
        const cat = detalle?.categoria;
        if (cat) {
          const rel = await fetchJson<NoticiaTipo[]>(`/api/noticias/?categoria=${encodeURIComponent(cat)}&limite=6`);
          if (mounted) setRelacionadas(rel.filter(n => n.slug !== detalle.slug).slice(0,3));
        }
      } catch (e: any) {
        setError(e?.message || 'Error cargando noticia');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  // Perfil del autor usando datos reales de la noticia (redes provenientes del usuario)
  const autorPerfil: AutorPerfil | undefined = noticia ? {
    nombre: noticia.autor_info?.nombre || 'Autor',
    bio: noticia.autor_info?.descripcion || '',
    rolPrincipal: noticia.programa,
    redes: Object.entries(noticia.autor_info?.redes_sociales || {})
      .filter(([, url]) => !!url)
      .map(([plataforma, url]) => ({
        plataforma: plataforma.toLowerCase() as AutorPerfil['redes'][number]['plataforma'],
        url,
      })),
    metrics: noticia.autor_info ? {
      articulos: noticia.autor_info.articulos_total || 0,
      seguidores: noticia.autor_info.seguidores || 0,
      aniosExperiencia: noticia.autor_info.experiencia_años || 0
    } : undefined
  } : undefined;

  // Noticias relacionadas (excluyendo la actual)
  const noticiasRelacionadas = relacionadas;

  useEffect(() => {
    if (noticia) {
      setCurrentLikes(noticia.likes || 0);
    }
  }, [noticia]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = (platform: string) => {
    const currentUrl = window.location.href;
    const title = noticia?.titulo || '';
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`,
      instagram: `https://www.instagram.com/`,
      copy: currentUrl
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank');
    }
    setShowShareMenu(false);
  };

  const redesOrden = [
    'twitter', 'x', 'facebook', 'instagram', 'linkedin', 'youtube', 'twitch', 'web', 'site', 'pagina'
  ];
  const ordenarRedes = (obj: Record<string, string>) => {
    const entries = Object.entries(obj).filter(([, v]) => !!v);
    entries.sort((a, b) => redesOrden.indexOf(a[0].toLowerCase()) - redesOrden.indexOf(b[0].toLowerCase()))
    return entries;
  };

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

  // Construir datos SEO
  const siteName = 'Radio Conexión Latam';
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const img = noticia.imagen?.startsWith('http') ? noticia.imagen : `${API_BASE}${noticia.imagen}`;
  const title = noticia.titulo;
  const description = noticia.resumen || (noticia.contenido ?? '').replace(/<[^>]+>/g, '').slice(0, 160);
  const publishedTime = new Date(noticia.fecha).toISOString();
  const modifiedTime = publishedTime;
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    image: [img],
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: noticia.autor_info?.nombre ? { '@type': 'Person', name: noticia.autor_info.nombre } : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: '/logo.jpg'
      }
    },
    description,
    mainEntityOfPage: url
  }), [title, img, publishedTime, modifiedTime, url, description, noticia.autor_info?.nombre]);

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
        {noticia.tags?.slice(0, 6).map((t, i) => (
          <meta key={i} property="article:tag" content={t} />
        ))}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | ${siteName}`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={img} />
        {/* Si tienes usuario: <meta name="twitter:site" content="@tu_usuario" /> */}

        {/* Json-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      {/* Hero Section con imagen de fondo completa */}
  <section className="relative min-h-screen overflow-visible pt-24 md:pt-28 pt-[env(safe-area-inset-top)]">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <img 
            src={noticia.imagen?.startsWith('http') ? noticia.imagen : `${API_BASE}${noticia.imagen}`} 
            alt={noticia.titulo}
            className="w-full h-full object-cover"
          />
          {/* Overlay más oscuro para mejorar contraste del título */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/60"></div>
        </div>

        {/* Navegación superior */}
  <div className="relative z-20 flex flex-col justify-center min-h-screen px-4 sm:px-5 lg:px-10">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-white/80 text-sm mb-8">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                Inicio
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-amber-200 font-medium">{noticia.categoria}</span>
            </nav>

            {/* Botón de retroceso */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-8 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:bg-black/50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver</span>
            </button>
          </div>
        </div>

        {/* Contenido del hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-6 mt-8 md:mt-12 lg:mt-16">
              <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                {noticia.categoria}
              </span>
              {noticia.destacada && (
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  DESTACADO
                </span>
              )}
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                TRENDING
              </span>
            </div>

            {/* Título principal responsivo y sin recorte en móvil */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 font-['Cinzel'] leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]">
              {noticia.titulo}
            </h1>

            {/* Resumen */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 font-['Cormorant_Garamond'] leading-relaxed max-w-4xl">
              {noticia.resumen}
            </p>

            {/* Meta información */}
            <div className="flex flex-wrap items-center gap-6 text-white/80 mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">{new Date(noticia.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{noticia.tiempo_lectura ?? 0} min de lectura</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span className="font-medium">{noticia.vistas.toLocaleString()} vistas</span>
              </div>
            </div>

            {/* Autor destacado */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{noticia.autor_info?.nombre || 'Autor'}</p>
                <p className="text-white/80">{noticia.programa}</p>
                {noticia.autor_info?.descripcion && (
                  <p className="text-white/60 text-sm">{noticia.autor_info.descripcion}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5 text-white" />
                </button>
                <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Globe className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Redes sociales del autor (si existen) */}
            {noticia.autor_info?.redes_sociales && Object.keys(noticia.autor_info.redes_sociales).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {ordenarRedes(noticia.autor_info.redes_sociales).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
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

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Barra de acciones flotante */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-stone-200 p-2 space-y-2">
          <button
            onClick={handleLike}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
              isLiked ? 'bg-red-100 text-red-600' : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-semibold">{currentLikes}</span>
          </button>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
              isBookmarked ? 'bg-amber-100 text-amber-600' : 'hover:bg-stone-100 text-stone-600'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-semibold">Guardar</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-all duration-300"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{noticia.compartidos}</span>
            </button>

            {/* Share menu */}
            {showShareMenu && (
              <div className="absolute left-full ml-3 top-0 bg-white rounded-xl shadow-xl border border-stone-200 p-2 space-y-2 min-w-[180px]">
                <button
                  onClick={() => handleShare('facebook')}
                  className="w-full flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors text-sm"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="w-full flex items-center gap-2 p-2 hover:bg-sky-50 rounded-lg text-sky-600 transition-colors text-sm"
                >
                  <Twitter className="w-5 h-5" />
                  <span className="font-medium">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="w-full flex items-center gap-2 p-2 hover:bg-stone-50 rounded-lg text-stone-600 transition-colors text-sm"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  <span className="font-medium">{copied ? 'Copiado!' : 'Copiar enlace'}</span>
                </button>
              </div>
            )}
          </div>

          <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-stone-100 text-stone-600 transition-all duration-300">
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{noticia.comentarios}</span>
          </button>
        </div>
      </div>

      {/* Contenido del artículo */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-12">
            {noticia.tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Contenido formateado y sanitizado */}
          <div className="prose prose-lg max-w-none">
            <div
              className="text-stone-700 leading-relaxed font-['Cormorant_Garamond'] text-lg space-y-6"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(noticia.contenido || '') }}
            />
          </div>

          {/* Quote destacado */}
          <div className="my-12 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-8 rounded-r-2xl">
            <blockquote className="text-xl italic text-stone-700 font-['Cormorant_Garamond'] leading-relaxed">
              "Su música nos recuerda que crecer no significa perder la capacidad de sentir con intensidad, de emocionarse con una gran composición orquestal, de valorar el arte que trasciende las barreras generacionales."
            </blockquote>
            <cite className="block mt-4 text-amber-700 font-semibold">— Del artículo</cite>
          </div>

          {/* Acciones del artículo en mobile */}
          <div className="lg:hidden bg-stone-50 rounded-2xl p-4 mt-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 text-sm ${
                    isLiked ? 'bg-red-100 text-red-600' : 'bg-white text-stone-600 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-semibold">{currentLikes}</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-stone-600 hover:bg-blue-50 transition-colors text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-semibold">{noticia.comentarios}</span>
                </button>

                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white text-stone-600 hover:bg-green-50 transition-colors text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="font-semibold">{noticia.compartidos}</span>
                </button>
              </div>

              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isBookmarked ? 'bg-amber-500 text-white' : 'bg-white text-stone-600 hover:bg-amber-50'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sección del autor enriquecida */}
      {autorPerfil && (
        <section className="py-20 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-amber-200 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl" />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="bg-white/90 backdrop-blur-sm rounded-4xl p-10 shadow-2xl border border-amber-100 overflow-hidden">
              <div className="grid md:grid-cols-3 gap-10">
                {/* Avatar + Métricas */}
                <div className="flex flex-col items-center text-center md:text-left md:items-start">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg ring-4 ring-white/60">
                      <User className="w-14 h-14 text-white" />
                    </div>
                    {autorPerfil.metrics && (
                      <span className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        {autorPerfil.metrics.aniosExperiencia} AÑOS
                      </span>
                    )}
                  </div>
                  {autorPerfil.metrics && (
                    <div className="w-full grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-amber-700 font-['Cinzel']">{autorPerfil.metrics.articulos}</p>
                        <p className="text-[11px] font-medium text-amber-700/70 tracking-wide">ARTÍCULOS</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-amber-700 font-['Cinzel']">{Math.round((autorPerfil.metrics.seguidores)/1000)}K</p>
                        <p className="text-[11px] font-medium text-amber-700/70 tracking-wide">SEGUIDORES</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-amber-700 font-['Cinzel']">{autorPerfil.metrics.aniosExperiencia}</p>
                        <p className="text-[11px] font-medium text-amber-700/70 tracking-wide">EXPERIENCIA</p>
                      </div>
                    </div>
                  )}
                  <button className="w-full md:w-auto bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow hover:shadow-lg hover:from-amber-700 hover:to-orange-700 transition-all text-sm">
                    Seguir Autor
                  </button>
                </div>

                {/* Información principal */}
                <div className="md:col-span-2 flex flex-col gap-6">
                  <div>
                    <h3 className="text-3xl font-bold text-stone-800 font-['Cinzel'] mb-2">
                      Sobre {autorPerfil.nombre}
                    </h3>
                    <p className="text-amber-700 font-semibold mb-1">{autorPerfil.rolPrincipal}</p>
                    {noticia.programa && (
                      <p className="text-stone-600 text-sm">Programa: {noticia.programa}</p>
                    )}
                  </div>
                  <p className="text-stone-700 leading-relaxed font-['Cormorant_Garamond'] text-lg">
                    {autorPerfil.bio}
                  </p>

                  {/* Redes sociales */}
                  <div>
                    <h4 className="text-sm font-semibold tracking-wider text-amber-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      PRESENCIA DIGITAL
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {autorPerfil.redes.map((r, i) => {
                        const baseClasses = 'group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border backdrop-blur-sm transition-all';
                        const platformStyles: Record<string,string> = {
                          twitter: 'bg-sky-50/60 border-sky-300/40 text-sky-600 hover:bg-sky-100',
                          facebook: 'bg-blue-50/60 border-blue-300/40 text-blue-600 hover:bg-blue-100',
                          instagram: 'bg-pink-50/60 border-pink-300/40 text-pink-600 hover:bg-pink-100',
                          linkedin: 'bg-cyan-50/60 border-cyan-300/40 text-cyan-700 hover:bg-cyan-100',
                          youtube: 'bg-red-50/60 border-red-300/40 text-red-600 hover:bg-red-100',
                          twitch: 'bg-purple-50/60 border-purple-300/40 text-purple-600 hover:bg-purple-100',
                          web: 'bg-amber-50/60 border-amber-300/40 text-amber-700 hover:bg-amber-100'
                        };
                        const labelMap: Record<string,string> = {
                          twitter: 'Twitter', facebook: 'Facebook', instagram: 'Instagram',
                          linkedin: 'LinkedIn', youtube: 'YouTube', twitch: 'Twitch', web: 'Sitio'
                        };
                        const iconMap: Record<string, JSX.Element> = {
                          twitter: <span className="font-bold">𝕏</span>,
                          facebook: <span className="font-bold">f</span>,
                          instagram: <span className="font-bold">◎</span>,
                          linkedin: <span className="font-bold">in</span>,
                          youtube: <span className="font-bold">▶</span>,
                          twitch: <span className="font-bold">✦</span>,
                          web: <Globe className="w-4 h-4" />
                        };
                        return (
                          <a
                            key={i}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${baseClasses} ${platformStyles[r.plataforma]}`}
                          >
                            <span className="text-base">{iconMap[r.plataforma]}</span>
                            <span>{labelMap[r.plataforma]}</span>
                            {r.seguidores && (
                              <span className="text-[11px] font-semibold text-stone-500 group-hover:text-stone-700 transition-colors">
                                {r.seguidores >= 1000 ? `${(r.seguidores/1000).toFixed(1)}K` : r.seguidores}
                              </span>
                            )}
                            {r.verificado && (
                              <span className="ml-1 text-amber-600 text-xs font-bold">✔</span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA artículos del autor */}
                  <div className="mt-4 flex flex-wrap gap-4">
                    <button
                      onClick={() => navigate(`/noticias?autor=${encodeURIComponent(autorPerfil.nombre)}`)}
                      className="px-6 py-3 rounded-xl bg-white border border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-all shadow-sm"
                    >
                      Más artículos de {autorPerfil.nombre.split(' ')[0]}
                    </button>
                    <button
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:from-amber-700 hover:to-orange-700 transition-all shadow"
                    >
                      Invitar a Entrevista
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Noticias relacionadas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-stone-800 font-['Cinzel'] mb-4">
              Artículos Relacionados
            </h2>
            <p className="text-stone-600 font-['Cormorant_Garamond'] text-lg">
              Continúa explorando nuestro archivo de análisis profundos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {noticiasRelacionadas.map((relacionada) => (
              <article
                key={relacionada.id}
                onClick={() => navigate(`/noticia/${generateSlug(relacionada.titulo)}`)}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-stone-100 hover:border-amber-200 transform hover:scale-105"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={relacionada.imagen}
                    alt={relacionada.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {relacionada.categoria}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg font-['Cinzel'] line-clamp-2 group-hover:text-amber-200 transition-colors">
                      {relacionada.titulo}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-stone-600 text-sm leading-relaxed font-['Cormorant_Garamond'] line-clamp-3 mb-4">
                    {relacionada.resumen}
                  </p>

                  <div className="flex items-center justify-between text-xs text-stone-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(relacionada.fecha).toLocaleDateString('es-ES')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {relacionada.vistas.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <span className="text-sm text-stone-800 font-semibold">{relacionada.autor_info?.nombre || 'Autor'}</span>
                    <div className="flex items-center gap-3 text-stone-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {relacionada.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {relacionada.comentarios}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white font-['Cinzel'] mb-6">
            ¿Te gustó este artículo?
          </h2>
          <p className="text-white/90 text-lg font-['Cormorant_Garamond'] mb-8 max-w-2xl mx-auto">
            Únete a nuestra comunidad de otakus maduros y recibe análisis profundos directamente en tu correo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-amber-600 px-8 py-4 rounded-2xl font-bold hover:bg-amber-50 transition-colors duration-300 shadow-lg">
              Suscribirse al Newsletter
            </button>
            <button 
              onClick={() => navigate('/noticias')}
              className="bg-black/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold hover:bg-black/30 transition-all duration-300 border border-white/20"
            >
              Ver Más Artículos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}