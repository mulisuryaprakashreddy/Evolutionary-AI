import { useState } from 'react';
import {
  Calendar, Clock, CreditCard, Heart, Package, Settings, ShoppingBag,
  TrendingUp, Truck, Wallet, CheckCircle2, ArrowRight, Star,
} from 'lucide-react';
import { useStore } from '../store';
import { LISTINGS, formatPrice } from '../data';

type Tab = 'overview' | 'rentals' | 'wishlist' | 'payments' | 'returns' | 'settings';

export function DashboardPage() {
  const { navigate, wishlist, cart } = useStore();
  const [tab, setTab] = useState<Tab>('overview');

  // Build a few mock "active" rentals from catalog items
  const activeRentals = LISTINGS.slice(0, 2).map((l, i) => ({
    listing: l,
    start: new Date(Date.now() - i * 86400000),
    days: 5 + i,
  }));
  const upcoming = LISTINGS.slice(2, 4).map((l) => ({ listing: l, start: new Date(Date.now() + 4 * 86400000), days: 3 }));

  const wishlisted = wishlist.map((id) => LISTINGS.find((l) => l.id === id)).filter(Boolean) as typeof LISTINGS;

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'rentals', label: 'My rentals', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'returns', label: 'Returns', icon: Truck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <img src="https://i.pravatar.cc/120?img=7" alt="Profile" className="h-14 w-14 rounded-full object-cover" />
        <div>
          <h1 className="font-display text-2xl font-bold text-app">Welcome back, Alex</h1>
          <p className="text-sm text-app-soft">Manage your rentals, wishlist, and account</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${tab === t.id ? 'bg-primary-tint text-primary-soft' : 'text-app-soft hover:bg-bg-soft'}`}
              >
                <t.icon size={17} /> {t.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {tab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat icon={Package} label="Active rentals" value={String(activeRentals.length)} accent="primary" />
                <Stat icon={Calendar} label="Upcoming" value={String(upcoming.length)} accent="accent" />
                <Stat icon={Heart} label="Wishlist" value={String(wishlist.length)} accent="amber" />
              </div>

              <Panel title="Active rentals" action={{ label: 'View all', onClick: () => setTab('rentals') }}>
                {activeRentals.map(({ listing, start, days }) => (
                  <RentalRow key={listing.id} listing={listing} start={start} days={days} status="active" onView={() => navigate({ name: 'listing', id: listing.id })} />
                ))}
              </Panel>

              <Panel title="Upcoming pickups" action={{ label: 'View all', onClick: () => setTab('rentals') }}>
                {upcoming.map(({ listing, start, days }) => (
                  <RentalRow key={listing.id} listing={listing} start={start} days={days} status="upcoming" onView={() => navigate({ name: 'listing', id: listing.id })} />
                ))}
              </Panel>

              <Panel title="From your wishlist" action={{ label: 'View all', onClick: () => setTab('wishlist') }}>
                {wishlisted.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {wishlisted.slice(0, 4).map((l) => (
                      <button key={l.id} onClick={() => navigate({ name: 'listing', id: l.id })} className="card text-left">
                        <img src={l.images[0]} alt="" className="aspect-[4/3] w-full object-cover" />
                        <div className="p-3">
                          <p className="truncate text-sm font-semibold text-app">{l.name}</p>
                          <p className="text-xs text-primary-soft font-semibold">{formatPrice(l.priceDaily)}/day</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : <EmptyHint icon={Heart} text="No saved items yet" />}
              </Panel>
            </div>
          )}

          {tab === 'rentals' && (
            <div className="space-y-6 animate-fade-in">
              <Panel title="Active rentals">
                {activeRentals.map(({ listing, start, days }) => (
                  <RentalRow key={listing.id} listing={listing} start={start} days={days} status="active" onView={() => navigate({ name: 'listing', id: listing.id })} />
                ))}
              </Panel>
              <Panel title="Upcoming">
                {upcoming.map(({ listing, start, days }) => (
                  <RentalRow key={listing.id} listing={listing} start={start} days={days} status="upcoming" onView={() => navigate({ name: 'listing', id: listing.id })} />
                ))}
              </Panel>
              <Panel title="Past rentals">
                {LISTINGS.slice(4, 6).map((l) => (
                  <RentalRow key={l.id} listing={l} start={new Date(Date.now() - 20 * 86400000)} days={4} status="completed" onView={() => navigate({ name: 'listing', id: l.id })} />
                ))}
              </Panel>
            </div>
          )}

          {tab === 'wishlist' && (
            <div className="animate-fade-in">
              <Panel title="Saved items">
                {wishlisted.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {wishlisted.map((l) => (
                      <button key={l.id} onClick={() => navigate({ name: 'listing', id: l.id })} className="card text-left">
                        <img src={l.images[0]} alt="" className="aspect-[4/3] w-full object-cover" />
                        <div className="p-3">
                          <p className="truncate text-sm font-semibold text-app">{l.name}</p>
                          <p className="text-xs text-primary-soft font-semibold">{formatPrice(l.priceDaily)}/day</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : <EmptyHint icon={Heart} text="No saved items yet" />}
              </Panel>
            </div>
          )}

          {tab === 'payments' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-3">
                <Stat icon={Wallet} label="Spent this year" value={formatPrice(1240)} accent="primary" />
                <Stat icon={CreditCard} label="Deposits held" value={formatPrice(450)} accent="accent" />
                <Stat icon={CheckCircle2} label="Refunds issued" value={formatPrice(300)} accent="amber" />
              </div>
              <Panel title="Payment methods">
                <div className="flex items-center justify-between rounded-xl border border-app/10 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-bg-soft"><CreditCard size={18} /></span>
                    <div>
                      <p className="font-semibold text-app">Visa •••• 4242</p>
                      <p className="text-xs text-app-faint">Expires 04/27 · Default</p>
                    </div>
                  </div>
                  <span className="chip chip-active">Default</span>
                </div>
              </Panel>
              <Panel title="Recent invoices">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b border-app/10 py-3 text-sm last:border-0">
                    <div>
                      <p className="font-semibold text-app">RH-{100240 + i}</p>
                      <p className="text-xs text-app-faint">{new Date(Date.now() - i * 7 * 86400000).toLocaleDateString()}</p>
                    </div>
                    <span className="font-semibold text-app">{formatPrice(120 + i * 30)}</span>
                  </div>
                ))}
              </Panel>
            </div>
          )}

          {tab === 'returns' && (
            <div className="animate-fade-in">
              <Panel title="Returns & refunds">
                <div className="rounded-xl bg-bg-soft p-4 text-sm">
                  <p className="font-semibold text-app">No active returns</p>
                  <p className="mt-1 text-app-soft">When your rental ends, schedule a return here. Deposits are refunded automatically once the item is inspected.</p>
                </div>
              </Panel>
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <Panel title="Profile">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SettingField label="Full name" value="Alex Morgan" />
                  <SettingField label="Email" value="alex@email.com" />
                  <SettingField label="Phone" value="+1 (555) 010-2024" />
                  <SettingField label="Location" value="New York, NY" />
                </div>
              </Panel>
              <Panel title="Notifications">
                <div className="space-y-2">
                  {['Booking confirmations', 'Return reminders', 'Messages from owners', 'Promotions & deals'].map((n, i) => (
                    <div key={n} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-app-soft">{n}</span>
                      <span className={`relative h-5 w-9 rounded-full ${i < 3 ? 'bg-primary' : 'bg-app/15'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${i < 3 ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; accent: 'primary' | 'accent' | 'amber' }) {
  const colors = { primary: 'bg-primary-tint text-primary-soft', accent: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
  return (
    <div className="surface rounded-2xl p-5">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${colors[accent]}`}><Icon size={20} /></span>
      <p className="mt-3 font-display text-2xl font-bold text-app">{value}</p>
      <p className="text-sm text-app-faint">{label}</p>
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: { label: string; onClick: () => void }; children: React.ReactNode }) {
  return (
    <div className="surface rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-app">{title}</h2>
        {action && <button onClick={action.onClick} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-soft hover:text-primary">{action.label} <ArrowRight size={14} /></button>}
      </div>
      {children}
    </div>
  );
}

function RentalRow({ listing, start, days, status, onView }: { listing: typeof LISTINGS[number]; start: Date; days: number; status: 'active' | 'upcoming' | 'completed'; onView: () => void }) {
  const end = new Date(start); end.setDate(end.getDate() + days);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const statusMap = {
    active: { label: 'Active', cls: 'bg-primary-tint text-primary-soft' },
    upcoming: { label: 'Upcoming', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
    completed: { label: 'Completed', cls: 'bg-bg-soft text-app-faint' },
  } as const;
  return (
    <div className="flex items-center gap-3 border-b border-app/10 py-3 last:border-0">
      <button onClick={onView} className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
        <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
      </button>
      <div className="min-w-0 flex-1">
        <button onClick={onView} className="block truncate text-left font-semibold text-app hover:text-primary-soft">{listing.name}</button>
        <p className="inline-flex items-center gap-1.5 text-xs text-app-faint">
          <Clock size={12} /> {fmt(start)} – {fmt(end)}
          <span className="mx-1">·</span>
          <Truck size={12} /> {listing.delivery ? 'Delivery' : 'Pickup'}
        </p>
      </div>
      <span className={`chip ${statusMap[status].cls}`}>{statusMap[status].label}</span>
      <span className="hidden font-semibold text-app sm:block">{formatPrice(listing.priceDaily * days)}</span>
    </div>
  );
}

function EmptyHint({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; className?: string }>; text: string }) {
  return (
    <div className="py-8 text-center">
      <Icon size={32} className="mx-auto text-app-faint" />
      <p className="mt-2 text-sm text-app-soft">{text}</p>
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-app-soft">{label}</span>
      <input defaultValue={value} className="input !py-2.5" />
    </label>
  );
}
