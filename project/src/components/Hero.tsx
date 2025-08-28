import React from 'react';
import { Headphones, Users, Clock, Globe, Zap, Music } from 'lucide-react';

interface HeroProps {
  onPlayLive: () => void;
}

export default function Hero({ onPlayLive }: HeroProps) {
  return (
    <section id="inicio" className="relative min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-orange-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          {/* Main Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img 
                src="/logo.jpg" 
                alt="Radio Conexión Latam" 
                className="h-32 w-32 rounded-2xl shadow-2xl border-4 border-white/30"
              />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-bounce">
                <Zap className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              RADIO
            </span>
            <br />
            <span className="text-white">CONEXIÓN</span>
            <br />
            <span className="text-pink-300 text-4xl md:text-6xl">LATAM</span>
          </h1>
          
          <p className="text-xl md:text-3xl mb-12 text-purple-100 max-w-4xl mx-auto leading-relaxed font-light">
            Conectando corazones latinos a través de la música. 
            <span className="block mt-2 text-pink-300 font-medium">Tu ritmo, tu pasión, tu conexión.</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button 
              onClick={onPlayLive}
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <Music className="inline-block mr-2 h-6 w-6" />
              Escuchar Ahora
            </button>
            <button className="border-2 border-white/30 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 backdrop-blur-sm">
              <Globe className="inline-block mr-2 h-6 w-6" />
              Conoce Más
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Headphones className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">24/7</h3>
              <p className="text-purple-200">Transmisión Continua</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Users className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">150K+</h3>
              <p className="text-purple-200">Oyentes Activos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Globe className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">20+</h3>
              <p className="text-purple-200">Países Conectados</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <Clock className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">8+</h3>
              <p className="text-purple-200">Años Conectando</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-20 fill-white">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
}