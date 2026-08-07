import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, ArrowRight, Building2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui';
import { toastError, toastSuccess } from '@/components/Toaster';
import { cn } from '@/lib/utils';

export function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          title: role === 'freelancer' ? title : undefined,
        },
      },
    });
    if (error) {
      toastError(error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      toastSuccess('Account created! Welcome to WorkNexus.');
      navigate('/');
    } else {
      toastError('Sign up failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-[var(--font-display)]">Create your account</h1>
          <p className="text-sm text-neutral-500 mt-1">Join WorkNexus as a client or freelancer</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                role === 'client'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              )}
            >
              <Building2 className={cn('h-6 w-6 mb-2', role === 'client' ? 'text-primary-600' : 'text-neutral-400')} />
              <p className="font-semibold text-sm">I'm a Client</p>
              <p className="text-xs text-neutral-500 mt-0.5">Hire freelancers</p>
              {role === 'client' && <Check className="h-4 w-4 text-primary-600 mt-1" />}
            </button>
            <button
              type="button"
              onClick={() => setRole('freelancer')}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all',
                role === 'freelancer'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              )}
            >
              <Briefcase className={cn('h-6 w-6 mb-2', role === 'freelancer' ? 'text-primary-600' : 'text-neutral-400')} />
              <p className="font-semibold text-sm">I'm a Freelancer</p>
              <p className="text-xs text-neutral-500 mt-0.5">Find work</p>
              {role === 'freelancer' && <Check className="h-4 w-4 text-primary-600 mt-1" />}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField icon={User} label="Full Name">
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="form-input"
              />
            </FormField>
            <FormField icon={Mail} label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
              />
            </FormField>
            {role === 'freelancer' && (
              <FormField icon={Briefcase} label="Professional Title">
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Full-Stack Developer"
                  className="form-input"
                />
              </FormField>
            )}
            <FormField icon={Lock} label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="form-input"
              />
            </FormField>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function FormField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <div className="[&_.form-input]:pl-9 [&_.form-input]:h-10 [&_.form-input]:w-full [&_.form-input]:rounded-lg [&_.form-input]:border [&_.form-input]:border-neutral-300 [&_.form-input]:bg-white [&_.form-input]:pr-3 [&_.form-input]:text-sm [&_.form-input]:text-neutral-900 [&_.form-input]:placeholder:text-neutral-400 [&_.form-input]:transition-colors [&_.form-input]:focus:border-primary-500 [&_.form-input]:focus:outline-none [&_.form-input]:focus:ring-2 [&_.form-input]:focus:ring-primary-500/20 dark:[&_.form-input]:border-neutral-700 dark:[&_.form-input]:bg-neutral-900 dark:[&_.form-input]:text-neutral-100">
          {children}
        </div>
      </div>
    </div>
  );
}
