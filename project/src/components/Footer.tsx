import React from 'react';
import { Radio, Facebook, Twitter, Instagram, Youtube, Heart, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <img 
                src="/logo.jpg" 
                alt="Radio Conexión Latam" 
                className="h-16 w-16 rounded-xl border-2 border-white/20"
              />
              <div>
                <h3 className="text-3xl font-bold">Radio Conexión</h3>
                <p className="text-pink-300 text-lg">LATAM</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-8 text-lg">
              Conectando corazones latinos a través de la música desde hace más de 8 años. 
              Tu estación favorita que une culturas, emociones y ritmos en una sola frecuencia.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4 mb-8">
              <a href="#" className="bg-white/10 hover:bg-pink-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-pink-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-pink-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-pink-600 p-3 rounded-full transition-all duration-300 transform hover:scale-110">
                <Youtube className="h-6 w-6" />
              </a>
            </div>

            {/* Live Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">EN VIVO</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Headphones className="h-4 w-4" />
                  <span>2,847 oyentes conectados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-pink-300">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li><a href="#inicio" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                <span>→</span><span>Inicio</span>
              </a></li>
              <li><a href="#programas" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                <span>→</span><span>Programas</span>
              </a></li>
              <li><a href="#noticias" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                <span>→</span><span>Noticias</span>
              </a></li>
              <li><a href="#equipo" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                <span>→</span><span>Equipo</span>
              </a></li>
              <li><a href="#contacto" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                <span>→</span><span>Contacto</span>
              </a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-6 text-pink-300">Contacto</h4>
            <div className="space-y-4 text-gray-300">
              <div>
                <p className="font-semibold text-white mb-1">Dirección</p>
                <p>Av. Conexión Latina 123</p>
                <p>Ciudad de México, México</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Teléfono</p>
                <p>+52 (55) 1234-5678</p>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Email</p>
                <p>info@conexionlatam.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <p className="text-gray-400">
                © 2024 Radio Conexión Latam. Todos los derechos reservados.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400">
              <span>Hecho con</span>
              <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
              <span>para la comunidad latina</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">
              Transmitiendo desde México para toda Latinoamérica • Licencia de radiodifusión #LAT-2024-001
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}