'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CATEGORIES, CONDITIONS, DONATION_TYPES } from '@/lib/constants';

export function BrowseFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
      router.push(`/browse?${params.toString()}`);
    },
    [router, sp],
  );

  const toggle = (key: string) => {
    const params = new URLSearchParams(sp.toString());
    if (params.get(key) === 'true') params.delete(key);
    else params.set(key, 'true');
    router.push(`/browse?${params.toString()}`);
  };

  const clearAll = () => router.push('/browse');

  const hasFilters = sp.toString() !== '';

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="f-q" className="text-xs font-medium text-muted-foreground">
            Search
          </Label>
          <Input
            id="f-q"
            defaultValue={sp.get('q') ?? ''}
            placeholder="Equipment or location"
            className="mt-1.5 h-9"
            onChange={(e) => update('q', e.target.value || null)}
          />
        </div>

        <FilterGroup label="Category">
          <Select
            value={sp.get('category') ?? ''}
            onValueChange={(v) => update('category', v || null)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>

        <FilterGroup label="Condition">
          <Select
            value={sp.get('condition') ?? ''}
            onValueChange={(v) => update('condition', v || null)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any condition" />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>

        <FilterGroup label="Donation type">
          <Select
            value={sp.get('donationType') ?? ''}
            onValueChange={(v) => update('donationType', v || null)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent>
              {DONATION_TYPES.map((d) => (
                <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterGroup>

        <FilterGroup label="Sort by">
          <Select
            value={sp.get('sort') || 'newest'}
            onValueChange={(v) => update('sort', v === 'newest' ? null : v)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </FilterGroup>

        <div className="space-y-3 border-t border-border pt-4">
          <CheckRow
            checked={sp.get('shipping') === 'true'}
            onChange={() => toggle('shipping')}
            label="Shipping available"
          />
          <CheckRow
            checked={sp.get('pickup') === 'true'}
            onChange={() => toggle('pickup')}
            label="Pickup available"
          />
          <CheckRow
            checked={sp.get('status') === 'available'}
            onChange={() => update('status', sp.get('status') === 'available' ? null : 'available')}
            label="Available only"
          />
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}
