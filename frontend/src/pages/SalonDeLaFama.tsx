import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, Filter } from 'lucide-react';
import { API_BASE } from '../lib/api';

interface Participante {
  id: number;
  nombre: string;
  periodo_tiempo: string | null;
  es_ganador: boolean;
  imagen_url: string | null;
  categoria_id: number;
  categoria_nombre: string | null;
}

interface Evento {
  id: number;
  anio: number;
  titulo_evento: string;
  participantes: Participante[];
}

interface Categoria {
  id: number;
  nombre: string;
}

function Iniciales({ nombre }: { nombre: string }) {
  const partes = nombre.trim().split(' ');
  const ini = partes.length >= 2
    ? partes[0][0] + partes[1][0]
    : nombre.slice(0, 2);
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white font-black text-3xl select-none">
      {ini.toUpperCase()}
    </div>
  );
}

function ParticipanteCard({ p }: { p: Participante }) {
  const [imgError, setImgError] = useState(false);
  const src = p.imagen_url
    ? (p.imagen_url.startsWith('http') ? p.imagen_url : `${API_BASE}${p.imagen_url}`)
    : null;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
      p.es_ganador ? 'border-amber-300 ring-1 ring-amber-200' : 'border-purple-100'
    }`}>
      <div className="w-full aspect-square overflow-hidden">
        {src && !imgError ? (
          <img
            src={src}
            alt={p.nombre}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Iniciales nombre={p.nombre} />
        )}
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        {p.es_ganador && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 w-fit">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Ganador
          </span>
        )}
        <p className="font-bold text-stone-800 text-sm leading-tight">{p.nombre}</p>
        {p.categoria_nombre && (
          <p className="text-xs text-purple-600 font-semibold">{p.categoria_nombre}</p>
        )}
        {p.periodo_tiempo && (
          <p className="text-xs text-stone-400">{p.periodo_tiempo}</p>
        )}
      </div>
    </div>
  );
}

export default function SalonDeLaFama() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [evRes, catRes] = await Promise.all([
          fetch('/api/timeline/eventos'),
          fetch('/api/timeline/categorias'),
        ]);
        if (!evRes.ok || !catRes.ok) throw new Error('Error cargando datos');
        const ev: Evento[] = await evRes.json();
        const cats: Categoria[] = await catRes.json();
        setEventos(ev);
        setCategorias(cats);
        if (ev.length > 0) setAnioSeleccionado(ev[0].anio);
      } catch (e: any) {
        setError(e?.message || 'Error cargando el Salón de la Fama');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const eventoActual = useMemo(
    () => eventos.find(e => e.anio === anioSeleccionado) ?? null,
    [eventos, anioSeleccionado]
  );

  const participantesFiltrados = useMemo(() => {
    if (!eventoActual) return [];
    return categoriaSeleccionada
      ? eventoActual.participantes.filter(p => p.categoria_id === categoriaSeleccionada)
      : eventoActual.participantes;
  }, [eventoActual, categoriaSeleccionada]);

  const ganadores = participantesFiltrados.filter(p => p.es_ganador);
  const resto = participantesFiltrados.filter(p => !p.es_ganador);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-purple-800 via-fuchsia-700 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 40% 50%, rgba(217,70,239,0.3) 0%, transparent 70%)' }} />
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-10 bg-white pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 text-center">
          <Link
            to="/fans-choice-resultados"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Resultados
          </Link>

          <div className="text-6xl mb-3">🏅</div>
          <p className="text-white/60 uppercase tracking-widest text-xs font-bold mb-1">Radio Conexión Latam</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Salón de la Fama</h1>
          <p className="text-white/80 text-lg">Reconociendo la excelencia a través de los años</p>
        </div>
      </div>

      {/* Filtros */}
      {!loading && !error && eventos.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-purple-400 flex-shrink-0" />

          {/* Selector de año */}
          <select
            value={anioSeleccionado ?? ''}
            onChange={e => {
              setAnioSeleccionado(Number(e.target.value));
              setCategoriaSeleccionada(null);
            }}
            className="text-sm font-semibold text-purple-700 bg-white border border-purple-200 rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
          >
            {eventos.map(ev => (
              <option key={ev.id} value={ev.anio}>{ev.titulo_evento} ({ev.anio})</option>
            ))}
          </select>

          {/* Filtro por categoría */}
          <select
            value={categoriaSeleccionada ?? ''}
            onChange={e => setCategoriaSeleccionada(e.target.value ? Number(e.target.value) : null)}
            className="text-sm font-semibold text-fuchsia-700 bg-white border border-fuchsia-200 rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-300 cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <span className="text-xs text-stone-400 ml-auto">
            {participantesFiltrados.length} participante{participantesFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 pb-16">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Trophy className="w-12 h-12 text-purple-300 animate-bounce" />
            <p className="text-purple-600 font-semibold animate-pulse">Cargando el Salón de la Fama…</p>
          </div>
        )}

        {!loading && error && (
          <div className="max-w-md mx-auto text-center py-20">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-stone-700 mb-2">No se pudo cargar el contenido</h2>
            <p className="text-sm text-stone-500 bg-stone-100 rounded-xl px-4 py-3 font-mono">{error}</p>
          </div>
        )}

        {!loading && !error && eventos.length === 0 && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🏅</p>
            <h2 className="text-xl font-bold text-stone-600 mb-2">Aún no hay eventos registrados</h2>
            <p className="text-stone-400 text-sm">El Salón de la Fama se irá completando próximamente.</p>
          </div>
        )}

        {!loading && !error && eventoActual && (
          <>
            {/* Ganadores destacados */}
            {ganadores.length > 0 && (
              <section className="mb-10">
                <h2 className="flex items-center gap-2 text-lg font-black text-amber-700 mb-4">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" /> Ganadores
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ganadores.map(p => <ParticipanteCard key={p.id} p={p} />)}
                </div>
              </section>
            )}

            {/* Resto de participantes */}
            {resto.length > 0 && (
              <section>
                {ganadores.length > 0 && (
                  <h2 className="text-lg font-black text-stone-600 mb-4">Participantes</h2>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {resto.map(p => <ParticipanteCard key={p.id} p={p} />)}
                </div>
              </section>
            )}

            {participantesFiltrados.length === 0 && (
              <div className="text-center py-16">
                <p className="text-stone-400 text-sm">No hay participantes para los filtros seleccionados.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
