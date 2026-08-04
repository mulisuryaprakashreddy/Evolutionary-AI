'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Package, Heart, User, ShieldCheck, Building2, Pencil, Trash2, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ListingCard } from '@/components/listing-card';
import { supabase, useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import { STATUS_META, type ListingStatus } from '@/lib/constants';
import type { Listing } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/format';

export default function DashboardPage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const tab = sp.get('tab') || 'listings';

  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login?next=/dashboard');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    (async () => {
      setLoadingData(true);
      const [{ data: myListings }, { data: favRows }] = await Promise.all([
        supabase.from('listings').select('*, profiles:donor_id(full_name, organization_name, is_verified)').eq('donor_id', user.id).order('created_at', { ascending: false }),
        supabase.from('favorites').select('listing:listings(*, profiles:donor_id(full_name, organization_name, is_verified))').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setListings((myListings || []) as Listing[]);
      setFavorites((favRows || []).map((r: any) => r.listing).filter(Boolean) as Listing[]);
      setLoadingData(false);
    })();
  }, [user, profile]);

  const updateStatus = async (id: string, status: ListingStatus) => {
    const { error } = await supabase.from('listings').update({ status }).eq('id', id);
    if (error) { toast.error('Could not update status'); return; }
    setListings((l) => l.map((x) => x.id === id ? { ...x, status } : x));
    toast.success('Status updated');
  };

  const removeListing = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return;
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) { toast.error('Could not delete listing'); return; }
    setListings((l) => l.filter((x) => x.id !== id));
    toast.success('Listing deleted');
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user!.id);
    setSavingProfile(false);
    if (error) { toast.error('Could not save profile'); return; }
    await refreshProfile();
    toast.success('Profile saved');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const org = profile?.organization_name;

  return (
    <div className="container py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Welcome, {profile?.full_name || profile?.organization_name || user.email}
          </h1>
          <p className="mt-1 text-muted-foreground">Manage your listings, favorites, and profile.</p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/listings/new"><Plus className="h-4 w-4" /> Donate equipment</Link>
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {profile?.is_verified && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
            {org ? <Building2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            {org ? 'Verified organization' : 'Verified donor'}
          </span>
        )}
      </div>

      <Tabs defaultValue={tab} className="mt-8">
        <TabsList>
          <TabsTrigger value="listings" className="gap-1.5" onClick={() => router.push('/dashboard?tab=listings')}>
            <Package className="h-4 w-4" /> My listings ({listings.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-1.5" onClick={() => router.push('/dashboard?tab=favorites')}>
            <Heart className="h-4 w-4" /> Saved ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5" onClick={() => router.push('/dashboard?tab=profile')}>
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {loadingData ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : listings.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No listings yet"
              body="Share your first piece of medical equipment with someone in need."
              cta={<Button asChild className="gap-1.5"><Link href="/listings/new"><Plus className="h-4 w-4" /> Create a listing</Link></Button>}
            />
          ) : (
            <div className="space-y-4">
              {listings.map((l) => {
                const status = (l.status || 'available') as ListingStatus;
                const meta = STATUS_META[status] ?? STATUS_META.available;
                return (
                  <div key={l.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
                    <Link href={`/listings/${l.id}`} className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {l.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.images[0]} alt={l.equipment_name} className="h-full w-full object-cover" />
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', meta.className)}>{meta.label}</span>
                        <span className="text-xs text-muted-foreground">{formatRelative(l.created_at)}</span>
                      </div>
                      <h3 className="mt-1 font-display font-semibold">{l.equipment_name}</h3>
                      <p className="text-sm text-muted-foreground">{l.city ? `${l.city}, ` : ''}{l.country}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <SelectStatus value={status} onChange={(v) => updateStatus(l.id, v)} />
                      <Button asChild variant="outline" size="sm"><Link href={`/listings/${l.id}`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button asChild variant="outline" size="sm"><Link href={`/listings/${l.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="outline" size="sm" onClick={() => removeListing(l.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {loadingData ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No saved equipment yet"
              body="Tap the heart on any listing to save it here for later."
              cta={<Button asChild><Link href="/browse">Browse equipment</Link></Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((l) => <ListingCard key={l.id} listing={l} favorited />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <div className="max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold">Profile details</h2>
            <p className="mt-1 text-sm text-muted-foreground">This information appears on your listings.</p>
            <div className="mt-5 space-y-4">
              <div>
                <Label htmlFor="p-name">Full name</Label>
                <Input id="p-name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="p-phone">Phone</Label>
                <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="p-email">Email</Label>
                <Input id="p-email" value={user.email || ''} disabled className="mt-1.5 bg-muted" />
              </div>
              <Button onClick={saveProfile} disabled={savingProfile} className="gap-1.5">
                {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                Save profile
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SelectStatus({ value, onChange }: { value: ListingStatus; onChange: (v: ListingStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ListingStatus)}
      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
    >
      {Object.entries(STATUS_META).map(([k, v]) => (
        <option key={k} value={k}>{v.label}</option>
      ))}
    </select>
  );
}

function EmptyState({ icon: Icon, title, body, cta }: { icon: any; title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}
