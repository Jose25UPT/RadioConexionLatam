import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { API_BASE } from '../lib/api';

interface Redes {
  [key: string]: string;
}

interface Perfil {
  nombre_completo?: string;
  avatar?: string;
  titulo?: string;
  bio?: string;
  frase?: string;
  redes_sociales?: Redes;
}

const PLATAFORMAS = [
  'twitter', 'facebook', 'instagram', 'linkedin', 'youtube', 'twitch', 'web'
];

const MiPerfil: React.FC = () => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil>({ redes_sociales: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [okMsg, setOkMsg] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPerfil({
          nombre_completo: data.nombre_completo || '',
          avatar: data.avatar || '',
          titulo: data.titulo || '',
          bio: data.biografia || '',
          frase: data.frase_personal || '',
          redes_sociales: data.redes_sociales || {}
        });
      } catch (e: any) {
        setError(e?.message || 'Error cargando perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setRed = (key: string, value: string) => {
    setPerfil(prev => ({ ...prev, redes_sociales: { ...(prev.redes_sociales || {}), [key]: value } }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOkMsg('');
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/auth/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(perfil)
      });
      if (!res.ok) throw new Error(await res.text());
      setOkMsg('Perfil actualizado');
      setTimeout(() => setOkMsg(''), 2000);
    } catch (e: any) {
      setError(e?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-stone-600">Cargando…</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Mi perfil</h2>
        {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm mb-3">{error}</div>}
        {okMsg && <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm mb-3">{okMsg}</div>}
        <form onSubmit={save} className="space-y-5 bg-white rounded-xl border p-5">
          <div>
            <label className="block text-sm text-stone-700">Nombre completo</label>
            <input value={perfil.nombre_completo || ''} onChange={e=>setPerfil(prev=>({ ...prev, nombre_completo: e.target.value }))}
              className="w-full p-3 border rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-stone-700">Título</label>
              <input value={perfil.titulo || ''} onChange={e=>setPerfil(prev=>({ ...prev, titulo: e.target.value }))}
                className="w-full p-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-stone-700">Frase</label>
              <input value={perfil.frase || ''} onChange={e=>setPerfil(prev=>({ ...prev, frase: e.target.value }))}
                className="w-full p-3 border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-stone-700">Bio</label>
            <textarea value={perfil.bio || ''} onChange={e=>setPerfil(prev=>({ ...prev, bio: e.target.value }))}
              rows={4} className="w-full p-3 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Redes sociales</label>
            <div className="space-y-2">
              {PLATAFORMAS.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="w-28 text-sm capitalize">{p}</span>
                  <input
                    value={(perfil.redes_sociales || {})[p] || ''}
                    onChange={(e)=>setRed(p, e.target.value)}
                    placeholder={`https://${p}.com/usuario`}
                    className="flex-1 p-2 border rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-3 bg-amber-600 text-white rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={()=>navigate(-1)} className="px-5 py-3 bg-stone-200 rounded-lg">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MiPerfil;
