import { ArrowBigUp, MapPin, MessageSquare, Users, Calendar } from 'lucide-react';
import type { Report } from '@/types';
import { getCategoryIcon, severityMeta, statusMeta } from '@/lib/constants';
import { timeAgo } from '@/lib/analytics';
import { navigateTo } from '@/lib/router';

export function ReportCard({ report, compact = false }: { report: Report; compact?: boolean }) {
  const CatIcon = getCategoryIcon(report.category);
  const sev = severityMeta(report.severity);
  const stat = statusMeta(report.status);
  const photo = report.photos?.[0];

  return (
    <button
      onClick={() => navigateTo(`/reports/${report.id}`)}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition-all hover:border-teal-300 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-teal-500/50 dark:hover:shadow-teal-500/5"
    >
      {photo && !compact && (
        <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
          <img
            src={photo}
            alt={report.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${sev.dot}`}>
              {sev.label}
            </span>
          </div>
          <div className="absolute right-3 top-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stat.color}`}>
              {stat.label}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CatIcon className="h-3.5 w-3.5" />
          <span className="font-medium">{report.category}</span>
        </div>

        <h3 className="line-clamp-2 font-semibold text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
          {report.title}
        </h3>

        {!compact && (
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {report.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {report.city}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {timeAgo(report.created_at)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700/60">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <ArrowBigUp className="h-4 w-4" />
              {report.votes_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {report.comments_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {report.people_affected >= 1000 ? `${(report.people_affected / 1000).toFixed(1)}k` : report.people_affected}
            </span>
          </div>
          {compact && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${sev.dot}`}>
              {sev.label}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
