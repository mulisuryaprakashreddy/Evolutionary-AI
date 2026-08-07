import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wallet,
  Star,
  Eye,
  Send,
  FileText,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, Badge, Button, StarRating, EmptyState, Spinner, Avatar } from '@/components/ui';
import { formatCurrency, formatDate, timeAgo, truncate } from '@/lib/utils';
import type { Project, Proposal, Contract, Profile, Transaction, Review } from '@/lib/types';

interface ProposalRow extends Proposal {
  project?: Project | null;
}
interface ContractRow extends Contract {
  project?: Project | null;
  client?: Profile | null;
  payment?: { status: string; amount: number } | null;
}
interface ReviewRow extends Review {
  contract?: { project?: { title: string } | null } | null;
  reviewer?: Profile | null;
}

export function FreelancerDashboard() {
  const { session, profile } = useAuth();
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [wallet, setWallet] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function load() {
      const uid = session!.user!.id;
      const [propRes, conRes, walRes, txRes, revRes] = await Promise.all([
        supabase
          .from('proposals')
          .select('*, project:projects!proposals_project_id_fkey(*)')
          .eq('freelancer_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('contracts')
          .select('*, project:projects(*), client:profiles!contracts_client_id_fkey(*), payment:payments(*)')
          .eq('freelancer_id', uid)
          .order('created_at', { ascending: false }),
        supabase.from('wallets').select('balance').eq('user_id', uid).maybeSingle(),
        supabase.from('transactions').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(10),
        supabase
          .from('reviews')
          .select('*, contract:contracts!reviews_contract_id_fkey(project:projects(title)), reviewer:profiles!reviews_reviewer_id_fkey(*)')
          .eq('reviewee_id', uid)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      setProposals((propRes.data as ProposalRow[]) ?? []);
      setContracts((conRes.data as ContractRow[]) ?? []);
      setWallet((walRes.data as { balance: number } | null)?.balance ?? 0);
      setTransactions((txRes.data as Transaction[]) ?? []);
      setReviews((revRes.data as ReviewRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, [session?.user?.id]);

  const activeContracts = contracts.filter((c) => c.status === 'active');
  const completedContracts = contracts.filter((c) => c.status === 'completed');
  const pendingProposals = proposals.filter((p) => p.status === 'pending');
  const totalEarnings = contracts
    .filter((c) => c.payment?.status === 'released')
    .reduce((sum, c) => sum + (c.payment?.amount ?? c.agreed_amount), 0);
  const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-primary-500" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)]">Freelancer Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Welcome back, {profile?.full_name}</p>
        </div>
        <Link to="/projects"><Button>Browse Projects</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Briefcase} label="Active Jobs" value={String(activeContracts.length)} color="primary" />
        <StatCard icon={Send} label="Pending Applications" value={String(pendingProposals.length)} color="warning" />
        <StatCard icon={DollarSign} label="Total Earnings" value={formatCurrency(totalEarnings)} color="success" />
        <StatCard icon={Star} label="Avg Rating" value={avgRating > 0 ? avgRating.toFixed(1) : 'N/A'} color="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Contracts */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Active Jobs</h2>
          {activeContracts.length === 0 ? (
            <EmptyState icon={Briefcase} title="No active jobs" description="Apply to projects to get hired." action={<Link to="/projects"><Button>Find Work</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {activeContracts.map((c) => (
                <div key={c.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.project?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar name={c.client?.full_name ?? '?'} src={c.client?.avatar_url} size="sm" />
                        <span className="text-xs text-neutral-500">{c.client?.full_name}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-primary-600">{formatCurrency(c.agreed_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <Badge color="warning">In Progress</Badge>
                    <Link to={`/messages?contract=${c.id}`}><Button size="sm" variant="ghost">Message Client</Button></Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Applications */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Recent Applications</h2>
          {proposals.length === 0 ? (
            <EmptyState icon={Send} title="No applications yet" action={<Link to="/projects"><Button>Find Projects</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {proposals.slice(0, 5).map((p) => (
                <Link key={p.id} to={`/projects/${p.project_id}`} className="block rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.project?.title}</p>
                      <p className="text-xs text-neutral-400">{timeAgo(p.created_at)} · {formatCurrency(p.bid_amount)}</p>
                    </div>
                    <Badge color={p.status === 'pending' ? 'warning' : p.status === 'accepted' ? 'success' : 'neutral'}>{p.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Wallet */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Wallet</h2>
          <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 p-5 text-white mb-4">
            <div className="flex items-center gap-2 text-primary-100 text-sm mb-1">
              <Wallet className="h-4 w-4" /> Available Balance
            </div>
            <p className="text-3xl font-bold">{formatCurrency(wallet)}</p>
          </div>
          {transactions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Recent transactions</p>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-neutral-400">{formatDate(t.created_at)}</p>
                    </div>
                    <span className={t.type === 'credit' ? 'text-success-600 font-semibold' : 'text-error-600 font-semibold'}>
                      {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Reviews */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Recent Reviews</h2>
          {reviews.length === 0 ? (
            <EmptyState icon={Star} title="No reviews yet" description="Complete jobs to receive reviews." />
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.reviewer?.full_name ?? '?'} src={r.reviewer?.avatar_url} size="sm" />
                      <div>
                        <p className="font-medium text-sm">{r.reviewer?.full_name}</p>
                        <p className="text-xs text-neutral-400">{r.contract?.project?.title ?? 'Project'}</p>
                      </div>
                    </div>
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                  {r.body && <p className="text-sm text-neutral-500 mt-1">{truncate(r.body, 120)}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
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
