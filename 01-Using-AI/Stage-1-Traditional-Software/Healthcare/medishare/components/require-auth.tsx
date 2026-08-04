'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setRedirecting(true);
      router.push('/login?next=' + encodeURIComponent(window.location.pathname));
    }
  }, [loading, user, router]);

  if (loading || (!user && !redirecting)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Redirecting to sign in...
      </div>
    );
  }
  return <>{children}</>;
}
