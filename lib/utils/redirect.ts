/**
 * Valida o destino de redirecionamento pós-login (`?next=`).
 * Aceita apenas caminhos relativos ao próprio app ("/..."), rejeitando
 * URLs absolutas, protocol-relative ("//") e variantes com barra invertida.
 */
export function getSafeNext(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//') || value.startsWith('/\\')) return null;
  if (/[\u0000-\u001f]/.test(value)) return null;
  return value;
}

/** Lê e valida `?next=` da URL atual (somente no cliente). */
export function getNextFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return getSafeNext(new URLSearchParams(window.location.search).get('next'));
  } catch {
    return null;
  }
}

export function loginUrlWithNext(path: string): string {
  const next = getSafeNext(path);
  if (!next || next === '/' || next.startsWith('/login')) return '/login';
  return `/login?next=${encodeURIComponent(next)}`;
}
