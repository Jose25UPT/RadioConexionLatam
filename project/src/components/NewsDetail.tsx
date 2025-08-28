import React from 'react';
import { ArrowLeft, Calendar, User, Eye, Share2, Heart } from 'lucide-react';

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

interface NewsDetailProps {
  news: NewsItem;
  onBack: () => void;
}

export default function NewsDetail({ news, onBack }: NewsDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-600 text-white py-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <img src="/logo.jpg" alt="Radio Conexión Latam" className="h-12 w-12 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold">Radio Conexión Latam</h1>
                <p className="text-pink-200 text-sm">Noticias</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
                <Heart className="h-5 w-5" />
              </button>
              <button className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <span className="bg-pink-500 px-3 py-1 rounded-full text-sm font-medium">
            {news.categoria}
          </span>
        </div>
      </header>
      
      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative mb-8">
          <img 
            src={news.imagen} 
            alt={news.titulo} 
            className="w-full h-96 object-cover rounded-2xl shadow-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl"></div>
        </div>
        
        {/* Article Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {news.titulo}
          </h1>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-medium">{news.autor}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-pink-100 p-2 rounded-full">
                <Calendar className="h-4 w-4 text-pink-600" />
              </div>
              <span>{new Date(news.fecha).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-orange-100 p-2 rounded-full">
                <Eye className="h-4 w-4 text-orange-600" />
              </div>
              <span>{news.vistas.toLocaleString()} vistas</span>
            </div>
          </div>
          
          {/* Article Body */}
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 mb-8 font-medium leading-relaxed">
              {news.resumen}
            </p>
            
            <div className="text-gray-700 leading-relaxed text-lg space-y-6">
              {news.contenido.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                #{news.categoria.toLowerCase()}
              </span>
              <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                #radioconexionlatam
              </span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                #musicalatina
              </span>
            </div>
          </div>
          
          {/* About Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-start space-x-4">
              <img 
                src="/logo.jpg" 
                alt="Radio Conexión Latam" 
                className="h-16 w-16 rounded-xl border-2 border-white shadow-lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sobre Radio Conexión Latam
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Radio Conexión Latam es tu estación de radio favorita, conectando corazones latinos 
                  a través de la mejor música, noticias y entretenimiento las 24 horas del día. 
                  Transmitiendo desde México para toda Latinoamérica con más de 8 años de experiencia.
                </p>
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                  <span>🎧 150K+ oyentes activos</span>
                  <span>🌎 20+ países conectados</span>
                  <span>📻 Transmisión 24/7</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
              Escuchar Radio en Vivo
            </button>
            <button className="flex-1 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold py-3 px-6 rounded-xl transition-all duration-300">
              Ver Más Noticias
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}