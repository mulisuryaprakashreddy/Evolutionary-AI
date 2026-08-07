import { useEffect, useState } from 'react';
import { User, Briefcase, Building2, Save, Plus, Trash2, Link as LinkIcon, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, Button, Input, Textarea, Select, Avatar, Badge, EmptyState, Spinner, Modal } from '@/components/ui';
import { toastSuccess, toastError } from '@/components/Toaster';
import { formatCurrency } from '@/lib/utils';
import type { Profile, FreelancerProfile, ClientProfile, Portfolio, Skill } from '@/lib/types';

export function ProfileSettings() {
  const { session, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [fp, setFp] = useState<FreelancerProfile | null>(null);
  const [cp, setCp] = useState<ClientProfile | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portImage, setPortImage] = useState('');
  const [portLink, setPortLink] = useState('');

  useEffect(() => {
    if (!session?.user?.id) return;
    async function load() {
      const uid = session!.user!.id;
      const [fpRes, cpRes, portRes, skillRes, allSkillRes] = await Promise.all([
        supabase.from('freelancer_profiles').select('*').eq('user_id', uid).maybeSingle(),
        supabase.from('client_profiles').select('*').eq('user_id', uid).maybeSingle(),
        supabase.from('portfolios').select('*').eq('freelancer_id', uid).order('created_at', { ascending: false }),
        supabase.from('skills').select('*').order('name'),
        supabase.from('skills').select('*').order('name'),
      ]);
      setFp(fpRes.data as FreelancerProfile | null);
      setCp(cpRes.data as ClientProfile | null);
      setPortfolios((portRes.data as Portfolio[]) ?? []);
      setSkills((skillRes.data as Skill[]) ?? []);
      setAllSkills((allSkillRes.data as Skill[]) ?? []);
      if (profile) {
        setFullName(profile.full_name);
        setAvatarUrl(profile.avatar_url);
        setBio(profile.bio);
        setLocation(profile.location);
      }
      setLoading(false);
    }
    load();
  }, [session?.user?.id, profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSaving(true);
    const { error: profError } = await supabase.from('profiles').update({
      full_name: fullName,
      avatar_url: avatarUrl,
      bio,
      location,
    }).eq('id', session.user.id);
    if (profError) { toastError(profError.message); setSaving(false); return; }

    if (profile?.role === 'freelancer' && fp) {
      const { error } = await supabase.from('freelancer_profiles').update({
        title: fp.title,
        hourly_rate: fp.hourly_rate,
        experience_level: fp.experience_level,
        availability: fp.availability,
      }).eq('id', fp.id);
      if (error) { toastError(error.message); setSaving(false); return; }
    }
    if (profile?.role === 'client' && cp) {
      const { error } = await supabase.from('client_profiles').update({
        company_name: cp.company_name,
        website: cp.website,
      }).eq('id', cp.id);
      if (error) { toastError(error.message); setSaving(false); return; }
    }

    await refreshProfile();
    toastSuccess('Profile updated!');
    setSaving(false);
  }

  async function addPortfolio() {
    if (!session?.user?.id || !portTitle) return;
    const { data, error } = await supabase.from('portfolios').insert({
      freelancer_id: session.user.id,
      title: portTitle,
      description: portDesc,
      image_url: portImage,
      project_link: portLink,
    }).select().single();
    if (error) { toastError(error.message); return; }
    setPortfolios((prev) => [data as Portfolio, ...prev]);
    setShowPortfolio(false);
    setPortTitle(''); setPortDesc(''); setPortImage(''); setPortLink('');
    toastSuccess('Portfolio item added!');
  }

  async function deletePortfolio(id: string) {
    const { error } = await supabase.from('portfolios').delete().eq('id', id);
    if (error) { toastError(error.message); return; }
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
    toastSuccess('Portfolio item removed');
  }

  function improveBio() {
    if (!bio.trim()) { toastError('Write a bio first.'); return; }
    setBio(`${bio}\n\nI'm passionate about delivering high-quality work that exceeds client expectations. With a keen eye for detail and a commitment to deadlines, I ensure every project is completed to the highest standard. Let's build something great together!`);
    toastSuccess('Bio enhanced!');
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-primary-500" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold font-[var(--font-display)] mb-6">Profile Settings</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic info */}
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Basic Information</h2>
          <div className="flex items-center gap-4">
            <Avatar name={fullName || '?'} src={avatarUrl} size="xl" />
            <div className="flex-1">
              <Input label="Avatar URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <Input label="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Bio</label>
              <button type="button" onClick={improveBio} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Improve with AI
              </button>
            </div>
            <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell clients about yourself..." />
          </div>
        </Card>

        {/* Freelancer-specific */}
        {profile?.role === 'freelancer' && fp && (
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Briefcase className="h-4 w-4" /> Freelancer Profile</h2>
            <Input label="Professional Title" required value={fp.title} onChange={(e) => setFp({ ...fp, title: e.target.value })} placeholder="Full-Stack Developer" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Hourly Rate ($)" type="number" value={String(fp.hourly_rate)} onChange={(e) => setFp({ ...fp, hourly_rate: Number(e.target.value) })} />
              <Select label="Experience Level" value={fp.experience_level} onChange={(e) => setFp({ ...fp, experience_level: e.target.value as FreelancerProfile['experience_level'] })}>
                <option value="Entry">Entry</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </Select>
            </div>
            <Select label="Availability" value={fp.availability} onChange={(e) => setFp({ ...fp, availability: e.target.value as FreelancerProfile['availability'] })}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Not-available">Not Available</option>
            </Select>
          </Card>
        )}

        {/* Client-specific */}
        {profile?.role === 'client' && cp && (
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" /> Company Information</h2>
            <Input label="Company Name" value={cp.company_name} onChange={(e) => setCp({ ...cp, company_name: e.target.value })} />
            <Input label="Website" value={cp.website} onChange={(e) => setCp({ ...cp, website: e.target.value })} placeholder="https://..." />
          </Card>
        )}

        {/* Portfolio for freelancers */}
        {profile?.role === 'freelancer' && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Portfolio</h2>
              <Button size="sm" variant="outline" onClick={() => setShowPortfolio(true)}><Plus className="h-4 w-4" /> Add Item</Button>
            </div>
            {portfolios.length === 0 ? (
              <EmptyState icon={Briefcase} title="No portfolio items" description="Showcase your past work to attract clients." />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {portfolios.map((p) => (
                  <div key={p.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-32 object-cover" />}
                    <div className="p-3">
                      <div className="flex items-start justify-between">
                        <p className="font-medium text-sm">{p.title}</p>
                        <button onClick={() => deletePortfolio(p.id)} className="text-neutral-400 hover:text-error-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{p.description}</p>
                      {p.project_link && <a href={p.project_link} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline mt-1 inline-flex items-center gap-1"><LinkIcon className="h-3 w-3" /> View</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <Button type="submit" loading={saving} size="lg" className="w-full">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </form>

      {/* Portfolio modal */}
      <Modal open={showPortfolio} onClose={() => setShowPortfolio(false)} title="Add Portfolio Item">
        <div className="space-y-4">
          <Input label="Title" required value={portTitle} onChange={(e) => setPortTitle(e.target.value)} placeholder="E-commerce Website" />
          <Textarea label="Description" rows={3} value={portDesc} onChange={(e) => setPortDesc(e.target.value)} placeholder="Describe the project..." />
          <Input label="Image URL" value={portImage} onChange={(e) => setPortImage(e.target.value)} placeholder="https://..." />
          <Input label="Project Link" value={portLink} onChange={(e) => setPortLink(e.target.value)} placeholder="https://..." />
          <div className="flex gap-3">
            <Button onClick={addPortfolio} className="flex-1">Add Item</Button>
            <Button variant="outline" onClick={() => setShowPortfolio(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
