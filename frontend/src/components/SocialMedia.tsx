import React from 'react';
import { Facebook, Instagram, Music } from 'lucide-react';

export default function SocialMedia() {
  // Sólo mostraremos 3 previsualizaciones: Facebook, Instagram y Spotify
  const facebookPage = 'https://www.facebook.com/radioconexionlatam';
  const instagramPage = (import.meta as any).env?.VITE_INSTAGRAM_PAGE || 'https://www.instagram.com/radioconexion_latam';
  const spotifyUrl = (import.meta as any).env?.VITE_SPOTIFY_URL || 'https://open.spotify.com';
  const spotifyEmbed = (import.meta as any).env?.VITE_SPOTIFY_EMBED || '';
  const instagramEmbedsRaw = (import.meta as any).env?.VITE_INSTAGRAM_EMBEDS || '';
  const instagramEmbeds = instagramEmbedsRaw ? instagramEmbedsRaw.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  const followers = {
    facebook: '45.2K',
    instagram: '32.8K',
    spotify: '—'
  };

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
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center text-white">
                  <Facebook className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Facebook</div>
                  <div className="text-xs text-stone-500">{followers.facebook} seguidores</div>
                </div>
              </div>
              <a href={facebookPage} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">Abrir</a>
            </div>
            <div className="w-full h-72 bg-gray-50">
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
            </div>
          </div>

          {/* Instagram preview */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-md flex items-center justify-center text-white">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Instagram</div>
                  <div className="text-xs text-stone-500">{followers.instagram} seguidores</div>
                </div>
              </div>
              <a href={instagramPage} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-br from-pink-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm">Abrir</a>
            </div>
            <div className="p-3">
              {instagramEmbeds.length > 0 ? (
                <div className="space-y-3">
                  {instagramEmbeds.slice(0, 3).map((url: string, idx: number) => (
                    <div key={idx} className="w-full h-44 bg-gray-50 overflow-hidden rounded-md">
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
                  <p className="font-semibold mb-2">Vista previa no disponible</p>
                  <p className="text-xs mb-3">Por restricciones de Instagram no siempre se puede embeber. Puedes configurar `VITE_INSTAGRAM_EMBEDS` con URLs de embed en tu .env</p>
                  <a href={instagramPage} target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-br from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm">Abrir Instagram</a>
                </div>
              )}
            </div>
          </div>

          {/* Spotify preview */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center text-white">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">Spotify</div>
                  <div className="text-xs text-stone-500">Podcast / Episodios</div>
                </div>
              </div>
              <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">Abrir</a>
            </div>
            <div className="w-full h-72 bg-gray-50">
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
        </div>
      </div>
    </section>
  );
}