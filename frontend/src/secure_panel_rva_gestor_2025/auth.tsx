import React from 'react';
import LoginPanel from './Login';
import { Navigate } from 'react-router-dom';
import { PANEL_BASE } from './secureRoute';

export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

function padBase64(b64: string): string {
  const pad = b64.length % 4;
  if (pad === 2) return b64 + '==';
  if (pad === 3) return b64 + '=';
  if (pad === 1) return b64 + '==='; // extremely rare
  return b64;
}

export function decodeJwt(token: string): any | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padBase64(normalized));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export function getUserRole(): Role | null {
  const token = getToken();
  if (!token) return null;
  const payload = decodeJwt(token) || {};
  // Heurísticas para extraer rol
  const candidates: any[] = [
    payload.role,
    payload.rol,
    payload.user_role,
    Array.isArray(payload.roles) ? payload.roles[0] : undefined,
    Array.isArray(payload.scopes) ? payload.scopes.find((s: string) => /admin|editor|redactor|moderator|viewer/i.test(s)) : undefined,
    payload.is_admin ? 'ADMIN' : undefined,
  ].filter(Boolean);

  if (!candidates.length) {
    const stored = localStorage.getItem('user_role');
    if (stored) return stored.toUpperCase() as Role;
    const envDefault = (import.meta as any).env?.VITE_DEFAULT_ROLE;
    return envDefault ? String(envDefault).toUpperCase() as Role : null;
  }

  const roleStr = String(candidates[0]).toUpperCase();
  if (roleStr.includes('ADMIN')) return 'ADMIN';
  if (roleStr.includes('EDITOR')) return 'EDITOR';
  // Unificar AUTOR/REDACTOR/MOD* como EDITOR o VIEWER
  if (roleStr.includes('REDACTOR') || roleStr.includes('AUTHOR') || roleStr.includes('WRITER') || roleStr.includes('AUTOR') || roleStr.includes('MOD')) return 'EDITOR';
  return 'VIEWER';
}

export function userHasRole(required: Role | Role[] | undefined): boolean {
  if (!required) return true; // solo autenticación
  const role = getUserRole();
  if (!role) return false;
  const requiredList = Array.isArray(required) ? required : [required];
  // Jerarquía simple: ADMIN > EDITOR > REDACTOR > MODERATOR > VIEWER
  const weight: Record<Role, number> = { ADMIN: 3, EDITOR: 2, VIEWER: 1 };
  // Permitir si el rol está explícitamente en la lista
  if (requiredList.includes(role)) return true;
  // O si su jerarquía es mayor o igual al mínimo requerido (para que ADMIN pase en rutas de EDITOR/REDACTOR)
  const minAllowed = Math.min(...requiredList.map(r => weight[r]));
  return weight[role] >= minAllowed;
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_role');
}

export const RequireAuth: React.FC<{ children: React.ReactNode; roles?: Role | Role[] }>
  = ({ children, roles }) => {
    const token = getToken();
    if (!token) return <LoginPanel />;
    if (!userHasRole(roles)) {
      const req = Array.isArray(roles) ? roles : (roles ? [roles] : []);
      const onlyAdmin = req.length === 1 && req[0] === 'ADMIN';
      // Si intenta acceder a una ruta sólo ADMIN y no lo es, mejor redirigir al panel editorial
      if (onlyAdmin) return <Navigate to={PANEL_BASE} replace />;
      return <div className="min-h-screen flex items-center justify-center bg-stone-50"><div className="bg-white p-8 rounded-xl shadow border text-center"><h2 className="text-xl font-bold mb-2 text-red-600">Acceso denegado</h2><p className="text-stone-600">No tienes permisos para acceder a esta sección.</p></div></div>;
    }
    return <>{children}</>;
  };
