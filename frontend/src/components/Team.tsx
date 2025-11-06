import { Instagram, Twitter } from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image: string;
  email: string;
  phone: string;
  experience: string;
  specialty: string;
  social: {
    instagram?: string;
    twitter?: string;
  };
}

export default function Team() {
  // Diseño editorial minimal: bloques alternos imagen/texto, sin interactividad adicional
  const team: TeamMember[] = [
    {
      id: 1,
      name: "María González",
      role: "Directora General",
      bio: "Con más de 15 años de experiencia en radio, María lidera nuestro equipo con pasión y profesionalismo, conectando corazones latinos.",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "maria@conexionlatam.com",
      phone: "+1 234 567 8901",
      experience: "15+ años",
      specialty: "Gestión y Liderazgo",
      social: {
        instagram: "@maria_conexion",
        twitter: "@mariaconexion"
      }
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Locutor Principal",
      bio: "La voz más reconocida de nuestra estación, Carlos conecta con miles de oyentes cada día con su carisma único.",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "carlos@conexionlatam.com",
      phone: "+1 234 567 8902",
      experience: "12+ años",
      specialty: "Locución y Entretenimiento",
      social: {
        instagram: "@carlos_ritmos",
        twitter: "@carlosradio"
      }
    },
    {
      id: 3,
      name: "Ana Martínez",
      role: "Productora Musical",
      bio: "Especialista en curación musical, Ana selecciona los mejores temas latinos para cada momento del día.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "ana@conexionlatam.com",
      phone: "+1 234 567 8903",
      experience: "8+ años",
      specialty: "Producción Musical",
      social: {
        instagram: "@ana_musica",
        twitter: "@anaproductora"
      }
    },
    {
      id: 4,
      name: "Luis Fernández",
      role: "Director Técnico",
      bio: "Ingeniero de sonido con amplia experiencia, garantiza la mejor calidad de audio en nuestras transmisiones.",
      image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
      email: "luis@conexionlatam.com",
      phone: "+1 234 567 8904",
      experience: "10+ años",
      specialty: "Ingeniería de Audio",
      social: {
        instagram: "@luis_tech",
        twitter: "@luisaudio"
      }
    }
  ];

  return (
    <section id="equipo" className="py-24 bg-gradient-to-br from-slate-900 via-purple-800 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-14">
          <p className="text-sm uppercase tracking-widest text-white/50">Equipo</p>
          <h2 className="mt-2 text-4xl md:text-5xl font-extrabold text-white tracking-tight">Las personas detrás de la radio</h2>
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-fuchsia-500 to-cyan-500" />
          <p className="mt-6 text-lg text-white/70 max-w-3xl leading-relaxed">Un equipo pequeño, cercano y apasionado por la música y la cultura latina. Conócelos en un formato claro y directo.</p>
        </header>

        <div className="space-y-14">
          {team.map((m, i) => (
            <article key={m.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className={`lg:col-span-5 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <img src={m.image} alt={`Foto de ${m.name}`} className="w-full h-72 object-cover" />
                </div>
              </div>
              <div className={`lg:col-span-7 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <h3 className="text-2xl md:text-3xl font-bold text-white">{m.name}</h3>
                <p className="mt-1 text-base font-semibold bg-gradient-to-r from-purple-300 to-pink-300 text-transparent bg-clip-text">{m.role}</p>
                <p className="mt-1 text-sm text-cyan-300">{m.specialty} • {m.experience}</p>
                <p className="mt-4 text-white/80 leading-relaxed">{m.bio}</p>
                <div className="mt-5 flex gap-3">
                  {m.social.instagram && (
                    <a
                      href={`https://instagram.com/${m.social.instagram.replace('@','')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/15 text-sm"
                    >
                      <Instagram className="w-4 h-4 inline mr-1" /> Instagram
                    </a>
                  )}
                  {m.social.twitter && (
                    <a
                      href={`https://twitter.com/${m.social.twitter.replace('@','')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/15 text-sm"
                    >
                      <Twitter className="w-4 h-4 inline mr-1" /> Twitter
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-16 h-px w-full bg-white/10" />
      </div>
    </section>
  );
}