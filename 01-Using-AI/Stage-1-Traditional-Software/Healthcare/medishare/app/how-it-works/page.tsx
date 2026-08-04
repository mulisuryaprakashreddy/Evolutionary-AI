import Link from 'next/link';
import { Package, Search, MessageSquare, HandHeart, ShieldCheck, Globe2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'How it works — MedShare' };

const STEPS = [
  { icon: Package, title: '1. Create a listing', body: 'Sign up for free and tell us about the equipment you want to share. Add photos, condition, and your location — it takes under two minutes.' },
  { icon: Search, title: '2. Recipients search', body: 'Patients, families, and organizations browse by category and location. They save what they need and reach out when ready.' },
  { icon: MessageSquare, title: '3. Connect directly', body: 'Recipients contact you by phone, email, or WhatsApp using the details on your listing. You arrange pickup or shipping together.' },
  { icon: HandHeart, title: '4. Equipment finds a home', body: 'Mark your listing as donated or loaned. For loans, set an expected return date and mark it returned when it comes back.' },
];

export default function HowItWorksPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Simple by design</span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">How MedShare works</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          No payments, no middlemen, no fees. Just people helping people by sharing the medical equipment they no longer need.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <s.icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-secondary/30 p-8">
          <ShieldCheck className="h-8 w-8 text-accent" />
          <h2 className="mt-4 font-display text-2xl font-bold">For donors</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>• Create unlimited free listings</li>
            <li>• Choose to donate permanently or lend temporarily</li>
            <li>• Manage status: available, reserved, donated, loaned, returned</li>
            <li>• Get verified badges for organizations</li>
            <li>• See your donation history</li>
          </ul>
          <Button asChild className="mt-6 gap-1.5"><Link href="/listings/new"><HandHeart className="h-4 w-4" /> Donate equipment</Link></Button>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/30 p-8">
          <Globe2 className="h-8 w-8 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-bold">For recipients</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>• Browse and search worldwide, no account needed</li>
            <li>• Filter by category, condition, location, and delivery</li>
            <li>• Save favorites and contact donors directly</li>
            <li>• Report suspicious listings</li>
            <li>• Works on any device, anywhere</li>
          </ul>
          <Button asChild variant="outline" className="mt-6 gap-1.5"><Link href="/browse"><Search className="h-4 w-4" /> Find equipment <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </div>
  );
}
