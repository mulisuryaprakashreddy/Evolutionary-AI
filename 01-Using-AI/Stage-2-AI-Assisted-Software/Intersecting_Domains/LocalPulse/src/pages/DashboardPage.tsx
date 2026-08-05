import { useEffect, useState } from 'react';
import { FileText, Bookmark, ArrowBigUp, MessageSquare, TrendingUp, Award, ArrowRight, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Report } from '@/types';
import { ReportCard } from '@/components/ReportCard';
import { Card, EmptyState, Spinner, Button } from '@/components/ui';
import { navigateTo } from '@/lib/router';
import { severityMeta, statusMeta } from '@/lib/constants';
import { timeAgo } from '@/lib/analytics';

type Tab = 'reports' | 'saved' | 'stats';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('reports');
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [savedReports, setSavedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      supabase.from('reports').select('*, profiles!reports_user_id_fkey(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('saved_reports').select('report_id, reports!saved_reports_report_id_fkey(*, profiles!reports_user_id_fkey(*))').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]).then(([r, s]) => {
      setMyReports((r.data as Report[]) ?? []);
      setSavedReports((((s.data ?? []) as unknown as { report_id: string; reports: Report }[]).map((x) => x.reports).filter(Boolean)));
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Sign in to view your dashboard</h2>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigateTo('/auth/signin')}>Sign In</Button>
          <Button variant="outline" onClick={() => navigateTo('/auth/signup')}>Create Account</Button>
        </div>
      </div>
    );
  }

  const totalVotes = myReports.reduce((s, r) => s + r.votes_count, 0);
  const totalComments = myReports.reduce((s, r) => s + r.comments_count, 0);
  const peopleAffected = myReports.reduce((s, r) => s + r.people_affected, 0);
  const resolvedCount = myReports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;

  const unsave = async (reportId: string) => {
    await supabase.from('saved_reports').delete().eq('report_id', reportId).eq('user_id', user.id);
    setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile header */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 text-2xl font-bold text-white">
          {(profile?.display_name || user.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.display_name ?? 'Your Account'}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          {profile?.organization_name && (
            <p className="text-xs text-teal-600 dark:text-teal-400">{profile.organization_name}{profile.verified && ' · Verified'}</p>
          )}
        </div>
        <Button onClick={() => navigateTo('/report/new')}>
          <FileText className="h-4 w-4" /> New Report
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<FileText className="h-4 w-4" />} label="Reports Filed" value={myReports.length} />
        <StatCard icon={<ArrowBigUp className="h-4 w-4" />} label="Votes Received" value={totalVotes} />
        <StatCard icon={<MessageSquare className="h-4 w-4" />} label="Comments" value={totalComments} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="People Reached" value={`~${(peopleAffected / 1000).toFixed(1)}k`} />
      </div>

      {/* Achievement */}
      {myReports.length >= 3 && (
        <Card className="mb-6 flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {myReports.length >= 10 ? 'Civic Champion' : myReports.length >= 5 ? 'Community Reporter' : 'Verified Contributor'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">You've filed {myReports.length} reports and reached ~{(peopleAffected / 1000).toFixed(1)}k people.</p>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 border-b border-slate-200 dark:border-slate-700">
        <TabButton active={tab === 'reports'} onClick={() => setTab('reports')}>My Reports ({myReports.length})</TabButton>
        <TabButton active={tab === 'saved'} onClick={() => setTab('saved')}>Saved ({savedReports.length})</TabButton>
        <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>Overview</TabButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-teal-500" /></div>
      ) : tab === 'reports' ? (
        myReports.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="No reports yet"
            description="Document your first community problem to start making an impact."
            action={<Button onClick={() => navigateTo('/report/new')}>Report a Problem</Button>}
          />
        ) : (
          <div>
            {/* List view for my reports with management */}
            <div className="space-y-3">
              {myReports.map((r) => {
                const sev = severityMeta(r.severity);
                const stat = statusMeta(r.status);
                return (
                  <div key={r.id} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/60 dark:bg-slate-800/60">
                    {r.photos?.[0] && <img src={r.photos[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />}
                    <button onClick={() => navigateTo(`/reports/${r.id}`)} className="min-w-0 flex-1 text-left">
                      <p className="truncate font-medium text-slate-900 group-hover:text-teal-600 dark:text-white">{r.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className={`inline-flex items-center gap-1 ${sev.color}`}><span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} />{sev.label}</span>
                        <span className={`rounded-full px-2 py-0.5 ${stat.color}`}>{stat.label}</span>
                        <span>{r.votes_count} votes · {r.comments_count} comments</span>
                        <span>{timeAgo(r.created_at)}</span>
                      </div>
                    </button>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-teal-500" />
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : tab === 'saved' ? (
        savedReports.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-10 w-10" />}
            title="No saved reports"
            description="Bookmark reports to find them quickly here."
            action={<Button onClick={() => navigateTo('/explore')}>Explore Reports</Button>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedReports.map((r) => (
              <div key={r.id} className="relative">
                <ReportCard report={r} />
                <button
                  onClick={() => unsave(r.id)}
                  className="absolute right-3 top-3 z-10 rounded-lg bg-white/90 p-1.5 text-slate-500 shadow-sm hover:text-red-500 dark:bg-slate-800/90"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Report Status Breakdown</h3>
            <div className="space-y-2">
              {['reported', 'verified', 'under_review', 'in_progress', 'resolved'].map((s) => {
                const count = myReports.filter((r) => r.status === s).length;
                if (count === 0) return null;
                const stat = statusMeta(s as Report['status']);
                return (
                  <div key={s} className="flex items-center justify-between text-sm">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stat.color}`}>{stat.label}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{count}</span>
                  </div>
                );
              })}
              {myReports.length === 0 && <p className="text-sm text-slate-400">No reports to analyze.</p>}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Impact</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Reports filed</dt><dd className="font-bold text-slate-900 dark:text-white">{myReports.length}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Resolved</dt><dd className="font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Total votes</dt><dd className="font-bold text-slate-900 dark:text-white">{totalVotes}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">People reached</dt><dd className="font-bold text-slate-900 dark:text-white">~{peopleAffected.toLocaleString()}</dd></div>
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card className="p-4">
      <div className="mb-1 text-teal-600 dark:text-teal-400 [&_svg]:h-4 [&_svg]:w-4">{icon}</div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </Card>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
        active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      {children}
      {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-teal-500" />}
    </button>
  );
}
