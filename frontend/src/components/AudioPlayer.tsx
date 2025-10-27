import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Heart, Share2, Maximize2, Minimize2, ChevronUp, ChevronDown } from 'lucide-react';

interface AudioPlayerProps {
  onToggleVisibility?: () => void;
}

// Instancia global del audio para que persista entre componentes
let globalAudio: HTMLAudioElement | null = null;

export default function AudioPlayer({ onToggleVisibility }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentShow, setCurrentShow] = useState('Conexión Musical en Vivo');
  const [currentSong, setCurrentSong] = useState('Música Latina - Éxitos del Momento');
  const [listeners, setListeners] = useState(2847);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isHiddenByScroll, setIsHiddenByScroll] = useState(false);
  const [manualCollapsed, setManualCollapsed] = useState(false);
  const lastScroll = useRef<number>(0);
  const scrollDirection = useRef<'up' | 'down' | null>(null);

  // Manejar scroll para ocultar/mostrar barra inferior
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScroll.current;
      if (Math.abs(delta) > 10) { // umbral para evitar ruido
        if (delta > 0) {
          scrollDirection.current = 'down';
          setIsHiddenByScroll(true);
        } else {
          scrollDirection.current = 'up';
          setIsHiddenByScroll(false);
        }
        lastScroll.current = current;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // URLs correctas de Radio Conexión Latam
  const streamUrl = "https://stream-170.zeno.fm/yxynr8zy71zuv?zs=CBt9_4NJR0S-g7RGQMMwYA";
  const metadataUrl = "https://api.zeno.fm/mounts/metadata/subscribe/2t6pyzccd78uv";
  
  // Función para sincronizar el estado con el audio global
  const syncPlayingState = () => {
    if (globalAudio) {
      setIsPlaying(!globalAudio.paused && !globalAudio.ended);
    }
  };

  // Inicializar audio global
  useEffect(() => {
    if (!globalAudio) {
      globalAudio = new Audio(streamUrl);
      globalAudio.volume = volume;
      globalAudio.preload = 'none';
      
      // Event listeners para el audio global
      globalAudio.addEventListener('play', () => {
        console.log('Audio started playing');
        setIsPlaying(true);
      });
      globalAudio.addEventListener('pause', () => {
        console.log('Audio paused');
        setIsPlaying(false);
      });
      globalAudio.addEventListener('ended', () => {
        console.log('Audio ended');
        setIsPlaying(false);
      });
      globalAudio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
      });
      globalAudio.addEventListener('loadstart', () => {
        console.log('Audio loading started');
        syncPlayingState();
      });
      globalAudio.addEventListener('canplay', () => {
        console.log('Audio can play');
        syncPlayingState();
      });
    }
  }, []);

  // Añadir / remover padding inferior global según visibilidad efectiva
  useEffect(() => {
    const body = document.body;
    const visible = !isHiddenByScroll && !manualCollapsed && !isExpanded; // barra inferior visible
    if (visible) {
      body.classList.add('player-visible');
    } else {
      body.classList.remove('player-visible');
    }
    // Si está expandido (modal), no necesitamos padding adicional
    return () => {
      body.classList.remove('player-visible');
    };
  }, [isHiddenByScroll, manualCollapsed, isExpanded]);

  // Sincronizar estado al montar el componente
  useEffect(() => {
    syncPlayingState();
  }, []);

  // Sincronizar volumen y muteo cuando cambien
  useEffect(() => {
    if (globalAudio) {
      globalAudio.volume = volume;
      globalAudio.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Manejar oyentes simulados + metadata en tiempo real
  useEffect(() => {
    // Simular cambios de oyentes cada 5 segundos
    const interval = setInterval(() => {
      setListeners(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    // Escuchar metadata en tiempo real desde Zeno.fm
    const eventSource = new EventSource(metadataUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Metadata received:', data);

        if (data.streamTitle) {
          const cleaned = data.streamTitle.replace(/_/g, ' ').trim();
          setCurrentShow(cleaned);
          console.log('Program updated:', cleaned);
        }

        if (data.artist && data.title) {
          setCurrentSong(`${data.artist} - ${data.title}`);
        } else if (data.title) {
          setCurrentSong(data.title);
        } else if (data.song) {
          setCurrentSong(data.song);
        } else if (data.track) {
          setCurrentSong(data.track);
        }
      } catch (error) {
        console.log('Error parsing metadata:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.log('EventSource error:', error);
      eventSource.close();
    };

    // Limpiar al desmontar
    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  const togglePlay = async () => {
    if (!globalAudio) return;
    
    try {
      if (globalAudio.paused) {
        console.log('Attempting to play audio...');
        await globalAudio.play();
        setIsPlaying(true);
      } else {
        console.log('Pausing audio...');
        globalAudio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  return (
    <>
      {/* Spotify-style Bottom Player Bar */}
      <div
        className={`fixed left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 border-t border-gray-700 shadow-2xl backdrop-blur-lg transition-transform duration-500 ease-out ${
          (isHiddenByScroll || manualCollapsed) ? 'translate-y-full' : 'translate-y-0'
        }`}
        style={{ bottom: 0 }}
      >
        {/* Handle flotante para mostrar cuando está oculto */}
        {(isHiddenByScroll || manualCollapsed) && (
          <button
            className="absolute -top-8 right-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2 rounded-t-xl shadow-lg flex items-center gap-2 border border-gray-700 hover:from-gray-700 hover:to-gray-800 transition"
            onClick={() => { setManualCollapsed(false); setIsHiddenByScroll(false); }}
            aria-label="Mostrar reproductor"
          >
            <ChevronUp className="w-4 h-4" /> Radio
          </button>
        )}
        <div className="max-w-full mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Section - Now Playing Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0 max-w-xs lg:max-w-sm">
              <div className="relative flex-shrink-0">
                <img 
                  src="/logo.jpg" 
                  alt="Radio Conexión Latam" 
                  className="h-12 w-12 lg:h-14 lg:w-14 rounded-lg border border-white/30 shadow-lg"
                />
                {isPlaying && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-gray-900"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm lg:text-base truncate">Radio Conexión Latam</h3>
                <p className="text-gray-300 text-xs lg:text-sm truncate">{currentSong}</p>
                {isPlaying && (
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">EN VIVO</span>
                  </div>
                )}
              </div>
              
              {/* Mini Actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <button className="text-gray-400 hover:text-white transition-colors p-1">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Center Section - Main Controls */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Visualizer for larger screens */}
              {isPlaying && (
                <div className="hidden lg:flex items-center space-x-1">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full audio-wave"
                      style={{
                        height: `${Math.random() * 16 + 8}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
              )}
              
              <button
                onClick={togglePlay}
                className="bg-white hover:bg-gray-100 text-gray-900 p-3 lg:p-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 lg:h-6 lg:w-6" />
                ) : (
                  <Play className="h-5 w-5 lg:h-6 lg:w-6 ml-0.5" />
                )}
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                  title="Expandir"
                >
                  <Maximize2 className="h-4 w-4 lg:h-5 lg:w-5" />
                </button>
                <button
                  onClick={() => setManualCollapsed(true)}
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                  title="Ocultar barra"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Section - Volume & Listeners */}
            <div className="flex items-center space-x-4 flex-1 justify-end min-w-0 max-w-xs lg:max-w-sm">
              {/* Listeners count */}
              <div className="hidden md:flex items-center space-x-2 text-gray-400 text-sm">
                <Radio className="h-4 w-4" />
                <span className="text-xs lg:text-sm">
                  {listeners.toLocaleString()} oyentes
                </span>
              </div>
              
              {/* Volume Control */}
              <div className="hidden lg:flex items-center space-x-3 max-w-32">
                <button 
                  onClick={toggleMute} 
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer dark-slider"
                  />
                  <div 
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg pointer-events-none"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Mobile volume toggle */}
              <button 
                onClick={toggleMute} 
                className="lg:hidden text-gray-400 hover:text-white transition-colors p-2"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Player Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-white">
            {/* Header */}
            <div className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/logo.jpg" 
                      alt="Radio Conexión Latam" 
                      className="h-16 w-16 rounded-xl border-2 border-white/30 shadow-lg"
                    />
                    <div>
                      <h3 className="font-bold text-xl">Radio Conexión</h3>
                      <p className="text-pink-200">LATAM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                      title="Cerrar vista expandida"
                    >
                      <Minimize2 className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => { setIsExpanded(false); setManualCollapsed(true); }}
                      className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                      title="Minimizar barra"
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {isPlaying && (
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full w-fit">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">EN VIVO</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-0">
              {/* Now Playing */}
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold mb-2">{currentShow}</h4>
                <p className="text-white/80 mb-4">{currentSong}</p>
                <div className="flex items-center justify-center space-x-4 text-sm text-white/70">
                  <span className="flex items-center space-x-1">
                    <Radio className="h-4 w-4 text-green-400" />
                    <span>{listeners.toLocaleString()} oyentes</span>
                  </span>
                </div>
              </div>

              {/* Visualizer */}
              {isPlaying && (
                <div className="flex items-center justify-center space-x-1 mb-8">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-pink-400 to-purple-400 rounded-full audio-wave"
                      style={{
                        height: `${Math.random() * 24 + 4}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {/* Main Controls */}
              <div className="flex items-center justify-center space-x-6 mb-6">
                <button className="text-white/80 hover:text-white transition-colors p-2">
                  <Heart className="h-6 w-6" />
                </button>
                
                <button
                  onClick={togglePlay}
                  className="bg-white hover:bg-gray-100 text-gray-900 p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-xl"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </button>
                
                <button className="text-white/80 hover:text-white transition-colors p-2">
                  <Share2 className="h-6 w-6" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleMute} 
                  className="text-white/80 hover:text-white transition-colors p-2"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer dark-slider"
                  />
                  <div 
                    className="absolute top-0 left-0 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg pointer-events-none"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
                
                <span className="text-sm text-white/70 w-8">{Math.round(volume * 100)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}