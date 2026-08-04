import type { CartItem, Listing } from './types';

export interface PriceBreakdown {
  rental: number;
  delivery: number;
  insurance: number;
  platformFee: number;
  tax: number;
  deposit: number;
  total: number;
  totalDueToday: number;
}

const TAX_RATE = 0.08;
const PLATFORM_FEE_RATE = 0.05;
const INSURANCE_DAILY = 6;

export function priceForDays(listing: Listing, days: number): number {
  if (days >= 30 && listing.priceMonthly) {
    const months = Math.floor(days / 30);
    const remainder = days % 30;
    const weekly = Math.floor(remainder / 7);
    const daily = remainder % 7;
    return months * listing.priceMonthly + weekly * listing.priceWeekly + daily * listing.priceDaily;
  }
  if (days >= 7 && listing.priceWeekly) {
    const weeks = Math.floor(days / 7);
    const daily = days % 7;
    return weeks * listing.priceWeekly + daily * listing.priceDaily;
  }
  return days * listing.priceDaily;
}

export function calculatePrice(listing: Listing, item: CartItem): PriceBreakdown {
  const days = Math.max(item.days, 1);
  const rental = priceForDays(listing, days) * item.quantity;
  const delivery = item.delivery ? listing.shippingCost : 0;
  const insurance = item.insurance ? INSURANCE_DAILY * days * item.quantity : 0;
  const platformFee = Math.round(rental * PLATFORM_FEE_RATE);
  const tax = Math.round((rental + delivery + insurance) * TAX_RATE);
  const deposit = listing.deposit * item.quantity;
  const total = rental + delivery + insurance + platformFee + tax;
  return {
    rental, delivery, insurance, platformFee, tax, deposit,
    total, totalDueToday: total,
  };
}

export function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDateRange(start: string, days: number): string {
  const startDate = new Date(start);
  const endDate = addDays(startDate, days);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', opts)} – ${endDate.toLocaleDateString('en-US', opts)}`;
}
