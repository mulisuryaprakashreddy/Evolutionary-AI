import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Search, TrendingUp, Building2, ShieldCheck, Brain, Clock, Star,
  ArrowRight, CheckCircle2, FileText, Bell, Sparkles, ChevronDown, Quote,
  Laptop, HeartPulse, GraduationCap, Zap, Droplets, Truck, Briefcase, Package
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Tender, Category, Testimonial } from '../lib/types'
import TenderCard, { TenderCardSkeleton } from '../components/TenderCard'
import { formatCurrency } from '../lib/format'

const faqs = [
  { q: 'What is TenderPulse?', a: 'TenderPulse is a platform that helps businesses discover government tenders, contracts, grants, and procurement opportunities. It uses AI to recommend tenders that match your business profile, industry, and location.' },
  { q: 'How do AI recommendations work?', a: 'Our recommendation engine analyzes your company profile, industry, location, budget preferences, and past activity to score each tender on a 0-100% relevance scale. The more complete your profile, the better the matches.' },
  { q: 'Is there a cost to use TenderPulse?', a: 'You can browse all government tenders and create an account for free. Premium features like proposal-writing assistance and advanced analytics are available on paid plans.' },
  { q: 'Can I apply for tenders through the platform?', a: 'TenderPulse helps you discover and track opportunities. Each tender includes the official link where you submit your bid directly on the government portal.' },
  { q: 'How often are tenders updated?', a: 'New tenders are added daily from government portals. You can enable notifications to be alerted when a tender matches your saved searches.' },
]

const stats = [
  { label: 'Active Tenders', value: '12,400+', icon: FileText },
  { label: 'Businesses Connected', value: '8,200+', icon: Building2 },
  { label: 'Total Contract Value', value: '₹4,200 Cr', icon: TrendingUp },
  { label: 'Success Rate', value: '94%', icon: ShieldCheck },
]

const features = [
  { icon: Brain, title: 'AI Recommendations', desc: 'Get tenders scored 0-100% based on your company profile, industry, and location.' },
  { icon: FileText, title: 'Tender Summarizer', desc: 'AI-generated summaries highlight key facts so you can decide quickly.' },
  { icon: ShieldCheck, title: 'Eligibility Checker', desc: 'See instantly whether your business meets a tender requirements.' },
  { icon: Bell, title: 'Smart Notifications', desc: 'Get alerted about new tenders, closing deadlines, and saved search matches.' },
  { icon: Clock, title: 'Deadline Reminders', desc: 'Never miss a bid window with automatic deadline tracking.' },
  { icon: Sparkles, title: 'Proposal Assistant', desc: 'Get AI suggestions to draft stronger proposals and bid documents.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [featured, setFeatured] = useState<Tender[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    Promise.all([
      supabase.from('tenders').select('*, category:categories(*)').eq('status', 'open').order('budget', { ascending: false }).limit(6),
      supabase.from('categories').select('*').order('name'),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }).limit(3),
    ]).then(([t, c, tm]) => {
      setFeatured((t.data as Tender[]) ?? [])
      setCategories((c.data as Category[]) ?? [])
      setTestimonials((tm.data as Testimonial[]) ?? [])
      setLoading(false)
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/browse?q=${encodeURIComponent(query)}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-brand-950/40 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl dark:bg-brand-900/20" />
          <div className="absolute right-1/4 top-20 h-72 w-72 rounded-full bg-accent-200/20 blur-3xl dark:bg-accent-900/10" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 animate-fade-in dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-300">
              <Sparkles size={14} /> AI-Powered Tender Discovery
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl animate-fade-in-up dark:text-white">
              Find government tenders that <span className="text-brand-600 dark:text-brand-400">fit your business</span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 animate-fade-in-up">
              Discover thousands of government contracts, grants, and procurement opportunities.
              Get AI-powered recommendations matched to your industry, location, and budget.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row animate-fade-in-up">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by keyword, ministry, state, or organization..."
                  className="input pl-12 py-3.5 text-base shadow-sm"
                />
              </div>
              <button type="submit" className="btn-primary px-6 py-3.5 text-base">
                Search <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-accent-500" /> Free to browse</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-accent-500" /> Real-time updates</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-accent-500" /> No credit card needed</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card flex flex-col items-center p-5 text-center animate-fade-in-up">
                <s.icon className="mb-2 text-brand-600 dark:text-brand-400" size={22} />
                <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Browse by category</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Explore opportunities across sectors</p>
          </div>
          <Link to="/categories" className="hidden text-sm font-medium text-brand-600 hover:underline dark:text-brand-400 sm:block">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/browse?category=${c.slug}`}
              className="card group flex flex-col items-center gap-2 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950/50 dark:text-brand-400">
                <CategoryIcon name={c.icon} />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tenders */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Featured tenders</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">High-value opportunities open now</p>
            </div>
            <Link to="/browse" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <TenderCardSkeleton key={i} />)
              : featured.map((t) => <TenderCard key={t.id} tender={t} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Everything you need to win contracts</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">AI tools that help you find, evaluate, and apply faster</p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <f.icon size={22} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-slate-50 py-16 dark:bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Trusted by businesses nationwide</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">See what our users say about TenderPulse</p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="card flex flex-col p-6">
                  <Quote className="text-brand-200 dark:text-brand-800" size={28} />
                  <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-300">{t.quote}</p>
                  <div className="mt-4 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
                  </div>
                  <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}{t.company ? `, ${t.company}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-12 text-center shadow-lg sm:px-12">
          <div className="absolute inset-0 -z-10">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-accent-400/20 blur-3xl" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Start winning government contracts today</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">Create a free account, complete your business profile, and let AI find the right tenders for you.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register" className="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
              Create free account <ArrowRight size={18} />
            </Link>
            <Link to="/browse" className="btn border border-white/30 px-6 py-3 text-base text-white hover:bg-white/10">
              Browse tenders
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-2xl font-bold text-slate-900 dark:text-white">Frequently asked questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{f.q}</span>
                <ChevronDown size={18} className={`flex-shrink-0 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="animate-slide-down px-5 pb-5 text-sm text-slate-600 dark:text-slate-400">{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function CategoryIcon({ name }: { name: string | null }) {
  const icons: Record<string, typeof Building2> = {
    Building2, Laptop, HeartPulse, GraduationCap, Zap, Droplets, Truck, ShieldCheck, Briefcase, Package,
  }
  const Icon = icons[name ?? ''] ?? Building2
  return <Icon size={22} />
}

