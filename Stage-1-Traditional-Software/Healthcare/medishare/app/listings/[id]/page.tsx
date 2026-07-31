import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, Mail, MessageCircle, Truck, PackageCheck, Calendar, User, Building2, ShieldCheck, Share2, Flag, ArrowLeft, Clock } from 'lucide-react';
import { getListing, getSimilarListings } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ListingCard } from '@/components/listing-card';
import { FavoriteButton } from '@/components/favorite-button';
import { ReportDialog } from '@/components/report-dialog';
import { Gallery } from '@/components/gallery';
import { STATUS_META, categoryLabel, conditionLabel, donationTypeLabel, type ListingStatus } from '@/lib/constants';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const similar = await getSimilarListings(listing, 4);
  const status = (listing.status || 'available') as ListingStatus;
  const meta = STATUS_META[status] ?? STATUS_META.available;
  const org = listing.profiles?.organization_name;
  const verified = listing.profiles?.is_verified;
  const donorName = org || listing.profiles?.full_name || listing.contact_name || 'Donor';

  return (
    <div className="container py-8 md:py-12">
      <Link href="/browse" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to browse
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left: gallery + details */}
        <div>
          <Gallery images={listing.images} alt={listing.equipment_name} />

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-3 py-1 text-sm font-medium', meta.className)}>
              {meta.label}
            </span>
            <Badge variant="secondary" className="rounded-full">{categoryLabel(listing.category)}</Badge>
            <Badge variant="outline" className="rounded-full">{conditionLabel(listing.condition)}</Badge>
            <Badge variant="outline" className="rounded-full">{donationTypeLabel(listing.donation_type)}</Badge>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {listing.equipment_name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {listing.city ? `${listing.city}, ` : ''}{listing.country || 'Location not specified'}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Posted {formatRelative(listing.created_at)}</span>
            <span className="flex items-center gap-1.5"><PackageCheck className="h-4 w-4" /> Quantity: {listing.quantity}</span>
          </div>

          <Separator className="my-6" />

          <section>
            <h2 className="font-display text-lg font-semibold">Description</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
              {listing.description || 'No description provided.'}
            </p>
          </section>

          <Separator className="my-6" />

          <section className="grid gap-5 sm:grid-cols-2">
            <InfoCard icon={Truck} title="Pickup" value={listing.pickup_available ? 'Available' : 'Not available'} />
            <InfoCard icon={PackageCheck} title="Shipping" value={listing.shipping_available ? (listing.shipping_cost || 'Available') : 'Not available'} />
            <InfoCard icon={Calendar} title="Availability" value={listing.availability === 'immediate' ? 'Immediate' : `Available ${formatDate(listing.available_date)}`} />
            {listing.donation_type === 'lend' && listing.expected_return_date && (
              <InfoCard icon={Clock} title="Expected return" value={formatDate(listing.expected_return_date)} />
            )}
          </section>

          {listing.notes && (
            <>
              <Separator className="my-6" />
              <section>
                <h2 className="font-display text-lg font-semibold">Additional notes</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{listing.notes}</p>
              </section>
            </>
          )}

          <Separator className="my-6" />
          <div className="flex flex-wrap gap-3">
            <ReportDialog listingId={listing.id} />
            <Button variant="outline" className="gap-1.5">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        {/* Right: contact card */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {donorName.charAt(0).toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center gap-1.5 font-display font-semibold">
                    {donorName}
                    {verified && (
                      <ShieldCheck className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  {org && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" /> Verified organization
                    </div>
                  )}
                </div>
              </div>
              <FavoriteButton listingId={listing.id} favorited={false} />
            </div>

            <Separator className="my-5" />

            <h3 className="font-display font-semibold">Contact {donorName}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Preferred: <span className="font-medium text-foreground">{listing.preferred_contact}</span>
            </p>

            <div className="mt-4 space-y-2.5">
              {listing.phone && (
                <a href={`tel:${listing.phone}`} className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm transition hover:border-primary/40 hover:bg-primary/5">
                  <Phone className="h-4 w-4 text-primary" /> {listing.phone}
                </a>
              )}
              {listing.email && (
                <a href={`mailto:${listing.email}`} className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm transition hover:border-primary/40 hover:bg-primary/5">
                  <Mail className="h-4 w-4 text-primary" /> {listing.email}
                </a>
              )}
              {listing.phone && (
                <a
                  href={`https://wa.me/${listing.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm font-medium text-accent transition hover:bg-accent/10"
                >
                  <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                </a>
              )}
            </div>

            <div className="mt-5 rounded-xl bg-secondary/60 p-3 text-xs leading-relaxed text-muted-foreground">
              MedShare does not manage communication. Please contact the donor directly.
              {listing.notes ? ` ${listing.notes}` : ''}
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight">Similar equipment</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <div className="mt-1.5 font-medium">{value}</div>
    </div>
  );
}
