import React, { useState } from 'react';
import { Mail, Phone, Instagram, Twitter, Award  , Heart } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  email: string;
  phone: string;
  experience: string;
  specialty: string;
  social: {
    instagram?: string;
    twitter?: string;
  };
}

export default function Team() {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  const team: TeamMember[] = [
    {
      id: 1,
      name: "María González",
      role: "Directora General",
      bio: "Con más de 15 años de experiencia en radio, María lidera nuestro equipo con pasión y profesionalismo, conectando corazones latinos.",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "maria@conexionlatam.com",
      phone: "+1 234 567 8901",
      experience: "15+ años",
      specialty: "Gestión y Liderazgo",
      social: {
        instagram: "@maria_conexion",
        twitter: "@mariaconexion"
      }
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Locutor Principal",
      bio: "La voz más reconocida de nuestra estación, Carlos conecta con miles de oyentes cada día con su carisma único.",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "carlos@conexionlatam.com",
      phone: "+1 234 567 8902",
      experience: "12+ años",
      specialty: "Locución y Entretenimiento",
      social: {
        instagram: "@carlos_ritmos",
        twitter: "@carlosradio"
      }
    },
    {
      id: 3,
      name: "Ana Martínez",
      role: "Productora Musical",
      bio: "Especialista en curación musical, Ana selecciona los mejores temas latinos para cada momento del día.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "ana@conexionlatam.com",
      phone: "+1 234 567 8903",
      experience: "8+ años",
      specialty: "Producción Musical",
      social: {
        instagram: "@ana_musica",
        twitter: "@anaproductora"
      }
    },
    {
      id: 4,
      name: "Luis Fernández",
      role: "Director Técnico",
      bio: "Ingeniero de sonido con amplia experiencia, garantiza la mejor calidad de audio en nuestras transmisiones.",
      image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "luis@conexionlatam.com",
      phone: "+1 234 567 8904",
      experience: "10+ años",
      specialty: "Ingeniería de Audio",
      social: {
        instagram: "@luis_tech",
        twitter: "@luisaudio"
      }
    }
  ];

  return (
    <section id="equipo" className="py-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl mb-6 backdrop-blur-sm border border-purple-500/30">
          </div>
          <h2 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6 tracking-tight">
            Nuestro Equipo
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Las <span className="text-purple-400 font-bold">voces</span> y 
            <span className="text-pink-400 font-bold"> talentos</span> que dan vida a 
            <span className="text-cyan-400 font-bold"> Radio Conexión Latam</span>
          </p>
          <div className="mt-8 flex justify-center">
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={member.id}
              className="group relative"
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              {/* Card Container */}
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 transform hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-500/25">
                
                {/* Image Section */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                  
                  {/* Experience Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      <Award className="h-3 w-3 inline mr-1" />
                      {member.experience}
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex space-x-2">
                      {member.social.instagram && (
                        <a 
                          href={`https://instagram.com/${member.social.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 backdrop-blur-sm p-2 rounded-full text-white hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-110"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      )}
                      {member.social.twitter && (
                        <a 
                          href={`https://twitter.com/${member.social.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-blue-600/80 to-cyan-600/80 backdrop-blur-sm p-2 rounded-full text-white hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 transform hover:scale-110"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect Lines */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 space-y-4">
                  {/* Name and Role */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                      {member.name}
                    </h3>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold text-lg">
                      {member.role}
                    </p>
                    <div className="mt-2 text-sm text-cyan-400 font-medium">
                      {member.specialty}
                    </div>
                  </div>
                  
                  {/* Bio */}
                  <p className="text-gray-300 text-sm leading-relaxed text-center">
                    {member.bio}
                  </p>
                  
                  {/* Contact Info - Hidden by default, shown on hover */}
                  <div className="space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
                      <div className="bg-purple-600/20 p-1.5 rounded-full">
                        <Mail className="h-3 w-3 text-purple-400" />
                      </div>
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
                      <div className="bg-pink-600/20 p-1.5 rounded-full">
                        <Phone className="h-3 w-3 text-pink-400" />
                      </div>
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 -left-4 w-4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>

              {/* Floating Number */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}