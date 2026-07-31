import { useMemo, useState } from 'react';
import { ArrowRight, CalendarCheck, CreditCard, PackageSearch, Quote, ShieldCheck, Sparkles, Truck, Zap } from 'lucide-react';
import { useStore } from '../store';
import { CATEGORIES, LISTINGS, POPULAR_CITIES } from '../data';
import { CategoryIcon } from '../components/CategoryIcon';
import { ListingGrid } from '../components/ListingGrid';

export function HomePage() {
  const { navigate } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const trending = useMemo(() => LISTINGS.filter((l) => l.trending).slice(0, 8), []);
  const recent = useMemo(() => LISTINGS.filter((l) => l.recentlyAdded).slice(0, 4), []);
  const topRated = useMemo(() => [...LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, 4), []);

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) { setSubscribed(true); setEmail(''); }
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-tint/40 via-bg to-bg" />
        <div className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-32 top-40 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="mx-auto max-w-8xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint px-3 py-1.5 text-xs font-semibold text-primary-soft">
              <Sparkles size={13} /> Over 40,000 items available worldwide
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-app sm:text-6xl">
              Borrow anything,<br />from anyone.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-app-soft sm:text-lg">
              Why buy when you can borrow? Rent cameras, cars, tools, drones, and more from a global community of trusted owners — by the day, week, or month.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); navigate({ name: 'browse', q: (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value || undefined }); }}
              className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl glass p-2 shadow-card"
            >
              <input
                name="q"
                placeholder="What would you like to borrow today?"
                className="flex-1 bg-transparent px-4 py-3 text-[15px] text-app outline-none placeholder:text-app-faint"
              />
              <button type="submit" className="btn-primary !py-3">
                <PackageSearch size={18} /> Search
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-app-soft">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={16} className="text-primary" /> Secure escrow</span>
              <span className="inline-flex items-center gap-1.5"><Truck size={16} className="text-primary" /> Delivery or pickup</span>
              <span className="inline-flex items-center gap-1.5"><Zap size={16} className="text-primary" /> Instant booking</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        {/* Categories */}
        <Section title="Popular categories" subtitle="Find the right gear for any occasion" action={{ label: 'Browse all', onClick: () => navigate({ name: 'browse' }) }}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {CATEGORIES.slice(0, 7).map((c, i) => (
              <button
                key={c.id}
                onClick={() => navigate({ name: 'browse', category: c.id })}
                className="group surface flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all hover:-translate-y-1 hover:shadow-card-hover animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-tint text-primary-soft transition-transform group-hover:scale-110">
                  <CategoryIcon name={c.icon} className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-display text-sm font-semibold text-app">{c.name}</span>
                  <span className="mt-0.5 block text-xs text-app-faint">{c.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Trending */}
        <Section title="Trending rentals" subtitle="What everyone's borrowing this week" action={{ label: 'View all', onClick: () => navigate({ name: 'browse' }) }}>
          <ListingGrid listings={trending} />
        </Section>

        {/* How it works */}
        <Section title="How RentHub works" subtitle="Rent in three simple steps">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: PackageSearch, title: 'Discover & reserve', text: 'Search thousands of items, filter by location and dates, then reserve in seconds.' },
              { icon: CreditCard, title: 'Pay securely', text: 'Your payment is held in escrow and only released to the owner once your rental begins.' },
              { icon: CalendarCheck, title: 'Borrow & return', text: 'Get it delivered or pick it up, enjoy it, then return on time. Deposits refund automatically.' },
            ].map((step, i) => (
              <div key={i} className="surface rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white">
                  <step.icon size={22} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-app">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-app-soft">{step.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Top rated + recent */}
        <Section title="Top rated" subtitle="The highest-reviewed items on RentHub" action={{ label: 'View all', onClick: () => navigate({ name: 'browse' }) }}>
          <ListingGrid listings={topRated} />
        </Section>

        <Section title="Recently added" subtitle="Fresh listings from owners around the world" action={{ label: 'View all', onClick: () => navigate({ name: 'browse' }) }}>
          <ListingGrid listings={recent} />
        </Section>

        {/* Popular cities */}
        <Section title="Popular cities" subtitle="Explore rentals near you or wherever you're headed">
          <div className="flex flex-wrap gap-2.5">
            {POPULAR_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => navigate({ name: 'browse', q: city })}
                className="chip hover:chip-active"
              >
                {city}
              </button>
            ))}
          </div>
        </Section>

        {/* Testimonials */}
        <Section title="Loved by renters and owners" subtitle="Join a community that's redefining access over ownership">
          <div className="grid gap-4 md:grid-cols-3">
             {[
               { quote: 'I rented a $3,000 camera for a weekend shoot for under $200. The owner was a pro and walked me through everything.', name: 'Maya R.', role: 'Photographer, NYC' },
               { quote: 'My power tools sit idle 90% of the time. Listing them on RentHub turned my garage into a steady side income.', name: 'James T.', role: 'Owner, Austin' },
               { quote: 'Rented a Tesla for a road trip for a third of the cost of a rental agency. Escrow made it feel totally safe.', name: 'Lena V.', role: 'Renter, Seattle' },
             ].map((t, i) => (
              <div key={i} className="surface rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Quote size={24} className="text-primary/40" />
                <p className="mt-3 text-[15px] leading-relaxed text-app">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <img src={`https://i.pravatar.cc/80?img=${i + 20}`} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-app">{t.name}</p>
                    <p className="text-xs text-app-faint">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section title="Frequently asked questions" subtitle="Everything you need to know before you borrow">
          <div className="mx-auto max-w-3xl divide-y divide-app/10 rounded-2xl surface">
            {[
               { q: 'How does the security deposit work?', a: 'A refundable deposit is held alongside your rental payment. Once the item is returned undamaged, the deposit is released automatically within 3–5 business days.' },
               { q: 'Am I covered if something breaks?', a: 'Every rental is backed by RentHub Protection. Optional insurance covers accidental damage, and our dispute resolution team mediates any disagreement between renter and owner.' },
               { q: 'Can I extend my rental?', a: 'Yes — request an extension from your dashboard at any time before your return date. If the owner approves, your rental is extended and the additional cost is charged instantly.' },
               { q: 'How do owners get paid?', a: 'Owners receive payouts to their connected bank account 24 hours after the rental ends successfully. RentHub deducts a small platform fee from each payout.' },
            ].map((f, i) => (
              <details key={i} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold text-app">
                  {f.q}
                  <ArrowRight size={18} className="shrink-0 text-app-faint transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-app-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* Newsletter */}
        <section className="my-16 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-soft p-8 text-white sm:p-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Get the best rentals in your inbox</h2>
            <p className="mt-2 text-white/80">New listings, seasonal deals, and borrowing tips — once a week, no spam.</p>
            {subscribed ? (
              <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 font-semibold">
                <ShieldCheck size={18} /> You're subscribed. Welcome aboard!
              </p>
            ) : (
              <form onSubmit={subscribe} className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-2xl bg-white/15 p-2 backdrop-blur">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 bg-transparent px-4 py-2.5 text-white outline-none placeholder:text-white/60"
                />
                <button type="submit" className="rounded-xl bg-white px-5 py-2.5 font-semibold text-primary-soft transition-transform hover:scale-105">
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Section({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: { label: string; onClick: () => void }; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-app sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-app-soft">{subtitle}</p>}
        </div>
        {action && (
          <button onClick={action.onClick} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-soft transition-colors hover:text-primary">
            {action.label} <ArrowRight size={15} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
