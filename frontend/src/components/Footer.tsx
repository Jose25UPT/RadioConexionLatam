import { Headphones } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaSpotify, FaYoutube } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';

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

          {/* Redes Oficiales (con recuadro e ícono a color) y contactos comentados */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-pink-300">Redes Oficiales</h4>
            <ul className="grid grid-cols-3 gap-3 mb-6">
              <li>
                <a
                  href="https://www.youtube.com/channel/UCCVlwnb2MW6nnhGVYr7vHVg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1 bg-white/10 hover:bg-red-600/80 rounded-xl px-3 py-3 transition-all"
                  aria-label="YouTube"
                >
                  <FaYoutube className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-medium text-white/70 group-hover:text-white">YouTube</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@radioconexion_latam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1 bg-white/10 hover:bg-black rounded-xl px-3 py-3 transition-all"
                  aria-label="TikTok"
                >
                  <FaTiktok className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium text-white/70 group-hover:text-white">TikTok</span>
                </a>
              </li>
              <li>
                <a
                  href="https://open.spotify.com/show/2QIEylnlbAahByrVqbwjhx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1 bg-white/10 hover:bg-[#1DB954] rounded-xl px-3 py-3 transition-all"
                  aria-label="Spotify"
                >
                  <FaSpotify className="w-5 h-5 text-[#1DB954] group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-medium text-white/70 group-hover:text-white">Spotify</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/radioconexionLATAM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1 bg-white/10 hover:bg-[#1877F2] rounded-xl px-3 py-3 transition-all"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="w-5 h-5 text-[#1877F2] group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-medium text-white/70 group-hover:text-white">Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/radioconexion_latam/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1 bg-white/10 hover:from-pink-500 hover:to-purple-600 hover:bg-gradient-to-br rounded-xl px-3 py-3 transition-all"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-5 h-5 text-pink-400 group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-medium text-white/70 group-hover:text-white">Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/RConexion_LATAM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1 bg-white/10 hover:bg-black rounded-xl px-3 py-3 transition-all"
                  aria-label="X"
                >
                  <FaXTwitter className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium text-white/70 group-hover:text-white">X / Twitter</span>
                </a>
              </li>
            </ul>
            {/* Datos de contacto comentados para futura activación */}
            {/**
            <div className="text-gray-300 text-sm space-y-1">
              <p>📧 {import.meta.env.VITE_CONTACT_EMAIL || 'info@conexionlatam.com'}</p>
              <p>📞 {import.meta.env.VITE_CONTACT_PHONE || '+52 (55) 1234-5678'}</p>
            </div>
            */}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-6 pt-6">
          <div className="text-center text-sm text-gray-400 space-y-1">
            <p className="font-extrabold text-base tracking-wide text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.55)] brightness-125">
              Varnox Tech.
            </p>
              <p className="flex items-center justify-center gap-2">
                © 2025 Todos los derechos reservados.
                <img
                  src="/logovarnox.png"
                  alt="Varnox Tech"
                  className="h-4 w-auto opacity-80"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              </p>
          </div>
        </div>
      </div>
    </footer>
  );
}