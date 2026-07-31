import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { LISTINGS } from '../data';
import { ListingGrid } from '../components/ListingGrid';

export function WishlistPage() {
  const { wishlist, navigate } = useStore();
  const items = wishlist.map((id) => LISTINGS.find((l) => l.id === id)).filter(Boolean) as typeof LISTINGS;

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-app">Your wishlist</h1>
        <p className="mt-1 text-sm text-app-soft">{items.length} {items.length === 1 ? 'item' : 'items'} saved to borrow later</p>
      </div>

      {items.length > 0 ? (
        <ListingGrid listings={items} />
      ) : (
        <div className="surface rounded-2xl p-12 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-bg-soft"><Heart size={36} className="text-app-faint" /></div>
          <h2 className="mt-6 font-display text-xl font-bold text-app">No saved items yet</h2>
          <p className="mt-2 text-app-soft">Tap the heart on any rental to save it here for later.</p>
          <button onClick={() => navigate({ name: 'browse' })} className="btn-primary mt-6">Discover rentals <ArrowRight size={18} /></button>
        </div>
      )}
    </div>
  );
}
