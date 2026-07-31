import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, ShieldCheck, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/favorite-button';
import {
  STATUS_META,
  categoryLabel,
  conditionLabel,
  donationTypeLabel,
  type ListingStatus,
} from '@/lib/constants';
import type { Listing } from '@/lib/types';
import { formatRelative } from '@/lib/format';

export function ListingCard({ listing, favorited = false }: { listing: Listing; favorited?: boolean }) {
  const status = (listing.status || 'available') as ListingStatus;
  const meta = STATUS_META[status] ?? STATUS_META.available;
  const org = listing.profiles?.organization_name;
  const verified = listing.profiles?.is_verified;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {listing.images?.[0] ? (
          <Image
            src={listing.images[0]}
            alt={listing.equipment_name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur', meta.className)}>
            {meta.label}
          </span>
          <span className="rounded-full border border-border bg-background/80 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
            {donationTypeLabel(listing.donation_type)}
          </span>
        </div>
        <FavoriteButton
          listingId={listing.id}
          favorited={favorited}
          className="absolute right-3 top-3"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full text-xs font-medium">
            {categoryLabel(listing.category)}
          </Badge>
          <span className="text-xs text-muted-foreground">{conditionLabel(listing.condition)}</span>
        </div>
        <h3 className="mt-2 line-clamp-1 font-display text-base font-semibold leading-snug">
          {listing.equipment_name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {listing.city ? `${listing.city}, ` : ''}
            {listing.country || 'Location not specified'}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" /> {formatRelative(listing.created_at)}
          </span>
          {verified && (
            <span className="flex items-center gap-1 font-medium text-accent">
              {org ? <Building2 className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              {org ? 'Verified org' : 'Verified'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
