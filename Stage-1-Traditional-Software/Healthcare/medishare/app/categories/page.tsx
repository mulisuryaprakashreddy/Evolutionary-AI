import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { getStats } from '@/lib/queries';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Categories — MedShare' };

export default async function CategoriesPage() {
  const stats = await getStats();
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Browse by need</span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Equipment categories</h1>
        <p className="mt-3 text-muted-foreground">
          Find the medical equipment you need across {CATEGORIES.length} categories — from mobility aids to respiratory support.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {CATEGORIES.map((cat) => (
          <div key={cat.slug} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <cat.icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className="font-display text-xl font-semibold">{cat.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <span key={item} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">{item}</span>
                  ))}
                </div>
                <Button asChild variant="ghost" size="sm" className="mt-4 gap-1.5 px-0 text-primary">
                  <Link href={`/browse?category=${cat.slug}`}>Browse {cat.name} <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
