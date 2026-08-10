import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  TrendingUp, Bookmark as BookmarkIcon, FileText, Bell, BarChart3, Search,
  Sparkles, ArrowRight, CheckCircle2, Clock, Target, Building2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Tender, Bookmark as BookmarkRow, Application, Company, Notification } from '../lib/types'
import { recommendTenders, type TenderWithScore } from '../lib/ai'
import TenderCard from '../components/TenderCard'
import { formatCurrency, appStatusColor, timeAgo } from '../lib/format'

export default function DashboardPage() {
  const { session, profile } = useAuth()
  const [recommendations, setRecommendations] = useState<TenderWithScore[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkRow[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [company, setCompany] = useState<Company | null>(null)
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [allTenders, setAllTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    Promise.all([
      supabase.from('tenders').select('*, category:categories(*)').eq('status', 'open').order('created_at', { ascending: false }).limit(30),
      supabase.from('companies').select('*').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('bookmarks').select('*, tender:tenders(*, category:categories(*))').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(4),
      supabase.from('applications').select('*, tender:tenders(*, category:categories(*))').eq('user_id', session.user.id).order('updated_at', { ascending: false }).limit(5),
      supabase.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }).limit(5),
    ]).then(([t, c, b, a, n]) => {
      setAllTenders((t.data as Tender[]) ?? [])
      setCompany(c.data as Company | null)
      setBookmarks((b.data as BookmarkRow[]) ?? [])
      setApplications((a.data as Application[]) ?? [])
      setNotifs((n.data as Notification[]) ?? [])
      setLoading(false)
    })
  }, [session])

  useEffect(() => {
    if (!session || allTenders.length === 0) return
    Promise.all([
      supabase.from('applications').select('tender_id').eq('user_id', session.user.id),
      supabase.from('bookmarks').select('tender_id').eq('user_id', session.user.id),
    ]).then(([a, b]) => {
      const appliedIds = new Set((a.data ?? []).map((x: { tender_id: string }) => x.tender_id))
      const bookmarkIds = new Set((b.data ?? []).map((x: { tender_id: string }) => x.tender_id))
      setRecommendations(recommendTenders(allTenders, company, { appliedTenderIds: appliedIds, bookmarkedTenderIds: bookmarkIds }).slice(0, 3))
    })
  }, [session, allTenders, company])

  const profileComplete = company ? Math.round(
    (['company_name','gst_number','pan_number','business_type','industry','state','city','annual_turnover','years_experience','contact_email','website','description'].filter((f) => (company as unknown as Record<string, unknown>)[f]).length / 12) * 100
  ) : 0

  const totalBudget = applications.reduce((sum, a) => sum + (a.tender?.budget ?? 0), 0)

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-8"><div className="skeleton h-64 w-full rounded-xl" /></div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here's your tender activity overview</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BookmarkIcon} label="Saved Tenders" value={bookmarks.length} color="brand" />
        <StatCard icon={FileText} label="Applications" value={applications.length} color="accent" />
        <StatCard icon={Target} label="Won" value={applications.filter((a) => a.status === 'won').length} color="emerald" />
        <StatCard icon={TrendingUp} label="Total Value Tracked" value={formatCurrency(totalBudget)} color="amber" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* AI Recommendations */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-brand-600 dark:text-brand-400" size={20} />
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">AI Recommendations</h2>
              </div>
              <Link to="/browse" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">View all →</Link>
            </div>
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {recommendations.map((t) => <TenderCard key={t.id} tender={t} showScore />)}
              </div>
            ) : (
              <div className="card flex flex-col items-center py-10 text-center">
                <Building2 className="mb-3 text-slate-300 dark:text-slate-700" size={32} />
                <p className="text-sm font-medium text-slate-900 dark:text-white">Complete your company profile for better recommendations</p>
                <Link to="/company" className="btn-primary mt-4 text-xs">Set up profile <ArrowRight size={14} /></Link>
              </div>
            )}
          </section>

          {/* Recent Applications */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent Applications</h2>
              {applications.length > 0 && <span className="text-sm text-slate-500">{applications.length} total</span>}
            </div>
            {applications.length > 0 ? (
              <div className="space-y-2">
                {applications.map((a) => (
                  <Link key={a.id} to={`/tenders/${a.tender_id}`} className="card flex items-center gap-3 p-4 transition-colors hover:border-brand-300 dark:hover:border-brand-700">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{a.tender?.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{a.tender?.organization} · {formatCurrency(a.tender?.budget)}</p>
                    </div>
                    <span className={`badge capitalize ${appStatusColor(a.status)}`}>{a.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card flex flex-col items-center py-10 text-center">
                <Target className="mb-3 text-slate-300 dark:text-slate-700" size={32} />
                <p className="text-sm text-slate-500 dark:text-slate-400">No applications yet. Browse tenders to get started.</p>
                <Link to="/browse" className="btn-primary mt-4 text-xs">Browse tenders</Link>
              </div>
            )}
          </section>

          {/* Saved Tenders */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Saved Tenders</h2>
              {bookmarks.length > 0 && <Link to="/bookmarks" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">View all →</Link>}
            </div>
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {bookmarks.slice(0, 4).map((b) => b.tender && <TenderCard key={b.id} tender={b.tender} bookmarked />)}
              </div>
            ) : (
              <div className="card flex flex-col items-center py-10 text-center">
                <BookmarkIcon className="mb-3 text-slate-300 dark:text-slate-700" size={32} />
                <p className="text-sm text-slate-500 dark:text-slate-400">No saved tenders yet. Click the bookmark icon on any tender.</p>
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Profile completion */}
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Profile Completion</h3>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{profileComplete}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500" style={{ width: `${profileComplete}%` }} />
            </div>
            {profileComplete < 100 ? (
              <Link to="/company" className="btn-secondary mt-4 w-full text-xs">
                {company ? 'Complete profile' : 'Create company profile'} <ArrowRight size={14} />
              </Link>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-accent-600 dark:text-accent-400">
                <CheckCircle2 size={14} /> Profile complete
              </p>
            )}
          </div>

          {/* Notifications */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Bell size={18} className="text-brand-600 dark:text-brand-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            </div>
            {notifs.length > 0 ? (
              <div className="space-y-2">
                {notifs.map((n) => (
                  <div key={n.id} className={`rounded-lg p-3 text-sm ${!n.read ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''}`}>
                    <p className="font-medium text-slate-900 dark:text-slate-200">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-slate-400">{timeAgo(n.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">No notifications yet</p>
            )}
          </div>

          {/* Quick search */}
          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2">
              <Search size={18} className="text-brand-600 dark:text-brand-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Quick Search</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/browse?industry=Infrastructure" className="btn-secondary py-2 text-xs">Infrastructure</Link>
              <Link to="/browse?industry=IT%20%26%20Software" className="btn-secondary py-2 text-xs">IT Services</Link>
              <Link to="/browse?sort=deadline" className="btn-secondary py-2 text-xs">Closing Soon</Link>
              <Link to="/browse?sort=budget_high" className="btn-secondary py-2 text-xs">High Budget</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof BookmarkIcon; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  }
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}
