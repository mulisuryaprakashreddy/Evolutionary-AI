import {
  Accessibility,
  Bed,
  Wind,
  Activity,
  Baby,
  Dumbbell,
  Bath,
  Boxes,
  type LucideIcon,
} from 'lucide-react';

export type CategorySlug =
  | 'mobility'
  | 'beds'
  | 'respiratory'
  | 'monitoring'
  | 'infant-care'
  | 'rehabilitation'
  | 'bathroom-assistance'
  | 'other';

export type Category = {
  slug: CategorySlug;
  name: string;
  description: string;
  icon: LucideIcon;
  items: string[];
};

export const CATEGORIES: Category[] = [
  {
    slug: 'mobility',
    name: 'Mobility',
    description: 'Wheelchairs, walkers, crutches, and walking sticks',
    icon: Accessibility,
    items: ['Wheelchairs', 'Walkers', 'Crutches', 'Walking Sticks', 'Mobility Scooters'],
  },
  {
    slug: 'beds',
    name: 'Beds',
    description: 'Hospital beds, patient beds, and mattresses',
    icon: Bed,
    items: ['Hospital Beds', 'Patient Beds', 'Medical Mattresses'],
  },
  {
    slug: 'respiratory',
    name: 'Respiratory',
    description: 'Oxygen concentrators, cylinders, nebulizers, CPAP & BiPAP',
    icon: Wind,
    items: ['Oxygen Concentrators', 'Oxygen Cylinders', 'Nebulizers', 'CPAP', 'BiPAP'],
  },
  {
    slug: 'monitoring',
    name: 'Monitoring',
    description: 'Blood pressure, pulse oximeters, thermometers, glucometers',
    icon: Activity,
    items: ['Blood Pressure Monitor', 'Pulse Oximeter', 'Thermometer', 'Glucometer', 'Patient Monitors'],
  },
  {
    slug: 'infant-care',
    name: 'Infant Care',
    description: 'Pediatric wheelchairs and baby medical equipment',
    icon: Baby,
    items: ['Wheelchairs for Children', 'Baby Medical Equipment', 'Infant Monitors'],
  },
  {
    slug: 'rehabilitation',
    name: 'Rehabilitation',
    description: 'Exercise equipment and physiotherapy devices',
    icon: Dumbbell,
    items: ['Exercise Equipment', 'Physiotherapy Devices', 'Resistance Bands'],
  },
  {
    slug: 'bathroom-assistance',
    name: 'Bathroom Assistance',
    description: 'Shower chairs, commode chairs, and grab bars',
    icon: Bath,
    items: ['Shower Chairs', 'Commode Chairs', 'Grab Bars'],
  },
  {
    slug: 'other',
    name: 'Other Medical Equipment',
    description: 'Any reusable medical equipment not listed above',
    icon: Boxes,
    items: ['Home Care Equipment', 'Hearing Devices', 'Suction Machines', 'Other'],
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, Category>;

export type ConditionSlug = 'new' | 'like-new' | 'good' | 'used' | 'requires-repair';
export const CONDITIONS: { slug: ConditionSlug; label: string }[] = [
  { slug: 'new', label: 'New' },
  { slug: 'like-new', label: 'Like New' },
  { slug: 'good', label: 'Good' },
  { slug: 'used', label: 'Used' },
  { slug: 'requires-repair', label: 'Requires Repair' },
];

export type DonationTypeSlug = 'donate' | 'lend';
export const DONATION_TYPES: { slug: DonationTypeSlug; label: string; description: string }[] = [
  { slug: 'donate', label: 'Donate Permanently', description: 'Give the equipment away for good' },
  { slug: 'lend', label: 'Lend Temporarily', description: 'Loan the equipment and get it back' },
];

export type AvailabilitySlug = 'immediate' | 'specific-date';
export const AVAILABILITY: { slug: AvailabilitySlug; label: string }[] = [
  { slug: 'immediate', label: 'Immediate' },
  { slug: 'specific-date', label: 'Specific Date' },
];

export type ListingStatus = 'available' | 'reserved' | 'donated' | 'loaned' | 'returned' | 'unavailable';
export const STATUS_META: Record<ListingStatus, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-success/15 text-success border-success/30' },
  reserved: { label: 'Reserved', className: 'bg-warning/15 text-warning border-warning/30' },
  donated: { label: 'Donated', className: 'bg-primary/15 text-primary border-primary/30' },
  loaned: { label: 'Loaned', className: 'bg-accent/15 text-accent border-accent/30' },
  returned: { label: 'Returned', className: 'bg-muted text-muted-foreground border-border' },
  unavailable: { label: 'Unavailable', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export const CONTACT_METHODS = ['WhatsApp', 'Phone', 'Email'] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export function categoryLabel(slug: string): string {
  return CATEGORY_MAP[slug as CategorySlug]?.name ?? 'Other';
}
export function conditionLabel(slug: string): string {
  return CONDITIONS.find((c) => c.slug === slug)?.label ?? slug;
}
export function donationTypeLabel(slug: string): string {
  return DONATION_TYPES.find((d) => d.slug === slug)?.label ?? slug;
}
