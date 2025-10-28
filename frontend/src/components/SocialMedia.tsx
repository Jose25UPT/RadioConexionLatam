import { useEffect, useState } from 'react';
import { Facebook, Instagram, Music } from 'lucide-react';
import DeviceFrame from './DeviceFrame';

export default function SocialMedia() {
  // Sólo mostraremos 3 previsualizaciones: Facebook, Instagram y Spotify
  const cardStyle = (import.meta as any).env?.VITE_SOCIAL_CARD_STYLE || 'iphone'; // 'solid' | 'glass' | 'neon' | 'aurora' | 'iphone'
    const cardBase =
      cardStyle === 'glass'
      ? 'relative group rounded-2xl overflow-hidden border border-white/20 bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition duration-300 hover:-translate-y-[2px]'
      : cardStyle === 'neon'
      ? 'relative group rounded-2xl overflow-hidden border border-amber-300/30 bg-stone-900 text-white shadow-[0_0_30px_rgba(255,200,0,0.15)] hover:shadow-[0_0_45px_rgba(255,200,0,0.3)] transition duration-300 hover:-translate-y-[2px]'
        : cardStyle === 'aurora'
        ? 'relative group rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-1'
  : 'bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition duration-200';
  const headerBase =
      cardStyle === 'glass'
      ? 'p-4 flex items-center justify-between border-b border-white/30 bg-gradient-to-r from-white/70 to-white/30'
      : cardStyle === 'neon'
      ? 'p-4 flex items-center justify-between border-b border-amber-300/30 bg-gradient-to-r from-amber-500/10 to-pink-500/10'
        : cardStyle === 'aurora'
        ? 'p-4 flex items-center justify-between border-b border-white/20 bg-white/10'
      : 'p-4 flex items-center justify-between border-b border-gray-100';
  const facebookPage = (import.meta as any).env?.VITE_FACEBOOK_PAGE || 'https://www.facebook.com/radioconexionlatam';
  const facebookMode = (import.meta as any).env?.VITE_FACEBOOK_MODE || 'page'; // 'page' | 'video'
  const facebookVideoUrl = (import.meta as any).env?.VITE_FACEBOOK_VIDEO_URL || '';
  const instagramPage = (import.meta as any).env?.VITE_INSTAGRAM_PAGE || 'https://www.instagram.com/radioconexion_latam';
  // Modo de visualización: 'embeds' (por defecto) o 'profile' (solo tarjeta con botón)
  const instagramMode = (import.meta as any).env?.VITE_INSTAGRAM_MODE || 'embeds';
  const spotifyUrl = (import.meta as any).env?.VITE_SPOTIFY_URL || 'https://open.spotify.com';
  const spotifyEmbed = (import.meta as any).env?.VITE_SPOTIFY_EMBED || '';
  const instagramEmbedsRaw = (import.meta as any).env?.VITE_INSTAGRAM_EMBEDS || '';
  const instagramEmbeds = instagramEmbedsRaw ? instagramEmbedsRaw.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
  const showEmbeds = instagramMode !== 'profile' && instagramEmbeds.length > 0;

  const followers = {
    facebook: '45.2K',
    instagram: '32.8K',
    spotify: '—'
  };

  const renderFacebook = () => (
    <>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Facebook className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">Facebook</div>
            <div className="text-xs text-stone-500">{followers.facebook} seguidores</div>
          </div>
        </div>
        <a href={facebookPage} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm shadow hover:brightness-110">Abrir</a>
      </div>
      <div className="mx-3 mb-4 rounded-2xl overflow-hidden ring-1 ring-black/10 h-[560px] bg-white">
        {facebookMode === 'video' && facebookVideoUrl ? (
          <iframe
            title="Facebook Video"
            src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookVideoUrl)}&autoplay=1&mute=1&show_text=false&width=360&height=560`}
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder={0}
            allowFullScreen={true}
            allow="autoplay; encrypted-media; clipboard-write; picture-in-picture; web-share"
            className="w-full h-full"
          />
        ) : (
          <iframe
            title="Facebook Page"
            src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebookPage)}&tabs=timeline&width=360&height=560&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=`}
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder={0}
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            className="w-full h-full"
          />
        )}
      </div>
    </>
  );

  const renderInstagram = () => (
    <>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">Instagram</div>
            <div className="text-xs text-stone-500">{followers.instagram} seguidores</div>
          </div>
        </div>
        <a href={instagramPage} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm shadow hover:brightness-110">Abrir</a>
      </div>
      <div className="mx-3 mb-4 rounded-2xl overflow-hidden ring-1 ring-black/10 h-[560px] bg-gray-50">
        {showEmbeds ? (
          <div className="h-full overflow-auto">
            {instagramEmbeds.slice(0, 4).map((url: string, idx: number) => (
              <InstaEmbed key={idx} url={url} idx={idx} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-sm text-stone-700">
            <p className="font-semibold mb-2">Instagram</p>
            <p className="text-xs mb-3 px-6 text-center">Vista previa del perfil disponible. Pulsa el botón para abrir el perfil oficial.</p>
            <a href={instagramPage} target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-br from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm">Abrir Instagram</a>
          </div>
        )}
      </div>
    </>
  );

  const renderSpotify = () => (
    <>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold">Spotify</div>
            <div className="text-xs text-stone-500">Podcast / Episodios</div>
          </div>
        </div>
        <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm shadow hover:brightness-110">Abrir</a>
      </div>
      <div className="mx-3 mb-4 rounded-2xl overflow-hidden ring-1 ring-black/10 h-[560px] bg-white">
        {spotifyEmbed ? (
          <SpotifyEmbed embedUrl={spotifyEmbed} openUrl={spotifyUrl} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-stone-700">
            <div>
              <p className="font-semibold mb-2">Vista previa no disponible</p>
              <p className="text-xs mb-3 text-center px-6">Configura VITE_SPOTIFY_EMBED en tu .env para ver una previsualización embebida.</p>
              <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Abrir Spotify</a>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <section id="redes" className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Redes Sociales
          </h2>
         
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Facebook preview */}
          {cardStyle === 'iphone' ? (
            <DeviceFrame gradient="blue">{renderFacebook()}</DeviceFrame>
          ) : (
          <div className={cardBase}>
            {cardStyle === 'aurora' && (
              <div className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="aurora-layer" />
              </div>
            )}
            <div className={headerBase}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm transform group-hover:scale-110 group-hover:rotate-1 transition">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Facebook</div>
                  <div className="text-xs text-stone-500">{followers.facebook} seguidores</div>
                </div>
              </div>
              <a href={facebookPage} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm shadow hover:brightness-110 neon-ring">Abrir</a>
            </div>
            <div className="w-full h-72 bg-gradient-to-b from-white/60 to-gray-50">
              {facebookMode === 'video' && facebookVideoUrl ? (
                <iframe
                  title="Facebook Video"
                  src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookVideoUrl)}&autoplay=1&mute=1&show_text=false&width=360&height=300`}
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder={0}
                  allowFullScreen={true}
                  allow="autoplay; encrypted-media; clipboard-write; picture-in-picture; web-share"
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  title="Facebook Page"
                  src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebookPage)}&tabs=timeline&width=360&height=300&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=`}
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder={0}
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
          )}

          {/* Instagram preview */}
          {cardStyle === 'iphone' ? (
            <DeviceFrame gradient="purple">{renderInstagram()}</DeviceFrame>
          ) : (
          <div className={cardBase}>
            {cardStyle === 'aurora' && (
              <div className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="aurora-layer" />
              </div>
            )}
            <div className={headerBase}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-md flex items-center justify-center text-white shadow-sm transform group-hover:scale-110 group-hover:-rotate-1 transition">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Instagram</div>
                  <div className="text-xs text-stone-500">{followers.instagram} seguidores</div>
                </div>
              </div>
              <a href={instagramPage} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm shadow hover:brightness-110 neon-ring">Abrir</a>
            </div>
            <div className="p-3">
              {showEmbeds ? (
                <div className="space-y-3">
                  {instagramEmbeds.slice(0, 3).map((url: string, idx: number) => (
                    <div key={idx} className="w-full h-44 bg-gray-50 overflow-hidden rounded-xl ring-1 ring-stone-200/50 group-hover:ring-pink-300/40 transition">
                      <iframe
                        title={`Instagram ${idx}`}
                        src={url}
                        style={{ border: 'none', overflow: 'hidden' }}
                        scrolling="no"
                        frameBorder={0}
                        allow="encrypted-media; autoplay; clipboard-write"
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-sm text-stone-700 bg-gray-50 rounded-md">
                  <p className="font-semibold mb-2">Instagram</p>
                  <p className="text-xs mb-3">Vista previa del perfil disponible. Pulsa el botón para abrir el perfil oficial.</p>
                  <a href={instagramPage} target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-br from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm">Abrir Instagram</a>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Spotify preview */}
          {cardStyle === 'iphone' ? (
            <DeviceFrame gradient="green">{renderSpotify()}</DeviceFrame>
          ) : (
          <div className={cardBase}>
            {cardStyle === 'aurora' && (
              <div className="pointer-events-none absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="aurora-layer" />
              </div>
            )}
            <div className={headerBase}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center text-white shadow-sm transform group-hover:scale-110 group-hover:rotate-1 transition">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Spotify</div>
                  <div className="text-xs text-stone-500">Podcast / Episodios</div>
                </div>
              </div>
              <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm shadow hover:brightness-110 neon-ring">Abrir</a>
            </div>
            <div className="w-full h-72 bg-gradient-to-b from-white/60 to-gray-50">
              {spotifyEmbed ? (
                <iframe
                  title="Spotify Preview"
                  src={spotifyEmbed}
                  width="100%"
                  height="100%"
                  frameBorder={0}
                  allow="encrypted-media; autoplay; clipboard-write"
                  className="w-full h-full"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-stone-700">
                  <div>
                    <p className="font-semibold mb-2">Vista previa no disponible</p>
                    <p className="text-xs mb-3">Configura VITE_SPOTIFY_EMBED en tu .env para ver una previsualización embebida.</p>
                    <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Abrir Spotify</a>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  );
}

// --- Subcomponentes de ayuda ---

function InstaEmbed({ url, idx }: { url: string; idx: number }) {
  const [key, setKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setTimedOut(false);
    const t = setTimeout(() => {
      if (!loaded) setTimedOut(true);
    }, 7000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, url]);

  const openPost = url.replace('/embed', '/');

  return (
    <div className="relative w-full h-64 bg-gray-50 overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-600">
          Cargando publicación…
        </div>
      )}
      {timedOut && !loaded && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3 text-center">
          <p className="text-sm font-medium">No se pudo cargar la vista previa</p>
          <div className="flex gap-2">
            <button onClick={() => setKey(k => k + 1)} className="px-3 py-1.5 rounded-md bg-stone-900 text-white text-xs">Reintentar</button>
            <a href={openPost} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-md bg-gradient-to-br from-pink-500 to-purple-600 text-white text-xs">Abrir publicación</a>
          </div>
        </div>
      )}
      <iframe
        key={key}
        title={`Instagram ${idx}`}
        src={url}
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder={0}
        loading="lazy"
        allow="encrypted-media; autoplay; clipboard-write"
        className="w-full h-full"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function SpotifyEmbed({ embedUrl, openUrl }: { embedUrl: string; openUrl: string }) {
  const [key, setKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setTimedOut(false);
    const t = setTimeout(() => {
      if (!loaded) setTimedOut(true);
    }, 7000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, embedUrl]);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-600">
          Cargando Spotify…
        </div>
      )}
      {timedOut && !loaded && (
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-3 text-center">
          <p className="text-sm font-medium">No se pudo cargar la vista previa</p>
          <div className="flex gap-2">
            <button onClick={() => setKey(k => k + 1)} className="px-3 py-1.5 rounded-md bg-stone-900 text-white text-xs">Reintentar</button>
            <a href={openUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-md bg-green-600 text-white text-xs">Abrir Spotify</a>
          </div>
        </div>
      )}
      <iframe
        key={key}
        title="Spotify Preview"
        src={embedUrl}
        width="100%"
        height="100%"
        frameBorder={0}
        loading="lazy"
        allow="encrypted-media; autoplay; clipboard-write"
        className="w-full h-full"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}