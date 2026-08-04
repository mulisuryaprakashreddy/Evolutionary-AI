import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Mic, Video as VideoIcon, Bell, X, Upload, User, Play } from 'lucide-react';
import { useRouter } from '@/lib/router';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { navigate } = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate({ name: 'search', query: searchValue.trim() });
      setShowSearchMobile(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between gap-2 bg-brand-bg px-2 md:px-4">
      {/* Left: menu + logo */}
      <div className={`flex items-center gap-1 md:gap-4 ${showSearchMobile ? 'hidden md:flex' : 'flex'}`}>
        <button
          onClick={onMenuClick}
          className="rounded-full p-2 transition-colors hover:bg-brand-hover"
          aria-label="Menu"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={() => navigate({ name: 'home' })}
          className="flex items-center gap-1"
        >
          <div className="flex h-7 w-10 items-center justify-center rounded-md bg-brand-red">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">ClipShare</span>
        </button>
      </div>

      {/* Center: search */}
      <div className={`flex flex-1 items-center justify-center md:px-12 ${showSearchMobile ? 'flex' : 'hidden md:flex'}`}>
        {showSearchMobile && (
          <button
            onClick={() => setShowSearchMobile(false)}
            className="rounded-full p-2 transition-colors hover:bg-brand-hover md:hidden"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        )}
        <form onSubmit={handleSearch} className="flex w-full max-w-xl items-center">
          <div className="flex flex-1 items-center overflow-hidden rounded-l-full border border-brand-search-border bg-brand-search pl-4 focus-within:border-blue-500">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search"
              className="h-10 flex-1 bg-transparent text-base text-white placeholder:text-brand-subtle focus:outline-none"
              aria-label="Search"
            />
            {searchValue && (
              <button type="button" onClick={() => setSearchValue('')} className="p-2">
                <X className="h-5 w-5 text-brand-subtle" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="flex h-10 items-center rounded-r-full border border-l-0 border-brand-search-border bg-brand-elevated px-5 transition-colors hover:bg-brand-hover"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-brand-subtle" />
          </button>
        </form>
        <button
          className="ml-3 hidden rounded-full bg-brand-elevated p-2.5 transition-colors hover:bg-brand-hover md:block"
          aria-label="Voice search"
        >
          <Mic className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Right: actions */}
      <div className={`flex items-center gap-1 md:gap-2 ${showSearchMobile ? 'hidden' : 'flex'}`}>
        <button
          onClick={() => setShowSearchMobile(true)}
          className="rounded-full p-2 transition-colors hover:bg-brand-hover md:hidden"
          aria-label="Search"
        >
          <Search className="h-6 w-6 text-white" />
        </button>

        {/* Create menu */}
        <div className="relative hidden md:block" ref={createMenuRef}>
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center gap-2 rounded-full bg-brand-elevated py-2 pl-3 pr-4 transition-colors hover:bg-brand-hover"
          >
            <VideoIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-medium text-white">Create</span>
          </button>
          {showCreateMenu && (
            <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-xl bg-brand-elevated py-2 shadow-2xl animate-scale-in">
              <button className="flex w-full items-center gap-4 px-4 py-3 text-sm text-white transition-colors hover:bg-brand-hover">
                <Upload className="h-5 w-5" /> Upload video
              </button>
              <button className="flex w-full items-center gap-4 px-4 py-3 text-sm text-white transition-colors hover:bg-brand-hover">
                <VideoIcon className="h-5 w-5" /> Go live
              </button>
            </div>
          )}
        </div>

        <button className="relative rounded-full p-2 transition-colors hover:bg-brand-hover" aria-label="Notifications">
          <Bell className="h-6 w-6 text-white" />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-medium text-white">9+</span>
        </button>

        {/* Profile menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-medium text-white transition-transform hover:scale-105"
            aria-label="Account"
          >
            M
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-xl bg-brand-elevated shadow-2xl animate-scale-in">
              <div className="border-b border-brand-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-base font-medium text-white">
                    M
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">ClipShare Viewer</p>
                    <p className="text-xs text-brand-subtle">@myviewer</p>
                  </div>
                </div>
                <button className="mt-3 w-full rounded-full bg-white py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90">
                  View channel
                </button>
              </div>
              <div className="py-2">
                <button className="flex w-full items-center gap-4 px-4 py-3 text-sm text-white transition-colors hover:bg-brand-hover">
                  <User className="h-5 w-5" /> Your channel
                </button>
                <button className="flex w-full items-center gap-4 px-4 py-3 text-sm text-white transition-colors hover:bg-brand-hover">
                  <VideoIcon className="h-5 w-5" /> My videos
                </button>
                <button className="flex w-full items-center gap-4 px-4 py-3 text-sm text-white transition-colors hover:bg-brand-hover">
                  <Bell className="h-5 w-5" /> Notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
