import React from 'react';
import { Clock, Mic, Music, Coffee, Moon, Sun, Sunset } from 'lucide-react';

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

  return (
    <section id="programas" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Nuestra Programación
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre nuestros programas diseñados para acompañarte en cada momento del día
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100"
            >
              <div className={`bg-gradient-to-br ${program.color} p-8 text-white relative overflow-hidden`}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                      {program.icon}
                    </div>
                    {program.isLive && (
                      <div className="flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-xs font-bold">EN VIVO</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{program.name}</h3>
                  <p className="text-white/90 mb-4">con {program.host}</p>
                  
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{program.time}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <p className="text-gray-600 leading-relaxed mb-6">{program.description}</p>
                
                <div className="flex items-center justify-between">
                  <button className="text-purple-600 hover:text-pink-600 font-semibold transition-colors duration-200 flex items-center space-x-2">
                    <span>Más información</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {program.isLive && (
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-200">
                      Escuchar Ahora
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Banner */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">¿Quieres conocer toda nuestra programación?</h3>
          <p className="text-xl mb-6 text-white/90">Descarga nuestra guía completa de programas y horarios</p>
          <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-200">
            Descargar Programación
          </button>
        </div>
      </div>
    </section>
  );
}