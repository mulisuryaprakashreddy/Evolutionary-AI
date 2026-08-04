import { useEffect, useState } from 'react';

export type Route =
  | { name: 'landing' }
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'dashboard' }
  | { name: 'editor'; resumeId: string };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { name: 'landing' };
  if (parts[0] === 'login') return { name: 'login' };
  if (parts[0] === 'register') return { name: 'register' };
  if (parts[0] === 'dashboard') return { name: 'dashboard' };
  if (parts[0] === 'editor' && parts[1]) return { name: 'editor', resumeId: parts[1] };
  return { name: 'landing' };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(path: string) {
  window.location.hash = path;
}
