import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Users, UserPlus, Shield, Search, Trash2, LogOut,
  Pencil, Check, X, Camera, KeyRound, Loader2,
  AlertCircle, CheckCircle, UserCog, BarChart2,
} from 'lucide-react';
import MetricasAdmin from './MetricasAdmin';
import { useNavigate } from 'react-router-dom';
import { PANEL_BASE } from './secureRoute';
import { API_BASE } from '../lib/api';

type Rol = 'admin' | 'editor';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  avatar?: string | null;
  titulo?: string | null;
  biografia?: string | null;
  frase_personal?: string | null;
  redes_sociales?: Record<string, string>;
}

const REDES_PLATAFORMAS = [
  { key: 'facebook',  label: 'Facebook',   placeholder: 'https://facebook.com/...' },
  { key: 'instagram', label: 'Instagram',  placeholder: 'https://instagram.com/...' },
  { key: 'twitter',   label: 'Twitter / X', placeholder: 'https://x.com/...' },
  { key: 'youtube',   label: 'YouTube',    placeholder: 'https://youtube.com/...' },
  { key: 'tiktok',    label: 'TikTok',     placeholder: 'https://tiktok.com/@...' },
  { key: 'spotify',   label: 'Spotify',    placeholder: 'https://open.spotify.com/...' },
];

interface Toast { type: 'ok' | 'err'; msg: string }

interface ProfileForm {
  titulo: string;
  bio: string;
  frase: string;
  redes_sociales: Record<string, string>;
}

