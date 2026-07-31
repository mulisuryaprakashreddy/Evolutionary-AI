import { useEffect, useState } from 'react';
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X } from 'lucide-react';
import { useStore } from '../store';
import { CATEGORIES } from '../data';
import { CategoryIcon } from './CategoryIcon';

export function Header() {
  const { navigate, route, cartCount, wishlist, theme, toggleTheme } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [route]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ name: 'browse', q: search.trim() || undefined });
  }

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-card' : 'bg-bg-elev/80 backdrop-blur-sm'}`}>
      <div className="mx-auto flex h-16 max-w-8xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate({ name: 'home' })} className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white shadow-sm">
            <ShoppingBag size={18} />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-app">RentHub</span>
        </button>

        <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-app-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What would you like to borrow today?"
            className="input pl-12 pr-4"
            aria-label="Search rentals"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate({ name: 'browse' })}
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-app-soft transition-colors hover:bg-bg-soft hover:text-app lg:block"
          >
            Browse
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-lg text-app-soft transition-colors hover:bg-bg-soft hover:text-app"
          >
            {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
          </button>
          <button
            onClick={() => navigate({ name: 'wishlist' })}
            aria-label="Wishlist"
            className="relative grid h-10 w-10 place-items-center rounded-lg text-app-soft transition-colors hover:bg-bg-soft hover:text-app"
          >
            <Heart size={19} />
            {wishlist.length > 0 && <Badge count={wishlist.length} />}
          </button>
          <button
            onClick={() => navigate({ name: 'cart' })}
            aria-label="Cart"
            className="relative grid h-10 w-10 place-items-center rounded-lg text-app-soft transition-colors hover:bg-bg-soft hover:text-app"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && <Badge count={cartCount} />}
          </button>
          <button
            onClick={() => navigate({ name: 'dashboard' })}
            aria-label="Account"
            className="hidden h-10 w-10 place-items-center rounded-lg text-app-soft transition-colors hover:bg-bg-soft hover:text-app sm:grid"
          >
            <User size={19} />
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-lg text-app-soft transition-colors hover:bg-bg-soft hover:text-app md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Category strip */}
      <nav className="hidden border-t border-app/5 md:block">
        <div className="mx-auto flex max-w-8xl items-center gap-1 overflow-x-auto px-4 py-1.5 no-scrollbar sm:px-6 lg:px-8">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ name: 'browse', category: c.id })}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-app-soft transition-colors hover:bg-bg-soft hover:text-app"
            >
              <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-app/5 bg-bg-elev md:hidden">
          <form onSubmit={submitSearch} className="relative p-4">
            <Search size={18} className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-app-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rentals..."
              className="input pl-12"
            />
          </form>
          <div className="grid grid-cols-2 gap-1 px-3 pb-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate({ name: 'browse', category: c.id })}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-app-soft hover:bg-bg-soft"
              >
                <CategoryIcon name={c.icon} className="h-4 w-4" />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-white shadow-sm">
      {count > 99 ? '99+' : count}
    </span>
  );
}
