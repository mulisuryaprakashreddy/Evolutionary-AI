import type { Listing } from './types';
import { ListingCard } from './ListingCard';

export function ListingGrid({ listings, className = '' }: { listings: Listing[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${className}`}>
      {listings.map((l, i) => (
        <ListingCard key={l.id} listing={l} index={i} />
      ))}
    </div>
  );
}
