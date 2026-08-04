import { useState, type FormEvent } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/router';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { signIn, signUp } = useAuth();
  const isRegister = mode === 'register';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = isRegister ? await signUp(email, password) : await signIn(email, password);

    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (isRegister) {
      // After signup, Supabase auto-signs in (email confirmation is off)
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-semibold text-xl tracking-tight">ResumeForge</span>
          </div>

          <h1 className="text-2xl font-bold text-center mb-1">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-slate-400 text-center mb-8">
            {isRegister
              ? 'Start building your resume in minutes.'
              : 'Log in to continue building your resume.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm transition-colors"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
            </button>
          </form>

          <p className="text-sm text-slate-400 text-center mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => navigate(isRegister ? '/login' : '/register')}
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              {isRegister ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
