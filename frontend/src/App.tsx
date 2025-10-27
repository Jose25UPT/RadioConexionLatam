import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Programs from './components/Programs';
import News from './components/News';
import NewsDetailModern from './components/NewsDetailModern';
import AllNewsModern from './components/AllNewsModern';
import SocialMedia from './components/SocialMedia';
import Team from './components/Team';

import Footer from './components/Footer';
import AudioPlayer from './components/AudioPlayer';
import SocialFloating from './components/SocialFloating';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Nota: con moduleResolution "bundler" a veces ayuda incluir la extensión
import ScrollToTop from './components/ScrollToTop.tsx';

// Importamos componentes del administrador
import PanelAdministrador from './secure_panel_rva_gestor_2025/PanelAdministrador';
import EditarNoticia from './secure_panel_rva_gestor_2025/EditarNoticia';
import AgregarNoticia from './secure_panel_rva_gestor_2025/AgregarNoticia';
import LoginPanel from './secure_panel_rva_gestor_2025/Login';
import AdminDashboard from './secure_panel_rva_gestor_2025/AdminDashboard';
import { PANEL_BASE, PANEL_LOGIN } from './secure_panel_rva_gestor_2025/secureRoute';
import { RequireAuth } from './secure_panel_rva_gestor_2025/auth';
import MiPerfil from './secure_panel_rva_gestor_2025/MiPerfil';

const AuthWrapper = ({ children, roles }: { children: React.ReactNode, roles?: any }) => (
  <RequireAuth roles={roles}>{children}</RequireAuth>
);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePlayLive = () => {
    // Función para reproducir en vivo
  };

  const handleTogglePlayerVisibility = () => {
    // Función para alternar visibilidad del reproductor
  };

  // Agrega clase al body para el espacio del reproductor
  useEffect(() => {
    // Siempre agregar la clase porque el reproductor siempre está visible
    document.body.classList.add('player-visible');
    return () => {
      document.body.classList.remove('player-visible');
    };
  }, []);

  // Enrutamiento con react-router-dom
  return (
    <Router>
      {/* Forzar scroll al inicio en cada cambio de ruta */}
      <ScrollToTop />
      <Routes>
  <Route path={PANEL_LOGIN} element={<LoginPanel />} />
        <Route 
          path={`${PANEL_BASE}/admin`} 
          element={
            <RequireAuth roles={["ADMIN"]}>
              <div className="min-h-screen bg-white">
                <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                <AdminDashboard />
                <Footer />
                <AudioPlayer onToggleVisibility={handleTogglePlayerVisibility} />
              </div>
            </RequireAuth>
          }
        />
        <Route 
          path={PANEL_BASE} 
          element={
            <AuthWrapper roles={["ADMIN","EDITOR"]}>
              <div className="min-h-screen bg-white">
                <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                <PanelAdministrador />
                <Footer />
                <AudioPlayer onToggleVisibility={handleTogglePlayerVisibility} />
              </div>
            </AuthWrapper>
          }
        />
        <Route 
          path={`${PANEL_BASE}/editar/:id`} 
          element={
            <AuthWrapper roles={["ADMIN","EDITOR","REDACTOR"]}>
              <div className="min-h-screen bg-white">
                <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                <EditarNoticia />
                <Footer />
                <AudioPlayer onToggleVisibility={handleTogglePlayerVisibility} />
              </div>
            </AuthWrapper>
          }
        />
        <Route 
          path={`${PANEL_BASE}/agregar`} 
          element={
            <AuthWrapper roles={["ADMIN","EDITOR"]}>
              <div className="min-h-screen bg-white">
                <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                <AgregarNoticia />
                <Footer />
                <AudioPlayer onToggleVisibility={handleTogglePlayerVisibility} />
              </div>
            </AuthWrapper>
          }
        />

        {/* Ruta para gestionar perfil del autor/editor */}
        <Route 
          path={`${PANEL_BASE}/mi-perfil`} 
          element={
            <AuthWrapper roles={["ADMIN","EDITOR"]}>
              <div className="min-h-screen bg-white">
                <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
                <MiPerfil />
                <Footer />
                <AudioPlayer onToggleVisibility={handleTogglePlayerVisibility} />
              </div>
            </AuthWrapper>
          }
        />
        
        {/* Ruta para todas las noticias */}
        <Route 
          path="/noticias" 
          element={
            <div className="min-h-screen bg-white">
              <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
              <AllNewsModern />
              <Footer />
              <AudioPlayer
                onToggleVisibility={handleTogglePlayerVisibility}
              />
            </div>
          } 
        />

        {/* Ruta para detalle de noticia con slug */}
        <Route 
          path="/noticia/:slug" 
          element={
            <div className="min-h-screen bg-white">
              <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
              <NewsDetailModern />
              <Footer />
              <AudioPlayer
                onToggleVisibility={handleTogglePlayerVisibility}
              />
            </div>
          } 
        />

        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white">
              <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
              <Hero onPlayLive={handlePlayLive} />
              <Programs />
              <News />
              <SocialMedia />
              <Team />
              <Footer />
              <AudioPlayer
                onToggleVisibility={handleTogglePlayerVisibility}
              />
            </div>
          }
        />
      </Routes>
      {/* Floating social buttons (global) */}
      <SocialFloating />
    </Router>
  );
}

export default App;
