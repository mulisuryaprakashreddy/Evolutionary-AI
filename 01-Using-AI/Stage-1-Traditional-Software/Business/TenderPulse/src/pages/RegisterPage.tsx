import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Building2, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Briefcase, UserCircle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/auth'
import type { UserRole } from '../lib/types'

export default function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('business')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password, fullName, role)
    setLoading(false)
    if (error) {
      setError(error)
    } else {
      setSuccess(true)
      setTimeout(() => navigate(location.state?.from ?? '/dashboard'), 800)
    }
  }

  if (success) {
    return (
      <AuthShell title="Account created!" subtitle="Welcome to TenderPulse. Redirecting you to your dashboard...">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-accent-600 dark:bg-accent-900/40 dark:text-accent-400">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Your account is ready.</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle="Start discovering government tenders matched to your business">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input pl-10" placeholder="Rajesh Mehta" />
          </div>
        </div>

        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@company.com" />
          </div>
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="Min. 6 characters" />
          </div>
        </div>

        <div>
          <label className="label">Account type</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: 'business', label: 'Business', icon: Briefcase },
              { v: 'individual', label: 'Individual', icon: UserCircle },
              { v: 'admin', label: 'Admin', icon: ShieldCheck },
            ] as const).map((r) => (
              <button
                key={r.v}
                type="button"
                onClick={() => setRole(r.v)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-all ${
                  role === r.v
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-300'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <r.icon size={18} /> {r.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Creating account...' : <>Create account <ArrowRight size={18} /></>}
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  )
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12 dark:from-slate-950 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Building2 size={22} />
            </div>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <div className="card p-6">{children}</div>
      </div>
    </div>
  )
}
