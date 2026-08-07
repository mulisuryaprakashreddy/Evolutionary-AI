import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Wallet,
  Star,
  Users,
  FileText,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, Badge, Button, StarRating, EmptyState, Spinner, Avatar, Modal, Textarea } from '@/components/ui';
import { toastSuccess, toastError } from '@/components/Toaster';
import { formatCurrency, formatDate, timeAgo, truncate } from '@/lib/utils';
import type { Project, Proposal, Contract, Payment, Review, Profile } from '@/lib/types';

interface ProjectRow extends Project {
  category?: { name: string } | null;
  proposal_count?: number;
}
interface ContractRow extends Contract {
  project?: Project | null;
  freelancer?: Profile | null;
  payment?: Payment | null;
  review?: Review | null;
}
interface ProposalRow extends Proposal {
  project?: Project | null;
}

export function ClientDashboard() {
  const { session, profile } = useAuth();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [wallet, setWallet] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<ContractRow | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    async function load() {
      const uid = session!.user!.id;
      const [projRes, conRes, propRes, walRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*, category:categories(name)')
          .eq('client_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('contracts')
          .select('*, project:projects(*), freelancer:profiles!contracts_freelancer_id_fkey(*), payment:payments(*), review:reviews(*)')
          .eq('client_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('proposals')
          .select('*, project:projects!proposals_project_id_fkey(*)')
          .in('project_id', (await supabase.from('projects').select('id').eq('client_id', uid)).data?.map((p: { id: string }) => p.id) ?? [])
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase.from('wallets').select('balance').eq('user_id', uid).maybeSingle(),
      ]);
      setProjects((projRes.data as ProjectRow[]) ?? []);
      setContracts((conRes.data as ContractRow[]) ?? []);
      setProposals((propRes.data as ProposalRow[]) ?? []);
      setWallet((walRes.data as { balance: number } | null)?.balance ?? 0);
      setLoading(false);
    }
    load();
  }, [session?.user?.id]);

  const activeProjects = projects.filter((p) => p.status === 'open' || p.status === 'in_progress');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const totalSpent = contracts
    .filter((c) => c.payment?.status === 'released')
    .reduce((sum, c) => sum + (c.payment?.amount ?? 0), 0);

  async function releasePayment(contract: ContractRow) {
    if (!contract.payment) return;
    setSubmitting(true);
    const { error: payError } = await supabase
      .from('payments')
      .update({ status: 'released', released_at: new Date().toISOString() })
      .eq('id', contract.payment.id);
    if (payError) { toastError(payError.message); setSubmitting(false); return; }
    const { data: wal } = await supabase.from('wallets').select('id, balance').eq('user_id', contract.freelancer_id).maybeSingle();
    if (wal) {
      const newBalance = (wal as { balance: number }).balance + contract.agreed_amount;
      await supabase.from('wallets').update({ balance: newBalance }).eq('id', (wal as { id: string }).id);
      await supabase.from('transactions').insert({
        wallet_id: (wal as { id: string }).id,
        user_id: contract.freelancer_id,
        type: 'credit',
        amount: contract.agreed_amount,
        description: `Payment for ${contract.project?.title ?? 'project'}`,
        contract_id: contract.id,
      });
    }
    await supabase.from('contracts').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', contract.id);
    await supabase.from('projects').update({ status: 'completed' }).eq('id', contract.project_id);
    await supabase.from('notifications').insert({
      user_id: contract.freelancer_id,
      type: 'payment',
      title: 'Payment released!',
      body: `${formatCurrency(contract.agreed_amount)} for "${contract.project?.title}"`,
      link: '/freelancer',
    });
    toastSuccess('Payment released! Please leave a review.');
    setSubmitting(false);
    setReviewModal(contract);
  }

  async function submitReview() {
    if (!reviewModal || !session?.user?.id) return;
    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      contract_id: reviewModal.id,
      reviewer_id: session.user.id,
      reviewee_id: reviewModal.freelancer_id,
      rating,
      body: reviewBody,
    });
    if (error) { toastError(error.message); setSubmitting(false); return; }
    toastSuccess('Review submitted!');
    setReviewModal(null);
    setReviewBody('');
    setRating(5);
    setSubmitting(false);
    const { data } = await supabase
      .from('contracts')
      .select('*, project:projects(*), freelancer:profiles!contracts_freelancer_id_fkey(*), payment:payments(*), review:reviews(*)')
      .eq('client_id', session.user.id)
      .order('created_at', { ascending: false });
    setContracts((data as ContractRow[]) ?? []);
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-primary-500" /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)]">Client Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Welcome back, {profile?.full_name}</p>
        </div>
        <Link to="/projects/new"><Button><Plus className="h-4 w-4" /> Post Project</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Briefcase} label="Active Projects" value={String(activeProjects.length)} color="primary" />
        <StatCard icon={CheckCircle2} label="Completed" value={String(completedProjects.length)} color="success" />
        <StatCard icon={Clock} label="Pending Proposals" value={String(proposals.length)} color="warning" />
        <StatCard icon={DollarSign} label="Total Spent" value={formatCurrency(totalSpent)} color="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Your Projects</h2>
          {projects.length === 0 ? (
            <EmptyState icon={Briefcase} title="No projects yet" action={<Link to="/projects/new"><Button>Post your first project</Button></Link>} />
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((p) => (
                <Link key={p.id} to={`/projects/${p.id}`} className="block rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.title}</p>
                      <p className="text-xs text-neutral-400">{timeAgo(p.created_at)} · {p.proposal_count ?? 0} proposals</p>
                    </div>
                    <Badge color={p.status === 'open' ? 'success' : p.status === 'in_progress' ? 'warning' : p.status === 'completed' ? 'primary' : 'neutral'}>
                      {p.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Active Contracts */}
        <Card className="p-5">
          <h2 className="font-semibold mb-4">Active Contracts</h2>
          {contracts.length === 0 ? (
            <EmptyState icon={FileText} title="No contracts yet" description="Hire a freelancer to start a contract." />
          ) : (
            <div className="space-y-3">
              {contracts.slice(0, 5).map((c) => (
                <div key={c.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.project?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar name={c.freelancer?.full_name ?? '?'} src={c.freelancer?.avatar_url} size="sm" />
                        <span className="text-xs text-neutral-500">{c.freelancer?.full_name}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-primary-600">{formatCurrency(c.agreed_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <Badge color={c.status === 'active' ? 'warning' : c.status === 'completed' ? 'success' : 'neutral'}>{c.status}</Badge>
                    <div className="flex gap-2">
                      {c.payment?.status === 'escrow' && c.status === 'active' && (
                        <Button size="sm" onClick={() => releasePayment(c)} loading={submitting}>Release Payment</Button>
                      )}
                      {c.status === 'completed' && !c.review && (
                        <Button size="sm" variant="outline" onClick={() => setReviewModal(c)}>Leave Review</Button>
                      )}
                      {c.status === 'completed' && c.review && (
                        <StarRating rating={c.review.rating} size="sm" />
                      )}
                      <Link to={`/messages?contract=${c.id}`}><Button size="sm" variant="ghost">Message</Button></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Review Modal */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)} title="Leave a Review">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className="text-3xl transition-transform hover:scale-110">
                  <span className={star <= rating ? 'text-accent-400' : 'text-neutral-300 dark:text-neutral-600'}>&#9733;</span>
                </button>
              ))}
            </div>
          </div>
          <Textarea label="Review" rows={4} value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} placeholder="Share your experience..." />
          <div className="flex gap-3">
            <Button onClick={submitReview} loading={submitting} className="flex-1">Submit Review</Button>
            <Button variant="outline" onClick={() => setReviewModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
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
