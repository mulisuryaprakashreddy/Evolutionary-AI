import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft, ArrowBigUp, MapPin, Calendar, Users, Share2, Bookmark,
  MessageSquare, Bot, Lightbulb, AlertCircle, Loader2, Send,
  CheckCircle2, Clock, Trash2, Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Report, ReportComment, ReportUpdate, Profile } from '@/types';
import { getCategoryIcon, severityMeta, statusMeta, RECURRENCES } from '@/lib/constants';
import { timeAgo, formatDate, haversineKm } from '@/lib/analytics';
import { summarizeReport, suggestSolutions, hasApiKey } from '@/lib/ai';
import { ReportCard } from '@/components/ReportCard';
import { Button, Card, Spinner, EmptyState, Badge } from '@/components/ui';
import { navigateTo } from '@/lib/router';

export function ReportDetailPage({ id }: { id: string }) {
  const { user } = useAuth();
  const toast = useToast();

  const [report, setReport] = useState<Report | null>(null);
  const [reporter, setReporter] = useState<Profile | null>(null);
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [updates, setUpdates] = useState<ReportUpdate[]>([]);
  const [nearby, setNearby] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [voteBusy, setVoteBusy] = useState(false);

  // AI states
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSolutions, setAiSolutions] = useState<string[] | null>(null);
  const [aiLoading, setAiLoading] = useState<'summary' | 'solutions' | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Comment form
  const [commentBody, setCommentBody] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);

  const aiReady = hasApiKey();

  const loadAll = useCallback(async () => {
    setLoading(true);
    const { data: rep } = await supabase
      .from('reports')
      .select('*, profiles!reports_user_id_fkey(*)')
      .eq('id', id)
      .maybeSingle();
    if (!rep) { setLoading(false); return; }
    setReport(rep as Report);
    setReporter((rep as Report).profiles ?? null);

    const [c, u] = await Promise.all([
      supabase.from('report_comments').select('*, profiles!report_comments_user_id_fkey(*)').eq('report_id', id).order('created_at', { ascending: false }),
      supabase.from('report_updates').select('*, profiles!report_updates_author_id_fkey(*)').eq('report_id', id).order('created_at', { ascending: false }),
    ]);
    setComments((c.data as ReportComment[]) ?? []);
    setUpdates((u.data as ReportUpdate[]) ?? []);
    setLoading(false);

    // nearby
    const { data: nearbyData } = await supabase
      .from('reports')
      .select('*, profiles!reports_user_id_fkey(*)')
      .neq('id', id)
      .limit(50)
      .order('created_at', { ascending: false });
    if (nearbyData && rep) {
      const sorted = (nearbyData as Report[])
        .map((r) => ({ r, d: haversineKm(rep.latitude, rep.longitude, r.latitude, r.longitude) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .map((x) => x.r);
      setNearby(sorted);
    }

    if (user) {
      const { data: v } = await supabase.from('report_votes').select('id').eq('report_id', id).eq('user_id', user.id).maybeSingle();
      setVoted(!!v);
      const { data: s } = await supabase.from('saved_reports').select('id').eq('report_id', id).eq('user_id', user.id).maybeSingle();
      setSaved(!!s);
    }
  }, [id, user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleVote = async () => {
    if (!user) { toast('info', 'Sign in to vote on reports.'); navigateTo('/auth/signin'); return; }
    if (!report) return;
    setVoteBusy(true);
    if (voted) {
      await supabase.from('report_votes').delete().eq('report_id', report.id).eq('user_id', user.id);
      setVoted(false);
      setReport({ ...report, votes_count: Math.max(report.votes_count - 1, 0) });
    } else {
      await supabase.from('report_votes').insert({ report_id: report.id });
      setVoted(true);
      setReport({ ...report, votes_count: report.votes_count + 1 });
    }
    setVoteBusy(false);
  };

  const toggleSave = async () => {
    if (!user) { toast('info', 'Sign in to save reports.'); navigateTo('/auth/signin'); return; }
    if (!report) return;
    if (saved) {
      await supabase.from('saved_reports').delete().eq('report_id', report.id).eq('user_id', user.id);
      setSaved(false);
      toast('info', 'Removed from saved.');
    } else {
      await supabase.from('saved_reports').insert({ report_id: report.id });
      setSaved(true);
      toast('success', 'Saved to your dashboard.');
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/#/reports/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('success', 'Link copied to clipboard.');
    } catch {
      toast('info', `Share link: ${url}`);
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentBody.trim() || !report) return;
    setCommentBusy(true);
    const { data, error } = await supabase
      .from('report_comments')
      .insert({ report_id: report.id, body: commentBody.trim() })
      .select('*, profiles!report_comments_user_id_fkey(*)')
      .single();
    setCommentBusy(false);
    if (error) { toast('error', 'Could not post comment.'); return; }
    setComments((c) => [data as ReportComment, ...c]);
    setCommentBody('');
    setReport({ ...report, comments_count: report.comments_count + 1 });
  };

  const deleteComment = async (cid: string) => {
    const { error } = await supabase.from('report_comments').delete().eq('id', cid);
    if (error) { toast('error', 'Could not delete comment.'); return; }
    setComments((c) => c.filter((x) => x.id !== cid));
    if (report) setReport({ ...report, comments_count: Math.max(report.comments_count - 1, 0) });
  };

  const runSummary = async () => {
    if (!report || !aiReady) return;
    setAiLoading('summary'); setAiError(null);
    try {
      const s = await summarizeReport(report);
      setAiSummary(s);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI request failed.');
    }
    setAiLoading(null);
  };

  const runSolutions = async () => {
    if (!report || !aiReady) return;
    setAiLoading('solutions'); setAiError(null);
    try {
      const s = await suggestSolutions(report);
      setAiSolutions(s);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'AI request failed.');
    }
    setAiLoading(null);
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner className="h-8 w-8 text-teal-500" /></div>;
  }
  if (!report) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <EmptyState icon={<AlertCircle className="h-10 w-10" />} title="Report not found" description="This report may have been removed."
          action={<Button onClick={() => navigateTo('/explore')}>Back to Explore</Button>} />
      </div>
    );
  }

  const CatIcon = getCategoryIcon(report.category);
  const sev = severityMeta(report.severity);
  const stat = statusMeta(report.status);
  const recurrenceLabel = RECURRENCES.find((r) => r.id === report.recurrence)?.label ?? report.recurrence;

  // Mini map position
  const mapX = ((report.longitude + 180) / 360) * 100;
  const mapY = ((90 - report.latitude) / 180) * 100;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigateTo('/explore')} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Back to Explore
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge className={`${sev.ring} ${sev.color}`}><span className={`h-1.5 w-1.5 rounded-full ${sev.dot}`} /> {sev.label}</Badge>
          <Badge className={stat.color}>{stat.label}</Badge>
          <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"><CatIcon className="h-3 w-3" /> {report.category}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{report.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {report.village ? `${report.village}, ` : ''}{report.city}, {report.country}</span>
          <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> Observed {formatDate(report.date_observed)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> Reported {timeAgo(report.created_at)}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> ~{report.people_affected.toLocaleString()} affected</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Gallery */}
          {report.photos.length > 0 && (
            <Card className="overflow-hidden">
              <div className="grid gap-1 sm:grid-cols-2">
                <img src={report.photos[0]} alt="" className="h-64 w-full object-cover sm:h-80" />
                {report.photos.length > 1 && (
                  <div className="grid grid-cols-2 gap-1">
                    {report.photos.slice(1, 5).map((p, i) => (
                      <img key={i} src={p} alt="" className="h-32 w-full object-cover sm:h-39" style={{ height: 'calc(10rem)' }} />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Description */}
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{report.description}</p>
          </Card>

          {/* AI Summary */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <Bot className="h-5 w-5 text-teal-600 dark:text-teal-400" /> AI Summary
              </h2>
              {!aiSummary && !aiLoading && (
                <Button size="sm" variant="outline" onClick={runSummary} disabled={!aiReady}>
                  <Sparkles className="h-4 w-4" /> Generate
                </Button>
              )}
            </div>
            <div className="p-6">
              {!aiReady && <AiNotReady />}
              {aiReady && !aiSummary && !aiLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Click "Generate" to let AI summarize this report's impact and urgency.</p>
              )}
              {aiLoading === 'summary' && <AiLoading />}
              {aiError && <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>}
              {aiSummary && <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{aiSummary}</p>}
            </div>
          </Card>

          {/* AI Solutions */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <Lightbulb className="h-5 w-5 text-amber-500" /> AI Suggested Solutions
              </h2>
              {!aiSolutions && !aiLoading && (
                <Button size="sm" variant="outline" onClick={runSolutions} disabled={!aiReady}>
                  <Sparkles className="h-4 w-4" /> Generate
                </Button>
              )}
            </div>
            <div className="p-6">
              {!aiReady && <AiNotReady />}
              {aiReady && !aiSolutions && !aiLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400">AI can suggest practical actions to address this problem. These are recommendations, not official decisions.</p>
              )}
              {aiLoading === 'solutions' && <AiLoading />}
              {aiError && <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>}
              {aiSolutions && (
                <ul className="space-y-2">
                  {aiSolutions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {aiSolutions && (
                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">These AI-generated suggestions are recommendations, not official decisions.</p>
              )}
            </div>
          </Card>

          {/* Updates timeline */}
          {updates.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Updates</h2>
              <div className="space-y-4">
                {updates.map((u) => (
                  <div key={u.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{u.profiles?.display_name ?? 'Someone'}</span>
                        <span className="text-xs text-slate-400">{timeAgo(u.created_at)}</span>
                        {u.status && <Badge className={statusMeta(u.status).color}>{statusMeta(u.status).label}</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{u.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Comments */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <MessageSquare className="h-5 w-5" /> Comments ({comments.length})
            </h2>
            {user ? (
              <form onSubmit={addComment} className="mb-5 flex gap-2">
                <input
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Add a comment…"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <Button type="submit" disabled={!commentBody.trim() || commentBusy}>
                  {commentBusy ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <p className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <button onClick={() => navigateTo('/auth/signin')} className="font-medium text-teal-600 hover:underline dark:text-teal-400">Sign in</button> to comment.
              </p>
            )}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400">No comments yet. Be the first to discuss this issue.</p>
              ) : comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-semibold text-white">
                    {(c.profiles?.display_name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{c.profiles?.display_name ?? 'Anonymous'}</span>
                      <span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span>
                      {user?.id === c.user_id && (
                        <button onClick={() => deleteComment(c.id)} className="ml-auto text-slate-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="p-5">
            <div className="flex gap-2">
              <button
                onClick={toggleVote}
                disabled={voteBusy}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 transition-all ${
                  voted ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' : 'border-slate-200 hover:border-teal-300 dark:border-slate-700'
                }`}
              >
                <ArrowBigUp className={`h-5 w-5 ${voted ? 'fill-current' : ''}`} />
                <span className="text-lg font-bold">{report.votes_count}</span>
                <span className="text-xs">votes</span>
              </button>
              <button
                onClick={toggleSave}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-3 transition-all ${
                  saved ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' : 'border-slate-200 hover:border-teal-300 dark:border-slate-700'
                }`}
              >
                <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
                <span className="text-xs mt-1">{saved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={share}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 transition-all hover:border-teal-300 dark:border-slate-700"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-xs mt-1">Share</span>
              </button>
            </div>
          </Card>

          {/* Reporter */}
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Reporter</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 font-semibold text-white">
                {(reporter?.display_name || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {report.is_anonymous ? 'Anonymous' : reporter?.display_name ?? 'Unknown'}
                </p>
                {!report.is_anonymous && reporter?.organization_name && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">{reporter.organization_name}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Mini map */}
          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Location</h3>
            </div>
            <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
              <svg viewBox="0 0 100 50" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <rect width="100" height="50" fill="currentColor" className="text-slate-100 dark:text-slate-800/50" />
                <g fill="currentColor" className="text-slate-200 dark:text-slate-700/70">
                  <path d="M12,8 Q18,6 24,9 L26,14 Q24,20 20,22 L15,21 Q10,18 11,12 Z" />
                  <path d="M24,24 Q28,22 30,26 L29,34 Q27,38 25,37 L24,30 Z" />
                  <path d="M46,10 Q52,8 55,12 L53,16 Q48,17 45,14 Z" />
                  <path d="M48,18 Q56,16 58,22 L56,32 Q52,36 49,34 L47,26 Z" />
                  <path d="M56,8 Q72,6 82,12 L84,18 Q78,22 70,20 L60,16 Z" />
                  <path d="M68,18 Q72,17 73,22 L70,24 Z" />
                  <path d="M80,30 Q86,28 88,32 L85,35 Q81,34 80,32 Z" />
                </g>
              </svg>
              <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${mapX}%`, top: `${mapY}%` }}>
                <span className={`block h-3.5 w-3.5 rounded-full ${sev.dot} ring-2 ring-white dark:ring-slate-900`} />
              </div>
            </div>
            <div className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
              <p>{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</p>
              {report.postal_code && <p className="mt-1">Postal: {report.postal_code}</p>}
            </div>
          </Card>

          {/* Properties */}
          <Card className="p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Details</h3>
            <dl className="space-y-2 text-sm">
              <Detail label="Recurrence" value={recurrenceLabel} />
              <Detail label="People affected" value={`~${report.people_affected.toLocaleString()}`} />
              <Detail label="Date observed" value={formatDate(report.date_observed)} />
              <Detail label="Reported" value={timeAgo(report.created_at)} />
            </dl>
          </Card>
        </div>
      </div>

      {/* Nearby */}
      {nearby.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Nearby Issues</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((r) => <ReportCard key={r.id} report={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-900 dark:text-white">{value}</dd>
    </div>
  );
}

function AiNotReady() {
  return (
    <div className="rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-500/10">
      <p className="text-sm text-amber-700 dark:text-amber-300">
        Add your AI API key in <button onClick={() => navigateTo('/settings')} className="font-medium underline">AI Settings</button> to generate insights.
      </p>
    </div>
  );
}

function AiLoading() {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <Loader2 className="h-4 w-4 animate-spin text-teal-500" /> AI is analyzing…
    </div>
  );
}
