import React, { useState, useRef } from 'react';
import { Clock, Mic, Music, Coffee, Moon, Sun, Sunset, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface Program {
  id: number;
  name: string;
  host: string;
  time: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isLive?: boolean;
}

export default function Programs() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const programs: Program[] = [
    {
      id: 1,
      name: "Conexión Matutina",
      host: "María González",
      time: "06:00 - 10:00",
      description: "Despierta con la mejor música latina y las noticias más importantes del día.",
      icon: <Coffee className="h-8 w-8" />,
      color: "from-orange-400 to-pink-500",
      isLive: true
    },
    {
      id: 2,
      name: "Ritmos Sin Fronteras",
      host: "Carlos Rodríguez",
      time: "10:00 - 14:00",
      description: "Los mejores éxitos latinos de todos los tiempos sin interrupciones.",
      icon: <Music className="h-8 w-8" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      name: "Tarde Latina",
      host: "Ana Martínez",
      time: "14:00 - 18:00",
      description: "Entretenimiento, música y conversación para tu tarde perfecta.",
      icon: <Sun className="h-8 w-8" />,
      color: "from-pink-500 to-orange-500"
    },
    {
      id: 4,
      name: "Conexión Nocturna",
      host: "Luis Fernández",
      time: "18:00 - 22:00",
      description: "Las mejores baladas y música relajante para cerrar el día.",
      icon: <Sunset className="h-8 w-8" />,
      color: "from-purple-600 to-indigo-600"
    },
    {
      id: 5,
      name: "Madrugada Latina",
      host: "Sofia Herrera",
      time: "22:00 - 02:00",
      description: "Música suave y romántica para acompañar tus noches.",
      icon: <Moon className="h-8 w-8" />,
      color: "from-indigo-600 to-purple-700"
    },
    {
      id: 6,
      name: "Conexión Especial",
      host: "Equipo Completo",
      time: "Fines de Semana",
      description: "Programación especial con invitados y eventos únicos.",
      icon: <Mic className="h-8 w-8" />,
      color: "from-pink-600 to-purple-600"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(programs.length / 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(programs.length / 2)) % Math.ceil(programs.length / 2));
  };

  return (
    <section id="programas" className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
            Programación en Vivo
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            Desliza para descubrir todos nuestros programas especiales
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-lg hover:bg-white/30 p-3 rounded-full transition-all duration-300 group"
          >
            <ChevronLeft className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 backdrop-blur-lg hover:bg-white/30 p-3 rounded-full transition-all duration-300 group"
          >
            <ChevronRight className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Carousel Track */}
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: Math.ceil(programs.length / 2) }, (_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {programs.slice(slideIndex * 2, slideIndex * 2 + 2).map((program) => (
                    <div
                      key={program.id}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-500 transform hover:scale-105 border border-white/20"
                    >
                      {/* Header with gradient */}
                      <div className={`bg-gradient-to-br ${program.color} p-4 relative overflow-hidden`}>
                        {/* Animated background elements */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8 animate-pulse delay-1000"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-3">
                            <div className="bg-white/30 backdrop-blur-sm p-2 rounded-xl">
                              <div className="h-6 w-6">{program.icon}</div>
                            </div>
                            {program.isLive && (
                              <div className="flex items-center space-x-1 bg-red-500 px-2 py-1 rounded-full animate-bounce">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold">EN VIVO</span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold mb-1">{program.name}</h3>
                          <p className="text-white/90 text-sm mb-2">con {program.host}</p>
                          
                          <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span className="font-medium text-sm">{program.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-4">
                        <p className="text-purple-100 leading-relaxed mb-4 text-sm">{program.description}</p>
                        
                        <div className="flex items-center justify-between">
                          {program.isLive ? (
                            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm">
                              <Play className="h-3 w-3" />
                              <span>Escuchar</span>
                            </button>
                          ) : (
                            <button className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-full font-bold hover:bg-white/30 transition-all duration-300 text-sm">
                              <Clock className="h-3 w-3" />
                              <span>Próximamente</span>
                            </button>
                          )}
                          
                          <button className="text-purple-200 hover:text-white font-semibold transition-colors duration-200 flex items-center space-x-1 text-sm">
                            <span>Ver más</span>
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-3 mt-12">
          {Array.from({ length: Math.ceil(programs.length / 2) }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}