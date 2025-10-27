import React from 'react';
import { Facebook, Instagram, Youtube, Headphones } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-purple-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.jpg" 
                alt="Radio Conexión Latam" 
                className="h-12 w-12 rounded-lg border border-white/20"
              />
              <div>
                <h3 className="text-xl font-bold">Radio Conexión</h3>
                <p className="text-pink-300 text-sm">LATAM</p>
              </div>
            </div>
            
            {/* Live Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                <span className="font-medium">EN VIVO</span>
                <Headphones className="h-3 w-3" />
                <span>2,847 oyentes</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-pink-300">Enlaces</h4>
            <div className="grid grid-cols-2 gap-2">
              <a href="#inicio" className="text-gray-300 hover:text-white transition-colors text-sm">Inicio</a>
              <a href="#programas" className="text-gray-300 hover:text-white transition-colors text-sm">Programas</a>
              <a href="#noticias" className="text-gray-300 hover:text-white transition-colors text-sm">Noticias</a>
              <a href="#equipo" className="text-gray-300 hover:text-white transition-colors text-sm">Equipo</a>
              <a href="#contacto" className="text-gray-300 hover:text-white transition-colors text-sm">Contacto</a>
            </div>
          </div>

          {/* Contact and Social */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-pink-300">Síguenos</h4>
            
            {/* Social Media */}
            <div className="flex space-x-3 mb-4">
              <a href="#" className="bg-white/10 hover:bg-pink-600 p-2 rounded-lg transition-all duration-300">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-pink-600 p-2 rounded-lg transition-all duration-300">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-pink-600 p-2 rounded-lg transition-all duration-300">
                <Youtube className="h-4 w-4" />
              </a>
            </div>

            <div className="text-gray-300 text-sm space-y-1">
              <p>📧 info@conexionlatam.com</p>
              <p>📞 +52 (55) 1234-5678</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-6 pt-6">
          <div className="text-center text-sm text-gray-400 space-y-1">
            <p className="font-semibold text-base tracking-wide">Varnox Tech.</p>
            <p>© 2025 Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}