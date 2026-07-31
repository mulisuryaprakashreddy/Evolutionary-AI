import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { getListing, formatPrice } from '../data';
import { calculatePrice, formatDateRange } from '../pricing';

export function CheckoutPage() {
  const { cart, navigate, clearCart, notify } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '', card: '', expiry: '', cvc: '' });
  const [placing, setPlacing] = useState(false);

  const lines = useMemo(() => {
    return cart.map((item, index) => {
      const listing = getListing(item.listingId);
      if (!listing) return null;
      return { index, item, listing, breakdown: calculatePrice(listing, item) };
    }).filter(Boolean) as { index: number; item: typeof cart[number]; listing: NonNullable<ReturnType<typeof getListing>>; breakdown: ReturnType<typeof calculatePrice> }[];
  }, [cart]);

  const grandTotal = useMemo(() => lines.reduce((sum, l) => sum + l.breakdown.totalDueToday, 0), [lines]);
  const deposits = useMemo(() => lines.reduce((sum, l) => sum + l.breakdown.deposit, 0), [lines]);

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Nothing to check out</h1>
        <button onClick={() => navigate({ name: 'browse' })} className="btn-primary mt-6">Browse rentals</button>
      </div>
    );
  }

  const steps = ['Details', 'Payment', 'Review'];

  function placeOrder() {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      clearCart();
      notify('Booking confirmed!');
      navigate({ name: 'confirmation' });
    }, 1100);
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const canContinue = step === 0
    ? form.name && form.email && form.address && form.city && form.zip
    : step === 1
      ? form.card.length >= 12 && form.expiry && form.cvc.length >= 3
      : true;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <button onClick={() => navigate({ name: 'cart' })} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-app-soft hover:text-app">
        <ArrowLeft size={16} /> Back to cart
      </button>
      <h1 className="font-display text-3xl font-bold text-app">Checkout</h1>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary text-white' : 'bg-bg-soft text-app-faint'}`}>
              {i < step ? <Check size={16} /> : i + 1}
            </span>
            <span className={`text-sm font-semibold ${i <= step ? 'text-app' : 'text-app-faint'}`}>{s}</span>
            {i < steps.length - 1 && <span className={`mx-2 h-0.5 flex-1 rounded ${i < step ? 'bg-primary' : 'bg-app/15'}`} />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="surface rounded-2xl p-6">
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-lg font-bold text-app">Delivery details</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name" value={form.name} onChange={(v) => update('name', v)} placeholder="Alex Morgan" className="sm:col-span-2" />
                <Field label="Email" value={form.email} onChange={(v) => update('email', v)} placeholder="you@email.com" type="email" className="sm:col-span-2" />
                <Field label="Street address" value={form.address} onChange={(v) => update('address', v)} placeholder="123 Main St" className="sm:col-span-2" />
                <Field label="City" value={form.city} onChange={(v) => update('city', v)} placeholder="New York" />
                <Field label="ZIP / Postal code" value={form.zip} onChange={(v) => update('zip', v)} placeholder="10001" />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-lg font-bold text-app">Payment method</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {['Card', 'Apple Pay', 'Google Pay', 'PayPal'].map((m, i) => (
                  <button key={m} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${i === 0 ? 'border-primary bg-primary-tint text-primary-soft' : 'border-app/15 text-app-soft hover:bg-bg-soft'}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="grid gap-3">
                <Field label="Card number" value={form.card} onChange={(v) => update('card', v.replace(/[^\d ]/g, ''))} placeholder="4242 4242 4242 4242" icon={CreditCard} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry" value={form.expiry} onChange={(v) => update('expiry', v)} placeholder="MM/YY" />
                  <Field label="CVC" value={form.cvc} onChange={(v) => update('cvc', v.replace(/\D/g, ''))} placeholder="123" />
                </div>
              </div>
              <p className="inline-flex items-center gap-1.5 text-xs text-app-faint"><Lock size={13} /> Payments are encrypted and processed securely. We never store your card.</p>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="font-display text-lg font-bold text-app">Review your order</h2>
              <div className="space-y-3">
                {lines.map(({ index, listing, item, breakdown }) => (
                  <div key={index} className="flex gap-3 rounded-xl border border-app/10 p-3">
                    <img src={listing.images[0]} alt="" className="h-16 w-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-app">{listing.name}</p>
                      <p className="text-xs text-app-faint">{formatDateRange(item.startDate, item.days)} · {item.quantity}×</p>
                    </div>
                    <p className="font-semibold text-app">{formatPrice(breakdown.totalDueToday)}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-bg-soft p-4 text-sm">
                <p className="font-semibold text-app">Deliver to</p>
                <p className="text-app-soft">{form.name}, {form.address}, {form.city} {form.zip}</p>
                <p className="mt-2 font-semibold text-app">Payment</p>
                <p className="text-app-soft">•••• {form.card.slice(-4) || '4242'}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="btn-ghost">Back</button>}
            {step < 2 ? (
              <button onClick={() => canContinue && setStep((s) => s + 1)} disabled={!canContinue} className="btn-primary flex-1">Continue <ArrowRight size={18} /></button>
            ) : (
              <button onClick={placeOrder} disabled={placing} className="btn-primary flex-1">
                {placing ? 'Processing…' : <>Pay {formatPrice(grandTotal)} <Lock size={16} /></>}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="surface rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold text-app">Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              {lines.map(({ index, listing, breakdown }) => (
                <div key={index} className="flex justify-between gap-2 text-app-soft">
                  <span className="truncate">{listing.name}</span>
                  <span className="font-medium text-app">{formatPrice(breakdown.totalDueToday)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-app/10 pt-3 text-app-soft">
                <span>Refundable deposits</span>
                <span className="font-medium text-app">{formatPrice(deposits)}</span>
              </div>
              <div className="flex justify-between border-t border-app/10 pt-3">
                <span className="font-display font-bold text-app">Total due today</span>
                <span className="font-display text-xl font-bold text-primary-soft">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2 rounded-xl bg-primary-tint/50 p-3 text-xs text-primary-soft">
              <p className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Held in escrow until your rental begins</p>
              <p className="inline-flex items-center gap-1.5"><Check size={14} /> Free cancellation up to 48h before pickup</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', icon: Icon, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; icon?: React.ComponentType<{ size?: number; className?: string }>; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-app-soft">{label}</span>
      <div className="relative">
        {Icon && <Icon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-app-faint" />}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`input !py-2.5 ${Icon ? 'pl-11' : ''}`} />
      </div>
    </label>
  );
}
