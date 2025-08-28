import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, MessageCircle, Music } from 'lucide-react';

export default function SocialMedia() {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: <Facebook className="h-6 w-6" />,
      url: 'https://facebook.com/radioconexionlatam',
      color: 'from-blue-600 to-blue-700',
      followers: '45.2K'
    },
    {
      name: 'Instagram',
      icon: <Instagram className="h-6 w-6" />,
      url: 'https://instagram.com/radioconexionlatam',
      color: 'from-pink-500 to-purple-600',
      followers: '32.8K'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="h-6 w-6" />,
      url: 'https://twitter.com/conexionlatam',
      color: 'from-blue-400 to-blue-500',
      followers: '28.5K'
    },
    {
      name: 'YouTube',
      icon: <Youtube className="h-6 w-6" />,
      url: 'https://youtube.com/@radioconexionlatam',
      color: 'from-red-500 to-red-600',
      followers: '15.3K'
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="h-6 w-6" />,
      url: 'https://wa.me/5255123456789',
      color: 'from-green-500 to-green-600',
      followers: 'Chat'
    },
    {
      name: 'TikTok',
      icon: <Music className="h-6 w-6" />,
      url: 'https://tiktok.com/@radioconexionlatam',
      color: 'from-gray-800 to-gray-900',
      followers: '22.1K'
    }
  ];

  return (
    <section id="redes" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Síguenos en Redes Sociales
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mantente conectado con nosotros en todas nuestras plataformas digitales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100"
            >
              <div className={`bg-gradient-to-br ${social.color} p-8 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{social.followers}</div>
                      <div className="text-white/80 text-sm">seguidores</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{social.name}</h3>
                  <p className="text-white/90">@radioconexionlatam</p>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Síguenos para contenido exclusivo, música en vivo y las últimas noticias de la radio.
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-purple-600 font-semibold group-hover:text-pink-600 transition-colors">
                    Seguir ahora
                  </span>
                  <svg className="h-5 w-5 text-purple-600 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Social Feed Preview */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Últimas Publicaciones
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram Post */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-lg">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Instagram</h4>
                  <p className="text-gray-500 text-sm">Hace 2 horas</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                🎵 ¡Ahora suena en vivo! Los mejores éxitos latinos para acompañar tu tarde. 
                #RadioConexionLatam #MusicaLatina
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>❤️ 234</span>
                <span>💬 18</span>
                <span>📤 12</span>
              </div>
            </div>

            {/* Twitter Post */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-2 rounded-lg">
                  <Twitter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Twitter</h4>
                  <p className="text-gray-500 text-sm">Hace 4 horas</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                🔴 EN VIVO: Entrevista exclusiva con @ArtistLatino sobre su nuevo álbum. 
                ¡No te lo pierdas! 🎤✨
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>🔄 45</span>
                <span>❤️ 128</span>
                <span>💬 23</span>
              </div>
            </div>

            {/* Facebook Post */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Facebook</h4>
                  <p className="text-gray-500 text-sm">Hace 6 horas</p>
                </div>
              </div>
              <p className="text-gray-700 mb-3">
                📻 ¡Gracias por acompañarnos cada día! Somos la radio #1 en música latina. 
                Tu apoyo nos motiva a seguir conectando corazones. 💜
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>👍 89</span>
                <span>💬 34</span>
                <span>📤 21</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}