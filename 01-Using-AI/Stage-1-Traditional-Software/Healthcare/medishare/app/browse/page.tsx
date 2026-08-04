import { ListingCard } from '@/components/listing-card';
import { getListings } from '@/lib/queries';
import { BrowseFilters } from '@/components/browse-filters';
import { CATEGORIES, CONDITIONS, DONATION_TYPES } from '@/lib/constants';
import { Suspense } from 'react';
import { SearchX } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sp = (v: string | string[] | undefined) =>
    typeof v === 'string' ? v : undefined;

  const params = {
    q: sp(searchParams.q),
    category: sp(searchParams.category),
    condition: sp(searchParams.condition),
    donationType: sp(searchParams.donationType),
    status: sp(searchParams.status),
    country: sp(searchParams.country),
    city: sp(searchParams.city),
    shipping: searchParams.shipping === 'true',
    pickup: searchParams.pickup === 'true',
    sort: sp(searchParams.sort),
  };

  const listings = await getListings(params);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Browse equipment
        </h1>
        <p className="mt-2 text-muted-foreground">
          {listings.length} {listings.length === 1 ? 'listing' : 'listings'} available
          {params.category ? ` in ${CATEGORIES.find((c) => c.slug === params.category)?.name ?? ''}` : ''}.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BrowseFilters />
        </aside>
        <div>
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
              <SearchX className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-display text-lg font-semibold">No listings found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try adjusting your filters or search terms. New equipment is added every day.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
