import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowLeft, MapPin, Building, Wallet, Clock, FileText, Phone, Mail,
  Bookmark, BookmarkCheck, Share2, ExternalLink, Calendar, CheckCircle2,
  XCircle, AlertCircle, Sparkles, Brain, ShieldCheck, ListChecks, Download
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Tender, Application, Company } from '../lib/types'
import { formatCurrency, formatDateTime, daysUntil, statusColor, appStatusColor } from '../lib/format'
import { summarizeTender, checkEligibility, recommendTenders, type TenderWithScore } from '../lib/ai'
import TenderCard from '../components/TenderCard'

export default function TenderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { session } = useAuth()
  const [tender, setTender] = useState<Tender | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [application, setApplication] = useState<Application | null>(null)
  const [similar, setSimilar] = useState<TenderWithScore[]>([])
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [showEligibility, setShowEligibility] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    supabase.from('tenders').select('*, category:categories(*)').eq('id', id).maybeSingle().then(({ data }) => {
      setTender(data as Tender | null)
      setLoading(false)
      if (data) {
        setAiSummary(summarizeTender(data as Tender))
        supabase.from('tenders').update({ view_count: (data as Tender).view_count + 1 }).eq('id', id).then(() => {})
        // load similar
        supabase
          .from('tenders')
          .select('*, category:categories(*)')
          .neq('id', id)
          .eq('status', 'open')
          .limit(20)
          .then(({ data: all }) => {
            if (all) {
              const recs = recommendTenders(all as Tender[], null).slice(0, 3)
              setSimilar(recs)
            }
          })
      }
    })

    if (session) {
      supabase.from('companies').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
        setCompany(data as Company | null)
      })
      supabase.from('bookmarks').select('id').eq('user_id', session.user.id).eq('tender_id', id).maybeSingle().then(({ data }) => {
        setBookmarked(!!data)
      })
      supabase.from('applications').select('*').eq('user_id', session.user.id).eq('tender_id', id).maybeSingle().then(({ data }) => {
        setApplication(data as Application | null)
      })
    }
  }, [id, session])

  const toggleBookmark = async () => {
    if (!session || !tender) return
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', session.user.id).eq('tender_id', tender.id)
      setBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert({ user_id: session.user.id, tender_id: tender.id, folder: 'Saved' })
      setBookmarked(true)
    }
  }

  const setAppStatus = async (status: Application['status']) => {
    if (!session || !tender) return
    if (application) {
      const { data } = await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', application.id).select('*').maybeSingle()
      setApplication(data as Application | null)
    } else {
      const { data } = await supabase.from('applications').insert({ user_id: session.user.id, tender_id: tender.id, status }).select('*').maybeSingle()
      setApplication(data as Application | null)
    }
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: tender?.title, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton mb-4 h-8 w-32 rounded" />
        <div className="skeleton mb-4 h-10 w-3/4 rounded" />
        <div className="skeleton mb-8 h-40 w-full rounded-xl" />
        <div className="skeleton h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!tender) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Tender not found</h1>
        <Link to="/browse" className="btn-primary mt-4">Back to browse</Link>
      </div>
    )
  }

  const days = daysUntil(tender.closing_date)
  const eligibility = checkEligibility(tender, company)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/browse" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
        <ArrowLeft size={16} /> Back to browse
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`badge ${statusColor(tender.status)}`}>{tender.status}</span>
              {tender.industry && <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tender.industry}</span>}
              {tender.tender_number && <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{tender.tender_number}</span>}
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">{tender.title}</h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              {tender.organization && <span className="flex items-center gap-1.5"><Building size={14} /> {tender.organization}</span>}
              {tender.state && <span className="flex items-center gap-1.5"><MapPin size={14} /> {tender.state}{tender.district ? `, ${tender.district}` : ''}</span>}
              {tender.ministry && <span className="flex items-center gap-1.5"><FileText size={14} /> {tender.ministry}</span>}
            </div>
          </div>

          {/* AI Summary */}
          <div className="card overflow-hidden">
            <button onClick={() => setShowSummary(!showSummary)} className="flex w-full items-center justify-between gap-3 p-5 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">AI Summary</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quick overview of this tender</p>
                </div>
              </div>
              {showSummary ? <XCircle size={18} className="text-slate-400" /> : <Brain size={18} className="text-slate-400" />}
            </button>
            {showSummary && aiSummary && (
              <div className="animate-slide-down border-t border-slate-100 p-5 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {aiSummary}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Description</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{tender.description}</p>
          </div>

          {/* Eligibility */}
          <div className="card overflow-hidden">
            <button onClick={() => setShowEligibility(!showEligibility)} className="flex w-full items-center justify-between gap-3 p-5 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Eligibility Checker</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {company ? 'Check if your company qualifies' : 'Complete your company profile to enable checking'}
                  </p>
                </div>
              </div>
              {showEligibility ? <XCircle size={18} className="text-slate-400" /> : <ListChecks size={18} className="text-slate-400" />}
            </button>
            {showEligibility && (
              <div className="animate-slide-down border-t border-slate-100 p-5 dark:border-slate-800">
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">{tender.eligibility_criteria}</p>
                {eligibility.total > 0 && company ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${eligibility.verdict === 'eligible' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : eligibility.verdict === 'partial' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}`}>
                        {eligibility.verdict === 'eligible' ? 'Likely Eligible' : eligibility.verdict === 'partial' ? 'Partially Eligible' : 'Needs Review'}
                      </span>
                      <span className="text-xs text-slate-500">{eligibility.passedCount}/{eligibility.total} criteria checked</span>
                    </div>
                    {eligibility.criteria.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                        {c.passed === true ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" /> :
                         c.passed === false ? <XCircle size={16} className="mt-0.5 flex-shrink-0 text-rose-500" /> :
                         <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">{c.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    {!company ? 'Complete your company profile to run the eligibility check.' : 'No specific criteria detected for automatic checking. Review the eligibility text above.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white">Required Documents</h3>
            <div className="mt-3 space-y-2">
              {tender.required_documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                  <FileText size={16} className="text-brand-600 dark:text-brand-400" />
                  <span className="flex-1 text-slate-700 dark:text-slate-300">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Similar tenders */}
          {similar.length > 0 && (
            <div>
              <h3 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">Similar tenders</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similar.map((t) => <TenderCard key={t.id} tender={t} showScore />)}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* Key facts */}
          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Key Information</h3>
            <dl className="space-y-3 text-sm">
              <InfoRow icon={Wallet} label="Budget" value={formatCurrency(tender.budget)} />
              <InfoRow icon={Wallet} label="EMD" value={formatCurrency(tender.emd)} />
              <InfoRow icon={FileText} label="Tender Fee" value={formatCurrency(tender.tender_fee)} />
              <InfoRow icon={Calendar} label="Opening Date" value={formatDateTime(tender.opening_date)} />
              <InfoRow icon={Clock} label="Closing Date" value={formatDateTime(tender.closing_date)} />
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-slate-500">Time remaining</span>
                <span className={`font-semibold ${days < 0 ? 'text-slate-400' : days <= 7 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  {days < 0 ? 'Closed' : days === 0 ? 'Closes today' : `${days} days left`}
                </span>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="card space-y-2 p-5">
            {session ? (
              <>
                <button onClick={toggleBookmark} className={bookmarked ? 'btn-secondary w-full' : 'btn-primary w-full'}>
                  {bookmarked ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save tender</>}
                </button>
                <button onClick={share} className="btn-secondary w-full">
                  <Share2 size={16} /> {copied ? 'Link copied!' : 'Share'}
                </button>
                {tender.official_link && (
                  <a href={tender.official_link} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">
                    <ExternalLink size={16} /> Official tender
                  </a>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Sign in to save and track this tender</p>
                <Link to="/login" className="btn-primary w-full">Sign in</Link>
              </div>
            )}
          </div>

          {/* Application tracker */}
          {session && (
            <div className="card p-5">
              <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Application Tracker</h3>
              {application && (
                <div className="mb-3">
                  <span className={`badge ${appStatusColor(application.status)} capitalize`}>{application.status}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setAppStatus('interested')} className="btn-secondary py-2 text-xs">Interested</button>
                <button onClick={() => setAppStatus('applied')} className="btn-secondary py-2 text-xs">Applied</button>
                <button onClick={() => setAppStatus('shortlisted')} className="btn-secondary py-2 text-xs">Shortlisted</button>
                <button onClick={() => setAppStatus('won')} className="btn-secondary py-2 text-xs">Won</button>
              </div>
            </div>
          )}

          {/* Contact */}
          {tender.contact_info && (
            <div className="card p-5">
              <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Contact</h3>
              <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail size={14} /> {tender.contact_info}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Icon size={14} /> {label}</dt>
      <dd className="font-semibold text-slate-900 dark:text-white">{value}</dd>
    </div>
  )
}
