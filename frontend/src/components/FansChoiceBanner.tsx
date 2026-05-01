import { useEffect, useState } from 'react';

const SLIDES = [
  {
    label: 'LATAM Awards',
    title: '¡Vota por tu favorito!',
    subtitle: 'Fans Choice 2026 ya está abierto. Elige a los mejores del año.',
    cta: 'Votar ahora',
    accent: 'from-purple-700 via-fuchsia-700 to-pink-600',
    glow: 'rgba(168,85,247,0.35)',
  },
  {
    label: 'Fans Choice',
    title: '10 categorías, tú decides.',
    subtitle: 'Cosplayer, Streamer, Banda musical, Influencer y más. ¡Tu voto cuenta!',
    cta: 'Participar',
    accent: 'from-indigo-700 via-purple-700 to-fuchsia-600',
    glow: 'rgba(99,102,241,0.35)',
  },
  {
    label: '¡Solo un voto por categoría!',
    title: 'Simple, rápido y seguro.',
    subtitle: 'Inicia sesión con Google y emite tu voto en segundos.',
    cta: 'Ir a FANS CHOICE',
    accent: 'from-fuchsia-700 via-pink-700 to-rose-600',
    glow: 'rgba(217,70,239,0.35)',
  },
];

export default function FansChoiceBanner() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SLIDES.length);
        setFading(false);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  const goTo = (i: number) => {
    if (i === current) return;
    setFading(true);
    setTimeout(() => { setCurrent(i); setFading(false); }, 400);
  };

  return (
    <section className="relative overflow-hidden py-0">
      {/* Badge FINALIZADO */}
      <div className="absolute top-4 right-4 z-20 md:top-6 md:right-8 pointer-events-none">
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 bg-red-600 text-white font-black text-xs md:text-sm uppercase tracking-widest px-4 py-2 rounded-full shadow-lg ring-2 ring-white/40 animate-pulse">
            🔒 Finalizado
          </span>
        </div>
      </div>

      <div
        className={`relative bg-gradient-to-r ${slide.accent} transition-all duration-500`}
        style={{ minHeight: '220px' }}
      >
        {/* Fondo decorativo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 70% 50%, ${slide.glow} 0%, transparent 70%)`,
          }}
        />
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full opacity-10 bg-white pointer-events-none" />

        <div
          className={`relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8 transition-opacity duration-400 ${fading ? 'opacity-0' : 'opacity-100'}`}
        >
          {/* Texto */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              {slide.label}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              {slide.title}
            </h2>
            <p className="text-white/80 text-base md:text-lg max-w-lg">
              {slide.subtitle}
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <a
              href="/FANS-CHOICE"
              className="group relative inline-flex items-center gap-2 bg-white text-purple-800 font-extrabold text-lg px-8 py-4 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-200"
            >
              <span>⭐</span>
              <span>{slide.cta}</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </a>

            {/* Dots */}
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-6' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
