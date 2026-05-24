import { useEffect, useState } from 'react';
import { MessageSquare, User, ChevronLeft, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { fetchJson, API_BASE } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface Nota {
  id: number;
  contenido: string;
  autor_nombre: string | null;
  autor_avatar: string | null;
  created_at: string;
}

const PER_PAGE = 12;

function purifyNota(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'br', 'p', 'span', 'div'],
    ALLOWED_ATTR: ['style'],
    FORCE_BODY: true,
  });
  return clean.replace(/style="([^"]*)"/g, (_, v) => {
    const m = v.match(/text-align\s*:\s*(left|center|right|justify)/i);
    return m ? `style="text-align:${m[1]}"` : '';
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora mismo';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d}d`;
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TodasLasNotas() {
  const navigate = useNavigate();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchJson<Nota[]>(`/api/notas/?limite=${PER_PAGE}&offset=${page * PER_PAGE}`),
      fetchJson<{ total: number }>('/api/notas/total'),
    ])
      .then(([data, t]) => {
        setNotas(data);
        setTotal(t.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-5 transition-colors"
          >
            <ChevronLeft size={16} /> Regresar
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center">
              <MessageSquare size={20} className="text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notas</h1>
              <p className="text-white/40 text-sm">{total} notas publicadas</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-white/40 text-sm text-center py-20 animate-pulse">
            Cargando notas…
          </div>
        ) : notas.length === 0 ? (
          <div className="text-white/30 text-sm text-center py-20">
            No hay notas publicadas aún.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notas.map(n => (
              <article
                key={n.id}
                className="bg-white/5 border border-white/10 hover:border-purple-400/30 rounded-2xl p-4 transition-all duration-200 hover:bg-white/8 flex flex-col"
              >
                {/* Autor */}
                <div className="flex items-center gap-2 mb-3">
                  {n.autor_avatar ? (
                    <img
                      src={n.autor_avatar.startsWith('http') ? n.autor_avatar : `${API_BASE}${n.autor_avatar}`}
                      alt={n.autor_nombre || ''}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                      <User size={13} className="text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/80 truncate">
                      {n.autor_nombre || 'Editor'}
                    </p>
                    <p className="text-[10px] text-white/35">{timeAgo(n.created_at)}</p>
                  </div>
                </div>

                {/* Contenido */}
                <div
                  className="text-white/75 text-sm leading-relaxed flex-1"
                  dangerouslySetInnerHTML={{ __html: purifyNota(n.contenido) }}
                />
              </article>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-white/50 text-sm">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
