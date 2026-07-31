'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Loader2, ImagePlus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CATEGORIES, CONDITIONS, DONATION_TYPES, AVAILABILITY, CONTACT_METHODS } from '@/lib/constants';
import { supabase, useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';
import type { Listing } from '@/lib/types';

const schema = z.object({
  equipment_name: z.string().min(3, 'Please enter an equipment name'),
  category: z.string().min(1, 'Choose a category'),
  description: z.string().min(10, 'Please add a short description'),
  condition: z.string().min(1, 'Choose a condition'),
  quantity: z.coerce.number().int().min(1, 'At least 1'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().optional().default(''),
  pickup_available: z.boolean().default(true),
  shipping_available: z.boolean().default(false),
  shipping_cost: z.string().optional().default(''),
  donation_type: z.string().min(1, 'Choose a donation type'),
  availability: z.string().min(1, 'Choose availability'),
  available_date: z.string().optional().default(''),
  expected_return_date: z.string().optional().default(''),
  contact_name: z.string().min(1, 'Contact name is required'),
  phone: z.string().optional().default(''),
  email: z.string().email('Enter a valid email'),
  preferred_contact: z.string().min(1, 'Choose a preferred method'),
  notes: z.string().optional().default(''),
  images: z.array(z.object({ url: z.string().url('Enter a valid image URL').or(z.literal('')) })).default([]),
});

type FormValues = z.infer<typeof schema>;

export function ListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: listing
      ? {
          equipment_name: listing.equipment_name,
          category: listing.category,
          description: listing.description,
          condition: listing.condition,
          quantity: listing.quantity,
          country: listing.country,
          state: listing.state,
          city: listing.city,
          postal_code: listing.postal_code,
          pickup_available: listing.pickup_available,
          shipping_available: listing.shipping_available,
          shipping_cost: listing.shipping_cost ?? '',
          donation_type: listing.donation_type,
          availability: listing.availability,
          available_date: listing.available_date ?? '',
          expected_return_date: listing.expected_return_date ?? '',
          contact_name: listing.contact_name,
          phone: listing.phone,
          email: listing.email,
          preferred_contact: listing.preferred_contact,
          notes: listing.notes ?? '',
          images: (listing.images || []).map((url) => ({ url })),
        }
      : {
          equipment_name: '',
          category: '',
          description: '',
          condition: '',
          quantity: 1,
          country: '',
          state: '',
          city: '',
          postal_code: '',
          pickup_available: true,
          shipping_available: false,
          shipping_cost: '',
          donation_type: 'donate',
          availability: 'immediate',
          available_date: '',
          expected_return_date: '',
          contact_name: profile?.full_name || profile?.organization_name || '',
          phone: profile?.phone || '',
          email: user?.email || '',
          preferred_contact: 'Email',
          notes: '',
          images: [{ url: '' }],
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'images' });
  const donationType = watch('donation_type');
  const availability = watch('availability');

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast.info('Please sign in to create a listing');
      router.push('/login');
      return;
    }
    if (listing && listing.donor_id !== user.id) {
      toast.error('You can only edit your own listings');
      router.push('/dashboard');
      return;
    }
    setBusy(true);
    const images = values.images.map((i) => i.url).filter(Boolean);
    if (images.length === 0) {
      toast.error('Please add at least one image URL');
      setBusy(false);
      return;
    }
    const payload = {
      donor_id: user.id,
      equipment_name: values.equipment_name,
      category: values.category,
      description: values.description,
      condition: values.condition,
      quantity: values.quantity,
      images,
      country: values.country,
      state: values.state || '',
      city: values.city,
      postal_code: values.postal_code || '',
      pickup_available: values.pickup_available,
      shipping_available: values.shipping_available,
      shipping_cost: values.shipping_cost || null,
      donation_type: values.donation_type,
      availability: values.availability,
      available_date: values.available_date || null,
      expected_return_date: values.donation_type === 'lend' ? values.expected_return_date || null : null,
      contact_name: values.contact_name,
      phone: values.phone || '',
      email: values.email,
      preferred_contact: values.preferred_contact,
      notes: values.notes || null,
      status: listing?.status ?? 'available',
    };

    const { data, error } = listing
      ? await supabase.from('listings').update(payload).eq('id', listing.id).select('id').single()
      : await supabase.from('listings').insert(payload).select('id').single();

    setBusy(false);
    if (error) {
      toast.error('Could not save listing', { description: error.message });
      return;
    }
    toast.success(listing ? 'Listing updated' : 'Listing created');
    router.push(`/listings/${data!.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Equipment details */}
      <Section title="Equipment details" subtitle="Tell recipients what you are sharing.">
        <Grid>
          <Field label="Equipment name" error={errors.equipment_name?.message} full>
            <Input {...register('equipment_name')} placeholder="e.g. Electric Wheelchair" />
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <Select value={watch('category')} onValueChange={(v) => setValue('category', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Condition" error={errors.condition?.message}>
            <Select value={watch('condition')} onValueChange={(v) => setValue('condition', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue placeholder="Choose condition" /></SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Quantity" error={errors.quantity?.message}>
            <Input type="number" min={1} {...register('quantity')} />
          </Field>
        </Grid>
        <Field label="Description" error={errors.description?.message} full>
          <Textarea rows={4} {...register('description')} placeholder="Describe the equipment, how it was used, and its current condition..." />
        </Field>
      </Section>

      {/* Images */}
      <Section title="Images" subtitle="Paste image URLs (direct links ending in .jpg, .png, etc.).">
        <div className="space-y-3">
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <div className="relative flex-1">
                <ImagePlus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register(`images.${i}.url`)}
                  placeholder="https://example.com/equipment-photo.jpg"
                  className="pl-9"
                />
              </div>
              {fields.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors.images && typeof errors.images.message === 'string' && (
            <p className="text-sm text-destructive">{errors.images.message}</p>
          )}
          <Button type="button" variant="outline" size="sm" onClick={() => append({ url: '' })} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add another image
          </Button>
        </div>
      </Section>

      {/* Location & delivery */}
      <Section title="Location & delivery" subtitle="Where is the equipment and how can it reach a recipient?">
        <Grid>
          <Field label="Country" error={errors.country?.message}>
            <Input {...register('country')} placeholder="e.g. United States" />
          </Field>
          <Field label="State / Province" error={errors.state?.message}>
            <Input {...register('state')} placeholder="e.g. California" />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Input {...register('city')} placeholder="e.g. Los Angeles" />
          </Field>
          <Field label="Postal code" error={errors.postal_code?.message}>
            <Input {...register('postal_code')} placeholder="e.g. 90001" />
          </Field>
        </Grid>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
            <Checkbox checked={watch('pickup_available')} onCheckedChange={(v) => setValue('pickup_available', !!v)} />
            <div>
              <div className="text-sm font-medium">Pickup available</div>
              <div className="text-xs text-muted-foreground">Recipient can collect in person</div>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
            <Checkbox checked={watch('shipping_available')} onCheckedChange={(v) => setValue('shipping_available', !!v)} />
            <div>
              <div className="text-sm font-medium">Shipping available</div>
              <div className="text-xs text-muted-foreground">You can ship it to the recipient</div>
            </div>
          </label>
        </div>
        {watch('shipping_available') && (
          <Field label="Estimated shipping cost (optional)" full>
            <Input {...register('shipping_cost')} placeholder="e.g. $40 or Negotiable" />
          </Field>
        )}
      </Section>

      {/* Donation type & availability */}
      <Section title="Donation type & availability" subtitle="Is this a permanent gift or a temporary loan?">
        <Grid>
          <Field label="Donation type" error={errors.donation_type?.message}>
            <Select value={watch('donation_type')} onValueChange={(v) => setValue('donation_type', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DONATION_TYPES.map((d) => <SelectItem key={d.slug} value={d.slug}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Availability" error={errors.availability?.message}>
            <Select value={watch('availability')} onValueChange={(v) => setValue('availability', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AVAILABILITY.map((a) => <SelectItem key={a.slug} value={a.slug}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          {availability === 'specific-date' && (
            <Field label="Available from" full>
              <Input type="date" {...register('available_date')} />
            </Field>
          )}
          {donationType === 'lend' && (
            <Field label="Expected return date" full>
              <Input type="date" {...register('expected_return_date')} />
            </Field>
          )}
        </Grid>
      </Section>

      {/* Contact */}
      <Section title="Contact information" subtitle="Recipients will use these details to reach you directly.">
        <Grid>
          <Field label="Contact name" error={errors.contact_name?.message}>
            <Input {...register('contact_name')} placeholder="Your name or organization" />
          </Field>
          <Field label="Preferred contact method" error={errors.preferred_contact?.message}>
            <Select value={watch('preferred_contact')} onValueChange={(v) => setValue('preferred_contact', v, { shouldValidate: true })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTACT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phone number" error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="e.g. +1-555-0100" />
          </Field>
          <Field label="Email address" error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="you@email.com" />
          </Field>
        </Grid>
        <Field label="Additional notes (optional)" full>
          <Textarea rows={3} {...register('notes')} placeholder="e.g. Please call between 9 AM and 6 PM." />
        </Field>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={busy} className="gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {listing ? 'Save changes' : 'Submit listing'}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      <Separator className="my-5" />
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  error,
  children,
  full,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
