import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Shield, Pencil, Search, Filter, Edit3, Trash2 } from 'lucide-react';
import { PANEL_BASE } from './secureRoute';
import { getUserRole } from './auth';
import { API_BASE } from '../lib/api';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'EDITOR' | 'REDACTOR' | 'MODERATOR' | 'VIEWER';
  activo: boolean;
}

const roles: Usuario['rol'][] = ['ADMIN','EDITOR','REDACTOR','MODERATOR','VIEWER'];

const AdminDashboard: React.FC = () => {
  const role = getUserRole();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [q, setQ] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{ nombre: string; email: string; password: string; rol: Usuario['rol'] }>({ nombre: '', email: '', password: '', rol: 'EDITOR' });

  useEffect(() => {
    const cargar = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE}/api/admin/users`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('No se pudo cargar usuarios');
        const data = await res.json();
        const mapped: Usuario[] = (Array.isArray(data) ? data : data.users || []).map((u: any) => ({
          id: String(u.id || u.user_id || u.uid),
          nombre: u.nombre || u.name || u.username || u.nombre_usuario || '',
          email: u.email || '',
          rol: (u.rol || u.role || 'VIEWER').toUpperCase(),
          activo: u.activo ?? u.active ?? true,
        }));
        if (!mapped.length) throw new Error('vacío');
        setUsuarios(mapped);
      } catch {
        // fallback de demo
        setUsuarios([
          { id: '1', nombre: 'Admin', email: 'admin@radio.com', rol: 'ADMIN', activo: true },
          { id: '2', nombre: 'Editor 1', email: 'editor@radio.com', rol: 'EDITOR', activo: true },
          { id: '3', nombre: 'Redactor 1', email: 'redactor@radio.com', rol: 'REDACTOR', activo: true },
        ]);
      }
    };
    cargar();
  }, []);

  const filtrados = useMemo(() => usuarios.filter(u => {
    const okQ = [u.nombre, u.email, u.rol].some(v => String(v).toLowerCase().includes(q.toLowerCase()));
    const okRol = !filtroRol || u.rol === filtroRol;
    return okQ && okRol;
  }), [usuarios, q, filtroRol]);

  const asignarRol = async (id: string, rol: Usuario['rol']) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rol })
      });
      if (!res.ok) throw new Error('No se pudo actualizar el rol');
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol } : u));
    } catch (e: any) {
      alert(e.message || 'Error cambiando rol');
    }
  };

  const crearUsuario = () => {
    setCreateError(null);
    setNewUser({ nombre: '', email: '', password: '', rol: 'EDITOR' });
    setShowCreate(true);
  };

  const submitCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setCreateError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        // Usuario (sin espacios recomendados)
        nombre_usuario: newUser.nombre,
        // Email y password
        email: newUser.email,
        password: newUser.password,
        // Rol (enviamos ambos por compatibilidad, el backend toma cualquiera)
        role: newUser.rol,
        rol: newUser.rol
      };
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let msg = 'No se pudo crear el usuario';
        try {
          const err = await res.json();
          msg = err?.detail || msg;
        } catch {}
        throw new Error(msg);
      }
      const created = await res.json();
      const nuevo: Usuario = {
        id: String(created.id || created.user?.id || Date.now()),
        nombre: created.nombre_usuario || created.nombre || created.name || newUser.nombre,
        email: created.email || newUser.email,
        rol: (created.rol || created.role || newUser.rol) as Usuario['rol'],
        activo: created.activo ?? true
      };
      setUsuarios(prev => [nuevo, ...prev]);
      setShowCreate(false);
    } catch (e: any) {
      setCreateError(e.message || 'Error creando usuario');
    } finally {
      setLoading(false);
    }
  };

  const desactivarUsuario = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('No se pudo cambiar estado');
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
    } catch (e: any) {
      alert(e.message || 'Error cambiando estado del usuario');
    }
  };

  const resetPass = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/reset_password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error('No se pudo resetear la contraseña');
      const data = await res.json();
      if (data.temp_password) {
        alert(`Contraseña temporal: ${data.temp_password}`);
      } else {
        alert('Contraseña actualizada');
      }
    } catch (e: any) {
      alert(e.message || 'Error reseteando contraseña');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-3"><Shield className="text-amber-600" /> Administración General</h1>
          <div className="flex items-center gap-3">
            <Link to={PANEL_BASE} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">Ir al Panel Editorial</Link>
            <button onClick={crearUsuario} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"><UserPlus size={16}/> Crear editor</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-stone-700"><Users/> <span className="font-semibold">Usuarios totales</span></div>
            <div className="text-3xl font-bold mt-2">{usuarios.length}</div>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-stone-700"><Edit3/> <span className="font-semibold">Roles activos</span></div>
            <div className="text-3xl font-bold mt-2">{roles.length}</div>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 text-stone-700"><Pencil/> <span className="font-semibold">Correcciones de noticias</span></div>
            <div className="text-sm text-stone-500 mt-2">Acceso permitido (ADMIN) para editar noticias de otros.</div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center bg-stone-100 rounded-lg px-3"><Search className="text-stone-500"/><input value={q} onChange={e=>setQ(e.target.value)} className="bg-transparent p-2 outline-none" placeholder="Buscar por nombre/correo/rol"/></div>
            <div className="flex items-center gap-2"><Filter className="text-stone-500"/>
              <select value={filtroRol} onChange={e=>setFiltroRol(e.target.value)} className="border rounded-lg px-3 py-2">
                <option value="">Todos</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-stone-500 border-b">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(u => (
                  <tr key={u.id} className="border-b hover:bg-stone-50">
                    <td className="py-3 px-4">{u.nombre}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <select value={u.rol} onChange={e=>asignarRol(u.id, e.target.value as Usuario['rol'])} className="border rounded-lg px-2 py-1">
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${u.activo? 'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{u.activo? 'Activo':'Inactivo'}</span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button onClick={()=>resetPass(u.id)} className="px-3 py-1 rounded bg-stone-200 hover:bg-stone-300">Reset Pass</button>
                      <button onClick={()=>desactivarUsuario(u.id)} className="px-3 py-1 rounded bg-red-200 hover:bg-red-300">{u.activo? 'Desactivar':'Activar'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-sm text-stone-500">
          <p>Nota: Este panel es exclusivo para ADMIN. Aquí se gestionan usuarios y roles. La edición de noticias sigue en el Panel Editorial.</p>
        </div>
      </div>

      {/* Modal Crear Usuario/Editor */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold mb-4">Crear usuario</h2>
            {createError && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{createError}</div>}
            <form onSubmit={submitCrearUsuario} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input value={newUser.nombre} onChange={e=>setNewUser(v=>({...v, nombre: e.target.value}))} required className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={newUser.email} onChange={e=>setNewUser(v=>({...v, email: e.target.value}))} required className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contraseña</label>
                <input type="password" value={newUser.password} onChange={e=>setNewUser(v=>({...v, password: e.target.value}))} required className="w-full border rounded-lg px-3 py-2"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rol</label>
                <select value={newUser.rol} onChange={e=>setNewUser(v=>({...v, rol: e.target.value as Usuario['rol']}))} className="w-full border rounded-lg px-3 py-2">
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=>setShowCreate(false)} className="px-4 py-2 rounded-lg bg-stone-200 hover:bg-stone-300">Cancelar</button>
                <button disabled={loading} type="submit" className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white">{loading? 'Creando...' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
