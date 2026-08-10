import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { AuthShell } from './RegisterPage'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error)
    else navigate(location.state?.from ?? '/dashboard')
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your TenderPulse account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div>
          <label className="label">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10" placeholder="you@company.com" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10" placeholder="Your password" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Signing in...' : <>Sign in <ArrowRight size={18} /></>}
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          New to TenderPulse?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  )
}
