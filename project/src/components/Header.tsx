import React from 'react';
import { Radio, Menu, X, Headphones, Mic } from 'lucide-react';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export default function Header({ isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const navItems = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Programas', href: '#programas' },
    { name: 'Noticias', href: '#noticias' },
    { name: 'Redes Sociales', href: '#redes' },
    { name: 'En Vivo', href: '#envivo' },
    { name: 'Equipo', href: '#equipo' },
    { name: 'Contacto', href: '#contacto' }
  ];

  return (
    <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-600 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src="/logo.jpg" 
                alt="Radio Conexión Latam" 
                className="h-16 w-16 rounded-xl shadow-lg border-2 border-white/20"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Radio Conexión
                <span className="block text-pink-300 text-lg">LATAM</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white hover:text-pink-300 transition-all duration-300 font-medium text-lg relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-orange-400 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Live Indicator */}
          <div className="hidden md:flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">EN VIVO</span>
            <Headphones className="h-5 w-5 text-pink-300" />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white hover:text-pink-300 transition-colors p-2"
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-pink-300 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}