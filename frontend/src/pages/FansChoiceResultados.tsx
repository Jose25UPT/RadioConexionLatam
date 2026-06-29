import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchJson } from '../lib/api';
import { ArrowLeft, Trophy } from 'lucide-react';

interface Candidate {
  position: number;
  name: string;
  votes: number;
  percentage: number;
  is_winner: boolean;
}

interface Category {
  id: number;
  name: string;
  total_votes: number;
  candidates: Candidate[];
}

interface ResultsData {
  categories: Category[];
  cutoff_date: string;
  total_records: number;
  generated_at: string;
  error?: string;
}

const CAT_ICONS: Record<number, string> = {
  1: '🎭', 2: '📣', 3: '🏪', 4: '📹', 5: '🎉',
  6: '🎵', 7: '🎮', 8: '⭐', 9: '📺', 10: '📰',
};

const MEDALS = ['🥇', '🥈', '🥉'];

function BarResult({ candidate }: { candidate: Candidate }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(candidate.percentage), 100);
    return () => clearTimeout(t);
  }, [candidate.percentage]);

  return (
    <div className={`rounded-xl p-3 border transition-shadow ${
      candidate.is_winner
        ? 'bg-amber-50 border-amber-300 shadow-sm'
        : 'bg-stone-50 border-stone-100'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl w-8 text-center flex-shrink-0 leading-none">
          {MEDALS[candidate.position - 1] ?? candidate.position}
        </span>
        <p className={`flex-1 font-semibold text-sm leading-tight ${
          candidate.is_winner ? 'text-amber-800' : 'text-stone-700'
        }`}>
          {candidate.name}
        </p>
        <div className="text-right flex-shrink-0 min-w-[52px]">
          <p className={`font-black text-base leading-none ${
            candidate.is_winner ? 'text-amber-700' : 'text-stone-600'
          }`}>
            {candidate.votes.toLocaleString()}
          </p>
          <p className="text-xs text-stone-400">{candidate.percentage}%</p>
        </div>
      </div>
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            candidate.is_winner
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
              : 'bg-gradient-to-r from-purple-400 to-fuchsia-400'
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function CategoryCard({ cat }: { cat: Category }) {
  const winner = cat.candidates[0];
  return (
    <div className="bg-white rounded-3xl shadow-md border border-purple-100 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{CAT_ICONS[cat.id] ?? '🎯'}</span>
          <div className="min-w-0">
            <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Categoría {cat.id}</p>
            <h3 className="text-white font-black text-base leading-tight truncate">{cat.name}</h3>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white/60 text-[10px] uppercase tracking-widest">Votos</p>
          <p className="text-white font-black text-xl">{cat.total_votes.toLocaleString()}</p>
        </div>
      </div>

      {/* Winner callout */}
      {winner && winner.votes > 0 && (
        <div className="mx-5 mt-4 mb-2 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl px-4 py-2.5">
          <span className="text-2xl">🥇</span>
          <div>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Ganador</p>
            <p className="font-black text-amber-800 text-sm leading-tight">{winner.name}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-black text-amber-700 text-lg">{winner.percentage}%</p>
            <p className="text-[10px] text-amber-500">{winner.votes} votos</p>
          </div>
        </div>
      )}

      {/* All candidates */}
      <div className="px-5 pb-5 pt-2 space-y-2">
        {cat.candidates.map(cand => (
          <BarResult key={cand.name} candidate={cand} />
        ))}
      </div>
    </div>
  );
}

export default function FansChoiceResultados() {
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchJson<ResultsData>('/api/fanschoice/resultados');
        if (res.error) setFetchError(res.error);
        setData(res);
      } catch (e: any) {
        setFetchError(e?.message || 'Error cargando resultados');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalVotos = data?.categories.reduce((s, c) => s + c.total_votes, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50">

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 60% 50%, rgba(217,70,239,0.3) 0%, transparent 70%)' }} />
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full opacity-10 bg-white pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>

          <div className="text-6xl mb-3">🏆</div>
          <p className="text-white/60 uppercase tracking-widest text-xs font-bold mb-1">LATAM Awards</p>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Fans Choice 2026</h1>
          <p className="text-white/80 text-lg mb-4">Resultados Oficiales</p>

          <Link
            to="/salon-de-la-fama"
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-bold text-sm rounded-full px-5 py-2.5 transition-colors mb-2"
          >
            🏅 Ver Salón de la Fama
          </Link>

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 text-white text-sm border border-white/20">
            <span>📅</span>
            <span>Votos válidos hasta el 30 de abril de 2026 · 23:59</span>
          </div>

          {!loading && !fetchError && (
            <p className="mt-3 text-white/50 text-sm">
              {totalVotos.toLocaleString()} votos en {data?.categories.length} categorías
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Trophy className="w-12 h-12 text-purple-300 animate-bounce" />
            <p className="text-purple-600 font-semibold animate-pulse">Cargando resultados…</p>
          </div>
        )}

        {!loading && fetchError && (
          <div className="max-w-md mx-auto text-center py-20">
            <p className="text-5xl mb-4">⚠️</p>
            <h2 className="text-xl font-bold text-stone-700 mb-2">No se pudieron cargar los resultados</h2>
            <p className="text-sm text-stone-500 bg-stone-100 rounded-xl px-4 py-3 font-mono break-all">{fetchError}</p>
          </div>
        )}

        {!loading && !fetchError && data && (
          <>
            {/* Summary bar */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {[
                { label: 'Total de votos', value: totalVotos.toLocaleString(), icon: '🗳️' },
                { label: 'Categorías', value: data.categories.length, icon: '🏷️' },
                { label: 'Cierre de votación', value: '30 Abr 2026', icon: '🔒' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-purple-100">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-xs text-stone-400 font-semibold uppercase tracking-wide">{s.label}</p>
                    <p className="text-lg font-black text-stone-800">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {data.categories.map(cat => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>

          </>
        )}
      </div>
    </div>
  );
}
