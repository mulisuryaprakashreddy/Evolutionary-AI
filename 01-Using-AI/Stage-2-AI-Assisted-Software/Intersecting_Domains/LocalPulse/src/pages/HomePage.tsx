import { useEffect, useMemo, useState } from 'react';
import {
  Search, MapPin, ArrowRight, TrendingUp, Sparkles, Users, Globe,
  Activity, ShieldCheck, BarChart3, MessageSquareText, Bot, HandHeart,
  Layers, Map as MapIcon, FileText, Lightbulb, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { navigateTo } from '@/lib/router';
import type { Report } from '@/types';
import { ReportCard } from '@/components/ReportCard';
import { Button, Card } from '@/components/ui';
import { communityHealthScore, categoryStats, topLocations, monthlyTrend } from '@/lib/analytics';
import { healthBand } from '@/lib/constants';
import { hasApiKey } from '@/lib/ai';

const HERO_IMG = 'https://images.pexels.com/photos/6647013/pexels-photo-6647013.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('reports')
      .select('*, profiles!reports_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setReports((data as Report[]) ?? []);
        setLoading(false);
      });
  }, []);

  const trending = useMemo(() => [...reports].sort((a, b) => b.votes_count - a.votes_count).slice(0, 4), [reports]);
  const recent = useMemo(() => reports.slice(0, 8), [reports]);
  const cats = useMemo(() => categoryStats(reports).slice(0, 6), [reports]);
  const cities = useMemo(() => topLocations(reports, 'city', 5), [reports]);
  const trend = useMemo(() => monthlyTrend(reports, 6), [reports]);
  const avgHealth = useMemo(() => {
    if (reports.length === 0) return null;
    const byCity = new Map<string, Report[]>();
    for (const r of reports) {
      const arr = byCity.get(r.city) ?? [];
      arr.push(r);
      byCity.set(r.city, arr);
    }
    const scores = [...byCity.values()].map((rs) => communityHealthScore(rs));
    return Math.round(scores.reduce((s, x) => s + x, 0) / scores.length);
  }, [reports]);

  const aiReady = hasApiKey();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(query.trim() ? `/explore?q=${encodeURIComponent(query)}` : '/explore');
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/70 to-slate-50 dark:to-slate-950" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-teal-300" />
              AI-powered community intelligence
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              What's happening in<br className="hidden sm:block" /> your community?
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-200">
              Report local problems. AI clusters, prioritizes, and summarizes thousands of citizen reports into actionable insights for communities, NGOs, and local governments.
            </p>

            <form onSubmit={onSearch} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl dark:bg-slate-800">
              <Search className="ml-2 h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search issues, locations, categories…"
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <Button type="submit" size="md" className="shrink-0">
                Search
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button variant="secondary" size="lg" onClick={() => navigateTo('/report/new')}>
                <FileText className="h-5 w-5" />
                Report a Problem
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => navigateTo('/explore')}>
                <Globe className="h-5 w-5" />
                Explore Problems
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          <Stat icon={<FileText className="h-5 w-5" />} label="Reports Filed" value={reports.length ? `${reports.length}+` : '—'} />
          <Stat icon={<Globe className="h-5 w-5" />} label="Communities" value={cities.length ? `${cities.length}+` : '—'} />
          <Stat icon={<Users className="h-5 w-5" />} label="People Affected" value={reports.length ? `${Math.round(reports.reduce((s, r) => s + r.people_affected, 0) / 1000)}k+` : '—'} />
          <Stat icon={<Activity className="h-5 w-5" />} label="Avg. Health Score" value={avgHealth !== null ? `${avgHealth}/100` : '—'} accent={avgHealth !== null ? healthBand(avgHealth).color : ''} />
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* Trending */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trending Issues</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigateTo('/explore?sort=votes')}>View all <ChevronRight className="h-4 w-4" /></Button>
          </div>
          {loading ? <LoadingGrid /> : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {trending.map((r) => <ReportCard key={r.id} report={r} />)}
            </div>
          )}
        </section>

        {/* AI Insights banner */}
        <section>
          <Card className="overflow-hidden">
            <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_1fr] lg:p-10">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  <Bot className="h-4 w-4" /> AI Community Intelligence
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  Turn thousands of reports into clarity
                </h2>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  LocalPulse AI clusters duplicate reports, calculates priority scores, generates community health scores, predicts emerging risks, and suggests practical solutions — all grounded in real citizen reports.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => navigateTo('/chat')}>
                    <Bot className="h-4 w-4" /> Try the AI Assistant
                  </Button>
                  <Button variant="outline" onClick={() => navigateTo('/rankings')}>
                    <BarChart3 className="h-4 w-4" /> View Rankings
                  </Button>
                </div>
                {!aiReady && (
                  <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                    Add your AI API key in Settings to unlock AI insights.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FeatureMini icon={<Layers />} title="Clustering" desc="Group duplicate reports" />
                <FeatureMini icon={<TrendingUp />} title="Priority Score" desc="Rank by urgency" />
                <FeatureMini icon={<ShieldCheck />} title="Health Score" desc="0–100 per area" />
                <FeatureMini icon={<Lightbulb />} title="Solutions" desc="AI recommendations" />
              </div>
            </div>
          </Card>
        </section>

        {/* Recently reported */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recently Reported</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigateTo('/explore')}>View all <ChevronRight className="h-4 w-4" /></Button>
          </div>
          {loading ? <LoadingGrid /> : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {recent.map((r) => <ReportCard key={r.id} report={r} />)}
            </div>
          )}
        </section>

        {/* Categories + Cities */}
        <section className="grid gap-8 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Top Categories
            </h3>
            <div className="space-y-3">
              {cats.map((c) => {
                const max = cats[0]?.count || 1;
                return (
                  <div key={c.category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{c.category}</span>
                      <span className="text-slate-500 dark:text-slate-400">{c.count} reports</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all" style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Active Communities
            </h3>
            <div className="space-y-2">
              {cities.map((city) => {
                const cityReports = reports.filter((r) => r.city === city.name);
                const score = communityHealthScore(cityReports);
                const band = healthBand(score);
                return (
                  <button
                    key={city.name}
                    onClick={() => navigateTo(`/community/${encodeURIComponent(city.name)}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/50 dark:border-slate-700 dark:hover:border-teal-500/50 dark:hover:bg-teal-500/5"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{city.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{city.count} reports</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${band.color}`}>{score}</p>
                      <p className="text-xs text-slate-400">health</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </section>

        {/* Trend chart */}
        <section>
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Reports Over Time
            </h3>
            <TrendChart points={trend} />
          </Card>
        </section>

        {/* How it works */}
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">How It Works</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">From a single report to community-wide intelligence</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <HowStep
              num="01" icon={<FileText />}
              title="Report a Problem"
              desc="Citizens document issues with photos, location, severity, and context. Reports are public and searchable."
            />
            <HowStep
              num="02" icon={<Bot />}
              title="AI Analyzes"
              desc="AI clusters duplicates, calculates priority scores, detects trends, and generates plain-language summaries."
            />
            <HowStep
              num="03" icon={<HandHeart />}
              title="Communities Act"
              desc="Citizens, NGOs, and governments use insights to prioritize, respond, and measure real impact."
            />
          </div>
        </section>

        {/* Quick links */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink icon={<MapIcon />} title="Interactive Map" desc="Explore reports on a map" onClick={() => navigateTo('/map')} />
          <QuickLink icon={<BarChart3 />} title="Rankings" desc="Compare communities" onClick={() => navigateTo('/rankings')} />
          <QuickLink icon={<MessageSquareText />} title="AI Assistant" desc="Ask about issues" onClick={() => navigateTo('/chat')} />
          <QuickLink icon={<HandHeart />} title="Get Involved" desc="Report & vote" onClick={() => navigateTo('/report/new')} />
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, accent = '' }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-6 text-center">
      <div className="text-teal-600 dark:text-teal-400">{icon}</div>
      <p className={`text-2xl font-bold ${accent || 'text-slate-900 dark:text-white'}`}>{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function FeatureMini({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="mb-2 text-teal-600 dark:text-teal-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  );
}

function HowStep({ num, icon, title, desc }: { num: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="relative p-6">
      <span className="absolute right-4 top-4 text-3xl font-bold text-slate-100 dark:text-slate-800">{num}</span>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </Card>
  );
}

function QuickLink({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-teal-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-teal-500/50">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-500" />
    </button>
  );
}

function TrendChart({ points }: { points: { label: string; count: number }[] }) {
  const max = Math.max(...points.map((p) => p.count), 1);
  return (
    <div className="flex h-40 items-end justify-between gap-3">
      {points.map((p, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-teal-500 to-cyan-400 transition-all hover:from-teal-600 hover:to-cyan-500"
              style={{ height: `${(p.count / max) * 100}%`, minHeight: p.count > 0 ? '8px' : '2px' }}
              title={`${p.count} reports`}
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}
