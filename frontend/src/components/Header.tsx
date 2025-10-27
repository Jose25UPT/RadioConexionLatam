import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PANEL_LOGIN, PANEL_BASE } from '../secure_panel_rva_gestor_2025/secureRoute';
import { getToken, clearAuth } from '../secure_panel_rva_gestor_2025/auth';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export default function Header({ isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isAuth = !!getToken();
  const isAdmin = (localStorage.getItem('user_role') || '').toUpperCase() === 'ADMIN';
  const handleLogout = () => { clearAuth(); navigate('/'); };
  
  const navItems = [
    { name: 'Inicio', href: isHomePage ? '#inicio' : '/', type: 'link' },
    { name: 'Programas', href: isHomePage ? '#programas' : '/#programas', type: isHomePage ? 'anchor' : 'link' },
    { name: 'Noticias', href: '/noticias', type: 'link' },
    { name: 'Redes Sociales', href: isHomePage ? '#redes' : '/#redes', type: isHomePage ? 'anchor' : 'link' },
    { name: 'Equipo', href: isHomePage ? '#equipo' : '/#equipo', type: isHomePage ? 'anchor' : 'link' },
    { name: 'Contacto', href: isHomePage ? '#contacto' : '/#contacto', type: isHomePage ? 'anchor' : 'link' }
  ];

  return (
    <header className="bg-gradient-to-r from-purple-900 via-purple-800 to-pink-600 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-4">
          {/* Logo - Far Left */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="relative">
              <img 
                src="/logo.jpg" 
                alt="Radio Conexión Latam" 
                className="h-14 w-14 rounded-xl shadow-lg border-2 border-white/20"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Radio Conexión
                <span className="block text-pink-300 text-sm md:text-base">LATAM</span>
              </h1>
            </div>
          </Link>

          {/* Spacer to push navigation to the right */}
          <div className="flex-1"></div>

          {/* Desktop Navigation - Far Right */}
          <nav className="hidden lg:flex space-x-8 xl:space-x-10 items-center">
            {navItems.map((item) => (
              item.type === 'link' ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white hover:text-pink-300 transition-all duration-300 font-medium text-base xl:text-lg relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-orange-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-pink-300 transition-all duration-300 font-medium text-base xl:text-lg relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-orange-400 group-hover:w-full transition-all duration-300"></span>
                </a>
              )
            ))}
            {/* Auth actions */}
            {isAuth ? (
              <>
                {isAdmin && (
                  <Link to={`${PANEL_BASE}/admin`} className="ml-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 7.292M15 21H3a2 2 0 01-2-2V7a2 2 0 012-2h3m12 0h3a2 2 0 012 2v4M7 7h10v10H7V7z" /></svg>
                    <span>Admin</span>
                  </Link>
                )}
                <Link to={PANEL_BASE} className="ml-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4" /></svg>
                  <span>Panel</span>
                </Link>
                <button onClick={handleLogout} className="ml-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <Link to={PANEL_LOGIN} className="ml-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l4-4m-4 4l4 4m13-4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile menu button - Far Right */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white hover:text-pink-300 transition-colors p-2 rounded-lg hover:bg-white/10 ml-4"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                item.type === 'link' ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-white hover:text-pink-300 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white hover:text-pink-300 transition-colors duration-200 py-3 px-4 rounded-lg hover:bg-white/10 backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              ))}
              {/* Auth actions mobile */}
              {isAuth ? (
                <>
                  {isAdmin && (
                    <Link to={`${PANEL_BASE}/admin`} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 7.292M15 21H3a2 2 0 01-2-2V7a2 2 0 012-2h3m12 0h3a2 2 0 012 2v4M7 7h10v10H7V7z" /></svg>
                      <span>Admin</span>
                    </Link>
                  )}
                  <Link to={PANEL_BASE} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4" /></svg>
                    <span>Panel</span>
                  </Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <Link to={PANEL_LOGIN} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l4-4m-4 4l4 4m13-4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Login</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}