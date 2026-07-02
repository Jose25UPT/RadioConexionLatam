// Cliente API centralizado (base URL + headers)
function inferBase(): string {
  // 1) Permitir configurar con VITE_API_BASE (URL completa)
  const envBase = (import.meta as any)?.env?.VITE_API_BASE;
  if (envBase) return String(envBase).replace(/\/$/, '');

  // 2) Alias simple: VITE_API_KEY (también espera una URL completa)
  const envKey = (import.meta as any)?.env?.VITE_API_KEY;
  if (envKey) return String(envKey).replace(/\/$/, '');
  try {
    const ls = typeof localStorage !== 'undefined' ? localStorage.getItem('api_base_override') : null;
    if (ls) return ls.replace(/\/$/, '');
  } catch {}
  if (typeof window !== 'undefined') {
    // Por defecto usa el mismo origen donde corre el frontend
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:8000';
}

export let API_BASE: string = inferBase();
export function setApiBase(url: string) {
  API_BASE = String(url || '').replace(/\/$/, '');
  try { localStorage.setItem('api_base_override', API_BASE); } catch {}
}

export async function fetchJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(init?.headers || {}),
  };
  if (token && !(headers as Record<string, string>)['Authorization']) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  // Auto-set Content-Type for JSON string bodies (skip FormData — browser sets multipart boundary)
  if (typeof init?.body === 'string' && !(headers as Record<string, string>)['Content-Type']) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    if (res.status === 401 && typeof localStorage !== 'undefined') {
      const hadToken = localStorage.getItem('auth_token');
      if (hadToken) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        if (typeof window !== 'undefined' &&
            window.location.pathname.startsWith('/secure_panel_rva_gestor_2025')) {
          window.location.href = '/secure_panel_rva_gestor_2025/login?expired=1';
        }
      }
      throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
    }
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detail || body?.message || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(`HTTP ${res.status}${detail ? `: ${detail}` : ` ${res.statusText}`}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return null as T;
  return res.json();
}
