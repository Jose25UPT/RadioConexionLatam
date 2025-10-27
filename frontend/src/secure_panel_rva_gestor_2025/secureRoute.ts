// Utilidad para ofuscar la ruta del panel de administración
// Nota: Esto no es seguridad real, solo ofuscación de la URL. El acceso sigue protegido por token.

function base64Url(input: string): string {
  // btoa espera Latin1; usamos entrada ASCII simple
  const b64 = btoa(input);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const SEED: string = (import.meta as any).env?.VITE_PANEL_SEED || 'rva-2025';
const RAW = `panel:${SEED}:v1`;
const OBFUSCATED = base64Url(RAW);

export const PANEL_BASE = `/p/${OBFUSCATED}`;
export const PANEL_LOGIN = `${PANEL_BASE}/login`;
