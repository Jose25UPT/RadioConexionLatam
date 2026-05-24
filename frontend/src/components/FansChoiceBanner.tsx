import { Link } from 'react-router-dom';

export default function FansChoiceBanner() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="relative bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-600"
        style={{ minHeight: '180px' }}
      >
        {/* Decorativos */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(217,70,239,0.35) 0%, transparent 70%)' }}
        />
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full opacity-10 bg-white pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Texto */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              LATAM Awards · Fans Choice 2026
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              🏆 ¡Ya tenemos ganadores!
            </h2>
            <p className="text-white/80 text-base md:text-lg max-w-lg">
              Las votaciones cerraron el 30 de abril. Descubre quiénes se llevaron el reconocimiento de los fans.
            </p>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <Link
              to="/fans-choice-resultados"
              className="group inline-flex items-center gap-2 bg-white text-purple-800 font-extrabold text-lg px-8 py-4 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-200"
            >
              <span>🏆</span>
              <span>Ver Resultados</span>
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
