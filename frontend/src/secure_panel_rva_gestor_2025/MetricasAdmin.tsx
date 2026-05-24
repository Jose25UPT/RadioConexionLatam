import { useEffect, useState } from 'react';
import { BarChart2, Eye, FileText, TrendingUp, X, Loader2 } from 'lucide-react';
import { API_BASE } from '../lib/api';

interface CategoriaMetrica {
  categoria: string;
  articulos: number;
  vistas: number;
}
interface TopNoticia {
  id: number;
  titulo: string;
  slug: string;
  vistas: number;
  categoria: string | null;
}
interface TopEditor {
  editor: string;
  articulos: number;
  vistas: number;
}
interface Metricas {
  total_noticias: number;
  total_vistas: number;
  por_categoria: CategoriaMetrica[];
  top_noticias: TopNoticia[];
  top_editores: TopEditor[];
}

interface Props {
  onClose: () => void;
}

export default function MetricasAdmin({ onClose }: Props) {
  const [data, setData] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    fetch(`${API_BASE}/api/admin/metricas`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => { if (!r.ok) throw new Error('Error cargando métricas'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const maxVistas = data ? Math.max(...data.por_categoria.map(c => c.vistas), 1) : 1;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-stone-50 rounded-2xl shadow-2xl w-full max-w-3xl my-4 sm:my-6">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-200 bg-white rounded-t-2xl">
          <h2 className="text-base sm:text-xl font-bold text-stone-800 flex items-center gap-2">
            <BarChart2 size={20} className="text-amber-600 flex-shrink-0" />
            Métricas del sitio
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-stone-500 gap-2">
            <Loader2 size={20} className="animate-spin" /> Cargando métricas…
          </div>
        )}
        {error && (
          <div className="p-6 text-red-600 text-sm">{error}</div>
        )}

        {data && (
          <div className="p-4 sm:p-6 space-y-6">

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3">
              <Kpi icon={<FileText size={16} />} label="Noticias" value={data.total_noticias} color="amber" />
              <Kpi icon={<Eye size={16} />} label="Vistas totales" value={data.total_vistas.toLocaleString()} color="blue" />
              <Kpi icon={<TrendingUp size={16} />} label="Categorías" value={data.por_categoria.length} color="purple" />
              <Kpi icon={<BarChart2 size={16} />} label="Editores" value={data.top_editores.length} color="green" />
            </div>

            {/* Vistas por categoría */}
            <div>
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-3">
                Vistas por categoría
              </h3>
              <div className="space-y-2.5">
                {data.por_categoria.map(c => (
                  <div key={c.categoria} className="flex items-center gap-2 min-w-0">
                    <span className="w-24 sm:w-28 text-xs text-stone-700 font-medium truncate flex-shrink-0">
                      {c.categoria}
                    </span>
                    <div className="flex-1 bg-stone-200 rounded-full h-3.5 overflow-hidden min-w-0">
                      <div
                        className="h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                        style={{ width: `${Math.max(3, (c.vistas / maxVistas) * 100)}%` }}
                      />
                    </div>
                    <span className="text-right text-xs text-stone-500 flex-shrink-0 whitespace-nowrap pl-1">
                      {c.vistas.toLocaleString()}v · {c.articulos}a
                    </span>
                  </div>
                ))}
                {data.por_categoria.length === 0 && (
                  <p className="text-stone-400 text-sm">Sin datos de categorías.</p>
                )}
              </div>
            </div>

            {/* Tablas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Top noticias */}
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
                  Top 10 más vistas
                </h3>
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="divide-y divide-stone-100">
                    {data.top_noticias.map((n, i) => (
                      <div key={n.id} className="flex items-start gap-2 px-3 py-2.5 hover:bg-stone-50 min-w-0">
                        <span className="w-5 text-center text-xs text-stone-400 font-medium flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-stone-800 font-medium text-xs leading-snug line-clamp-2 break-words">
                            {n.titulo}
                          </p>
                          {n.categoria && (
                            <p className="text-stone-400 text-[10px] mt-0.5">{n.categoria}</p>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-stone-600 flex-shrink-0 whitespace-nowrap pl-1">
                          {(n.vistas || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {data.top_noticias.length === 0 && (
                      <p className="px-4 py-6 text-center text-stone-400 text-xs">Sin datos</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top editores */}
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
                  Editores más activos
                </h3>
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="divide-y divide-stone-100">
                    {data.top_editores.map((e, i) => (
                      <div key={e.editor} className="flex items-center gap-2 px-3 py-2.5 hover:bg-stone-50 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-stone-800 text-xs font-medium truncate min-w-0">
                          {e.editor}
                        </span>
                        <span className="text-xs text-stone-500 flex-shrink-0 whitespace-nowrap">
                          {e.articulos}art
                        </span>
                        <span className="text-xs font-semibold text-stone-600 flex-shrink-0 whitespace-nowrap pl-1">
                          {e.vistas.toLocaleString()}v
                        </span>
                      </div>
                    ))}
                    {data.top_editores.length === 0 && (
                      <p className="px-4 py-6 text-center text-stone-400 text-xs">Sin datos</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    amber:  'bg-amber-50  text-amber-700  border-amber-200',
    blue:   'bg-blue-50   text-blue-700   border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green:  'bg-green-50  text-green-700  border-green-200',
  };
  return (
    <div className={`rounded-xl border p-3 sm:p-4 flex flex-col gap-1 ${colors[color] || colors.amber}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium opacity-70">{icon}{label}</div>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
    </div>
  );
}
