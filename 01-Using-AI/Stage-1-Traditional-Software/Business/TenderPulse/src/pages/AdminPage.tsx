import { useEffect, useState } from 'react'
import {
  Plus, Pencil, Trash2, X, Save, FileText, Users, BarChart3, ShieldCheck,
  TrendingUp, Building, MapPin, Search
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Tender, Category, Profile } from '../lib/types'
import { formatCurrency, formatDate, statusColor } from '../lib/format'

type Tab = 'tenders' | 'users' | 'analytics'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('tenders')
  const [tenders, setTenders] = useState<Tender[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [stats, setStats] = useState({ tenders: 0, open: 0, users: 0, totalBudget: 0 })
  const [byState, setByState] = useState<{ state: string; count: number }[]>([])
  const [byIndustry, setByIndustry] = useState<{ industry: string; count: number }[]>([])
  const [editing, setEditing] = useState<Tender | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const loadTenders = () => {
    supabase.from('tenders').select('*, category:categories(*)').order('created_at', { ascending: false }).then(({ data }) => {
      setTenders((data as Tender[]) ?? [])
    })
  }

  const loadAnalytics = () => {
    supabase.from('tenders').select('budget, state, industry, status').then(({ data }) => {
      const rows = (data ?? []) as { budget: number; state: string; industry: string; status: string }[]
      const total = rows.reduce((s, r) => s + (r.budget ?? 0), 0)
      setStats({
        tenders: rows.length,
        open: rows.filter((r) => r.status === 'open').length,
        users: 0,
        totalBudget: total,
      })
      const stateMap: Record<string, number> = {}
      rows.forEach((r) => { if (r.state) stateMap[r.state] = (stateMap[r.state] ?? 0) + 1 })
      setByState(Object.entries(stateMap).map(([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count))
      const indMap: Record<string, number> = {}
      rows.forEach((r) => { if (r.industry) indMap[r.industry] = (indMap[r.industry] ?? 0) + 1 })
      setByIndustry(Object.entries(indMap).map(([industry, count]) => ({ industry, count })).sort((a, b) => b.count - a.count))
    })
  }

  useEffect(() => {
    loadTenders()
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories((data as Category[]) ?? []))
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setUsers((data as Profile[]) ?? [])
      setStats((s) => ({ ...s, users: (data ?? []).length }))
    })
    loadAnalytics()
  }, [])

  const deleteTender = async (id: string) => {
    if (!confirm('Delete this tender? This cannot be undone.')) return
    await supabase.from('tenders').delete().eq('id', id)
    loadTenders()
    loadAnalytics()
  }

  const filteredTenders = tenders.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.organization?.toLowerCase().includes(search.toLowerCase()) ||
    t.tender_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage tenders, users, and platform analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {([
          { v: 'tenders', label: 'Tenders', icon: FileText },
          { v: 'users', label: 'Users', icon: Users },
          { v: 'analytics', label: 'Analytics', icon: BarChart3 },
        ] as const).map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.v
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tenders tab */}
      {tab === 'tenders' && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input className="input pl-9 py-2 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenders..." />
            </div>
            <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary text-sm">
              <Plus size={16} /> Add tender
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Budget</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Closing</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTenders.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="max-w-xs truncate px-4 py-3 font-medium text-slate-900 dark:text-white">{t.title}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{t.organization}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatCurrency(t.budget)}</td>
                      <td className="px-4 py-3"><span className={`badge ${statusColor(t.status)}`}>{t.status}</span></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(t.closing_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => { setEditing(t); setShowForm(true) }} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-700">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => deleteTender(t.id)} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.full_name ?? '—'}</td>
                    <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600 capitalize dark:bg-slate-800 dark:text-slate-300">{u.role}</span></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics tab */}
      {tab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatBox icon={FileText} label="Total Tenders" value={String(stats.tenders)} />
            <StatBox icon={TrendingUp} label="Open Tenders" value={String(stats.open)} />
            <StatBox icon={Users} label="Total Users" value={String(stats.users)} />
            <StatBox icon={Building} label="Total Budget" value={formatCurrency(stats.totalBudget)} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card p-6">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Tenders by State</h3>
              <div className="space-y-3">
                {byState.map((s) => (
                  <div key={s.state}>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {s.state}</span>
                      <span>{s.count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(s.count / byState[0].count) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Tenders by Industry</h3>
              <div className="space-y-3">
                {byIndustry.map((s) => (
                  <div key={s.industry}>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Building size={12} /> {s.industry}</span>
                      <span>{s.count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-accent-500" style={{ width: `${(s.count / byIndustry[0].count) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tender form modal */}
      {showForm && (
        <TenderForm
          tender={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => { loadTenders(); loadAnalytics(); setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function StatBox({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  )
}

function TenderForm({ tender, categories, onClose, onSaved }: {
  tender: Tender | null
  categories: Category[]
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Tender>>(tender ?? {
    title: '', description: '', organization: '', department: '', ministry: '',
    state: '', district: '', industry: '', budget: undefined, emd: undefined,
    tender_fee: undefined, closing_date: '', status: 'open', tender_number: '',
    eligibility_criteria: '', required_documents: [], contact_info: '', official_link: '',
  })

  const update = (field: keyof Tender, value: unknown) => setForm((f) => ({ ...f, [field]: value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = { ...form }
    if (tender) {
      const { error } = await supabase.from('tenders').update(payload).eq('id', tender.id)
      if (error) setError(error.message)
      else onSaved()
    } else {
      const { error } = await supabase.from('tenders').insert(payload)
      if (error) setError(error.message)
      else onSaved()
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8" onClick={onClose}>
      <div className="card w-full max-w-2xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{tender ? 'Edit Tender' : 'Add Tender'}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>

        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">{error}</div>}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input className="input" required value={form.title ?? ''} onChange={(e) => update('title', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea rows={3} className="input" value={form.description ?? ''} onChange={(e) => update('description', e.target.value)} />
            </div>
            <div>
              <label className="label">Organization</label>
              <input className="input" value={form.organization ?? ''} onChange={(e) => update('organization', e.target.value)} />
            </div>
            <div>
              <label className="label">Tender Number</label>
              <input className="input" value={form.tender_number ?? ''} onChange={(e) => update('tender_number', e.target.value)} />
            </div>
            <div>
              <label className="label">Ministry</label>
              <input className="input" value={form.ministry ?? ''} onChange={(e) => update('ministry', e.target.value)} />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" value={form.department ?? ''} onChange={(e) => update('department', e.target.value)} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input" value={form.state ?? ''} onChange={(e) => update('state', e.target.value)} />
            </div>
            <div>
              <label className="label">District</label>
              <input className="input" value={form.district ?? ''} onChange={(e) => update('district', e.target.value)} />
            </div>
            <div>
              <label className="label">Industry</label>
              <input className="input" value={form.industry ?? ''} onChange={(e) => update('industry', e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category_id ?? ''} onChange={(e) => update('category_id', e.target.value || null)}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Budget (₹)</label>
              <input type="number" className="input" value={form.budget ?? ''} onChange={(e) => update('budget', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            <div>
              <label className="label">EMD (₹)</label>
              <input type="number" className="input" value={form.emd ?? ''} onChange={(e) => update('emd', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            <div>
              <label className="label">Tender Fee (₹)</label>
              <input type="number" className="input" value={form.tender_fee ?? ''} onChange={(e) => update('tender_fee', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            <div>
              <label className="label">Closing Date</label>
              <input type="date" className="input" value={form.closing_date?.split('T')[0] ?? ''} onChange={(e) => update('closing_date', e.target.value ? new Date(e.target.value).toISOString() : null)} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status ?? 'open'} onChange={(e) => update('status', e.target.value)}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="awarded">Awarded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Eligibility Criteria</label>
              <textarea rows={2} className="input" value={form.eligibility_criteria ?? ''} onChange={(e) => update('eligibility_criteria', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Official Link</label>
              <input className="input" value={form.official_link ?? ''} onChange={(e) => update('official_link', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Contact Info</label>
              <input className="input" value={form.contact_info ?? ''} onChange={(e) => update('contact_info', e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : <><Save size={16} /> {tender ? 'Update' : 'Create'}</>}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
