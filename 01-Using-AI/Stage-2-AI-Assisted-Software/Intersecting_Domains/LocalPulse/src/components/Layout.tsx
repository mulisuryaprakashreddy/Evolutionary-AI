import { useEffect, useState } from 'react';
import { Activity, Menu, X, Sun, Moon, Plus, LayoutDashboard, LogOut, User as UserIcon, Bot } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { navigateTo } from '@/lib/router';
import { Button } from '@/components/ui';

const NAV = [
  { label: 'Explore', path: '/explore' },
  { label: 'Map', path: '/map' },
  { label: 'Rankings', path: '/rankings' },
  { label: 'AI Assistant', path: '/chat' },
];

export function Header({ currentPath }: { currentPath: string }) {
  const { theme, toggle } = useTheme();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [currentPath]);

  const go = (path: string) => { navigateTo(path); setMobileOpen(false); };

  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? 'glass border-b border-slate-200/60 dark:border-slate-800/60' : 'bg-transparent'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => go('/')} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Local<span className="gradient-text">Pulse</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-semibold text-white">
                  {(profile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {profile?.display_name?.split(' ')[0] || 'Account'}
                </span>
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-in scale-in">
                    <div className="border-b border-slate-100 px-4 py-2 dark:border-slate-700">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{profile?.display_name}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <MenuItem icon={<LayoutDashboard className="h-4 w-4" />} label="My Dashboard" onClick={() => { go('/dashboard'); setUserMenu(false); }} />
                    <MenuItem icon={<Plus className="h-4 w-4" />} label="Report a Problem" onClick={() => { go('/report/new'); setUserMenu(false); }} />
                    <MenuItem icon={<Bot className="h-4 w-4" />} label="AI Settings" onClick={() => { go('/settings'); setUserMenu(false); }} />
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <MenuItem icon={<LogOut className="h-4 w-4" />} label="Sign Out" onClick={() => { signOut(); setUserMenu(false); navigateTo('/'); }} danger />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" onClick={() => go('/auth/signin')}>Sign In</Button>
              <Button size="sm" onClick={() => go('/auth/signup')}>Get Started</Button>
            </div>
          )}

          <Button size="sm" className="hidden lg:inline-flex" onClick={() => go('/report/new')}>
            <Plus className="h-4 w-4" />
            Report
          </Button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden animate-in slide-in-from-bottom">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {item.label}
              </button>
            ))}
            <button onClick={() => go('/report/new')} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-500/10">
              Report a Problem
            </button>
            {user ? (
              <>
                <button onClick={() => go('/dashboard')} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                  My Dashboard
                </button>
                <button onClick={() => { signOut(); go('/'); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => go('/auth/signin')}>Sign In</Button>
                <Button size="sm" className="flex-1" onClick={() => go('/auth/signup')}>Get Started</Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">LocalPulse</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              A global AI-powered civic platform where citizens report community problems and AI transforms thousands of reports into meaningful insights and actionable recommendations.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><button onClick={() => navigateTo('/explore')} className="text-slate-500 hover:text-teal-600 dark:text-slate-400">Explore Problems</button></li>
              <li><button onClick={() => navigateTo('/map')} className="text-slate-500 hover:text-teal-600 dark:text-slate-400">Interactive Map</button></li>
              <li><button onClick={() => navigateTo('/rankings')} className="text-slate-500 hover:text-teal-600 dark:text-slate-400">Community Rankings</button></li>
              <li><button onClick={() => navigateTo('/chat')} className="text-slate-500 hover:text-teal-600 dark:text-slate-400">AI Assistant</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Get Involved</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><button onClick={() => navigateTo('/report/new')} className="text-slate-500 hover:text-teal-600 dark:text-slate-400">Report a Problem</button></li>
              <li><button onClick={() => navigateTo('/auth/signup')} className="text-slate-500 hover:text-teal-600 dark:text-slate-400">Create Account</button></li>
              <li><button onClick={() => navigateTo('/settings')} className="text-slate-500 hover:text-teal-600 dark:text-slate-400">AI Settings</button></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            LocalPulse is a demo platform. AI insights are generated using your own API key and are recommendations, not official decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
