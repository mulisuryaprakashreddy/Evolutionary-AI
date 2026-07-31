import Link from 'next/link';
import { Suspense } from 'react';
import { Search, ArrowRight, HandHeart, Package, MessageSquare, ShieldCheck, Globe2, Building2, Star, TrendingUp, Users, Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/constants';
import { getRecentListings, getStats } from '@/lib/queries';
import { ListingCard } from '@/components/listing-card';
import { HomeSearch } from '@/components/home-search';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  { q: 'Is MedShare really free?', a: 'Yes. There are no fees, no payments, and no charges. Donors give or lend equipment directly to recipients. The platform only helps you find each other and connect.' },
  { q: 'How do I contact a donor?', a: 'Open any listing to see the donor’s contact details — phone, email, and a WhatsApp button. You contact them directly to arrange pickup or shipping. MedShare does not manage messages.' },
  { q: 'Can I lend equipment instead of donating it?', a: 'Absolutely. When you create a listing, choose “Lend Temporarily” and set an expected return date. The listing shows up as a loan, and you can mark it returned when it comes back.' },
  { q: 'Is the equipment safe to use?', a: 'MedShare is a community marketplace. We ask donors to describe condition honestly, and recipients to inspect equipment before use. Always consult a healthcare professional before relying on any medical device.' },
  { q: 'Can NGOs and hospitals use the platform?', a: 'Yes. Organizations can create verified profiles, post bulk requests, and run donation campaigns. Look for the verified badge on organization listings.' },
  { q: 'What can I list?', a: 'Any reusable medical equipment — wheelchairs, hospital beds, oxygen concentrators, walkers, glucometers, shower chairs, and more. If it can help someone, you can list it.' },
];

export default async function Home() {
  const [recent, stats] = await Promise.all([getRecentListings(8), getStats()]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-grid mask-fade-b opacity-60" />
        <div className="container py-20 text-center md:py-28">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-success" />
            {stats.active} active listings across {stats.countries} countries
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Give medical equipment a <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">second life</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
            Donate or lend unused medical equipment to patients, families, caregivers, NGOs, and
            hospitals — anywhere in the world. Completely free, no payments, ever.
          </p>

          <HomeSearch />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-1.5">
              <Link href="/listings/new"><HandHeart className="h-4 w-4" /> Donate equipment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5">
              <Link href="/browse"><Search className="h-4 w-4" /> Find equipment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-border/60 bg-secondary/30">
        <div className="container grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          <Stat icon={Package2} label="Equipment shared" value={stats.shared} />
          <Stat icon={TrendingUp} label="Active listings" value={stats.active} />
          <Stat icon={Users} label="Community donors" value={stats.donors} />
          <Stat icon={Globe2} label="Countries" value={stats.countries} />
        </div>
      </section>

      {/* Featured categories */}
      <section className="container py-16 md:py-20">
        <SectionHeading
          eyebrow="Browse by need"
          title="Featured categories"
          subtitle="From mobility aids to respiratory support — find the equipment you need by category."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/browse?category=${cat.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <cat.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display font-semibold">{cat.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{cat.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently added */}
      <section className="bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              align="left"
              eyebrow="Just listed"
              title="Recently added"
              subtitle="Fresh equipment ready for a new home."
            />
            <Button asChild variant="ghost" className="hidden gap-1.5 sm:flex">
              <Link href="/browse">View all <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container py-16 md:py-20">
        <SectionHeading
          eyebrow="Simple by design"
          title="How MedShare works"
          subtitle="No accounts to pay for, no middlemen. Just people helping people."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <Step
            n="01"
            icon={Package}
            title="List your equipment"
            body="Donors create a free listing with photos, condition, and location in under two minutes."
          />
          <Step
            n="02"
            icon={Search}
            title="Recipients search"
            body="Patients and families browse by category and location, then save what they need."
          />
          <Step
            n="03"
            icon={MessageSquare}
            title="Connect directly"
            body="Recipients contact the donor by phone, email, or WhatsApp to arrange pickup or shipping."
          />
        </div>
        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/how-it-works">Learn more <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Trust & partners */}
      <section className="border-y border-border/60 bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Trust & safety"
            title="Built for a community you can trust"
            subtitle="Verified organizations, honest listings, and clear safety guidance."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TrustCard icon={ShieldCheck} title="Verified donors & orgs" body="Email and phone verification, plus verified badges for NGOs and hospitals." />
            <TrustCard icon={Building2} title="Organization profiles" body="NGOs and hospitals get dedicated profiles, wishlists, and bulk request tools." />
            <TrustCard icon={Star} title="Community reporting" body="Flag suspicious listings. Our team reviews every report to keep the platform safe." />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container py-16 md:py-20">
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <div className="mx-auto mt-10 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-10 text-center text-primary-foreground md:p-16">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative">
            <h2 className="text-balance font-display text-3xl font-bold md:text-4xl">
              Join the movement
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/90">
              Get notified about new equipment in your area and platform announcements. No spam, ever.
            </p>
            <form className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                required
                placeholder="you@email.com"
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button type="submit" variant="secondary" className="shrink-0">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="font-display text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</span>
      )}
      <h2 className="mt-2 text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-balance text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Step({ n, icon: Icon, title, body }: { n: string; icon: any; title: string; body: string }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
      <span className="absolute right-5 top-5 font-display text-3xl font-bold text-muted/60">{n}</span>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function TrustCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
