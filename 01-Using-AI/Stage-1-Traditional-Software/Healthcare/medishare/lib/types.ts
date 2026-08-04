export type Listing = {
  id: string;
  donor_id: string;
  equipment_name: string;
  category: string;
  description: string;
  condition: string;
  quantity: number;
  images: string[];
  country: string;
  state: string;
  city: string;
  postal_code: string;
  pickup_available: boolean;
  shipping_available: boolean;
  shipping_cost: string | null;
  donation_type: string;
  availability: string;
  available_date: string | null;
  expected_return_date: string | null;
  contact_name: string;
  phone: string;
  email: string;
  preferred_contact: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; organization_name: string | null; is_verified: boolean };
};

export type Favorite = {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
};

export type Report = {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  created_at: string;
};

export type ListingInput = Omit<
  Listing,
  'id' | 'donor_id' | 'status' | 'created_at' | 'updated_at' | 'profiles'
>;
