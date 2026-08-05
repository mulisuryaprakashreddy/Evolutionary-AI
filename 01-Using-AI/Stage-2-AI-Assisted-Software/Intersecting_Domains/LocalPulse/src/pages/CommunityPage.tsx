import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, TrendingUp, Bot, Sparkles, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Report } from '@/types';
import {
  communityHealthScore, healthDimensions, categoryStats, monthlyTrend,
  topLocations, resolutionRate,
} from '@/lib/analytics';
import { healthBand, getCategoryIcon } from '@/lib/constants';
import { communityInsights, explainHealthScore, hasApiKey, type CommunityInsight, type HealthExplanation } from '@/lib/ai';
import { ReportCard } from '@/components/ReportCard';
import { Card, Button, Spinner, EmptyState } from '@/components/ui';
import { navigateTo } from '@/lib/router';

export function CommunityPage({ city }: { city: string }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<CommunityInsight | null>(null);
  const [explanation, setExplanation] = useState<HealthExplanation | null>(null);
  const [aiLoading, setAiLoading] = useState<'insights' | 'explain' | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const aiReady = hasApiKey();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reports')
      .select('*, profiles!reports_user_id_fkey(*)')
      .ilike('city', city)
      .order('created_at', { ascending: false });
    setReports((data as Report[]) ?? []);
    const { data: all } = await supabase
      .from('reports')
      .select('*, profiles!reports_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(200);
    setAllReports((all as Report[]) ?? []);
    setLoading(false);
  }, [city]);

  useEffect(() => { load(); }, [load]);

  const score = useMemo(() => communityHealthScore(reports), [reports]);
  const band = healthBand(score);
  const dims = useMemo(() => healthDimensions(reports), [reports]);
  const cats = useMemo(() => categoryStats(reports).slice(0, 8), [reports]);
  const trend = useMemo(() => monthlyTrend(reports, 6), [reports]);
  const nearby = useMemo(() => topLocations(allReports.filter((r) => r.city !== city), 'city', 5), [allReports, city]);
  const resolved = resolutionRate(reports);
  const activeReports = reports.filter((r) => !['resolved', 'closed'].includes(r.status));
  const resolvedReports = reports.filter((r) => ['resolved', 'closed'].includes(r.status));

  const topCats = cats.map((c) => c.category);

  const runInsights = async () => {
    if (!aiReady) return;
    setAiLoading('insights'); setAiError(null);
    try {
      const r = reports.map((x) => ({ title: x.title, category: x.category, severity: x.severity, city: x.city, status: x.status, people_affected: x.people_affected }));
      const result = await communityInsights(r);
      setInsight(result);
    } catch (e) { setAiError(e instanceof Error ? e.message : 'AI request failed.'); }
    setAiLoading(null);
  };

  const runExplain = async () => {
    if (!aiReady) return;
    setAiLoading('explain'); setAiError(null);
    try {
      const result = await explainHealthScore({
        score, city, topCategories: topCats, resolvedRatio: resolved,
        totalReports: reports.length, peopleAffected: reports.reduce((s, r) => s + r.people_affected, 0),
      });
      setExplanation(result);
    } catch (e) { setAiError(e instanceof Error ? e.message : 'AI request failed.'); }
    setAiLoading(null);
  };

  const recentActive = activeReports.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigateTo('/rankings')} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Back to Rankings
      </button>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Spinner className="h-8 w-8 text-teal-500" /></div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-10 w-10" />}
          title={`No reports in ${city} yet`}
          description="Be the first to document a community issue here."
          action={<Button onClick={() => navigateTo('/report/new')}>Report a Problem</Button>}
        />
      ) : (
        <>
          {/* Header with health score */}
          <div className="mb-8 grid gap-6 lg:grid-cols-[300px_1fr]">
            <Card className="flex flex-col items-center justify-center p-8">
              <div className={`relative flex h-36 w-36 items-center justify-center rounded-full ${band.bg}/10`}>
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" strokeWidth="8" className="stroke-slate-200 dark:stroke-slate-700" />
                  <circle
                    cx="50" cy="50" r="44" fill="none" strokeWidth="8" strokeLinecap="round"
                    className={band.color.replace('text', 'stroke')}
                    strokeDasharray={`${(score / 100) * 276} 276`}
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div className="text-center">
                  <span className={`text-3xl font-bold ${band.color}`}>{score}</span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
              </div>
              <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{city}</h1>
              <p className={`text-sm font-medium ${band.text}`}>{band.label}</p>
            </Card>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Active Problems" value={activeReports.length} />
                <StatCard label="Resolved" value={resolvedReports.length} />
                <StatCard label="Resolution Rate" value={`${Math.round(resolved * 100)}%`} />
                <StatCard label="People Affected" value={`~${(reports.reduce((s, r) => s + r.people_affected, 0) / 1000).toFixed(1)}k`} />
              </div>

              {/* AI explain */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-slate-700">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                    <Bot className="h-5 w-5 text-teal-600 dark:text-teal-400" /> AI Health Explanation
                  </h2>
                  {!explanation && !aiLoading && (
                    <Button size="sm" variant="outline" onClick={runExplain} disabled={!aiReady}>
                      <Sparkles className="h-4 w-4" /> Explain
                    </Button>
                  )}
                </div>
                <div className="p-5">
                  {!aiReady && <AiNotReady />}
                  {aiReady && !explanation && !aiLoading && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Let AI explain how this community's score was calculated — its strengths and what needs improvement.</p>
                  )}
                  {aiLoading === 'explain' && <AiLoading />}
                  {aiError && <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>}
                  {explanation && (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{explanation.summary}</p>
                      {explanation.strengths.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Strengths</p>
                          <ul className="space-y-1">
                            {explanation.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {explanation.needs_improvement.length > 0 && (
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">Needs Improvement</p>
                          <ul className="space-y-1">
                            {explanation.needs_improvement.map((s, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Health dimensions radar/bars */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <Activity className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Health Dimensions
              </h2>
              <div className="space-y-3">
                {dims.filter((d) => d.reportCount > 0).sort((a, b) => a.score - b.score).map((d) => {
                  const b = healthBand(d.score);
                  return (
                    <div key={d.dimension}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{d.dimension}</span>
                        <span className={`font-semibold ${b.color}`}>{d.score}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div className={`h-full rounded-full ${b.bg}`} style={{ width: `${d.score}%`, transition: 'width 0.6s ease-out' }} />
                      </div>
                    </div>
                  );
                })}
                {dims.filter((d) => d.reportCount > 0).length === 0 && (
                  <p className="text-sm text-slate-400">No dimension-specific data yet.</p>
                )}
              </div>
            </Card>

            {/* AI community insights */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                  <Bot className="h-5 w-5 text-teal-600 dark:text-teal-400" /> AI Community Summary
                </h2>
                {!insight && !aiLoading && (
                  <Button size="sm" variant="outline" onClick={runInsights} disabled={!aiReady}>
                    <Sparkles className="h-4 w-4" /> Generate
                  </Button>
                )}
              </div>
              <div className="p-6">
                {!aiReady && <AiNotReady />}
                {aiReady && !insight && !aiLoading && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Generate a plain-language summary of this community's condition based on citizen reports.</p>
                )}
                {aiLoading === 'insights' && <AiLoading />}
                {aiError && <p className="text-sm text-red-600 dark:text-red-400">{aiError}</p>}
                {insight && (
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{insight.summary}</p>
                    {insight.strengths.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Strengths</p>
                        <ul className="space-y-1">
                          {insight.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {insight.concerns.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase text-amber-600 dark:text-amber-400">Concerns</p>
                        <ul className="space-y-1">
                          {insight.concerns.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Categories + trend */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Top Problem Categories</h2>
              <div className="space-y-3">
                {cats.map((c) => {
                  const Icon = getCategoryIcon(c.category);
                  const max = cats[0]?.count || 1;
                  return (
                    <div key={c.category} className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-200">{c.category}</span>
                          <span className="text-slate-500">{c.count}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${(c.count / max) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Reports Over Time
              </h2>
              <div className="flex h-40 items-end justify-between gap-3">
                {trend.map((p, i) => {
                  const max = Math.max(...trend.map((x) => x.count), 1);
                  return (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end">
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-cyan-400" style={{ height: `${(p.count / max) * 100}%`, minHeight: p.count > 0 ? '8px' : '2px' }} title={`${p.count} reports`} />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{p.label}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Recent active reports */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Active Issues in {city}</h2>
            {recentActive.length === 0 ? (
              <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">No active issues — all reports have been resolved!</Card>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recentActive.map((r) => <ReportCard key={r.id} report={r} />)}
              </div>
            )}
          </div>

          {/* Nearby communities */}
          {nearby.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Nearby Communities</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {nearby.map((n) => {
                  const rs = allReports.filter((r) => r.city === n.name);
                  const s = communityHealthScore(rs);
                  const b = healthBand(s);
                  return (
                    <button
                      key={n.name}
                      onClick={() => navigateTo(`/community/${encodeURIComponent(n.name)}`)}
                      className="rounded-xl border border-slate-200 p-4 text-center transition-all hover:border-teal-300 hover:shadow-sm dark:border-slate-700 dark:hover:border-teal-500/50"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{n.name}</p>
                      <p className={`mt-1 text-lg font-bold ${b.color}`}>{s}</p>
                      <p className="text-xs text-slate-400">{n.count} reports</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </Card>
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
