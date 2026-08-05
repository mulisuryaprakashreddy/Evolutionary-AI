import type { Report } from '@/types';
import { CATEGORY_TO_DIMENSION, HEALTH_DIMENSIONS } from './constants';

// In-app analytics & scoring — no AI calls, deterministic.

export function calcPriorityScore(r: Report): number {
  const sevWeight: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  const statusMultiplier: Record<string, number> = {
    reported: 1, verified: 1.1, under_review: 1, in_progress: 0.8,
    resolved: 0.1, closed: 0.05, reopened: 1.2,
  };
  const sev = sevWeight[r.severity] ?? 2;
  const votes = Math.log10(r.votes_count + 1) * 10;
  const people = Math.log10(r.people_affected + 1) * 8;
  const ageDays = (Date.now() - new Date(r.created_at).getTime()) / 86400000;
  const ageFactor = Math.min(ageDays / 30, 1) * 8;
  const recur = r.recurrence === 'continuous' ? 6 : r.recurrence === 'recurring' ? 4 : 0;
  const base = sev * 12 + votes + people + ageFactor + recur;
  return Math.round(base * (statusMultiplier[r.status] ?? 1));
}

export interface CategoryStat {
  category: string;
  count: number;
  affected: number;
}

export function categoryStats(reports: Report[]): CategoryStat[] {
  const map = new Map<string, CategoryStat>();
  for (const r of reports) {
    const cur = map.get(r.category) ?? { category: r.category, count: 0, affected: 0 };
    cur.count += 1;
    cur.affected += r.people_affected;
    map.set(r.category, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export function resolutionRate(reports: Report[]): number {
  if (reports.length === 0) return 0;
  const resolved = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
  return resolved / reports.length;
}

export interface DimensionScore {
  dimension: string;
  score: number;
  reportCount: number;
}

export function healthDimensions(reports: Report[]): DimensionScore[] {
  const dimReports = new Map<string, Report[]>();
  for (const dim of HEALTH_DIMENSIONS) dimReports.set(dim, []);
  for (const r of reports) {
    const dim = CATEGORY_TO_DIMENSION[r.category];
    if (dim && dimReports.has(dim)) dimReports.get(dim)!.push(r);
  }
  const sevPenalty: Record<string, number> = { low: 4, medium: 8, high: 14, critical: 22 };
  return HEALTH_DIMENSIONS.map((dim) => {
    const rs = dimReports.get(dim) ?? [];
    if (rs.length === 0) return { dimension: dim, score: 95, reportCount: 0 };
    let penalty = 0;
    for (const r of rs) penalty += sevPenalty[r.severity] ?? 8;
    penalty += Math.log10(rs.length + 1) * 6;
    penalty += Math.log10(rs.reduce((s, r) => s + r.people_affected, 0) + 1) * 4;
    const resolved = rs.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
    const resolvedBoost = (resolved / rs.length) * 12;
    const score = Math.max(10, Math.min(100, Math.round(100 - penalty + resolvedBoost)));
    return { dimension: dim, score, reportCount: rs.length };
  });
}

export function communityHealthScore(reports: Report[]): number {
  if (reports.length === 0) return 100;
  const dims = healthDimensions(reports);
  // Weight dimensions with reports more heavily; unreported dims stay high.
  let total = 0;
  let weight = 0;
  for (const d of dims) {
    const w = d.reportCount > 0 ? d.reportCount + 1 : 1;
    total += d.score * w;
    weight += w;
  }
  // Resolution bonus
  const rr = resolutionRate(reports);
  const bonus = rr * 8;
  return Math.max(0, Math.min(100, Math.round(total / weight + bonus)));
}

export interface TrendPoint {
  label: string;
  count: number;
}

export function monthlyTrend(reports: Report[], months = 6): TrendPoint[] {
  const now = new Date();
  const points: TrendPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-US', { month: 'short' });
    const count = reports.filter((r) => {
      const rd = new Date(r.created_at);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
    }).length;
    points.push({ label, count });
  }
  return points;
}

export function topLocations(reports: Report[], key: 'city' | 'village' | 'country' = 'city', n = 5) {
  const map = new Map<string, number>();
  for (const r of reports) {
    const v = r[key];
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, n);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
