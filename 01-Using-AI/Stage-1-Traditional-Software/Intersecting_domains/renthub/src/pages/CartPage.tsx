import { useMemo } from 'react';
import { ArrowRight, ShoppingBag, Trash2, Calendar, MapPin, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useStore } from '../store';
import { getListing, formatPrice } from '../data';
import { calculatePrice, formatDateRange } from '../pricing';

export function CartPage() {
  const { cart, removeFromCart, updateCartItem, navigate, clearCart } = useStore();

  const lines = useMemo(() => {
    return cart.map((item, index) => {
      const listing = getListing(item.listingId);
      if (!listing) return null;
      const breakdown = calculatePrice(listing, item);
      return { index, item, listing, breakdown };
    }).filter(Boolean) as { index: number; item: typeof cart[number]; listing: NonNullable<ReturnType<typeof getListing>>; breakdown: NonNullable<ReturnType<typeof calculatePrice>> }[];
  }, [cart]);

  const grandTotal = useMemo(() => lines.reduce((sum, l) => sum + l.breakdown.totalDueToday + l.breakdown.deposit, 0), [lines]);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-bg-soft"><ShoppingBag size={36} className="text-app-faint" /></div>
        <h1 className="mt-6 font-display text-2xl font-bold text-app">Your cart is empty</h1>
        <p className="mt-2 text-app-soft">Browse thousands of items available to borrow near you.</p>
        <button onClick={() => navigate({ name: 'browse' })} className="btn-primary mt-6">Start browsing <ArrowRight size={18} /></button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-app">Your cart</h1>
        <button onClick={clearCart} className="text-sm font-semibold text-app-faint hover:text-rose-500">Clear all</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          {lines.map(({ index, item, listing, breakdown }) => (
            <div key={index} className="surface rounded-2xl p-4 animate-fade-up">
              <div className="flex gap-4">
                <button onClick={() => navigate({ name: 'listing', id: listing.id })} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-bg-soft sm:h-28 sm:w-28">
                  <img src={listing.images[0]} alt={listing.name} className="h-full w-full object-cover" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <button onClick={() => navigate({ name: 'listing', id: listing.id })} className="text-left font-display text-base font-bold text-app hover:text-primary-soft">{listing.name}</button>
                      <p className="mt-0.5 text-xs text-app-faint">{listing.brand} · {listing.condition}</p>
                    </div>
                    <button onClick={() => removeFromCart(index)} aria-label="Remove" className="grid h-9 w-9 place-items-center rounded-lg text-app-faint transition-colors hover:bg-rose-500/10 hover:text-rose-500">
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-app-soft">
                    <span className="inline-flex items-center gap-1"><Calendar size={12} /> {formatDateRange(item.startDate, item.days)}</span>
                    <span className="inline-flex items-center gap-1">{item.delivery ? <Truck size={12} /> : <MapPin size={12} />} {item.delivery ? 'Delivery' : 'Pickup'}</span>
                    {item.insurance && <span className="inline-flex items-center gap-1"><ShieldCheck size={12} /> Protected</span>}
                    {listing.instantBook && <span className="inline-flex items-center gap-1"><Zap size={12} /> Instant</span>}
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <label className="text-xs text-app-faint">Qty
                      <input type="number" min={1} max={listing.quantity} value={item.quantity} onChange={(e) => updateCartItem(index, { quantity: Math.max(1, Math.min(listing.quantity, Number(e.target.value) || 1)) })} className="input !w-16 !py-1.5 ml-1.5" />
                    </label>
                    <label className="text-xs text-app-faint">Days
                      <input type="number" min={listing.minDays} max={listing.maxDays} value={item.days} onChange={(e) => updateCartItem(index, { days: Math.max(listing.minDays, Math.min(listing.maxDays, Number(e.target.value) || listing.minDays)) })} className="input !w-16 !py-1.5 ml-1.5" />
                    </label>
                    <div className="ml-auto text-right">
                      <p className="font-display text-lg font-bold text-app">{formatPrice(breakdown.totalDueToday)}</p>
                      <p className="text-xs text-app-faint">+ {formatPrice(breakdown.deposit)} deposit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="surface rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-app">Order summary</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              {lines.map(({ index, listing, breakdown }) => (
                <div key={index} className="flex justify-between gap-2 text-app-soft">
                  <span className="truncate">{listing.name}</span>
                  <span className="font-medium text-app">{formatPrice(breakdown.totalDueToday)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-app/10 pt-3 text-app-soft">
                <span>Refundable deposits</span>
                <span className="font-medium text-app">{formatPrice(lines.reduce((s, l) => s + l.breakdown.deposit, 0))}</span>
              </div>
              <div className="flex justify-between border-t border-app/10 pt-3">
                <span className="font-display text-base font-bold text-app">Total today</span>
                <span className="font-display text-2xl font-bold text-primary-soft">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <button onClick={() => navigate({ name: 'checkout' })} className="btn-primary mt-5 w-full !py-3.5">
              Checkout <ArrowRight size={18} />
            </button>
            <p className="mt-3 text-center text-xs text-app-faint">Deposits are held separately and refunded automatically on return.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
