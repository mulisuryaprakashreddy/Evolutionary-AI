import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  ArrowLeft,
  Send,
  CheckCircle2,
  Star,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import {
  Card,
  Badge,
  Button,
  Textarea,
  Input,
  Avatar,
  StarRating,
  EmptyState,
  Spinner,
  Modal,
} from '@/components/ui';
import { toastSuccess, toastError } from '@/components/Toaster';
import { formatCurrency, formatDate, timeAgo, daysUntil, truncate } from '@/lib/utils';
import type {
  Project,
  Category,
  Profile,
  Skill,
  Proposal,
  FreelancerProfile,
  Review,
  Contract,
} from '@/lib/types';

interface FullProject extends Project {
  category?: Category | null;
  client?: Profile | null;
  skills?: Skill[];
}

interface ProposalRow extends Proposal {
  freelancer?: Profile | null;
  freelancer_profile?: FreelancerProfile | null;
}

interface ReviewRow extends Review {
  reviewer?: Profile | null;
}

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const [project, setProject] = useState<FullProject | null>(null);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposal, setShowProposal] = useState(false);
  const [existingProposal, setExistingProposal] = useState<Proposal | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('7');
  const [submitting, setSubmitting] = useState(false);
  const [clientReviews, setClientReviews] = useState<ReviewRow[]>([]);

  const isOwner = profile?.id === project?.client_id;
  const isFreelancer = profile?.role === 'freelancer';

  useEffect(() => {
    if (!id) return;
    async function load() {
      const { data: proj } = await supabase
        .from('projects')
        .select('*, category:categories(*), client:profiles!projects_client_id_fkey(*), skills:skills(*)')
        .eq('id', id)
        .maybeSingle();
      const projectData = proj as FullProject | null;
      setProject(projectData);

      const [{ data: props }, { data: reviews }] = await Promise.all([
        supabase
          .from('proposals')
          .select('*, freelancer:profiles!proposals_freelancer_id_fkey(*), freelancer_profile:freelancer_profiles!proposals_freelancer_id_fkey(*)')
          .eq('project_id', id)
          .order('created_at', { ascending: false }),
        projectData?.client_id
          ? supabase
              .from('reviews')
              .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
              .eq('reviewee_id', projectData.client_id)
              .order('created_at', { ascending: false })
              .limit(5)
          : Promise.resolve({ data: null, error: null }),
      ]);
      setProposals((props as ProposalRow[]) ?? []);
      if (projectData) setClientReviews((reviews as ReviewRow[]) ?? []);
      if (projectData && session?.user?.id) {
        const { data: existing } = await supabase
          .from('proposals')
          .select('*')
          .eq('project_id', id)
          .eq('freelancer_id', session.user.id)
          .maybeSingle();
        setExistingProposal(existing as Proposal | null);
      }
      setLoading(false);
    }
    load();
  }, [id, session?.user?.id]);

  async function submitProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSubmitting(true);
    const { error } = await supabase.from('proposals').insert({
      project_id: id,
      freelancer_id: session.user.id,
      cover_letter: coverLetter,
      bid_amount: Number(bidAmount),
      estimated_days: Number(estimatedDays),
      status: 'pending',
    });
    if (error) {
      toastError(error.message);
      setSubmitting(false);
      return;
    }
    if (project?.client_id) {
      await supabase.from('notifications').insert({
        user_id: project.client_id,
        type: 'proposal',
        title: 'New proposal received',
        body: `New proposal on "${project.title}"`,
        link: `/projects/${id}`,
      });
    }
    toastSuccess('Proposal submitted!');
    setShowProposal(false);
    setCoverLetter('');
    setBidAmount('');
    const { data } = await supabase
      .from('proposals')
      .select('*, freelancer:profiles!proposals_freelancer_id_fkey(*), freelancer_profile:freelancer_profiles!proposals_freelancer_id_fkey(*)')
      .eq('project_id', id)
      .order('created_at', { ascending: false });
    setProposals((data as ProposalRow[]) ?? []);
    setSubmitting(false);
  }

  async function hireFreelancer(prop: ProposalRow) {
    if (!project) return;
    const { data: conData, error: conError } = await supabase.from('contracts').insert({
      project_id: project.id,
      client_id: project.client_id,
      freelancer_id: prop.freelancer_id,
      proposal_id: prop.id,
      agreed_amount: prop.bid_amount,
      status: 'active',
    }).select().single();
    if (conError) {
      toastError(conError.message);
      return;
    }
    const contract = conData as Contract;
    await supabase.from('projects').update({ status: 'in_progress' }).eq('id', project.id);
    await supabase.from('proposals').update({ status: 'accepted' }).eq('id', prop.id);
    await supabase.from('proposals').update({ status: 'rejected' }).neq('id', prop.id).eq('project_id', project.id);
    await supabase.from('payments').insert({
      contract_id: contract.id,
      payer_id: project.client_id,
      payee_id: prop.freelancer_id,
      amount: prop.bid_amount,
      status: 'escrow',
    });
    await supabase.from('notifications').insert({
      user_id: prop.freelancer_id,
      type: 'hire',
      title: 'You got hired!',
      body: `You were hired for "${project.title}"`,
      link: '/freelancer',
    });
    toastSuccess('Freelancer hired! Funds held in escrow.');
    navigate('/client');
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-primary-500" /></div>;
  if (!project) return <EmptyState icon={Briefcase} title="Project not found" action={<Link to="/projects"><Button>Browse projects</Button></Link>} />;

  const days = daysUntil(project.deadline);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {project.category && <Badge color="primary">{project.category.name}</Badge>}
              {project.experience_level && <Badge>{project.experience_level}</Badge>}
              <Badge color={project.status === 'open' ? 'success' : 'warning'}>{project.status.replace('_', ' ')}</Badge>
              <span className="text-xs text-neutral-400 ml-auto">{timeAgo(project.created_at)}</span>
            </div>
            <h1 className="text-2xl font-bold font-[var(--font-display)] mb-3">{project.title}</h1>
            <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">{project.description}</p>

            {project.skills && project.skills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-sm font-medium mb-2">Skills required</p>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((s) => (
                    <span key={s.id} className="text-sm px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Proposals section */}
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">
              Proposals ({proposals.length})
            </h2>
            {proposals.length === 0 ? (
              <EmptyState icon={Send} title="No proposals yet" description={isOwner ? "Wait for freelancers to apply." : "Be the first to apply!"} />
            ) : (
              <div className="space-y-4">
                {proposals.map((p) => (
                  <div key={p.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <Link to={`/freelancers/${p.freelancer_id}`} className="flex items-center gap-3 hover:opacity-80">
                        <Avatar name={p.freelancer?.full_name ?? '?'} src={p.freelancer?.avatar_url} size="md" />
                        <div>
                          <p className="font-semibold text-sm">{p.freelancer?.full_name}</p>
                          <p className="text-xs text-neutral-500">{p.freelancer_profile?.title}</p>
                        </div>
                      </Link>
                      <Badge color={p.status === 'pending' ? 'warning' : p.status === 'accepted' ? 'success' : 'neutral'}>
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{truncate(p.cover_letter, 200)}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-primary-600">{formatCurrency(p.bid_amount)}</span>
                        <span className="text-neutral-500">{p.estimated_days} days</span>
                        <span className="text-neutral-400">{timeAgo(p.created_at)}</span>
                      </div>
                      {isOwner && project.status === 'open' && p.status === 'pending' && (
                        <Button size="sm" onClick={() => hireFreelancer(p)}>Hire</Button>
                      )}
                      {isFreelancer && p.freelancer_id === session?.user?.id && (
                        <Link to={`/messages?contract=${p.id}`}><Button size="sm" variant="outline"><MessageSquare className="h-3.5 w-3.5" /> Message</Button></Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Project details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Budget</span>
                <span className="font-semibold">
                  {formatCurrency(project.budget_min)}
                  {project.budget_max > project.budget_min && ` - ${formatCurrency(project.budget_max)}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> Deadline</span>
                <span className="font-semibold">{formatDate(project.deadline) || 'Flexible'}</span>
              </div>
              {project.deadline && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 flex items-center gap-2"><Clock className="h-4 w-4" /> Time left</span>
                  <span className={`font-semibold ${days && days < 3 ? 'text-warning-600' : ''}`}>
                    {days && days > 0 ? `${days} days` : 'Past due'}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Type</span>
                <span className="font-semibold capitalize">{project.project_type}</span>
              </div>
            </div>

            {isFreelancer && project.status === 'open' && (
              <Button className="w-full mt-5" onClick={() => setShowProposal(true)} disabled={!!existingProposal}>
                {existingProposal ? 'Already Applied' : 'Submit Proposal'}
              </Button>
            )}
            {isOwner && (
              <Link to={`/projects/${project.id}/edit`}>
                <Button variant="outline" className="w-full mt-5">Edit Project</Button>
              </Link>
            )}
            {!session && (
              <Link to="/signup"><Button className="w-full mt-5">Sign up to apply</Button></Link>
            )}
          </Card>

          {project.client && (
            <Card className="p-5">
              <h3 className="font-semibold mb-3">About the client</h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={project.client.full_name} src={project.client.avatar_url} size="md" />
                <div>
                  <p className="font-semibold text-sm">{project.client.full_name}</p>
                  <p className="text-xs text-neutral-500">{project.client.location || 'Location not set'}</p>
                </div>
              </div>
              {project.client.is_verified && <Badge color="success"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>}
              {clientReviews.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <StarRating rating={clientReviews.reduce((a, r) => a + r.rating, 0) / clientReviews.length} showValue size="sm" />
                  <p className="text-xs text-neutral-500 mt-1">{clientReviews.length} reviews</p>
                </div>
              )}
            </Card>
          )}
        </aside>
      </div>

      {/* Proposal modal */}
      <Modal open={showProposal} onClose={() => setShowProposal(false)} title="Submit Proposal">
        <form onSubmit={submitProposal} className="space-y-4">
          <Input
            label="Bid Amount (USD)"
            type="number"
            required
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={formatCurrency(project.budget_min)}
          />
          <Input
            label="Estimated Days"
            type="number"
            required
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
            min="1"
          />
          <Textarea
            label="Cover Letter"
            required
            rows={5}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Explain why you're the best fit for this project..."
          />
          <div className="flex gap-3">
            <Button type="submit" loading={submitting} className="flex-1">
              <Send className="h-4 w-4" /> Submit
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowProposal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
