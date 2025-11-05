import { FaFacebookF, FaInstagram, FaSpotify, FaYoutube } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';

// Floating social buttons (right side) — todas las redes como enlaces flotantes
export default function SocialFloating() {
  // Panel Edge estático con 5 redes principales
  const links = [
    { name: 'YouTube', url: 'https://www.youtube.com/channel/UCCVlwnb2MW6nnhGVYr7vHVg', bg: 'bg-[#FF0000]', icon: <FaYoutube className="w-6 h-6 md:w-7 md:h-7" /> },
    { name: 'TikTok', url: 'https://www.tiktok.com/@radioconexion_latam', bg: 'bg-black', icon: <FaTiktok className="w-6 h-6 md:w-7 md:h-7" /> },
    { name: 'Spotify', url: 'https://open.spotify.com/show/2QIEylnlbAahByrVqbwjhx', bg: 'bg-[#1DB954]', icon: <FaSpotify className="w-6 h-6 md:w-7 md:h-7" /> },
    { name: 'Facebook', url: 'https://www.facebook.com/radioconexionLATAM', bg: 'bg-[#1877F2]', icon: <FaFacebookF className="w-6 h-6 md:w-7 md:h-7" /> },
    { name: 'Instagram', url: 'https://www.instagram.com/radioconexion_latam/', bg: 'bg-gradient-to-br from-pink-500 to-purple-600', icon: <FaInstagram className="w-6 h-6 md:w-7 md:h-7" /> },
    { name: 'X', url: 'https://x.com/RConexion_LATAM', bg: 'bg-black', icon: <FaXTwitter className="w-6 h-6 md:w-7 md:h-7" /> },
  ];

  return (
    <div className="fixed right-1 md:right-3 top-1/2 -translate-y-1/2 z-50">
      {/* Panel Edge */}
      <div className="rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-xl p-1.5 md:p-2">
        <ul className="flex flex-col items-center gap-2 md:gap-3">
          {links.map((link) => (
            <li key={link.name}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.name}
                className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl text-white shadow-lg ${link.bg}`}
                aria-label={link.name}
              >
                {link.icon}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
