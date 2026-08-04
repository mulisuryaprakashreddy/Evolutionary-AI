import { CheckCircle2, ArrowRight, Calendar, MapPin, Truck, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { LISTINGS, formatPrice } from '../data';

export function ConfirmationPage() {
  const { navigate, recentlyViewed } = useStore();
  const recent = recentlyViewed.map((id) => LISTINGS.find((l) => l.id === id)).filter(Boolean).slice(0, 4) as typeof LISTINGS;

  const orderId = `RH-${Math.floor(Math.random() * 900000 + 100000)}`;
  const pickup = new Date(); pickup.setDate(pickup.getDate() + 1);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="surface rounded-3xl p-8 text-center animate-scale-in sm:p-12">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary-tint">
          <CheckCircle2 size={44} className="text-primary" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-app">Booking confirmed!</h1>
        <p className="mt-2 text-app-soft">Your rental is reserved. We've emailed your confirmation and receipt.</p>

        <div className="mt-6 grid gap-3 rounded-2xl bg-bg-soft p-5 text-left text-sm sm:grid-cols-2">
          <div>
            <p className="text-app-faint">Order number</p>
            <p className="font-semibold text-app">{orderId}</p>
          </div>
          <div>
            <p className="text-app-faint">Payment</p>
            <p className="font-semibold text-app">Paid · Visa •••• 4242</p>
          </div>
          <div>
            <p className="text-app-faint">Pickup / delivery</p>
            <p className="inline-flex items-center gap-1 font-semibold text-app"><Calendar size={14} /> {pickup.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>
          <div>
            <p className="text-app-faint">Status</p>
            <p className="inline-flex items-center gap-1 font-semibold text-primary-soft"><ShieldCheck size={14} /> Escrow secured</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => navigate({ name: 'dashboard' })} className="btn-primary">Track my rentals <ArrowRight size={18} /></button>
          <button onClick={() => navigate({ name: 'browse' })} className="btn-ghost">Keep browsing</button>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-lg font-bold text-app">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recent.map((l) => (
              <button key={l.id} onClick={() => navigate({ name: 'listing', id: l.id })} className="card text-left">
                <img src={l.images[0]} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-app">{l.name}</p>
                  <p className="mt-1 text-sm font-bold text-primary-soft">{formatPrice(l.priceDaily)}<span className="text-app-faint font-normal">/day</span></p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
