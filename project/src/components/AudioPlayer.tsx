import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Heart, Share2, Maximize2, Minimize2 } from 'lucide-react';

interface AudioPlayerProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

// Instancia global del audio para que persista entre componentes
let globalAudio: HTMLAudioElement | null = null;

export default function AudioPlayer({ isVisible, onToggleVisibility }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentShow, setCurrentShow] = useState('Conexión Musical en Vivo');
  const [currentSong, setCurrentSong] = useState('Música Latina - Éxitos del Momento');
  const [listeners, setListeners] = useState(2847);
  const audioRef = useRef<HTMLAudioElement>(null);

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

   // Asignar ref local al audio global
  if (audioRef.current) {
    audioRef.current = globalAudio;
  }

  // No limpiamos porque queremos que globalAudio persista
}, []);

// Cuando el componente se vuelve visible, sincroniza estado
useEffect(() => {
  if (isVisible) {
    syncPlayingState();
  }
}, [isVisible]);

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

  // No mostrar nada si no es visible
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Mobile Player - Bottom Fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="p-2">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl shadow-xl overflow-hidden">
            {/* Contenido compacto */}
            <div className="p-3">
              <div className="flex items-center space-x-3">
                {/* Logo pequeño */}
                <div className="relative flex-shrink-0">
                  <img 
                    src="/logo.jpg" 
                    alt="Radio Conexión Latam" 
                    className="h-10 w-10 rounded-lg border border-white/30"
                  />
                  {isPlaying && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {/* Info del programa */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">Radio Conexión Latam</h3>
                  <p className="text-white/80 text-xs truncate">{currentSong}</p>
                  {isPlaying && (
                    <div className="flex items-center space-x-1 mt-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white/90 text-xs font-medium">EN VIVO</span>
                    </div>
                  )}
                </div>
                
                {/* Controles principales */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={togglePlay}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2.5 rounded-xl transition-all duration-300 border border-white/30"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white ml-0.5" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Player - Top Right */}
      <div className="fixed top-24 right-6 z-40 hidden md:block">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200/50 p-6 min-w-[380px] max-w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                {isPlaying && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Radio Conexión Latam</h3>
                {isPlaying && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-pink-600">EN VIVO</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setIsExpanded(true)}
              className="text-gray-600 hover:text-purple-600 p-2 rounded-lg hover:bg-purple-50 transition-all"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>

          {/* Now Playing */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{currentShow}</h4>
            <p className="text-gray-600 text-xs truncate">{currentSong}</p>
          </div>

          {/* Visualizer */}
          {isPlaying && (
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-full audio-wave"
                  style={{
                    height: `${Math.random() * 16 + 4}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <button className="text-gray-600 hover:text-pink-600 transition-colors p-2">
              <Heart className="h-5 w-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-xl"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white ml-0.5" />
              )}
            </button>
            
            <button className="text-gray-600 hover:text-pink-600 transition-colors p-2">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleMute} 
              className="text-gray-600 hover:text-purple-600 transition-colors"
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div 
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg pointer-events-none"
                style={{ width: `${volume * 100}%` }}
              ></div>
            </div>
            
            <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}</span>
          </div>

          {/* Listeners Count */}
          <div className="mt-4 text-center">
            <span className="text-xs text-gray-500">
              🎧 {listeners.toLocaleString()} oyentes conectados
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Player Modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-white">
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
                      className="h-16 w-16 rounded-xl border-2 border-white/30"
                    />
                    <div>
                      <h3 className="font-bold text-xl">Radio Conexión</h3>
                      <p className="text-pink-200">LATAM</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <Minimize2 className="h-6 w-6" />
                  </button>
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
                    <Heart className="h-4 w-4 text-pink-400" />
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
                      className="w-1 bg-gradient-to-t from-pink-400 to-orange-400 rounded-full audio-wave"
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
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-xl"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-white" />
                  ) : (
                    <Play className="h-8 w-8 text-white ml-1" />
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
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div 
                    className="absolute top-0 left-0 h-2 bg-gradient-to-r from-pink-400 to-orange-400 rounded-lg pointer-events-none"
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