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
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  return res.json();
}
