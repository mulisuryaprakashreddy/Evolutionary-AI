import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Calendar, Check, ChevronRight, Heart, MapPin, MessageCircle, Share2,
  ShieldCheck, Truck, Zap, Flag, Star, Package, Info,
} from 'lucide-react';
import { useStore } from '../store';
import { getListing, LISTINGS, formatPrice } from '../data';
import { calculatePrice, formatDateInput, addDays, formatDateRange } from '../pricing';
import { StarRating } from '../components/StarRating';
import { ListingCard } from '../components/ListingCard';

export function ListingPage() {
  const { route, navigate, addToCart, toggleWishlist, isWishlisted, notify, trackView } = useStore();
  const id = route.name === 'listing' ? route.id : '';
  const listing = getListing(id);

  const [activeImg, setActiveImg] = useState(0);
  const [days, setDays] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(formatDateInput(addDays(new Date(), 1)));
  const [delivery, setDelivery] = useState(true);
  const [insurance, setInsurance] = useState(true);

  useEffect(() => {
    if (listing) {
      trackView(listing.id);
      setActiveImg(0);
      setDays(listing.minDays);
      setQuantity(1);
      setDelivery(listing.delivery);
      setInsurance(listing.insurance);
      setStartDate(formatDateInput(addDays(new Date(), 1)));
    }
  }, [listing, trackView]);

  const breakdown = useMemo(() => {
    if (!listing) return null;
    return calculatePrice(listing, { listingId: listing.id, startDate, days, quantity, delivery, insurance });
  }, [listing, startDate, days, quantity, delivery, insurance]);

  const recommended = useMemo(() => {
    if (!listing) return [];
    return LISTINGS.filter((l) => l.id !== listing.id && l.category === listing.category).slice(0, 4);
  }, [listing]);

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Package size={48} className="mx-auto text-app-faint" />
        <h1 className="mt-4 font-display text-2xl font-bold">Listing not found</h1>
        <button onClick={() => navigate({ name: 'browse' })} className="btn-primary mt-6">Browse rentals</button>
      </div>
    );
  }

  const wished = isWishlisted(listing.id);

  function borrowNow() {
    addToCart({ listingId: listing!.id, startDate, days, quantity, delivery, insurance });
    notify('Added to your cart');
    navigate({ name: 'cart' });
  }

  return (
    <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-app-faint">
        <button onClick={() => navigate({ name: 'home' })} className="hover:text-app">Home</button>
        <ChevronRight size={14} />
        <button onClick={() => navigate({ name: 'browse', category: listing.category })} className="capitalize hover:text-app">{listing.category}</button>
        <ChevronRight size={14} />
        <span className="truncate text-app-soft">{listing.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Gallery */}
        <div className="animate-fade-in">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl surface">
            <img src={listing.images[activeImg]} alt={listing.name} className="h-full w-full object-cover" />
            <button
              onClick={() => toggleWishlist(listing.id)}
              aria-label="Save"
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full glass transition-transform hover:scale-110"
            >
              <Heart size={20} className={wished ? 'fill-rose-500 text-rose-500' : 'text-app'} />
            </button>
            <button
              onClick={() => notify('Link copied to clipboard', 'info')}
              aria-label="Share"
              className="absolute right-16 top-4 grid h-11 w-11 place-items-center rounded-full glass transition-transform hover:scale-110"
            >
              <Share2 size={19} className="text-app" />
            </button>
          </div>
          {listing.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`h-20 w-24 overflow-hidden rounded-xl border-2 transition-all ${activeImg === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info + calculator */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-app-faint">{listing.brand}</span>
            {listing.instantBook && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white"><Zap size={11} fill="currentColor" /> Instant book</span>
            )}
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight text-app sm:text-3xl">{listing.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <StarRating rating={listing.rating} />
              <span className="font-semibold text-app">{listing.rating.toFixed(1)}</span>
              <span className="text-app-faint">({listing.reviewsCount} reviews)</span>
            </span>
            <span className="inline-flex items-center gap-1 text-app-soft"><MapPin size={15} /> {listing.location}</span>
            <span className="inline-flex items-center gap-1 text-app-soft"><Calendar size={15} /> {listing.year}</span>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-app-soft">{listing.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <Spec label="Condition" value={listing.condition} />
            <Spec label="Model" value={listing.model} />
            <Spec label="Available" value={`${listing.quantity} in stock`} />
            <Spec label="Min rental" value={`${listing.minDays} day${listing.minDays > 1 ? 's' : ''}`} />
            <Spec label="Max rental" value={`${listing.maxDays} days`} />
            {listing.delivery && <Spec label="Delivery" value={`$${listing.shippingCost}`} />}
          </div>

          {/* Owner */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl surface p-4">
            <img src={listing.owner.avatar} alt={listing.owner.name} className="h-12 w-12 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-semibold text-app">{listing.owner.name}</p>
                {listing.owner.verified && <ShieldCheck size={16} className="shrink-0 text-primary" />}
              </div>
              <p className="text-xs text-app-faint">{listing.owner.rating} ★ · {listing.owner.reviews} reviews · responds {listing.owner.responseTime}</p>
            </div>
            <button onClick={() => notify('Chat is coming soon', 'info')} className="btn-ghost !py-2 !px-3">
              <MessageCircle size={16} /> Chat
            </button>
          </div>

          {/* Pricing calculator */}
          <div className="mt-5 rounded-2xl surface p-5">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-app">{formatPrice(listing.priceDaily)}</span>
              <span className="text-app-faint">/day</span>
              <span className="ml-auto text-sm text-app-soft">Weekly {formatPrice(listing.priceWeekly)} · Monthly {formatPrice(listing.priceMonthly)}</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-app-soft">Start date</span>
                <input type="date" min={formatDateInput(new Date())} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input !py-2.5" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-app-soft">Duration (days)</span>
                <input type="number" min={listing.minDays} max={listing.maxDays} value={days} onChange={(e) => setDays(Math.max(listing.minDays, Math.min(listing.maxDays, Number(e.target.value) || listing.minDays)))} className="input !py-2.5" />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="block flex-1">
                <span className="mb-1.5 block text-xs font-semibold text-app-soft">Quantity</span>
                <input type="number" min={1} max={listing.quantity} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(listing.quantity, Number(e.target.value) || 1)))} className="input !py-2.5" />
              </label>
              <div className="flex-1">
                <span className="mb-1.5 block text-xs font-semibold text-app-soft">Fulfillment</span>
                <div className="flex gap-1.5">
                  <button
                    disabled={!listing.delivery}
                    onClick={() => setDelivery(true)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${delivery ? 'border-primary bg-primary-tint text-primary-soft' : 'border-app/15 text-app-soft hover:bg-bg-soft'}`}
                  >
                    <Truck size={14} className="mr-1 inline" /> Delivery
                  </button>
                  <button
                    disabled={!listing.pickup}
                    onClick={() => setDelivery(false)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${!delivery ? 'border-primary bg-primary-tint text-primary-soft' : 'border-app/15 text-app-soft hover:bg-bg-soft'}`}
                  >
                    <MapPin size={14} className="mr-1 inline" /> Pickup
                  </button>
                </div>
              </div>
            </div>

            <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-app/15 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-sm text-app-soft"><ShieldCheck size={16} className="text-primary" /> Add damage protection ($6/day)</span>
              <span className={`relative h-5 w-9 rounded-full transition-colors ${insurance ? 'bg-primary' : 'bg-app/15'}`}>
                <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="sr-only" />
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${insurance ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </span>
            </label>

            {breakdown && (
              <div className="mt-4 space-y-2 border-t border-app/10 pt-4 text-sm">
                <Row label={`Rental · ${days} days × ${quantity}`} value={formatPrice(breakdown.rental)} />
                {breakdown.delivery > 0 && <Row label="Delivery" value={formatPrice(breakdown.delivery)} />}
                {breakdown.insurance > 0 && <Row label="Damage protection" value={formatPrice(breakdown.insurance)} />}
                <Row label="Platform fee" value={formatPrice(breakdown.platformFee)} />
                <Row label="Taxes" value={formatPrice(breakdown.tax)} />
                <div className="flex items-center justify-between pt-2 text-app-soft">
                  <span>Refundable deposit</span>
                  <span className="font-semibold">{formatPrice(breakdown.deposit)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-app/10 pt-3">
                  <span className="font-display text-base font-bold text-app">Total due today</span>
                  <span className="font-display text-2xl font-bold text-primary-soft">{formatPrice(breakdown.totalDueToday)}</span>
                </div>
              </div>
            )}

            <button onClick={borrowNow} className="btn-primary mt-4 w-full !py-3.5 text-base">
              <Calendar size={18} /> Borrow Now · {formatDateRange(startDate, days)}
            </button>
            <p className="mt-2 text-center text-xs text-app-faint">You won't be charged until the owner confirms. Free cancellation up to 48 hours before pickup.</p>
          </div>

          <button onClick={() => notify('Report submitted for review', 'info')} className="mt-4 inline-flex items-center gap-1.5 text-xs text-app-faint hover:text-rose-500">
            <Flag size={13} /> Report this listing
          </button>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-app">Reviews</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {listing.reviews.map((r) => (
            <div key={r.id} className="surface rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <img src={r.avatar} alt={r.author} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-app">{r.author}</p>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={r.rating} size={12} />
                    <span className="text-xs text-app-faint">{r.date}</span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-app-soft">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 font-display text-2xl font-bold text-app">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {recommended.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl surface px-3 py-2.5">
      <p className="text-xs text-app-faint">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-app">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-app-soft">
      <span>{label}</span>
      <span className="font-medium text-app">{value}</span>
    </div>
  );
}
