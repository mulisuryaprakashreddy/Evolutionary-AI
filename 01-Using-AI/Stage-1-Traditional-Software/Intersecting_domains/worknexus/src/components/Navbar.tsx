import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Moon,
  Sun,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Plus,
  MessageSquare,
  User,
  LogOut,
  Users,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { Avatar } from '@/components/ui';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { cn, timeAgo } from '@/lib/utils';
import type { Notification } from '@/lib/types';

export function Navbar() {
  const { session, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!session?.user?.id || !isSupabaseConfigured()) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setNotifications((data as Notification[]) ?? []));

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, isSupabaseConfigured]);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function markAllRead() {
    if (!session?.user?.id) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const dashboardLink = profile?.role === 'admin' ? '/admin' : profile?.role === 'freelancer' ? '/freelancer' : '/client';

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold font-[var(--font-display)] hidden sm:block">WorkNexus</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/projects" label="Browse Projects" />
              <NavLink to="/freelancers" label="Find Freelancers" />
              {session && <NavLink to={dashboardLink} label="Dashboard" />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {session && (
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => {
                    setNotifOpen((o) => !o);
                    if (!notifOpen && unreadCount > 0) markAllRead();
                  }}
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-scale-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                      <p className="font-semibold text-sm">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-neutral-500">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              'px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                              !n.is_read && 'bg-primary-50/50 dark:bg-primary-950/30'
                            )}
                          >
                            {n.link ? (
                              <Link to={n.link} className="block">
                                <p className="text-sm font-medium">{n.title}</p>
                                {n.body && <p className="text-xs text-neutral-500 mt-0.5">{n.body}</p>}
                                <p className="text-[11px] text-neutral-400 mt-1">{timeAgo(n.created_at)}</p>
                              </Link>
                            ) : (
                              <>
                                <p className="text-sm font-medium">{n.title}</p>
                                {n.body && <p className="text-xs text-neutral-500 mt-0.5">{n.body}</p>}
                                <p className="text-[11px] text-neutral-400 mt-1">{timeAgo(n.created_at)}</p>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {session && profile ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
                  <ChevronDown className="h-4 w-4 text-neutral-500 hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900 animate-scale-in overflow-hidden py-1">
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-sm font-semibold truncate">{profile.full_name}</p>
                      <p className="text-xs text-neutral-500 capitalize">{profile.role}</p>
                    </div>
                    <MenuItem icon={LayoutDashboard} label="Dashboard" to={dashboardLink} />
                    <MenuItem icon={User} label="My Profile" to="/profile" />
                    <MenuItem icon={MessageSquare} label="Messages" to="/messages" />
                    {profile.role === 'client' && (
                      <MenuItem icon={Plus} label="Post a Project" to="/projects/new" />
                    )}
                    {profile.role === 'admin' && (
                      <MenuItem icon={Shield} label="Admin Panel" to="/admin" />
                    )}
                    <div className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-950/30"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="h-10 px-4 inline-flex items-center rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="h-10 px-4 inline-flex items-center rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden h-10 w-10 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 py-3 animate-slide-up">
            <div className="flex flex-col gap-1">
              <MobileLink to="/projects" label="Browse Projects" icon={Search} />
              <MobileLink to="/freelancers" label="Find Freelancers" icon={Users} />
              {session && <MobileLink to={dashboardLink} label="Dashboard" icon={LayoutDashboard} />}
              {session && <MobileLink to="/messages" label="Messages" icon={MessageSquare} />}
              {!session && (
                <div className="flex gap-2 px-3 pt-2">
                  <Link to="/login" className="flex-1 h-10 inline-flex items-center justify-center rounded-lg border border-neutral-300 text-sm font-medium">
                    Log In
                  </Link>
                  <Link to="/signup" className="flex-1 h-10 inline-flex items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-medium">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'text-primary-600 bg-primary-50 dark:bg-primary-950/40 dark:text-primary-400'
          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white'
      )}
    >
      {label}
    </Link>
  );
}

function MenuItem({ icon: Icon, label, to }: { icon: React.ComponentType<{ className?: string }>; label: string; to: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
      <Icon className="h-4 w-4 text-neutral-500" />
      {label}
    </Link>
  );
}

function MobileLink({ to, label, icon: Icon }: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800">
      <Icon className="h-5 w-5 text-neutral-500" />
      {label}
    </Link>
  );
}
