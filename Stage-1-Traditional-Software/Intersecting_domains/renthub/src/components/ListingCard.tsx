import { Heart, MapPin, ShieldCheck, Star, Zap } from 'lucide-react';
import type { Listing } from '../types';
import { formatPrice } from '../data';
import { useStore } from '../store';
import { StarRating } from './StarRating';

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const { navigate, toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(listing.id);

  return (
    <article
      className="card group cursor-pointer hover:-translate-y-1 hover:shadow-card-hover animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
      onClick={() => navigate({ name: 'listing', id: listing.id })}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-soft">
        <img
          src={listing.images[0]}
          alt={listing.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {listing.instantBook && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              <Zap size={11} fill="currentColor" /> Instant
            </span>
          )}
          {listing.featured && (
            <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-amber-950 shadow-sm">Featured</span>
          )}
        </div>
        <button
          aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(listing.id); }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full glass transition-all hover:scale-110 active:scale-95"
        >
          <Heart size={18} className={wished ? 'fill-rose-500 text-rose-500' : 'text-app'} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-app-faint">
          <span className="truncate font-medium uppercase tracking-wide">{listing.brand}</span>
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="text-amber-400" fill="currentColor" strokeWidth={0} />
            {listing.rating.toFixed(1)} <span className="text-app-faint/70">({listing.reviewsCount})</span>
          </span>
        </div>
        <h3 className="mt-1 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-app">{listing.name}</h3>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-app-soft">
          <MapPin size={12} /> {listing.location}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="font-display text-xl font-bold text-app">{formatPrice(listing.priceDaily)}</span>
            <span className="text-sm text-app-faint"> /day</span>
          </div>
          <div className="inline-flex items-center gap-1 text-xs text-app-soft">
            {listing.owner.verified && <ShieldCheck size={14} className="text-primary" />}
            <span className="max-w-[90px] truncate">{listing.owner.name}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] shimmer" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 shimmer rounded" />
        <div className="h-4 w-5/6 shimmer rounded" />
        <div className="h-4 w-2/3 shimmer rounded" />
        <div className="h-6 w-1/2 shimmer rounded mt-2" />
      </div>
    </div>
  );
}
