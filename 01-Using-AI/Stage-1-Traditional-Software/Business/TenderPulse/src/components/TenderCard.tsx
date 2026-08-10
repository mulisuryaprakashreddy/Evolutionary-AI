import { Link } from 'react-router-dom'
import { MapPin, Building, Clock, Wallet, Bookmark, BookmarkCheck, TrendingUp } from 'lucide-react'
import type { Tender } from '../lib/types'
import type { TenderWithScore } from '../lib/types'
import { formatCurrency, formatDate, daysUntil, statusColor } from '../lib/format'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

interface Props {
  tender: Tender | TenderWithScore
  showScore?: boolean
  bookmarked?: boolean
  onBookmarkChange?: (id: string, saved: boolean) => void
}

export default function TenderCard({ tender, showScore, bookmarked, onBookmarkChange }: Props) {
  const { session } = useAuth()
  const [saved, setSaved] = useState(bookmarked ?? false)
  const [saving, setSaving] = useState(false)
  const score = 'score' in tender ? (tender as TenderWithScore).score : null
  const reasons = 'reasons' in tender ? (tender as TenderWithScore).reasons : []
  const days = daysUntil(tender.closing_date)

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!session) return
    setSaving(true)
    if (saved) {
      await supabase.from('bookmarks').delete().eq('user_id', session.user.id).eq('tender_id', tender.id)
      setSaved(false)
      onBookmarkChange?.(tender.id, false)
    } else {
      await supabase.from('bookmarks').insert({ user_id: session.user.id, tender_id: tender.id, folder: 'Saved' })
      setSaved(true)
      onBookmarkChange?.(tender.id, true)
    }
    setSaving(false)
  }

  return (
    <Link
      to={`/tenders/${tender.id}`}
      className="card group flex flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`badge ${statusColor(tender.status)}`}>{tender.status}</span>
          {tender.industry && (
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tender.industry}</span>
          )}
          {score != null && showScore && (
            <span className="badge bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
              <TrendingUp size={11} /> {score}% match
            </span>
          )}
        </div>
        {session && (
          <button
            onClick={toggleBookmark}
            disabled={saving}
            className="flex-shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
            aria-label={saved ? 'Remove bookmark' : 'Save tender'}
          >
            {saved ? <BookmarkCheck size={18} className="text-brand-600" /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 font-display text-base font-bold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
        {tender.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        {tender.organization && (
          <span className="flex items-center gap-1"><Building size={12} /> {tender.organization}</span>
        )}
        {tender.state && (
          <span className="flex items-center gap-1"><MapPin size={12} /> {tender.state}</span>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{tender.description}</p>

      {showScore && reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {reasons.slice(0, 2).map((r, i) => (
            <span key={i} className="badge bg-accent-50 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">{r}</span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-4 pt-4">
        <div>
          <p className="text-xs text-slate-400">Budget</p>
          <p className="flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-white">
            <Wallet size={13} /> {formatCurrency(tender.budget)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Closing</p>
          <p className={`flex items-center justify-end gap-1 text-sm font-semibold ${
            days < 0 ? 'text-slate-400' : days <= 7 ? 'text-rose-600' : 'text-slate-900 dark:text-white'
          }`}>
            <Clock size={13} />
            {days < 0 ? 'Closed' : days === 0 ? 'Today' : `${days}d left`}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function TenderCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
      <div className="skeleton mt-3 h-5 w-3/4 rounded" />
      <div className="skeleton mt-4 h-4 w-1/2 rounded" />
      <div className="skeleton mt-3 h-12 w-full rounded" />
      <div className="mt-4 flex justify-between">
        <div className="skeleton h-8 w-24 rounded" />
        <div className="skeleton h-8 w-24 rounded" />
      </div>
    </div>
  )
}
