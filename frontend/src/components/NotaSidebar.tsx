import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, ArrowRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { fetchJson, API_BASE } from '../lib/api';

interface Nota {
  id: number;
  contenido: string;
  autor_nombre: string | null;
  autor_avatar: string | null;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

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

export default function NotaSidebar() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<Nota[]>('/api/notas/?limite=5')
      .then(setNotas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-cyan-300" />
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-300">
            Notas
          </span>
        </div>
        <Link
          to="/notas"
          className="flex items-center gap-1 text-[11px] text-white/50 hover:text-cyan-300 transition-colors"
        >
          Ver todas <ArrowRight size={11} />
        </Link>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {loading && (
          <div className="text-white/30 text-xs text-center py-6 animate-pulse">
            Cargando notas…
          </div>
        )}

        {!loading && notas.length === 0 && (
          <div className="text-white/30 text-xs text-center py-6">
            Sin notas publicadas aún.
          </div>
        )}

        {notas.map(n => (
          <article
            key={n.id}
            className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-xl p-3.5 transition-all duration-200"
          >
            {/* Contenido */}
            <div
              className="text-white/85 text-xs leading-relaxed mb-2.5 line-clamp-4"
              dangerouslySetInnerHTML={{ __html: purifyNota(n.contenido) }}
            />

            {/* Footer */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              {n.autor_avatar ? (
                <img
                  src={n.autor_avatar.startsWith('http') ? n.autor_avatar : `${API_BASE}${n.autor_avatar}`}
                  alt={n.autor_nombre || ''}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                  <User size={10} className="text-white" />
                </div>
              )}
              <span className="text-[10px] text-white/50 truncate flex-1">
                {n.autor_nombre || 'Editor'}
              </span>
              <span className="text-[10px] text-white/35 flex-shrink-0">
                {timeAgo(n.created_at)}
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* CTA */}
      {notas.length > 0 && (
        <Link
          to="/notas"
          className="mt-4 flex items-center justify-center gap-2 py-2 rounded-xl border border-white/15 text-xs text-white/60 hover:text-cyan-300 hover:border-cyan-400/30 transition-all"
        >
          Ver todas las notas <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}
