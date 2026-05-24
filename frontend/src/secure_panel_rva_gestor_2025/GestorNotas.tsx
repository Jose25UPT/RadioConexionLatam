import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Plus, Pencil, Check, X, LogOut, FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { PANEL_BASE } from './secureRoute';
import { fetchJson } from '../lib/api';
import DOMPurify from 'dompurify';

const MAX_CHARS = 500;

interface Nota {
  id: number;
  contenido: string;
  autor_nombre: string | null;
  autor_avatar: string | null;
  created_at: string;
}

// ── Editor minimalista con contenteditable ────────────────────────────────
function NotaEditor({
  initialHtml,
  onSave,
  onCancel,
  saving,
}: {
  initialHtml: string;
  onSave: (html: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = initialHtml;
      setChars(ref.current.innerText.length);
      ref.current.focus();
    }
  }, []); // eslint-disable-line

  const exec = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    ref.current?.focus();
  };

  const getCount = () => ref.current?.innerText?.length ?? 0;

  const onInput = () => setChars(getCount());

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      getCount() >= MAX_CHARS &&
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const remaining = MAX_CHARS - getCount();
    if (remaining > 0) {
      document.execCommand('insertText', false, text.slice(0, remaining));
      setChars(getCount());
    }
  };

  const handleSave = () => {
    const html = ref.current?.innerHTML || '';
    if (!ref.current?.innerText?.trim()) return;
    onSave(html);
  };

  const btnClass =
    'px-2 py-1 rounded text-stone-600 hover:bg-stone-200 text-sm font-medium transition-colors';
  const pct = (chars / MAX_CHARS) * 100;
  const ringColor = pct > 90 ? 'text-red-500' : pct > 70 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="border border-stone-300 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 bg-stone-50 border-b border-stone-200 flex-wrap">
        <button type="button" onClick={() => exec('bold')} className={btnClass} title="Negrita">
          <b>B</b>
        </button>
        <button type="button" onClick={() => exec('italic')} className={btnClass} title="Cursiva">
          <em>I</em>
        </button>
        <button type="button" onClick={() => exec('underline')} className={btnClass} title="Subrayado">
          <u>U</u>
        </button>
        <span className="w-px h-4 bg-stone-300 mx-1" />
        <button type="button" onClick={() => exec('justifyLeft')} className={btnClass} title="Izquierda">
          ≡←
        </button>
        <button type="button" onClick={() => exec('justifyCenter')} className={btnClass} title="Centrar">
          ≡
        </button>
        <button type="button" onClick={() => exec('justifyRight')} className={btnClass} title="Derecha">
          ≡→
        </button>
      </div>

      {/* Área de texto */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        className="min-h-[100px] max-h-52 overflow-y-auto p-3 text-sm text-stone-800 focus:outline-none leading-relaxed"
        style={{ wordBreak: 'break-word' }}
        data-placeholder="Escribe tu nota aquí…"
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-stone-50 border-t border-stone-200">
        <span className={`text-xs font-medium ${ringColor}`}>
          {chars} / {MAX_CHARS}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || chars === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <span className="animate-pulse">Publicando…</span>
            ) : (
              <><Check size={13} /> Publicar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Render de nota con DOMPurify ──────────────────────────────────────────
function purify(html: string) {
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

// ── Panel principal ────────────────────────────────────────────────────────
export default function GestorNotas() {
  const navigate = useNavigate();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editHtml, setEditHtml] = useState('');
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const showMsg = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const cargar = async () => {
    try {
      const data = await fetchJson<Nota[]>('/api/notas/mis-notas');
      setNotas(data);
    } catch {
      setNotas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleCreate = async (html: string) => {
    setSaving(true);
    try {
      await fetchJson('/api/notas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: html }),
      });
      setShowCreate(false);
      showMsg(true, 'Nota publicada');
      cargar();
    } catch (e: any) {
      showMsg(false, e?.message || 'Error publicando');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number, html: string) => {
    setSaving(true);
    try {
      await fetchJson(`/api/notas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: html }),
      });
      setEditingId(null);
      showMsg(true, 'Nota actualizada');
      cargar();
    } catch (e: any) {
      showMsg(false, e?.message || 'Error actualizando');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta nota?')) return;
    try {
      await fetchJson(`/api/notas/${id}`, { method: 'DELETE' });
      showMsg(true, 'Nota eliminada');
      setNotas(prev => prev.filter(n => n.id !== id));
    } catch (e: any) {
      showMsg(false, e?.message || 'Error eliminando');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    navigate(`${PANEL_BASE}/login`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.ok
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to={PANEL_BASE}
                className="text-stone-400 hover:text-stone-700 transition-colors text-sm"
              >
                ← Panel
              </Link>
              <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <FileText size={20} className="text-purple-600" /> Notas
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowCreate(true); setEditingId(null); }}
                className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all text-sm font-medium"
              >
                <Plus size={15} /> Nueva nota
              </button>
              <button
                onClick={logout}
                className="p-2 bg-red-50 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                title="Salir"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Editor de nueva nota */}
        {showCreate && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
              Nueva nota
            </p>
            <NotaEditor
              initialHtml=""
              onSave={handleCreate}
              onCancel={() => setShowCreate(false)}
              saving={saving}
            />
          </div>
        )}

        {/* Lista */}
        {loading && (
          <p className="text-stone-400 text-sm text-center py-10 animate-pulse">
            Cargando notas…
          </p>
        )}

        {!loading && notas.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aún no tienes notas publicadas.</p>
          </div>
        )}

        {notas.map(n => (
          <div
            key={n.id}
            className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm"
          >
            {editingId === n.id ? (
              <div className="p-4">
                <NotaEditor
                  initialHtml={editHtml}
                  onSave={(html) => handleUpdate(n.id, html)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <div className="p-4">
                {/* Contenido */}
                <div
                  className="text-stone-800 text-sm leading-relaxed mb-3"
                  dangerouslySetInnerHTML={{ __html: purify(n.contenido) }}
                />

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-100">
                  <span>
                    {n.autor_nombre || 'Editor'} ·{' '}
                    {new Date(n.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditingId(n.id); setEditHtml(n.contenido); setShowCreate(false); }}
                      className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CSS placeholder para contenteditable vacío */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #a8a29e;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
