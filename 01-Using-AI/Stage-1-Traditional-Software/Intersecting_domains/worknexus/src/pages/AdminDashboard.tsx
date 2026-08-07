import { useEffect, useState } from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, ShieldCheck, Ban, CheckCircle2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, Badge, Avatar, Spinner, Button, EmptyState } from '@/components/ui';
import { toastSuccess, toastError } from '@/components/Toaster';
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils';
import type { Profile, Project } from '@/lib/types';

interface ProjectRow extends Project {
  client?: Profile | null;
  category?: { name: string } | null;
}

export function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'projects'>('overview');

  useEffect(() => {
    async function load() {
      const [u, p] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*, client:profiles!projects_client_id_fkey(*), category:categories(name)').order('created_at', { ascending: false }),
      ]);
      setUsers((u.data as Profile[]) ?? []);
      setProjects((p.data as ProjectRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleSuspend(user: Profile) {
    const newSuspended = !user.is_suspended;
    const { error } = await supabase.from('profiles').update({ is_suspended: newSuspended }).eq('id', user.id);
    if (error) { toastError(error.message); return; }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, is_suspended: newSuspended } : u)));
    toastSuccess(newSuspended ? 'User suspended' : 'User reinstated');
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-primary-500" /></div>;

  const freelancers = users.filter((u) => u.role === 'freelancer');
  const clients = users.filter((u) => u.role === 'client');
  const openProjects = projects.filter((p) => p.status === 'open');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-[var(--font-display)] mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'users', 'projects'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-primary-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={String(users.length)} color="primary" />
            <StatCard icon={Briefcase} label="Freelancers" value={String(freelancers.length)} color="accent" />
            <StatCard icon={Users} label="Clients" value={String(clients.length)} color="success" />
            <StatCard icon={TrendingUp} label="Open Projects" value={String(openProjects.length)} color="warning" />
          </div>

          <Card className="p-5">
            <h2 className="font-semibold mb-4">Recent Registrations</h2>
            <div className="space-y-3">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar name={u.full_name} src={u.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.full_name}</p>
                    <p className="text-xs text-neutral-400 capitalize">{u.role} · {timeAgo(u.created_at)}</p>
                  </div>
                  {u.is_suspended && <Badge color="error">Suspended</Badge>}
                  {u.is_verified && <Badge color="success">Verified</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'users' && (
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Manage Users ({users.length})</h2>
          {users.length === 0 ? (
            <EmptyState icon={Users} title="No users" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-xs text-neutral-500">
                    <th className="pb-2 pr-4">User</th>
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Joined</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-100 dark:border-neutral-800/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={u.full_name} src={u.avatar_url} size="sm" />
                          <span className="font-medium">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 capitalize">{u.role}</td>
                      <td className="py-3 pr-4 text-neutral-500">{formatDate(u.created_at)}</td>
                      <td className="py-3 pr-4">
                        {u.is_suspended ? <Badge color="error">Suspended</Badge> : <Badge color="success">Active</Badge>}
                      </td>
                      <td className="py-3">
                        <Button size="sm" variant={u.is_suspended ? 'outline' : 'danger'} onClick={() => toggleSuspend(u)}>
                          {u.is_suspended ? 'Reinstate' : 'Suspend'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'projects' && (
        <Card className="p-5">
          <h2 className="font-semibold mb-4">All Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <EmptyState icon={Briefcase} title="No projects" />
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{p.title}</p>
                    <p className="text-xs text-neutral-400">
                      {p.client?.full_name} · {formatCurrency(p.budget_min)} · {timeAgo(p.created_at)}
                    </p>
                  </div>
                  <Badge color={p.status === 'open' ? 'success' : p.status === 'in_progress' ? 'warning' : 'neutral'}>{p.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: 'primary' | 'success' | 'warning' | 'accent' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400',
    success: 'bg-success-50 text-success-600 dark:bg-success-950/50 dark:text-success-400',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-950/50 dark:text-warning-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-950/50 dark:text-accent-400',
  };
  return (
    <Card className="p-4">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </Card>
  );
}
