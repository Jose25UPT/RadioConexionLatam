import React from 'react';
import { Mail, Phone, Instagram, Twitter } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  email: string;
  phone: string;
  social: {
    instagram?: string;
    twitter?: string;
  };
}

export default function Team() {
  const team: TeamMember[] = [
    {
      id: 1,
      name: "María González",
      role: "Directora General",
      bio: "Con más de 15 años de experiencia en radio, María lidera nuestro equipo con pasión y profesionalismo, conectando corazones latinos.",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "maria@conexionlatam.com",
      phone: "+1 234 567 8901",
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
      social: {
        instagram: "@luis_tech",
        twitter: "@luisaudio"
      }
    }
  ];

  return (
    <section id="equipo" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Nuestro Equipo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conoce a las voces y talentos que hacen posible Radio Conexión Latam
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Social Media Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex space-x-2">
                    {member.social.instagram && (
                      <a 
                        href={`https://instagram.com/${member.social.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                    {member.social.twitter && (
                      <a 
                        href={`https://twitter.com/${member.social.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{member.bio}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-500 text-sm">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-500 text-sm">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <Phone className="h-4 w-4 text-pink-600" />
                    </div>
                    <span>{member.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join Team CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">¿Quieres formar parte de nuestro equipo?</h3>
            <p className="text-xl mb-6 text-white/90">
              Estamos siempre buscando talentos apasionados por la radio y la música latina
            </p>
            <button className="bg-white text-purple-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-200">
              Enviar CV
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}