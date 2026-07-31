import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ListingForm } from '@/components/listing-form';
import { RequireAuth } from '@/components/require-auth';
import { getListing } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  return (
    <RequireAuth>
      <div className="container max-w-3xl py-10">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">Edit listing</h1>
        <p className="mt-2 text-muted-foreground">Update the details of your equipment listing.</p>
        <div className="mt-8">
          <ListingForm listing={listing} />
        </div>
      </div>
    </RequireAuth>
  );
}
