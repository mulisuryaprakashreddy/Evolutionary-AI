import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Search, Sun, Moon, Menu, X, LayoutDashboard, Bookmark, LogOut, User, Bell, ChevronDown, Building2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Notification } from '../lib/types'
import { timeAgo } from '../lib/format'

export default function Navbar() {
  const { session, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const profileRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
    setNotifOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!session || !isSupabaseConfigured()) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => setNotifs((data as Notification[]) ?? []))
  }, [session, location.pathname, isSupabaseConfigured])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifs.filter((n) => !n.read).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/browse?q=${encodeURIComponent(searchQuery)}`)
  }

  const markAllRead = async () => {
    if (!session || !isSupabaseConfigured()) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', session.user.id).eq('read', false)
    setNotifs((n) => n.map((x) => ({ ...x, read: true })))
  }

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        className={`text-sm font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${
          active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Building2 size={20} />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              TenderPulse<span className="text-brand-600 dark:text-brand-400">AI</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navLink('/', 'Home')}
            {navLink('/browse', 'Browse Tenders')}
            {navLink('/categories', 'Categories')}
            {profile?.role === 'admin' && navLink('/admin', 'Admin')}
          </nav>
        </div>

        <div className="hidden flex-1 max-w-md lg:block">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenders, organizations, keywords..."
              className="input pl-10 py-2"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn-ghost p-2" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {session ? (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="btn-ghost relative p-2"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 animate-slide-down overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <span className="text-sm font-semibold">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</div>
                      ) : (
                        notifs.map((n) => (
                          <Link
                            key={n.id}
                            to={n.link ?? '#'}
                            className={`flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${!n.read ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''}`}
                          >
                            <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${!n.read ? 'bg-brand-500' : 'bg-transparent'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                              {n.body && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.body}</p>}
                              <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                    {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 animate-slide-down overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile?.full_name ?? 'User'}</p>
                      <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/bookmarks" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                      <Bookmark size={16} /> Bookmarks
                    </Link>
                    <Link to="/company" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                      <Building2 size={16} /> Company Profile
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">
                        <ShieldCheck size={16} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); navigate('/') }}
                      className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:hover:bg-rose-950/30"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </div>
          )}

          <button onClick={() => setMobileOpen((o) => !o)} className="btn-ghost p-2 md:hidden">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-slide-down border-t border-slate-200 bg-white px-4 py-4 md:hidden dark:border-slate-800 dark:bg-slate-950">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tenders..." className="input pl-10" />
          </form>
          <div className="flex flex-col gap-3">
            <Link to="/" className="text-sm font-medium text-slate-700 dark:text-slate-200">Home</Link>
            <Link to="/browse" className="text-sm font-medium text-slate-700 dark:text-slate-200">Browse Tenders</Link>
            <Link to="/categories" className="text-sm font-medium text-slate-700 dark:text-slate-200">Categories</Link>
            {session && <Link to="/dashboard" className="text-sm font-medium text-slate-700 dark:text-slate-200">Dashboard</Link>}
            {profile?.role === 'admin' && <Link to="/admin" className="text-sm font-medium text-slate-700 dark:text-slate-200">Admin</Link>}
            {!session && (
              <div className="mt-2 flex gap-2">
                <Link to="/login" className="btn-secondary flex-1">Sign in</Link>
                <Link to="/register" className="btn-primary flex-1">Get started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
