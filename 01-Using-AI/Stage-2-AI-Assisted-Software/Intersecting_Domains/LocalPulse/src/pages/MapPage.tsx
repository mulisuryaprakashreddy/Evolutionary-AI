import { useEffect, useMemo, useState } from 'react';
import { Map as MapIcon, Layers, Flame } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Report } from '@/types';
import { severityMeta } from '@/lib/constants';
import { navigateTo } from '@/lib/router';
import { Spinner, EmptyState } from '@/components/ui';
import { timeAgo } from '@/lib/analytics';

type Mode = 'pins' | 'heatmap';

export function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('pins');
  const [selected, setSelected] = useState<Report | null>(null);

  useEffect(() => {
    supabase
      .from('reports')
      .select('*, profiles!reports_user_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setReports((data as Report[]) ?? []);
        setLoading(false);
      });
  }, []);

  // Normalize lat/lng to SVG coordinates on an equirectangular world map
  const points = useMemo(() => {
    return reports.map((r) => ({
      report: r,
      x: ((r.longitude + 180) / 360) * 100,
      y: ((90 - r.latitude) / 180) * 100,
    }));
  }, [reports]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Interactive Map</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Explore community reports across the globe. Colors indicate severity.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('pins')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${mode === 'pins' ? 'bg-teal-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <MapIcon className="h-4 w-4" /> Pins
          </button>
          <button
            onClick={() => setMode('heatmap')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${mode === 'heatmap' ? 'bg-teal-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <Flame className="h-4 w-4" /> Heatmap
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
          {loading ? (
            <div className="flex h-[500px] items-center justify-center"><Spinner className="h-8 w-8 text-teal-500" /></div>
          ) : reports.length === 0 ? (
            <div className="flex h-[500px] items-center justify-center"><EmptyState icon={<MapIcon className="h-10 w-10" />} title="No reports to map yet" /></div>
          ) : (
            <div className="relative h-[500px] w-full sm:h-[600px]">
              {/* World map background (simplified grid + ocean) */}
              <svg viewBox="0 0 100 50" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <rect width="100" height="50" fill="currentColor" className="text-slate-100 dark:text-slate-800/50" />
                {/* Latitude/longitude grid */}
                {[10, 20, 30, 40].map((y) => (
                  <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.05" className="text-slate-200 dark:text-slate-700" />
                ))}
                {[20, 40, 60, 80].map((x) => (
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="50" stroke="currentColor" strokeWidth="0.05" className="text-slate-200 dark:text-slate-700" />
                ))}
                {/* Simplified continents (rough shapes) */}
                <g fill="currentColor" className="text-slate-200 dark:text-slate-700/70">
                  {/* North America */}
                  <path d="M12,8 Q18,6 24,9 L26,14 Q24,20 20,22 L15,21 Q10,18 11,12 Z" />
                  {/* South America */}
                  <path d="M24,24 Q28,22 30,26 L29,34 Q27,38 25,37 L24,30 Z" />
                  {/* Europe */}
                  <path d="M46,10 Q52,8 55,12 L53,16 Q48,17 45,14 Z" />
                  {/* Africa */}
                  <path d="M48,18 Q56,16 58,22 L56,32 Q52,36 49,34 L47,26 Z" />
                  {/* Asia */}
                  <path d="M56,8 Q72,6 82,12 L84,18 Q78,22 70,20 L60,16 Z" />
                  {/* India */}
                  <path d="M68,18 Q72,17 73,22 L70,24 Z" />
                  {/* Australia */}
                  <path d="M80,30 Q86,28 88,32 L85,35 Q81,34 80,32 Z" />
                </g>

                {/* Heatmap glow */}
                {mode === 'heatmap' && points.map((p, i) => {
                  const sev = severityMeta(p.report.severity);
                  const radius = p.report.severity === 'critical' ? 6 : p.report.severity === 'high' ? 5 : 4;
                  return (
                    <circle
                      key={`heat-${i}`}
                      cx={p.x}
                      cy={p.y / 2}
                      r={radius}
                      className={sev.id === 'critical' ? 'fill-red-500/30' : sev.id === 'high' ? 'fill-orange-500/25' : sev.id === 'medium' ? 'fill-amber-500/20' : 'fill-emerald-500/15'}
                    />
                  );
                })}
              </svg>

              {/* Pins overlay */}
              {mode === 'pins' && (
                <div className="absolute inset-0">
                  {points.map((p) => {
                    const sev = severityMeta(p.report.severity);
                    return (
                      <button
                        key={p.report.id}
                        onClick={() => setSelected(p.report)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 hover:z-10"
                        style={{ left: `${p.x}%`, top: `${p.y}%` }}
                        title={p.report.title}
                      >
                        <span className={`block h-3 w-3 rounded-full ${sev.dot} ring-2 ring-white shadow-md dark:ring-slate-900`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
                <p className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">Severity</p>
                <div className="flex gap-3">
                  {[{ c: 'bg-emerald-500', l: 'Low' }, { c: 'bg-amber-500', l: 'Med' }, { c: 'bg-orange-500', l: 'High' }, { c: 'bg-red-500', l: 'Critical' }].map((x) => (
                    <span key={x.l} className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <span className={`h-2.5 w-2.5 rounded-full ${x.c}`} /> {x.l}
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs text-slate-500 backdrop-blur dark:bg-slate-900/90 dark:text-slate-400">
                <Layers className="h-3.5 w-3.5" /> {reports.length} reports
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — selected report or list */}
        <div className="space-y-3">
          {selected ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800 animate-in scale-in">
              {selected.photos?.[0] && (
                <img src={selected.photos[0]} alt="" className="mb-3 h-32 w-full rounded-xl object-cover" />
              )}
              <h3 className="font-semibold text-slate-900 dark:text-white">{selected.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">{selected.description}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>{selected.city}, {selected.country}</span>
                <span>{timeAgo(selected.created_at)}</span>
              </div>
              <button
                onClick={() => navigateTo(`/reports/${selected.id}`)}
                className="mt-3 w-full rounded-xl bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                View Full Report
              </button>
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
              Click a pin to see report details.
            </p>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Recent Reports</h3>
            <div className="space-y-2">
              {reports.slice(0, 6).map((r) => {
                const sev = severityMeta(r.severity);
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${sev.dot}`} />
                    <span className="line-clamp-1 flex-1 text-xs text-slate-700 dark:text-slate-300">{r.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
