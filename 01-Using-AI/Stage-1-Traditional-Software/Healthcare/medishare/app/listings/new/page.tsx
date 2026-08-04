import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ListingForm } from '@/components/listing-form';
import { RequireAuth } from '@/components/require-auth';

export const metadata = { title: 'Donate equipment — MedShare' };

export default function NewListingPage() {
  return (
    <RequireAuth>
      <div className="container max-w-3xl py-10">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold tracking-tight">Donate or lend equipment</h1>
        <p className="mt-2 text-muted-foreground">
          Share unused medical equipment with someone who needs it. It only takes a few minutes.
        </p>
        <div className="mt-8">
          <ListingForm />
        </div>
      </div>
    </RequireAuth>
  );
}
