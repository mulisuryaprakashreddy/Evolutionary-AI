import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Route } from './types';

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function parseHash(): Route {
  const hash = window.location.hash.slice(1);
  if (hash === '' || hash === '/') return { name: 'home' };
  if (hash === '/trending') return { name: 'trending' };
  if (hash.startsWith('/watch/')) return { name: 'watch', videoId: hash.slice('/watch/'.length) };
  if (hash.startsWith('/channel/')) return { name: 'channel', channelId: hash.slice('/channel/'.length) };
  if (hash.startsWith('/search/')) return { name: 'search', query: decodeURIComponent(hash.slice('/search/'.length)) };
  return { name: 'home' };
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home': return '/';
    case 'trending': return '/trending';
    case 'watch': return `/watch/${route.videoId}`;
    case 'channel': return `/channel/${route.channelId}`;
    case 'search': return `/search/${encodeURIComponent(route.query)}`;
  }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((newRoute: Route) => {
    window.location.hash = routeToHash(newRoute);
  }, []);

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
