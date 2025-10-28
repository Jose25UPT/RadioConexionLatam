import {
  Facebook,
  Instagram,
  Music,
  Youtube,
  Twitter,
  Globe,
  Twitch,
  MessageCircle,
  Send,
  Headphones,
  Menu,
  X,
} from 'lucide-react';

// Floating social buttons (right side) — todas las redes como enlaces flotantes
export default function SocialFloating() {
  // Estado: en móvil se puede contraer/expandir; en escritorio siempre visible
  const [open, setOpen] = React.useState(false);

  const links = [
  { name: 'Web', url: 'https://www.radioconexionlatam.net.pe/', bg: 'bg-gray-800', icon: <Globe className="w-7 h-7 md:w-12 md:h-12" /> },
  { name: 'Twitch', url: 'https://www.twitch.tv/radioconexionlatam', bg: 'bg-violet-700', icon: <Twitch className="w-7 h-7 md:w-12 md:h-12" /> },
  { name: 'Spotify', url: 'https://open.spotify.com/show/2QIEylnlbAahByrVqbwjhx', bg: 'bg-green-600', icon: <Music className="w-7 h-7 md:w-12 md:h-12" /> },
  { name: 'Zeno', url: 'https://zeno.fm/radioconexionlatam', bg: 'bg-emerald-600', icon: <Headphones className="w-7 h-7 md:w-12 md:h-12" /> },
      { name: 'Telegram', url: 'https://t.me/radioconexionlatam', bg: 'bg-blue-400', icon: <Send className="w-7 h-7 md:w-12 md:h-12" /> },
      { name: 'Discord', url: 'https://discord.com/invite/CZmzfgjSYE', bg: 'bg-indigo-600', icon: <MessageCircle className="w-7 h-7 md:w-12 md:h-12" /> },
      { name: 'WhatsApp', url: 'https://wa.me/+51936030586', bg: 'bg-green-500', icon: <MessageCircle className="w-7 h-7 md:w-12 md:h-12" /> },
  { name: 'YouTube', url: 'https://www.youtube.com/channel/UCCVlwnb2MW6nnhGVYr7vHVg', bg: 'bg-red-600', icon: <Youtube className="w-7 h-7 md:w-12 md:h-12" /> },
  { name: 'TikTok', url: 'https://www.tiktok.com/@radioconexion_latam', bg: 'bg-black', icon: <Music className="w-7 h-7 md:w-12 md:h-12" /> },
  { name: 'Facebook', url: 'https://www.facebook.com/radioconexionLATAM', bg: 'bg-blue-600', icon: <Facebook className="w-7 h-7 md:w-12 md:h-12" /> },
  { name: 'Instagram', url: 'https://www.instagram.com/radioconexion_latam/', bg: 'bg-gradient-to-br from-pink-500 to-purple-600', icon: <Instagram className="w-7 h-7 md:w-12 md:h-12" /> },
  { name: 'X', url: 'https://x.com/RConexion_LATAM', bg: 'bg-sky-500', icon: <Twitter className="w-7 h-7 md:w-12 md:h-12" /> },

  ];

  return (
    <div>
      {/* Contenedor fijo: en móvil va en esquina inferior derecha; en desktop centrado a la derecha */}
      <div className="fixed right-3 bottom-3 md:right-4 md:top-1/2 z-50 md:transform md:-translate-y-1/2">
        {/* Botón de abrir/cerrar en móvil */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="md:hidden mb-2 w-12 h-12 rounded-full bg-black/80 text-white flex items-center justify-center shadow-lg backdrop-blur border border-white/10"
          aria-label={open ? 'Cerrar accesos' : 'Abrir accesos'}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Ventana visible: cerrada en móvil salvo cuando open=true; siempre visible en md+ */}
        <div className={`${open ? 'block' : 'hidden'} md:block h-[240px] md:h-[320px] overflow-hidden rounded-lg`} aria-hidden={false}>
          {/* Columna scrollable: el usuario puede usar la rueda cuando el mouse esté encima */}
          <ScrollableLinks links={links} step={window?.innerWidth >= 768 ? 96 : 72} />
        </div>
      </div>
    </div>
  );
}

import React, { useRef } from 'react';

function ScrollableLinks({ links, step: stepProp }: { links: Array<any>; step?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const step = stepProp ?? 96; // altura aproximada de botón + gap

  const onWheel = (e: React.WheelEvent) => {
    // Interceptamos para hacer scroll por pasos suaves
    e.preventDefault();
    if (!ref.current) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    ref.current.scrollBy({ top: direction * step, behavior: 'smooth' });
  };

  return (
    <div
      ref={ref}
      onWheel={onWheel}
      className="flex flex-col items-end gap-3 md:gap-4 h-full overflow-y-auto py-2 pr-2 scroll-smooth"
      style={{ scrollbarWidth: 'none' }}
    >
      {links.map((link: any) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          className={`flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-xl text-white shadow-2xl transition-all transform hover:-translate-y-0.5 ${link.bg}`}
          aria-label={link.name}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
