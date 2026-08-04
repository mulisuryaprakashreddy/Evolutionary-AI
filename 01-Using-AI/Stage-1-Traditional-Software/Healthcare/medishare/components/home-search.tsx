'use client';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function HomeSearch() {
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q') as string | null;
        router.push(`/browse${q ? `?q=${encodeURIComponent(q)}` : ''}`);
      }}
      className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-lg shadow-primary/5"
    >
      <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
      <Input
        name="q"
        placeholder="What medical equipment do you need?"
        className="border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
        autoFocus={false}
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
}
