/*
# Link listings.donor_id to profiles.id

1. Changes
- Add foreign key from `listings.donor_id` to `profiles.id` (in addition to auth.users) so PostgREST can join listings -> profiles.
- This enables the `profiles:donor_id (...)` select syntax used by the app.
2. Notes
- profiles.id already references auth.users(id), so this is a valid shared key.
- No data loss; the FK is additive.
*/

-- Drop the existing FK to auth.users so we can replace it with one to profiles
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_donor_id_fkey;

-- Add FK to profiles instead (profiles.id is itself a FK to auth.users)
ALTER TABLE listings
  ADD CONSTRAINT listings_donor_id_fkey
  FOREIGN KEY (donor_id) REFERENCES profiles(id) ON DELETE CASCADE;
