import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, User, ChevronLeft, ChevronRight, Heart, MessageCircle,
  Share2, Clock, Search,
  Star, Eye, Tag, ArrowUp, Sparkles, Film, Book
} from 'lucide-react';

import type { Noticia as NoticiaTipo } from '../types/Noticia';
import { fetchJson, API_BASE } from '../lib/api';

const CATEGORIA_TODAS = 'Todas';

export default function AllNewsModern() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIA_TODAS);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'fecha' | 'popularidad' | 'vistas'>('fecha');
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [allNews, setAllNews] = useState<NoticiaTipo[]>([]);
  const noticiasPerPage = 6;

  // Icono por categoría (aprox)
  const CategoriaIcon = ({ nombre }: { nombre?: string }) => {
    const n = (nombre || '').toLowerCase();
    if (n.includes('ghibli') || n.includes('cine')) return <Film className="w-3 h-3" />;
    if (n.includes('anál') || n.includes('anal')) return <Book className="w-3 h-3" />;
    if (n.includes('evento')) return <Calendar className="w-3 h-3" />;
    if (n.includes('review') || n.includes('reseña')) return <Star className="w-3 h-3" />;
    return <Tag className="w-3 h-3" />;
  };

  // Función para generar slug
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

  // Categorías disponibles (derivadas de datos)
  const categorias = useMemo(() => {
    const set = new Set<string>();
    allNews.forEach(n => n.categoria && set.add(n.categoria));
    return [CATEGORIA_TODAS, ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allNews]);

  // Tags disponibles (uniendo presentes + preset anime)
  const ANIME_TAGS_PRESET = ['anime','manga','shonen','seinen','shojo','isekai','mecha','hentai','juegos','cosplay','otaku','j-pop','kawaii'];
  const tagsDisponibles = useMemo(() => {
    const set = new Set<string>(ANIME_TAGS_PRESET.map(t => t.toLowerCase()));
    allNews.forEach(n => n.tags?.forEach(t => t && set.add(t.toLowerCase())));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allNews]);

  // Filtrar y ordenar noticias
  const filteredNews = useMemo(() => allNews
    .filter(noticia => {
      const s = searchTerm.trim().toLowerCase();
      const matchesSearch = !s
        || noticia.titulo.toLowerCase().includes(s)
        || noticia.contenido.toLowerCase().includes(s)
        || noticia.tags.some(tag => tag.toLowerCase().includes(s));
      const matchesCategory = selectedCategory === CATEGORIA_TODAS || noticia.categoria === selectedCategory;
      const matchesTags = selectedTags.length === 0
        || noticia.tags.some(tag => selectedTags.includes(tag.toLowerCase()));
      return matchesSearch && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularidad':
          return (b.likes + b.comentarios + b.compartidos) - (a.likes + a.comentarios + a.compartidos);
        case 'vistas':
          return b.vistas - a.vistas;
        default:
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      }
    }), [allNews, searchTerm, selectedCategory, selectedTags, sortBy]);

  // Paginación
  const totalPages = Math.ceil(filteredNews.length / noticiasPerPage);
  const startIndex = (currentPage - 1) * noticiasPerPage;
  const currentNews = filteredNews.slice(startIndex, startIndex + noticiasPerPage);

  // Tendencias (para ticker): top por popularidad
  const trending = useMemo(() => {
    const arr = [...allNews]
      .sort((a, b) => (b.likes + b.comentarios + b.compartidos) - (a.likes + a.comentarios + a.compartidos))
      .slice(0, 12);
    return arr.map((n) => ({
      id: n.id,
      titulo: n.titulo,
      categoria: n.categoria,
      slug: n.slug || generateSlug(n.titulo),
      tag: n.tags?.[0] || n.categoria || 'anime'
    }));
  }, [allNews]);

  // Tilt 3D para tarjetas
  const handleTilt = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0..1
    const py = (e.clientY - rect.top) / rect.height;   // 0..1
    const rx = (py - 0.5) * 8; // grados
    const ry = (px - 0.5) * -8;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };
  const resetTilt = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = '';
  };

  // Noticias destacadas para hero section
  // const featuredNews = useMemo(() => allNews.filter(n => n.destacada).slice(0, 3), [allNews]);

  const handleNewsClick = (noticia: NoticiaTipo) => {
    const slug = noticia.slug || generateSlug(noticia.titulo);
    navigate(`/noticia/${slug}`);
  };

  // Scroll to top
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Cargar noticias de la API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const noticias = await fetchJson<NoticiaTipo[]>(`/api/noticias/?limite=60`);
        if (!mounted) return;
        setAllNews(Array.isArray(noticias) ? noticias : []);
      } catch {
        // no-op: podemos mostrar un toast en el futuro
      }
    })();
    return () => { mounted = false; };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Resetear a página 1 cuando cambian filtros/búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTags]);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-orange-50 to-red-50">
      {/* Ticker de tendencias (arriba y más grande) */}
      {trending.length > 0 && (
        <div className="sticky top-20 md:top-24 z-30 bg-white/80 backdrop-blur-md border-b border-amber-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-amber-700 font-semibold text-sm md:text-base">
              <Sparkles className="w-5 h-5" /> Tendencias
            </span>
            <div className="ticker-wrapper flex-1">
              <div className="ticker-track">
                {[0, 1].map((rep) => (
                  <div key={rep} className="flex items-center gap-10 pr-10">
                    {trending.map((t) => (
                      <div key={`${rep}-${t.id}`} className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-xs md:text-sm">
                          <CategoriaIcon nombre={t.categoria} /> {t.categoria}
                        </span>
                        <button
                          onClick={() => navigate(`/noticia/${t.slug}`)}
                          className="text-stone-800 hover:text-amber-700 font-semibold whitespace-nowrap text-sm md:text-base"
                        >
                          {t.titulo}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero anime */}
      {/* Encabezado compacto sin portada: unify */}
      <section className="relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold w-max">
              <Sparkles className="w-4 h-4" /> Actualizado en tiempo real
            </div>
            <div className="flex items-center gap-3">
              <span className="sticker-jp">ニュース</span>
              <span className="sticker-jp" style={{background: 'linear-gradient(135deg,#22c55e,#06b6d4)'}}>オタク</span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
                Noticias de Anime
              </h1>
            </div>
            <p className="text-stone-600 max-w-2xl">
              Explora reseñas, análisis y tendencias del mundo otaku con una experiencia visual vibrante.
            </p>
          </div>
        </div>
      </section>

      

      {/* Contenido principal unificado */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Barra de filtros y búsqueda */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              {/* Búsqueda */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar noticias de anime, ej: isekai, mecha, cosplay..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 bg-white outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 text-sm"
                />
              </div>
              {/* Orden */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-stone-600">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'fecha' | 'popularidad' | 'vistas')}
                  className="text-sm rounded-xl border border-stone-200 bg-white px-3 py-2 focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
                >
                  <option value="fecha">Fecha</option>
                  <option value="popularidad">Popularidad</option>
                  <option value="vistas">Vistas</option>
                </select>
              </div>
              {/* Vista */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg text-sm border ${viewMode==='grid'?'bg-amber-500 text-white border-amber-500':'bg-white border-stone-200 text-stone-700'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg text-sm border ${viewMode==='list'?'bg-amber-500 text-white border-amber-500':'bg-white border-stone-200 text-stone-700'}`}
                >
                  Lista
                </button>
              </div>
              {/* Limpiar */}
              <div>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory(CATEGORIA_TODAS); setSelectedTags([]); setSortBy('fecha'); }}
                  className="px-3 py-2 rounded-lg text-sm border bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {/* Categorías */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <CategoriaIcon nombre={cat} /> {cat}
                </button>
              ))}
            </div>

            {/* Tags de anime */}
            <div className="flex items-center gap-2 flex-wrap">
              {tagsDisponibles.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTags((prev) => active ? prev.filter(t => t !== tag) : [...prev, tag])}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
                      active
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <Tag className="w-3 h-3" /> {tag}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentNews.map((noticia) => (
                <article
                  key={noticia.id}
                  onClick={() => handleNewsClick(noticia)}
                  onMouseMove={handleTilt}
                  onMouseLeave={resetTilt}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg cursor-pointer border border-amber-100 hover:border-amber-300 hover:shadow-[0_20px_60px_rgba(251,191,36,0.25)] transition-[transform,box-shadow,border-color] duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={noticia.imagen?.startsWith('http') ? noticia.imagen : `${API_BASE}${noticia.imagen}`}
                      alt={noticia.titulo}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="inline-flex items-center gap-2 bg-white/90 text-stone-800 px-3 py-1 rounded-full text-xs font-semibold border border-amber-200">
                        <CategoriaIcon nombre={noticia.categoria} /> {noticia.categoria}
                      </span>
                      {noticia.destacada && (
                        <span className="sticker-jp text-[10px] flex items-center gap-1">
                          <Star className="w-3 h-3" /> DESTACADO
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-white/20">
                        <Clock className="w-3 h-3" />{noticia.tiempo_lectura ?? 0}m
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-white font-extrabold text-xl font-['Cinzel'] line-clamp-2 group-hover:text-amber-200 transition-colors duration-300 leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                        {noticia.titulo}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 text-xs text-stone-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(noticia.fecha).toLocaleDateString('es-ES')}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{noticia.vistas.toLocaleString()}</span>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed font-['Cormorant_Garamond'] line-clamp-3 mb-4">{noticia.resumen || noticia.contenido}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-800 font-semibold">{noticia.autor_info?.nombre || 'Autor'}</p>
                          <p className="text-xs text-stone-500">{noticia.programa || noticia.categoria}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-stone-400 text-xs">
                        <span className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart className="w-3 h-3" />{noticia.likes}</span>
                        <span className="flex items-center gap-1 hover:text-blue-500 transition-colors"><MessageCircle className="w-3 h-3" />{noticia.comentarios}</span>
                        <span className="flex items-center gap-1 hover:text-green-500 transition-colors"><Share2 className="w-3 h-3" />{noticia.compartidos}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-6">
              {currentNews.map((noticia) => (
                <article
                  key={noticia.id}
                  onClick={() => handleNewsClick(noticia)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-stone-100 hover:border-amber-200"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative md:w-80 h-64 md:h-auto overflow-hidden">
                      <img
                        src={noticia.imagen?.startsWith('http') ? noticia.imagen : `${API_BASE}${noticia.imagen}`}
                        alt={noticia.titulo}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r md:bg-gradient-to-t from-black/40 to-transparent"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {noticia.categoria}
                        </span>
                        {noticia.destacada && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Star className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8">
                      <div className="flex items-center gap-4 mb-4 text-sm text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(noticia.fecha).toLocaleDateString('es-ES')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {noticia.tiempo_lectura ?? 0} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {noticia.vistas.toLocaleString()}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-stone-800 mb-4 font-['Cinzel'] group-hover:text-amber-700 transition-colors duration-300">
                        {noticia.titulo}
                      </h2>

                      <p className="text-stone-600 leading-relaxed font-['Cormorant_Garamond'] mb-6 line-clamp-3">
                        {noticia.contenido}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {noticia.tags.map((tag, index) => (
                          <span key={index} className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-stone-800 font-semibold">{noticia.autor_info?.nombre || 'Autor'}</p>
                            <p className="text-sm text-stone-500">{noticia.programa || noticia.categoria}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-stone-400">
                          <span className="flex items-center gap-2 hover:text-red-500 transition-colors">
                            <Heart className="w-4 h-4" />
                            {noticia.likes}
                          </span>
                          <span className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            {noticia.comentarios}
                          </span>
                          <span className="flex items-center gap-2 hover:text-green-500 transition-colors">
                            <Share2 className="w-4 h-4" />
                            {noticia.compartidos}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-16">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}