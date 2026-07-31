import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem } from './types';

export type Route =
  | { name: 'home' }
  | { name: 'browse'; category?: string; q?: string }
  | { name: 'listing'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'confirmation' }
  | { name: 'wishlist' }
  | { name: 'dashboard' };

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreState {
  route: Route;
  navigate: (route: Route) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateCartItem: (index: number, patch: Partial<CartItem>) => void;
  clearCart: () => void;
  cartCount: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  toasts: Toast[];
  notify: (message: string, type?: Toast['type']) => void;
  recentlyViewed: string[];
  trackView: (id: string) => void;
}

const StoreContext = createContext<StoreState | null>(null);

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [path, query] = hash.split('?');
  const segments = path.split('/').filter(Boolean);
  const params = new URLSearchParams(query || '');
  if (segments.length === 0) return { name: 'home' };
  switch (segments[0]) {
    case 'browse':
      return { name: 'browse', category: params.get('category') || undefined, q: params.get('q') || undefined };
    case 'listing':
      return segments[1] ? { name: 'listing', id: segments[1] } : { name: 'home' };
    case 'cart':
      return { name: 'cart' };
    case 'checkout':
      return { name: 'checkout' };
    case 'confirmation':
      return { name: 'confirmation' };
    case 'wishlist':
      return { name: 'wishlist' };
    case 'dashboard':
      return { name: 'dashboard' };
    default:
      return { name: 'home' };
  }
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'browse': {
      const params = new URLSearchParams();
      if (route.category) params.set('category', route.category);
      if (route.q) params.set('q', route.q);
      const qs = params.toString();
      return qs ? `#/browse?${qs}` : '#/browse';
    }
    case 'listing':
      return `#/listing/${route.id}`;
    case 'cart':
      return '#/cart';
    case 'checkout':
      return '#/checkout';
    case 'confirmation':
      return '#/confirmation';
    case 'wishlist':
      return '#/wishlist';
    case 'dashboard':
      return '#/dashboard';
  }
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash());
  const [cart, setCart] = useState<CartItem[]>(() => loadJSON('rh_cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => loadJSON('rh_wishlist', []));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadJSON<'light' | 'dark'>('rh_theme', 'light'));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => loadJSON('rh_recent', []));

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    localStorage.setItem('rh_cart', JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem('rh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    localStorage.setItem('rh_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);
  useEffect(() => {
    localStorage.setItem('rh_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const navigate = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
  }, []);

  const notify = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => [...prev, item]);
  }, []);
  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const updateCartItem = useCallback((index: number, patch: Partial<CartItem>) => {
    setCart((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]));
  }, []);
  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  const trackView = useCallback((id: string) => {
    setRecentlyViewed((prev) => [id, ...prev.filter((r) => r !== id)].slice(0, 8));
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const value: StoreState = {
    route, navigate, cart, addToCart, removeFromCart, updateCartItem, clearCart, cartCount,
    wishlist, toggleWishlist, isWishlisted, theme, toggleTheme, toasts, notify,
    recentlyViewed, trackView,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
