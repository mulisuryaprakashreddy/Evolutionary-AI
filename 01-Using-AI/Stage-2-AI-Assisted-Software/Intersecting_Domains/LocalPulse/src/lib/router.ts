import { useCallback, useEffect, useState } from 'react';

// Lightweight hash-based router: #/path/segment
export function useRoute(): [string, (path: string) => void] {
  const [path, setPath] = useState<string>(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onChange = () => {
      setPath(window.location.hash.slice(1) || '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((p: string) => {
    window.location.hash = p;
  }, []);

  return [path, navigate];
}

export function matchRoute(path: string): {
  name: string;
  params: Record<string, string>;
} {
  const clean = path.split('?')[0];
  const segments = clean.split('/').filter(Boolean);

  if (segments.length === 0) return { name: 'home', params: {} };
  if (segments[0] === 'explore') return { name: 'explore', params: {} };
  if (segments[0] === 'map') return { name: 'map', params: {} };
  if (segments[0] === 'rankings') return { name: 'rankings', params: {} };
  if (segments[0] === 'chat') return { name: 'chat', params: {} };
  if (segments[0] === 'settings') return { name: 'settings', params: {} };
  if (segments[0] === 'auth') return { name: 'auth', params: { mode: segments[1] || 'signin' } };
  if (segments[0] === 'dashboard') return { name: 'dashboard', params: {} };
  if (segments[0] === 'report' && segments[1] === 'new') return { name: 'report-new', params: {} };
  if (segments[0] === 'reports' && segments[1]) return { name: 'report-detail', params: { id: segments[1] } };
  if (segments[0] === 'community' && segments[1]) {
    return { name: 'community', params: { city: decodeURIComponent(segments[1]) } };
  }

  return { name: 'not-found', params: {} };
}

export function navigateTo(path: string) {
  window.location.hash = path;
}
