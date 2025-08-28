import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Programs from './components/Programs';
import News from './components/News';
import NewsDetail from './components/NewsDetail';
import SocialMedia from './components/SocialMedia';
import Team from './components/Team';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AudioPlayer from './components/AudioPlayer';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos componentes del administrador
import PanelAdministrador from './admin/PanelAdministrador';
import EditarNoticia from './admin/EditarNoticia';
import AgregarNoticia from './admin/AgregarNoticia';

interface NewsItem {
  id: number;
  titulo: string;
  resumen: string;
  contenido: string;
  autor: string;
  fecha: string;
  imagen: string;
  categoria: string;
  vistas: number;
  destacada: boolean;
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const handleNewsClick = (news: NewsItem) => {
    setSelectedNews(news);
  };

  const handleBackToNews = () => {
    setSelectedNews(null);
  };

  const handlePlayLive = () => {
    setIsPlayerVisible(true);
  };

  const handleTogglePlayerVisibility = () => {
    setIsPlayerVisible(true);
  };

  // Agrega clase al body si el reproductor está visible
  useEffect(() => {
    if (isPlayerVisible) {
      document.body.classList.add('player-visible');
    } else {
      document.body.classList.remove('player-visible');
    }
    return () => {
      document.body.classList.remove('player-visible');
    };
  }, [isPlayerVisible]);

  // Si una noticia está seleccionada, mostrar detalle
  if (selectedNews) {
    return (
      <div className="min-h-screen bg-white">
        <NewsDetail news={selectedNews} onBack={handleBackToNews} />
        <AudioPlayer
          isVisible={isPlayerVisible}
          onToggleVisibility={handleTogglePlayerVisibility}
        />
      </div>
    );
  }

  // Enrutamiento con react-router-dom
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<PanelAdministrador />} />
        <Route path="/admin/editar/:id" element={<EditarNoticia />} />
        <Route path="/admin/agregar" element={<AgregarNoticia />} />

        <Route
          path="/"
          element={
            <div className="min-h-screen bg-white">
              <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
              <Hero onPlayLive={handlePlayLive} />
              <Programs />
              <News onNewsClick={handleNewsClick} />
              <SocialMedia />
              <Team />
              <Contact />
              <Footer />
              <AudioPlayer
                isVisible={isPlayerVisible}
                onToggleVisibility={handleTogglePlayerVisibility}
              />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
