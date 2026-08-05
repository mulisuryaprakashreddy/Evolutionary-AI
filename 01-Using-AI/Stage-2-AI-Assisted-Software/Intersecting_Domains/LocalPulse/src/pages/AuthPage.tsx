import { useState } from 'react';
import { Activity, Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui';
import { navigateTo } from '@/lib/router';

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  const isSignUp = mode === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    if (isSignUp) {
      if (!displayName.trim()) { setError('Please enter your name.'); setBusy(false); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setBusy(false); return; }
      const { error } = await signUp(email, password, displayName.trim());
      setBusy(false);
      if (error) { setError(error); return; }
      toast('success', 'Account created! Welcome to LocalPulse.');
      navigateTo('/');
    } else {
      const { error } = await signIn(email, password);
      setBusy(false);
      if (error) { setError(error); return; }
      toast('success', 'Welcome back!');
      navigateTo('/');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isSignUp ? 'Join the community of civic reporters.' : 'Sign in to report and track issues.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {isSignUp && (
            <Field icon={<UserIcon className="h-4 w-4" />}>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display name"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                required
              />
            </Field>
          )}

          <Field icon={<Mail className="h-4 w-4" />}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              required
            />
          </Field>

          <Field icon={<Lock className="h-4 w-4" />}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              required
            />
          </Field>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => navigateTo(isSignUp ? '/auth/signin' : '/auth/signup')}
            className="font-medium text-teal-600 hover:underline dark:text-teal-400"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-700/50">
      <span className="text-slate-400">{icon}</span>
      {children}
    </div>
  );
}
