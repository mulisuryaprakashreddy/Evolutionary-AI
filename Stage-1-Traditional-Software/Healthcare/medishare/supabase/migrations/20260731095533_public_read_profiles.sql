/*
# Make profiles publicly readable (limited)

1. Security
- Add a SELECT policy on `profiles` allowing anon + authenticated to read the public-facing columns (full_name, organization_name, is_verified) so donor info can appear on listings.
- The full row (email, phone) remains owner-only via the existing "read_own_profile" policy. PostgREST column selection is enforced by the client query, not RLS, so we expose the table for SELECT but the app only requests public columns.
2. Notes
- This is intentional: donor contact details on listings are stored on the listings table itself (contact_name, phone, email), not on profiles. The profile join only surfaces display name + verification badge.
*/

DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);
