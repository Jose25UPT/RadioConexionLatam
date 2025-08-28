import React, { useState, useEffect } from 'react';
import { Calendar, User, Eye, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsItem {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  autor: string;
  fecha: string;
  imagen: string;
  categoria: string;
  vistas: number;
  destacada: boolean;
}

interface NewsProps {
  onNewsClick?: (news: NewsItem) => void;
}

export default function News({ onNewsClick }: NewsProps) {
  const [allNews, setAllNews] = useState<NewsItem[]>([]); // ✅ AÑADIDO
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const newsPerPage = 9;
  const [categories, setCategories] = useState<string[]>(['Todas']);

  // ✅ Cargar noticias desde API
  useEffect(() => {
  fetch('http://localhost:8000/api/noticias/')
      .then((res) => res.json())
      .then((data: NewsItem[]) => {
        setAllNews(data);
      })
      .catch((error) => console.error('Error al obtener noticias:', error));
  }, []);

  // ✅ Cargar categorías desde API
  useEffect(() => {
  fetch('http://localhost:8000/api/noticias/categorias/')
      .then((res) => res.json())
      .then((data: string[]) => {
        const uniqueCategories = Array.from(new Set(data));
        setCategories(['Todas', ...uniqueCategories]);
      })
      .catch((error) => console.error('Error al obtener categorías:', error));
  }, []);

   // ✅ Filtrar noticias por categoría
  const filteredNews = (
    selectedCategory === 'Todas'
      ? allNews
      : allNews.filter(news => news.categoria === selectedCategory)
  ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const totalNewsCount = selectedCategory === 'Todas'
    ? filteredNews.length - 2 // restar las 2 destacadas
    : filteredNews.length;

  const totalPages = selectedCategory === 'Todas'
    ? 1 + Math.ceil((totalNewsCount - 6) / newsPerPage) // Página 1: 6 normales
    : Math.ceil(totalNewsCount / newsPerPage);

  let featuredNews: NewsItem[] = [];
  let currentNews: NewsItem[] = [];

  if (currentPage === 1 && selectedCategory === 'Todas') {
    featuredNews = filteredNews.slice(0, 2); // 2 destacadas
    currentNews = filteredNews.slice(2, 8);  // 6 normales
  } else {
    const baseIndex = selectedCategory === 'Todas'
      ? 8 + (currentPage - 2) * newsPerPage // desde la página 2
      : (currentPage - 1) * newsPerPage;

    currentNews = filteredNews.slice(baseIndex, baseIndex + newsPerPage);
  }

  const handleNewsClick = (news: NewsItem) => {
    if (onNewsClick) {
      onNewsClick(news);
    } else {
      // Fallback: abrir en nueva ventana
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${news.titulo} - Radio Conexión Latam</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: 'Inter', sans-serif; }
            </style>
          </head>
          <body class="bg-gray-50">
            <div class="min-h-screen">
              <header class="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-600 text-white py-6">
                <div class="max-w-4xl mx-auto px-4">
                  <div class="flex items-center space-x-4 mb-4">
                    <img src="/logo.jpg" alt="Radio Conexión Latam" class="h-12 w-12 rounded-lg">
                    <h1 class="text-2xl font-bold">Radio Conexión Latam</h1>
                  </div>
                  <span class="bg-pink-500 px-3 py-1 rounded-full text-sm font-medium">${news.categoria}</span>
                </div>
              </header>
              
              <article class="max-w-4xl mx-auto px-4 py-8">
                <img src="${news.imagen}" alt="${news.titulo}" class="w-full h-96 object-cover rounded-2xl shadow-lg mb-8">
                
                <div class="bg-white rounded-2xl shadow-lg p-8">
                  <h1 class="text-4xl font-bold text-gray-900 mb-6">${news.titulo}</h1>
                  
                  <div class="flex items-center space-x-6 text-gray-600 mb-8 pb-6 border-b">
                    <div class="flex items-center space-x-2">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                      </svg>
                      <span>${news.autor}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                      </svg>
                      <span>${new Date(news.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                      </svg>
                      <span>${news.vistas.toLocaleString()} vistas</span>
                    </div>
                  </div>
                  
                  <div class="prose prose-lg max-w-none">
                    <p class="text-xl text-gray-700 mb-6 font-medium">${news.resumen}</p>
                    <div class="text-gray-700 leading-relaxed whitespace-pre-line">${news.contenido}</div>
                    
                    <div class="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <h3 class="text-lg font-semibold text-gray-900 mb-2">Sobre Radio Conexión Latam</h3>
                      <p class="text-gray-700">Radio Conexión Latam es tu estación de radio favorita, conectando corazones latinos a través de la mejor música, noticias y entretenimiento las 24 horas del día.</p>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  return (
    <section id="noticias" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Últimas Noticias
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mantente informado con las últimas novedades del mundo de la música latina y nuestra radio
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured News */}
        {currentPage === 1 && selectedCategory === 'Todas' && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Noticias Destacadas</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredNews.map((news) => (
                <div
                  key={news.id}
                  onClick={() => handleNewsClick(news)}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                >
                  <div className="relative">
                    <img
                      src={news.imagen}
                      alt={news.titulo}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                        {news.categoria}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {news.vistas.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {news.titulo}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{news.resumen}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{news.autor}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(news.fecha).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {currentNews.map((news) => (
            <div
              key={news.id}
              onClick={() => handleNewsClick(news)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
            >
              <div className="relative">
                <img
                  src={news.imagen}
                  alt={news.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {news.categoria}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {news.titulo}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{news.resumen}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3" />
                    <span>{news.autor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(news.fecha).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Anterior</span>
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-50 shadow-md'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-colors"
            >
              <span>Siguiente</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}