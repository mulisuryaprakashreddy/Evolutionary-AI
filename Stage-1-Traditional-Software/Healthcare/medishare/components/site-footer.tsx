import Link from 'next/link';
import { HeartHandshake, Mail, Globe } from 'lucide-react';

const LINKS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: 'Platform',
    items: [
      { label: 'Browse equipment', href: '/browse' },
      { label: 'Categories', href: '/categories' },
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Donate equipment', href: '/listings/new' },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Success stories', href: '/stories' },
      { label: 'Healthcare partners', href: '/partners' },
      { label: 'Volunteer', href: '/volunteer' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Safety & trust', href: '/safety' },
      { label: 'Contact', href: '/contact' },
      { label: 'Emergency info', href: '/emergency' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <HeartHandshake className="h-5 w-5" />
              </span>
               <span className="font-display text-xl font-bold tracking-tight">MedShare</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A free community platform connecting donors with patients, families, caregivers,
              NGOs, and hospitals — so unused medical equipment reaches the people who need it most.
            </p>
             <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
               <Mail className="h-4 w-4" /> hello@medshare.org
             </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" /> Available worldwide
            </div>
          </div>
          {LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} MedShare. A community project — no payments, no fees.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/guidelines" className="hover:text-foreground">Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
