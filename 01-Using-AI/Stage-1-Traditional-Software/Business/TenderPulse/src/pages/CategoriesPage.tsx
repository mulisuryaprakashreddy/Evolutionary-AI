import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category, Tender } from '../lib/types'
import { Building2, Laptop, HeartPulse, GraduationCap, Zap, Droplets, Truck, ShieldCheck, Briefcase, Package, ArrowRight } from 'lucide-react'

const ICONS: Record<string, typeof Building2> = {
  Building2, Laptop, HeartPulse, GraduationCap, Zap, Droplets, Truck, ShieldCheck, Briefcase, Package,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<(Category & { tender_count: number })[]>([])

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(async ({ data }) => {
      const cats = (data as Category[]) ?? []
      const withCounts = await Promise.all(
        cats.map(async (c) => {
          const { count } = await supabase.from('tenders').select('*', { count: 'exact', head: true }).eq('category_id', c.id).eq('status', 'open')
          return { ...c, tender_count: count ?? 0 }
        })
      )
      setCategories(withCounts)
    })
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse government tenders by sector</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const Icon = ICONS[c.icon ?? ''] ?? Building2
          return (
            <Link
              key={c.id}
              to={`/browse?category=${c.slug}`}
              className="card group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-950/50 dark:text-brand-400">
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{c.description}</p>
                <p className="mt-1 text-xs font-medium text-brand-600 dark:text-brand-400">{c.tender_count} open tender{c.tender_count !== 1 ? 's' : ''}</p>
              </div>
              <ArrowRight size={18} className="text-slate-300 transition-colors group-hover:text-brand-600 dark:text-slate-700 dark:group-hover:text-brand-400" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
