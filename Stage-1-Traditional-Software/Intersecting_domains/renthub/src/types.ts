export type CategoryId =
  | 'electronics'
  | 'vehicles'
  | 'cameras'
  | 'computers'
  | 'gaming'
  | 'tools'
  | 'furniture'
  | 'outdoor'
  | 'sports'
  | 'fashion'
  | 'books'
  | 'music'
  | 'office'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // lucide icon name
  blurb: string;
}

export interface Owner {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  rating: number;
  reviews: number;
  joinedYear: number;
  location: string;
  responseTime: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
}

export interface Listing {
  id: string;
  name: string;
  category: CategoryId;
  brand: string;
  model: string;
  description: string;
  images: string[];
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  year: number;
  priceDaily: number;
  priceWeekly: number;
  priceMonthly: number;
  deposit: number;
  delivery: boolean;
  pickup: boolean;
  shippingCost: number;
  quantity: number;
  minDays: number;
  maxDays: number;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  location: string;
  city: string;
  insurance: boolean;
  instantBook: boolean;
  trending: boolean;
  recentlyAdded: boolean;
  topRated: boolean;
  featured: boolean;
  owner: Owner;
}

export interface CartItem {
  listingId: string;
  startDate: string;
  days: number;
  quantity: number;
  delivery: boolean;
  insurance: boolean;
}
