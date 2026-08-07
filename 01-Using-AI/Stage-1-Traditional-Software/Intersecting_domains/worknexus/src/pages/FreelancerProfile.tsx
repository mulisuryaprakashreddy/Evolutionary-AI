import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Briefcase, Eye, ArrowLeft, Mail, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, Avatar, StarRating, Badge, Button, EmptyState, Spinner } from '@/components/ui';
import { formatCurrency, formatDate, truncate } from '@/lib/utils';
import type { Profile, FreelancerProfile, Portfolio, Review, Project, Contract } from '@/lib/types';

interface ReviewRow extends Review {
  reviewer?: Profile | null;
  contract?: Contract | null;
}

export function FreelancerProfile() {
  const { id } = useParams();
  const { profile: currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fp, setFp] = useState<FreelancerProfile | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [{ data: p }, { data: fpData }, { data: ports }, { data: revs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
        supabase.from('freelancer_profiles').select('*').eq('user_id', id).maybeSingle(),
        supabase.from('portfolios').select('*').eq('freelancer_id', id).order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*), contract:contracts!reviews_contract_id_fkey(*)')
          .eq('reviewee_id', id)
          .order('created_at', { ascending: false }),
      ]);
      setProfile(p as Profile | null);
      setFp(fpData as FreelancerProfile | null);
      setPortfolios((ports as Portfolio[]) ?? []);
      setReviews((revs as ReviewRow[]) ?? []);
      setLoading(false);
      if (fpData) {
        supabase.from('freelancer_profiles').update({ profile_views: (fpData as FreelancerProfile).profile_views + 1 }).eq('user_id', id).then();
      }
    }
    load();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-primary-500" /></div>;
  if (!profile) return <EmptyState icon={Briefcase} title="Profile not found" action={<Link to="/freelancers"><Button>Browse freelancers</Button></Link>} />;

  const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const isOwner = currentUser?.id === profile.id;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/freelancers" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to freelancers
      </Link>

      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <Avatar name={profile.full_name} src={profile.avatar_url} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold font-[var(--font-display)]">{profile.full_name}</h1>
              {profile.is_verified && <Badge color="success">Verified</Badge>}
            </div>
            <p className="text-neutral-500 mt-1">{fp?.title ?? 'Freelancer'}</p>
            {profile.location && (
              <p className="text-sm text-neutral-400 flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" /> {profile.location}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm">
              {reviews.length > 0 ? (
                <div className="flex items-center gap-1">
                  <StarRating rating={avgRating} size="sm" />
                  <span className="font-semibold">{avgRating.toFixed(1)}</span>
                  <span className="text-neutral-400">({reviews.length} reviews)</span>
                </div>
              ) : (
                <span className="text-neutral-400">No reviews yet</span>
              )}
              {fp && <span className="text-neutral-400 flex items-center gap-1"><Eye className="h-4 w-4" /> {fp.profile_views} views</span>}
            </div>
          </div>
          <div className="text-right">
            {fp && <p className="text-2xl font-bold text-primary-600">{formatCurrency(fp.hourly_rate)}<span className="text-sm font-normal text-neutral-400">/hr</span></p>}
            {fp && <Badge color={fp.experience_level === 'Expert' ? 'accent' : 'neutral'} className="mt-2">{fp.experience_level}</Badge>}
          </div>
        </div>
        {profile.bio && <p className="mt-4 text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>}
        {isOwner && (
          <Link to="/profile"><Button variant="outline" className="mt-4">Edit Profile</Button></Link>
        )}
      </Card>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6">
          {/* Portfolio */}
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Portfolio</h2>
            {portfolios.length === 0 ? (
              <EmptyState icon={Briefcase} title="No portfolio items" />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {portfolios.map((p) => (
                  <div key={p.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover" />}
                    <div className="p-4">
                      <p className="font-semibold text-sm">{p.title}</p>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{truncate(p.description, 100)}</p>
                      {p.project_link && <a href={p.project_link} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline mt-2 inline-flex items-center gap-1"><Globe className="h-3 w-3" /> View project</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Reviews */}
          <Card className="p-6">
            <h2 className="font-semibold text-lg mb-4">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <EmptyState icon={Star} title="No reviews yet" />
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.reviewer?.full_name ?? '?'} src={r.reviewer?.avatar_url} size="sm" />
                        <div>
                          <p className="font-semibold text-sm">{r.reviewer?.full_name}</p>
                          <p className="text-xs text-neutral-400">{formatDate(r.created_at)}</p>
                        </div>
                      </div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    {r.body && <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{r.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <aside>
          <Card className="p-5 sticky top-20">
            <h3 className="font-semibold mb-3">Details</h3>
            <div className="space-y-3 text-sm">
              {fp && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Availability</span>
                  <span className="font-medium">{fp.availability.replace('-', ' ')}</span>
                </div>
              )}
              {fp && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Hourly Rate</span>
                  <span className="font-medium">{formatCurrency(fp.hourly_rate)}/hr</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Member since</span>
                <span className="font-medium">{formatDate(profile.created_at)}</span>
              </div>
            </div>
            {!isOwner && currentUser?.role === 'client' && (
              <Link to="/projects/new"><Button className="w-full mt-4">Hire this freelancer</Button></Link>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
