import { useEffect, useState } from 'react'
import { Building2, Save, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import type { Company } from '../lib/types'

const BUSINESS_TYPES = ['Manufacturer', 'Service Provider', 'Contractor', 'Consultant', 'Trader', 'Startup']
const INDUSTRIES = ['IT & Software', 'Infrastructure', 'Healthcare', 'Education', 'Power & Energy', 'Water & Sanitation', 'Transport', 'Security & Defense', 'Consultancy', 'Supplies & Office']

export default function CompanyProfilePage() {
  const { session } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [certInput, setCertInput] = useState('')
  const [form, setForm] = useState<Partial<Company>>({
    company_name: '', gst_number: '', pan_number: '', business_type: '', industry: '',
    state: '', city: '', annual_turnover: undefined, years_experience: undefined,
    certifications: [], contact_email: '', contact_phone: '', website: '', description: '',
  })

  useEffect(() => {
    if (!session) return
    supabase.from('companies').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
      const c = data as Company | null
      setCompany(c)
      if (c) setForm(c)
      setLoading(false)
    })
  }, [session])

  const update = (field: keyof Company, value: unknown) => {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  const addCert = () => {
    if (!certInput.trim()) return
    update('certifications', [...(form.certifications ?? []), certInput.trim()])
    setCertInput('')
  }

  const removeCert = (i: number) => {
    update('certifications', (form.certifications ?? []).filter((_, idx) => idx !== i))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    setSaving(true)
    setError(null)
    const payload = { ...form, user_id: session.user.id }
    if (company) {
      const { error } = await supabase.from('companies').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', company.id)
      if (error) setError(error.message)
      else setSaved(true)
    } else {
      const { error } = await supabase.from('companies').insert(payload)
      if (error) setError(error.message)
      else setSaved(true)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-8"><div className="skeleton h-96 w-full rounded-xl" /></div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
          <Building2 size={24} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Company Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">A complete profile improves your AI match score</p>
        </div>
      </div>

      {company?.verified && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-700 dark:bg-accent-900/30 dark:text-accent-400">
          <CheckCircle2 size={16} /> Your company is verified
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Basic info */}
        <section className="card space-y-4 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company Name" required>
              <input className="input" required value={form.company_name ?? ''} onChange={(e) => update('company_name', e.target.value)} />
            </Field>
            <Field label="Business Type">
              <select className="input" value={form.business_type ?? ''} onChange={(e) => update('business_type', e.target.value)}>
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="GST Number">
              <input className="input" value={form.gst_number ?? ''} onChange={(e) => update('gst_number', e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" />
            </Field>
            <Field label="PAN Number">
              <input className="input" value={form.pan_number ?? ''} onChange={(e) => update('pan_number', e.target.value.toUpperCase())} placeholder="AAAAA0000A" />
            </Field>
          </div>
        </section>

        {/* Industry & Location */}
        <section className="card space-y-4 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white">Industry & Location</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Industry">
              <select className="input" value={form.industry ?? ''} onChange={(e) => update('industry', e.target.value)}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="State">
              <input className="input" value={form.state ?? ''} onChange={(e) => update('state', e.target.value)} placeholder="Maharashtra" />
            </Field>
            <Field label="City">
              <input className="input" value={form.city ?? ''} onChange={(e) => update('city', e.target.value)} placeholder="Pune" />
            </Field>
            <Field label="Years of Experience">
              <input type="number" min="0" className="input" value={form.years_experience ?? ''} onChange={(e) => update('years_experience', e.target.value ? parseInt(e.target.value) : null)} />
            </Field>
            <Field label="Annual Turnover (₹)">
              <input type="number" min="0" className="input" value={form.annual_turnover ?? ''} onChange={(e) => update('annual_turnover', e.target.value ? parseFloat(e.target.value) : null)} placeholder="In rupees" />
            </Field>
          </div>
        </section>

        {/* Certifications */}
        <section className="card space-y-4 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white">Certifications</h2>
          <div className="flex gap-2">
            <input
              className="input"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
              placeholder="e.g. ISO 9001, CMMI Level 3"
            />
            <button type="button" onClick={addCert} className="btn-secondary"><Plus size={16} /> Add</button>
          </div>
          {form.certifications && form.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.certifications.map((c, i) => (
                <span key={i} className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  {c}
                  <button type="button" onClick={() => removeCert(i)} className="ml-1 hover:text-rose-600"><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Contact */}
        <section className="card space-y-4 p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white">Contact & Description</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contact Email">
              <input type="email" className="input" value={form.contact_email ?? ''} onChange={(e) => update('contact_email', e.target.value)} />
            </Field>
            <Field label="Contact Phone">
              <input className="input" value={form.contact_phone ?? ''} onChange={(e) => update('contact_phone', e.target.value)} />
            </Field>
            <Field label="Website">
              <input className="input" value={form.website ?? ''} onChange={(e) => update('website', e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          <Field label="Company Description">
            <textarea rows={4} className="input" value={form.description ?? ''} onChange={(e) => update('description', e.target.value)} placeholder="Tell us about your business, capabilities, and past projects..." />
          </Field>
        </section>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : <><Save size={16} /> {company ? 'Update profile' : 'Create profile'}</>}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-sm text-accent-600 dark:text-accent-400"><CheckCircle2 size={16} /> Saved successfully</span>}
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-rose-500"> *</span>}</label>
      {children}
    </div>
  )
}
