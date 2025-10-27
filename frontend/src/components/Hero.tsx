import React from 'react';
import { Headphones, Users, Clock, Globe, Zap, Music } from 'lucide-react';

interface HeroProps {
  onPlayLive: () => void;
}

export default function Hero({ onPlayLive }: HeroProps) {
  return (
    <section id="inicio" className="relative min-h-screen text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="./public/portada1.png"
          alt="Radio Studio Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-purple-800/70 to-pink-600/80"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

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
              Radio 
            </span>
            <span className="text-white">Conexión</span>
            <br />
            <span className="text-pink-300 text-4xl md:text-6xl block text-center">LATAM</span>
          </h1>
          
          <p className="text-xl md:text-3xl mb-12 text-purple-100 max-w-4xl mx-auto leading-relaxed font-light">
            Conectando corazones latinos a través de la música. 
            <span className="block mt-2 text-pink-300 font-medium">Tu ritmo, tu pasión, tu conexión.</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          </div>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          </div>
        </div>
      </div>

      {/* Audio frequency waves */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/20 to-transparent overflow-hidden">
        {/* Frequency bars - Equalizer style */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center space-x-1 px-4 pb-2">
          {/* Generate multiple bars with different animations */}
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className={`bg-gradient-to-t from-pink-400 via-purple-400 to-cyan-400 rounded-t-lg animate-pulse`}
              style={{
                width: '8px',
                height: `${Math.random() * 60 + 20}px`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${0.8 + Math.random() * 0.4}s`
              }}
            />
          ))}
        </div>
        
        {/* Multiple pulse waves at different levels */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-around">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse"></div>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse delay-300"></div>
          <div className="w-40 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse delay-700"></div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-around">
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse delay-150"></div>
          <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse delay-450"></div>
          <div className="w-28 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse delay-900"></div>
        </div>
        
        {/* Sound waves with smoother animation */}
        <div className="absolute bottom-4 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-12 opacity-60">
            <path 
              d="M0,30 Q360,10 720,30 T1440,30" 
              fill="none" 
              stroke="url(#waveGradient)" 
              strokeWidth="2"
              className="animate-pulse"
            />
            <path 
              d="M0,35 Q360,15 720,35 T1440,35" 
              fill="none" 
              stroke="url(#waveGradient2)" 
              strokeWidth="1.5"
              className="animate-pulse"
              style={{animationDelay: '0.5s'}}
            />
            <path 
              d="M0,25 Q360,5 720,25 T1440,25" 
              fill="none" 
              stroke="url(#waveGradient3)" 
              strokeWidth="1"
              className="animate-pulse"
              style={{animationDelay: '1s'}}
            />
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1"/>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8"/>
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6"/>
              </linearGradient>
              <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7"/>
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Floating music elements */}
        <div className="absolute bottom-8 left-1/4 animate-bounce" style={{animationDelay: '1s'}}>
          <div className="w-6 h-6 bg-pink-400 rounded-full opacity-70 flex items-center justify-center shadow-lg">
            <Music className="h-3 w-3 text-white" />
          </div>
        </div>
        
        <div className="absolute bottom-12 right-1/3 animate-bounce" style={{animationDelay: '2s'}}>
          <div className="w-4 h-4 bg-purple-400 rounded-full opacity-60 shadow-md"></div>
        </div>
        
        <div className="absolute bottom-6 right-1/4 animate-bounce" style={{animationDelay: '3s'}}>
          <div className="w-5 h-5 bg-cyan-400 rounded-full opacity-80 flex items-center justify-center shadow-lg">
            <span className="text-xs text-white font-bold">♪</span>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/6 animate-bounce" style={{animationDelay: '1.5s'}}>
          <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-75 shadow-sm"></div>
        </div>
        
        <div className="absolute bottom-7 right-1/6 animate-bounce" style={{animationDelay: '2.5s'}}>
          <div className="w-4 h-4 bg-orange-400 rounded-full opacity-65 flex items-center justify-center shadow-md">
            <span className="text-xs text-white font-bold">♫</span>
          </div>
        </div>
      </div>
    </section>
  );
}