const ROL_LABELS: Record<Rol, string> = { admin: 'Admin', editor: 'Editor' };
const ROLES: Rol[] = ['admin', 'editor'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [q, setQ] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    nombre: '', email: '', password: '', rol: 'editor' as Rol,
    titulo: '', bio: '', frase: '',
  });
  const [toast, setToast] = useState<Toast | null>(null);

  // Edición inline de nombre
  const [editingName, setEditingName] = useState<{ id: string; value: string } | null>(null);
  const [savingName, setSavingName] = useState<string | null>(null);

  // Foto
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Reset contraseña
  const [resettingPass, setResettingPass] = useState<string | null>(null);

  // Cambio de estado activo
  const [togglingActivo, setTogglingActivo] = useState<string | null>(null);

  // Modal edición de perfil
  const [editProfile, setEditProfile] = useState<{ id: string; form: ProfileForm } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Métricas
  const [showMetricas, setShowMetricas] = useState(false);

  const showToast = (type: 'ok' | 'err', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  const authHeader = (): Record<string, string> => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const cargar = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const mapped: Usuario[] = (Array.isArray(data) ? data : data.users || []).map((u: any) => ({
        id: String(u.id),
        nombre: u.nombre_usuario || u.nombre || '',
        email: u.email || '',
        rol: (u.rol || 'editor').toLowerCase() as Rol,
        activo: u.activo ?? true,
        avatar: u.avatar || null,
        titulo: u.titulo || null,
        biografia: u.biografia || null,
        frase_personal: u.frase_personal || null,
        redes_sociales: u.redes_sociales || {},
      }));
      setUsuarios(mapped);
    } catch {
      setUsuarios([]);
    }
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() =>
    usuarios.filter(u =>
      [u.nombre, u.email, u.rol].some(v => v.toLowerCase().includes(q.toLowerCase()))
    ), [usuarios, q]);

  // ── Cambiar rol ─────────────────────────────────────────────────────────
  const asignarRol = async (id: string, rol: Rol) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ rol }),
      });
      if (!res.ok) throw new Error('No se pudo actualizar el rol');
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol } : u));
      showToast('ok', 'Rol actualizado');
    } catch (e: any) {
      showToast('err', e.message || 'Error cambiando rol');
    }
  };

  // ── Cambiar activo ───────────────────────────────────────────────────────
  const setActivo = async (id: string, activo: boolean) => {
    setTogglingActivo(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/activo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ activo }),
      });
      if (!res.ok) throw new Error('No se pudo cambiar el estado');
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo } : u));
      showToast('ok', activo ? 'Usuario activado' : 'Usuario desactivado');
    } catch (e: any) {
      showToast('err', e.message || 'Error cambiando estado');
    } finally {
      setTogglingActivo(null);
    }
  };

  // ── Editar nombre inline ─────────────────────────────────────────────────
  const startEditName = (u: Usuario) => setEditingName({ id: u.id, value: u.nombre });
  const cancelEditName = () => setEditingName(null);

  const saveEditName = async () => {
    if (!editingName) return;
    const { id, value } = editingName;
    const nombre = value.trim();
    if (!nombre) return;
    setSavingName(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/nombre`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ nombre_usuario: nombre }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || 'Error guardando nombre');
      }
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, nombre } : u));
      setEditingName(null);
      showToast('ok', 'Nombre actualizado');
    } catch (e: any) {
      showToast('err', e.message || 'Error guardando nombre');
    } finally {
      setSavingName(null);
    }
  };

  // ── Subir foto ───────────────────────────────────────────────────────────
  const handlePhotoChange = async (id: string, file: File) => {
    setUploadingPhoto(id);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/api/uploads/imagen?usuario_id=${id}`, {
        method: 'POST',
        headers: authHeader(),
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || 'Error subiendo foto');
      }
      const data = await res.json();
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, avatar: data.url || null } : u));
      showToast('ok', 'Foto actualizada');
    } catch (e: any) {
      showToast('err', e.message || 'Error subiendo foto');
    } finally {
      setUploadingPhoto(null);
    }
  };

  // ── Reset contraseña ─────────────────────────────────────────────────────
  const resetPass = async (id: string) => {
    setResettingPass(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/reset_password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Error reseteando contraseña');
      const data = await res.json();
      if (data.temp_password) {
        showToast('ok', `Contraseña temporal: ${data.temp_password}`);
        setTimeout(() => alert(`Contraseña temporal generada:\n\n${data.temp_password}\n\nCópiala antes de cerrar.`), 100);
      } else {
        showToast('ok', 'Contraseña actualizada');
      }
    } catch (e: any) {
      showToast('err', e.message || 'Error reseteando contraseña');
    } finally {
      setResettingPass(null);
    }
  };

  // ── Eliminar usuario ─────────────────────────────────────────────────────
  const eliminarUsuario = async (id: string) => {
    if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      if (!res.ok) throw new Error('No se pudo eliminar el usuario');
      setUsuarios(prev => prev.filter(u => u.id !== id));
      showToast('ok', 'Usuario eliminado');
    } catch (e: any) {
      showToast('err', e.message || 'Error eliminando usuario');
    }
  };

  // ── Abrir modal perfil ───────────────────────────────────────────────────
  const openEditProfile = (u: Usuario) => {
    setEditProfile({
      id: u.id,
      form: {
        titulo: u.titulo || '',
        bio: u.biografia || '',
        frase: u.frase_personal || '',
        redes_sociales: { ...(u.redes_sociales || {}) },
      },
    });
  };

  const saveProfile = async () => {
    if (!editProfile) return;
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${editProfile.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          titulo: editProfile.form.titulo || null,
          bio: editProfile.form.bio || null,
          frase: editProfile.form.frase || null,
          redes_sociales: Object.fromEntries(
            Object.entries(editProfile.form.redes_sociales).filter(([, v]) => v.trim())
          ),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || 'Error guardando perfil');
      }
      setUsuarios(prev => prev.map(u =>
        u.id === editProfile.id
          ? {
              ...u,
              titulo: editProfile.form.titulo || null,
              biografia: editProfile.form.bio || null,
              frase_personal: editProfile.form.frase || null,
              redes_sociales: editProfile.form.redes_sociales,
            }
          : u
      ));
      setEditProfile(null);
      showToast('ok', 'Perfil actualizado');
    } catch (e: any) {
      showToast('err', e.message || 'Error guardando perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Crear usuario ────────────────────────────────────────────────────────
  const submitCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCreateError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          nombre_usuario: newUser.nombre,
          email: newUser.email,
          password: newUser.password,
          rol: newUser.rol,
          titulo: newUser.titulo || undefined,
          bio: newUser.bio || undefined,
          frase: newUser.frase || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || 'No se pudo crear el usuario');
      }
      const created = await res.json();
      const newId = String(created.id || Date.now());
      setUsuarios(prev => [{
        id: newId,
        nombre: created.nombre_usuario || newUser.nombre,
        email: created.email || newUser.email,
        rol: (created.rol || newUser.rol).toLowerCase() as Rol,
        activo: created.activo ?? true,
        avatar: null,
        titulo: newUser.titulo || null,
        biografia: newUser.bio || null,
        frase_personal: newUser.frase || null,
      }, ...prev]);
      setShowCreate(false);
      setNewUser({ nombre: '', email: '', password: '', rol: 'editor', titulo: '', bio: '', frase: '' });
      showToast('ok', 'Editor creado');
    } catch (e: any) {
      setCreateError(e.message || 'Error creando usuario');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    navigate(`${PANEL_BASE}/login`);
  };

  const resolveAvatar = (u: Usuario) =>
    u.avatar
      ? (u.avatar.startsWith('http') ? u.avatar : `${API_BASE}${u.avatar}`)
      : '/logo.jpg';

  // ── Avatar con botón de cámara ───────────────────────────────────────────
  const renderAvatar = (u: Usuario) => (
    <div className="relative group/avatar w-10 h-10 flex-shrink-0">
      <img
        src={resolveAvatar(u)}
        alt={u.nombre}
        className="w-10 h-10 rounded-full object-cover border-2 border-stone-200"
      />
      <button
        onClick={() => fileInputRefs.current[u.id]?.click()}
        disabled={uploadingPhoto === u.id}
        title="Cambiar foto"
        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity"
      >
        {uploadingPhoto === u.id
          ? <Loader2 size={14} className="text-white animate-spin" />
          : <Camera size={14} className="text-white" />}
      </button>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={el => { fileInputRefs.current[u.id] = el; }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoChange(u.id, f); e.target.value = ''; }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm ${
          toast.type === 'ok'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {toast.type === 'ok'
            ? <CheckCircle size={16} className="flex-shrink-0" />
            : <AlertCircle size={16} className="flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Shield size={22} className="text-amber-600" /> Gestión de Usuarios
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowMetricas(true)}
                className="flex items-center gap-1.5 bg-stone-100 text-stone-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-stone-200 transition-all text-sm font-medium border border-stone-200"
                title="Ver métricas">
                <BarChart2 size={16} className="text-amber-600" />
                <span className="hidden sm:inline">Métricas</span>
              </button>
              <button onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 bg-amber-600 text-white px-3 sm:px-5 py-2 rounded-lg hover:bg-amber-700 transition-all text-sm font-medium">
                <UserPlus size={16} />
                <span className="hidden sm:inline">Crear editor</span>
                <span className="sm:hidden">Crear</span>
              </button>
              <button onClick={logout}
                className="p-2 bg-red-50 rounded-lg hover:bg-red-100 text-red-600" title="Cerrar sesión">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Stat */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3">
          <Users className="text-amber-600" size={20} />
          <span className="text-stone-700 font-medium">{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nombre, correo o rol..."
            className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white text-sm"
          />
        </div>

        {/* Tabla desktop */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide w-12">Foto</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Usuario</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Correo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Rol</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtrados.map(u => (
                  <tr key={u.id} className={`hover:bg-stone-50 ${!u.activo ? 'opacity-60' : ''}`}>
                    {/* Foto */}
                    <td className="py-3 px-4">{renderAvatar(u)}</td>

                    {/* Nombre + título */}
                    <td className="py-3 px-4">
                      {editingName?.id === u.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={editingName.value}
                            onChange={e => setEditingName(v => v ? { ...v, value: e.target.value } : v)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEditName(); if (e.key === 'Escape') cancelEditName(); }}
                            className="border border-amber-400 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-amber-500 outline-none w-36"
                          />
                          <button onClick={saveEditName} disabled={savingName === u.id}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-lg">
                            {savingName === u.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button onClick={cancelEditName} className="p-1 text-stone-400 hover:bg-stone-100 rounded-lg">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group/name">
                          <div>
                            <span className="font-medium text-stone-800 text-sm">{u.nombre}</span>
                            {u.titulo && <p className="text-xs text-stone-400 truncate max-w-[140px]">{u.titulo}</p>}
                          </div>
                          <button onClick={() => startEditName(u)}
                            className="p-1 text-stone-300 hover:text-amber-600 opacity-0 group-hover/name:opacity-100 transition-opacity rounded flex-shrink-0">
                            <Pencil size={12} />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Correo */}
                    <td className="py-3 px-4 text-sm text-stone-600 max-w-[180px] truncate">{u.email}</td>

                    {/* Rol */}
                    <td className="py-3 px-4">
                      <select
                        value={u.rol}
                        onChange={e => asignarRol(u.id, e.target.value as Rol)}
                        className="border border-stone-300 rounded-lg px-2 py-1 text-sm focus:ring-amber-500"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{ROL_LABELS[r]}</option>)}
                      </select>
                    </td>

                    {/* Estado */}
                    <td className="py-3 px-4">
                      <div className="relative">
                        {togglingActivo === u.id && (
                          <Loader2 size={13} className="animate-spin absolute right-6 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none z-10" />
                        )}
                        <select
                          value={u.activo ? 'activo' : 'inactivo'}
                          onChange={e => setActivo(u.id, e.target.value === 'activo')}
                          disabled={togglingActivo === u.id}
                          className={`border rounded-lg px-2 py-1 text-sm disabled:opacity-50 ${
                            u.activo
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-red-200 bg-red-50 text-red-600'
                          }`}
                        >
                          <option value="activo">Activo</option>
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditProfile(u)}
                          title="Editar perfil"
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                        >
                          <UserCog size={14} />
                        </button>
                        <button
                          onClick={() => resetPass(u.id)}
                          disabled={resettingPass === u.id}
                          title="Resetear contraseña"
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg disabled:opacity-50"
                        >
                          {resettingPass === u.id ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                        </button>
                        <button onClick={() => eliminarUsuario(u.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-stone-400 text-sm">No se encontraron usuarios</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas mobile */}
          <div className="md:hidden divide-y divide-stone-100">
            {filtrados.map(u => (
              <div key={u.id} className={`p-4 space-y-3 ${!u.activo ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  {renderAvatar(u)}
                  <div className="flex-1 min-w-0">
                    {editingName?.id === u.id ? (
                      <div className="flex items-center gap-1 mb-1">
                        <input
                          autoFocus
                          value={editingName.value}
                          onChange={e => setEditingName(v => v ? { ...v, value: e.target.value } : v)}
                          onKeyDown={e => { if (e.key === 'Enter') saveEditName(); if (e.key === 'Escape') cancelEditName(); }}
                          className="border border-amber-400 rounded px-2 py-0.5 text-sm w-full"
                        />
                        <button onClick={saveEditName} className="p-1 text-green-600">
                          {savingName === u.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        </button>
                        <button onClick={cancelEditName} className="p-1 text-stone-400"><X size={13} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="min-w-0">
                          <span className="font-medium text-stone-800 text-sm truncate block">{u.nombre}</span>
                          {u.titulo && <p className="text-xs text-stone-400 truncate">{u.titulo}</p>}
                        </div>
                        <button onClick={() => startEditName(u)} className="p-0.5 text-stone-300 hover:text-amber-600 flex-shrink-0">
                          <Pencil size={11} />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-stone-500 truncate">{u.email}</p>
                  </div>
                  <select
                    value={u.rol}
                    onChange={e => asignarRol(u.id, e.target.value as Rol)}
                    className="border border-stone-300 rounded-lg px-1.5 py-1 text-xs flex-shrink-0"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{ROL_LABELS[r]}</option>)}
                  </select>
                </div>

                {/* Estado mobile */}
                <select
                  value={u.activo ? 'activo' : 'inactivo'}
                  onChange={e => setActivo(u.id, e.target.value === 'activo')}
                  disabled={togglingActivo === u.id}
                  className={`w-full border rounded-lg px-2 py-1.5 text-sm disabled:opacity-50 ${
                    u.activo ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-600'
                  }`}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>

                {/* Acciones mobile */}
                <div className="flex gap-2">
                  <button onClick={() => openEditProfile(u)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs">
                    <UserCog size={13} /> Editar perfil
                  </button>
                  <button onClick={() => resetPass(u.id)} disabled={resettingPass === u.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-xs disabled:opacity-50">
                    {resettingPass === u.id ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                    Reset
                  </button>
                  <button onClick={() => eliminarUsuario(u.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {filtrados.length === 0 && (
              <div className="text-center py-8 text-stone-400 text-sm">No se encontraron usuarios</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: editar perfil ──────────────────────────────────────────── */}
      {editProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-800">Editar perfil</h2>
              <button onClick={() => setEditProfile(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Título <span className="text-stone-400 font-normal">(cargo o especialidad)</span>
                </label>
                <input
                  value={editProfile.form.titulo}
                  onChange={e => setEditProfile(v => v ? { ...v, form: { ...v.form, titulo: e.target.value } } : v)}
                  placeholder="Ej: Editor en Jefe, Redactor Cultural…"
                  maxLength={150}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Biografía</label>
                <textarea
                  value={editProfile.form.bio}
                  onChange={e => setEditProfile(v => v ? { ...v, form: { ...v.form, bio: e.target.value } } : v)}
                  placeholder="Breve descripción del editor, sus intereses y trayectoria…"
                  rows={4}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Frase personal <span className="text-stone-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={editProfile.form.frase}
                  onChange={e => setEditProfile(v => v ? { ...v, form: { ...v.form, frase: e.target.value } } : v)}
                  placeholder="Una cita o frase que lo represente…"
                  rows={2}
                  maxLength={300}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>

              {/* Redes sociales */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Redes sociales <span className="text-stone-400 font-normal">(opcional)</span>
                </label>
                <div className="space-y-2">
                  {REDES_PLATAFORMAS.map(({ key, label, placeholder }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-24 text-xs text-stone-500 flex-shrink-0">{label}</span>
                      <input
                        type="url"
                        value={editProfile.form.redes_sociales[key] || ''}
                        onChange={e => setEditProfile(v => v
                          ? { ...v, form: { ...v.form, redes_sociales: { ...v.form.redes_sociales, [key]: e.target.value } } }
                          : v
                        )}
                        placeholder={placeholder}
                        maxLength={500}
                        className="flex-1 border border-stone-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-stone-100 flex gap-3">
              <button onClick={() => setEditProfile(null)}
                className="flex-1 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm">
                Cancelar
              </button>
              <button onClick={saveProfile} disabled={savingProfile}
                className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                {savingProfile && <Loader2 size={14} className="animate-spin" />}
                {savingProfile ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: crear usuario ──────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-stone-800">Crear nuevo editor</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>
            {createError && (
              <div className="mx-5 mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{createError}</div>
            )}
            <form onSubmit={submitCrear} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                {/* Campos obligatorios */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Nombre de usuario <span className="text-red-500">*</span></label>
                  <input value={newUser.nombre} onChange={e => setNewUser(v => ({ ...v, nombre: e.target.value }))}
                    required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Correo <span className="text-red-500">*</span></label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser(v => ({ ...v, email: e.target.value }))}
                    required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Contraseña <span className="text-red-500">*</span></label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser(v => ({ ...v, password: e.target.value }))}
                    required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Rol <span className="text-red-500">*</span></label>
                  <select value={newUser.rol} onChange={e => setNewUser(v => ({ ...v, rol: e.target.value as Rol }))}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-amber-500">
                    {ROLES.map(r => <option key={r} value={r}>{ROL_LABELS[r]}</option>)}
                  </select>
                </div>

                {/* Separador perfil */}
                <div className="pt-1">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="flex-1 h-px bg-stone-200" /> Perfil (opcional) <span className="flex-1 h-px bg-stone-200" />
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Título / cargo</label>
                      <input value={newUser.titulo} onChange={e => setNewUser(v => ({ ...v, titulo: e.target.value }))}
                        placeholder="Ej: Editor en Jefe, Redactor Cultural…"
                        maxLength={150}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-amber-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Biografía</label>
                      <textarea value={newUser.bio} onChange={e => setNewUser(v => ({ ...v, bio: e.target.value }))}
                        placeholder="Breve descripción del editor…"
                        rows={3}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-amber-500 resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Frase personal</label>
                      <textarea value={newUser.frase} onChange={e => setNewUser(v => ({ ...v, frase: e.target.value }))}
                        placeholder="Una cita o frase que lo represente…"
                        rows={2}
                        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-amber-500 resize-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-stone-100 flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {loading ? 'Creando…' : 'Crear editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMetricas && <MetricasAdmin onClose={() => setShowMetricas(false)} />}
    </div>
  );
};

export default AdminDashboard;
