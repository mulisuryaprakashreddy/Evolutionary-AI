import { useEffect, useMemo, useState } from 'react';
import { Trophy, TrendingUp, Leaf, Shield, Bus, HeartPulse, Users, Zap, ArrowRight, Medal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Report } from '@/types';
import { communityHealthScore, categoryStats, resolutionRate } from '@/lib/analytics';
import { healthBand, CATEGORY_TO_DIMENSION } from '@/lib/constants';
import { navigateTo } from '@/lib/router';
import { Spinner, EmptyState } from '@/components/ui';

type RankType = 'health' | 'cleanest' | 'safest' | 'transport' | 'healthcare' | 'improving' | 'active' | 'responsive';

const RANK_TYPES: { id: RankType; label: string; icon: typeof Trophy; desc: string }[] = [
  { id: 'health', label: 'Best Community Health', icon: Trophy, desc: 'Highest overall health score' },
  { id: 'cleanest', label: 'Cleanest Communities', icon: Leaf, desc: 'Fewest waste & pollution reports' },
  { id: 'safest', label: 'Safest Communities', icon: Shield, desc: 'Fewest public safety issues' },
  { id: 'transport', label: 'Best Transportation', icon: Bus, desc: 'Fewest transit complaints' },
  { id: 'healthcare', label: 'Best Healthcare Access', icon: HeartPulse, desc: 'Fewest healthcare issues' },
  { id: 'improving', label: 'Fastest Improving', icon: TrendingUp, desc: 'Highest resolution rate' },
  { id: 'active', label: 'Most Active Community', icon: Users, desc: 'Most reports filed' },
  { id: 'responsive', label: 'Most Responsive', icon: Zap, desc: 'Best government response' },
];

export function RankingsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankType, setRankType] = useState<RankType>('health');

  useEffect(() => {
    supabase
      .from('reports')
      .select('*, profiles!reports_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setReports((data as Report[]) ?? []);
        setLoading(false);
      });
  }, []);

  const communities = useMemo(() => {
    const map = new Map<string, Report[]>();
    for (const r of reports) {
      const arr = map.get(r.city) ?? [];
      arr.push(r);
      map.set(r.city, arr);
    }
    return [...map.entries()].map(([city, rs]) => {
      const score = communityHealthScore(rs);
      const resolved = resolutionRate(rs);
      const cats = categoryStats(rs);

      // Category-specific filtering for ranking types
      const filterByDimension = (dim: string) => rs.filter((r) => CATEGORY_TO_DIMENSION[r.category] === dim);
      const cleanRs = filterByDimension('Waste Management').concat(filterByDimension('Cleanliness'), filterByDimension('Air Quality'), filterByDimension('Environmental Health'));
      const safeRs = filterByDimension('Public Safety');
      const transRs = filterByDimension('Public Transportation');
      const healthRs = filterByDimension('Healthcare Accessibility');
      const govRs = filterByDimension('Government Response Time');

      return {
        city, reports: rs, score, resolved, cats,
        cleanScore: cleanRs.length === 0 ? 100 : communityHealthScore(cleanRs),
        safeScore: safeRs.length === 0 ? 100 : communityHealthScore(safeRs),
        transScore: transRs.length === 0 ? 100 : communityHealthScore(transRs),
        healthScore: healthRs.length === 0 ? 100 : communityHealthScore(healthRs),
        govScore: govRs.length === 0 ? 100 : communityHealthScore(govRs),
        activeCount: rs.length,
        improvingScore: Math.round(resolved * 100),
      };
    });
  }, [reports]);

  const sorted = useMemo(() => {
    const arr = [...communities];
    switch (rankType) {
      case 'health': arr.sort((a, b) => b.score - a.score); break;
      case 'cleanest': arr.sort((a, b) => b.cleanScore - a.cleanScore); break;
      case 'safest': arr.sort((a, b) => b.safeScore - a.safeScore); break;
      case 'transport': arr.sort((a, b) => b.transScore - a.transScore); break;
      case 'healthcare': arr.sort((a, b) => b.healthScore - a.healthScore); break;
      case 'improving': arr.sort((a, b) => b.improvingScore - a.improvingScore); break;
      case 'active': arr.sort((a, b) => b.activeCount - a.activeCount); break;
      case 'responsive': arr.sort((a, b) => b.govScore - a.govScore); break;
    }
    return arr;
  }, [communities, rankType]);

  const currentRank = RANK_TYPES.find((r) => r.id === rankType)!;
  const scoreField = (c: typeof sorted[number]) => {
    switch (rankType) {
      case 'health': return c.score;
      case 'cleanest': return c.cleanScore;
      case 'safest': return c.safeScore;
      case 'transport': return c.transScore;
      case 'healthcare': return c.healthScore;
      case 'improving': return c.improvingScore;
      case 'active': return c.activeCount;
      case 'responsive': return c.govScore;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Community Rankings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Compare communities across different quality-of-life dimensions, computed from citizen reports.</p>
      </div>

      {/* Rank type selector */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RANK_TYPES.map((r) => {
          const Icon = r.icon;
          const active = rankType === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRankType(r.id)}
              className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${active ? 'text-teal-700 dark:text-teal-300' : 'text-slate-900 dark:text-white'}`}>{r.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{r.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-teal-500" /></div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={<Trophy className="h-10 w-10" />} title="No communities ranked yet" description="Reports will populate rankings once submitted." />
      ) : (
        <div className="space-y-3">
          {sorted.map((c, i) => {
            const band = healthBand(c.score);
            const val = scoreField(c);
            const isCount = rankType === 'active';
            return (
              <button
                key={c.city}
                onClick={() => navigateTo(`/community/${encodeURIComponent(c.city)}`)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-teal-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-teal-500/50 sm:p-5"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                  : i === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  : i === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                  : 'bg-slate-50 text-slate-400 dark:bg-slate-800'
                }`}>
                  {i < 3 ? <Medal className="h-5 w-5" /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">{c.city}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.reports.length} reports · {Math.round(c.resolved * 100)}% resolved</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${isCount ? 'text-slate-900 dark:text-white' : band.color}`}>{isCount ? val : val}</p>
                  <p className="text-xs text-slate-400">{isCount ? 'reports' : currentRank.label.split(' ')[0].toLowerCase()}</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-teal-500" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
