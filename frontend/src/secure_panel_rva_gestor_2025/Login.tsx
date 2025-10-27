import React, { useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PANEL_BASE } from './secureRoute';
import { API_BASE } from '../lib/api';
import { decodeJwt } from './auth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
  const form = new FormData();
  form.append('username', username.trim());
      form.append('password', password);
  const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Credenciales inválidas');
      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      // Intentar extraer rol desde respuesta o JWT
      let role: string | null = (data.role || data.rol || data.user?.role || data.user?.rol || (Array.isArray(data.roles) ? data.roles[0] : null) || (Array.isArray(data.scopes) ? data.scopes[0] : null)) || null;
      if (!role && data.access_token) {
        const payload = decodeJwt(data.access_token) || {};
        role = payload.role || payload.rol || (Array.isArray(payload.roles) ? payload.roles[0] : null) || (payload.is_admin ? 'ADMIN' : null);
      }
      if (!role) {
        try {
          const meRes = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${data.access_token}` }
          });
          if (meRes.ok) {
            const me = await meRes.json();
            role = me.role || me.rol || me.user?.role || me.user?.rol || null;
          }
        } catch {}
      }
      if (!role && username.toLowerCase() === 'admin') {
        role = 'ADMIN';
      }
      if (role) {
        try { localStorage.setItem('user_role', String(role).toUpperCase()); } catch {}
      }
  // Llevar siempre al panel editorial (listado de noticias) para que ADMIN/EDITOR editen
  navigate(PANEL_BASE);
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-stone-100 p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-amber-200/60">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg mb-4">
            <Lock size={42} />
          </div>
          <h1 className="text-3xl font-bold text-amber-800 font-otaku-title">Acceso Seguro</h1>
          <p className="text-stone-600 mt-2 font-otaku-body">Panel interno de gestión</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1 font-otaku-elegant">Usuario o Email</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input value={username} onChange={e=>setUsername(e.target.value)} required placeholder="tu_usuario" className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-otaku-body" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1 font-otaku-elegant">Contraseña</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="********" className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-otaku-body" />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm font-otaku-body bg-red-50 border border-red-200 rounded p-3">{error}</div>}
          <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md disabled:opacity-60">
            <LogIn size={18} /> {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <p className="text-xs text-stone-400 text-center mt-8 font-otaku-body">© 2025 Radio ConexionLatam</p>
      </div>
    </div>
  );
};

export default Login;
