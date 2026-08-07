import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  ArrowRight,
  Code,
  Smartphone,
  BrainCircuit,
  Palette,
  Clapperboard,
  PenLine,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Cloud,
  Star,
  TrendingUp,
  Users,
  CheckCircle2,
  Wallet,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button, Card, Badge } from '@/components/ui';
import { formatCurrency, timeAgo, truncate } from '@/lib/utils';
import type { Category, Project, Profile } from '@/lib/types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Smartphone,
  BrainCircuit,
  Palette,
  Clapperboard,
  PenLine,
  Megaphone,
  BarChart3,
  ShieldCheck,
  Cloud,
};

interface FeaturedProject extends Project {
  category?: Category | null;
  client?: Profile | null;
  proposal_count?: number;
}

export function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      const [catRes, projRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase
          .from('projects')
          .select('*, category:categories(*), client:profiles!projects_client_id_fkey(*)')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);
      setCategories((catRes.data as Category[]) ?? []);
      setProjects((projRes.data as FeaturedProject[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-primary-950/30 dark:via-neutral-950 dark:to-accent-950/20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/30 dark:bg-primary-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-200/20 dark:bg-accent-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <Badge color="primary" className="mb-4">
                <Sparkles className="h-3 w-3" />
                AI-powered marketplace
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[var(--font-display)] leading-[1.1] tracking-tight">
                Hire the best talent.
                <span className="block text-primary-600">Get work done.</span>
              </h1>
              <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-400 max-w-lg">
                WorkNexus connects businesses with top freelancers across 10+ categories. Post a project, receive proposals, and hire with confidence.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Search className="h-4 w-4" />
                    Browse Projects
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                  No credit card needed
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                  Secure escrow
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/4458323/pexels-photo-4458323.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                  alt="Freelancer working remotely"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-3 shadow-lg">
                  <div className="flex -space-x-2">
                    {['AB', 'CD', 'EF'].map((i, idx) => (
                      <div key={idx} className="h-8 w-8 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center border-2 border-white dark:border-neutral-900">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">10,000+ freelancers</p>
                    <p className="text-xs text-neutral-500">Ready to work right now</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 rounded-xl bg-white dark:bg-neutral-900 shadow-xl p-3 flex items-center gap-2 animate-fade-in">
                <div className="h-9 w-9 rounded-lg bg-success-100 dark:bg-success-900/50 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-success-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Escrow protected</p>
                  <p className="text-sm font-semibold">$2.4M+ paid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <Stat icon={Users} value="10K+" label="Active freelancers" />
            <Stat icon={Briefcase} value="50K+" label="Projects posted" />
            <Stat icon={Wallet} value="$2.4M+" label="Paid to freelancers" />
            <Stat icon={Star} value="4.9/5" label="Average rating" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-[var(--font-display)]">Explore categories</h2>
          <p className="text-neutral-500 mt-2">Find the right talent for any project</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon] ?? Briefcase;
            return (
              <Link
                key={cat.id}
                to={`/projects?category=${cat.slug}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-primary-700"
              >
                <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <p className="font-semibold text-sm">{cat.name}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-[var(--font-display)]">How it works</h2>
            <p className="text-neutral-500 mt-2">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              num="01"
              icon={Briefcase}
              title="Post a project"
              desc="Tell us what you need. Add your budget, deadline, and required skills."
            />
            <Step
              num="02"
              icon={Users}
              title="Receive proposals"
              desc="Freelancers apply with bids and cover letters. Compare and pick the best."
            />
            <Step
              num="03"
              icon={CheckCircle2}
              title="Hire & pay safely"
              desc="Fund escrow, track progress, chat, and release payment when satisfied."
            />
          </div>
        </div>
      </section>

      {/* Featured projects */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold font-[var(--font-display)]">Latest projects</h2>
            <p className="text-neutral-500 mt-2">Fresh opportunities from clients</p>
          </div>
          <Link to="/projects">
            <Button variant="outline">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-neutral-500">No projects posted yet. Be the first to post one!</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`}>
                <Card className="p-5 h-full hover:shadow-md transition-all hover:border-primary-300 dark:hover:border-primary-700">
                  <div className="flex items-center justify-between mb-3">
                    {p.category && <Badge color="primary">{p.category.name}</Badge>}
                    <span className="text-xs text-neutral-400">{timeAgo(p.created_at)}</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2 line-clamp-2">{p.title}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-4">{truncate(p.description, 120)}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary-600">
                      {formatCurrency(p.budget_min)}
                      {p.budget_max > p.budget_min && ` - ${formatCurrency(p.budget_max)}`}
                    </span>
                    {p.experience_level && <Badge>{p.experience_level}</Badge>}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-[var(--font-display)]">Built for everyone</h2>
            <p className="text-neutral-500 mt-2">Everything you need to hire or get hired</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Feature icon={Wallet} title="Escrow payments" desc="Funds held safely until you release them. Dispute resolution built in." />
            <Feature icon={MessageSquare} title="Real-time chat" desc="Communicate with freelancers directly. Share files and track progress." />
            <Feature icon={Star} title="Reviews & ratings" desc="Build your reputation with verified reviews from real clients." />
            <Feature icon={TrendingUp} title="Analytics dashboard" desc="Track earnings, spending, and project performance at a glance." />
            <Feature icon={Sparkles} title="AI assistance" desc="Improve project descriptions, proposals, and profiles with AI." />
            <Feature icon={ShieldCheck} title="Secure & verified" desc="Every account is protected. Profiles are verified for quality." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-primary-600 p-10 lg:p-16 text-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-bold font-[var(--font-display)] text-white">Ready to get started?</h2>
            <p className="text-primary-100 mt-3 max-w-xl mx-auto">Join thousands of clients and freelancers building great things together on WorkNexus.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup">
                <Button variant="secondary" size="lg">
                  Sign up free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                  Browse projects
                </Button>
              </Link>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
    </div>
  );
}

function Step({ num, icon: Icon, title, desc }: { num: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="text-center">
      <div className="relative inline-flex mb-4">
        <div className="h-16 w-16 rounded-2xl bg-primary-600 text-white flex items-center justify-center">
          <Icon className="h-8 w-8" />
        </div>
        <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-accent-400 text-neutral-900 text-xs font-bold flex items-center justify-center">
          {num}
        </span>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-xs mx-auto">{desc}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <Card className="p-6">
      <div className="h-11 w-11 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-neutral-500">{desc}</p>
    </Card>
  );
}
