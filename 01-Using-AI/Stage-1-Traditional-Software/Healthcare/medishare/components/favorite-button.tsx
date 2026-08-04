'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase, useAuth } from '@/components/auth-provider';
import { toast } from 'sonner';

export function FavoriteButton({
  listingId,
  favorited: initial,
  className,
  size = 20,
}: {
  listingId: string;
  favorited: boolean;
  className?: string;
  size?: number;
}) {
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initial);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Sign in to save favorites', { description: 'Create a free account to save equipment.' });
      return;
    }
    setBusy(true);
    if (favorited) {
      await supabase.from('favorites').delete().eq('listing_id', listingId).eq('user_id', user.id);
      setFavorited(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ listing_id: listingId, user_id: user.id });
      setFavorited(true);
    }
    setBusy(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-background/80 p-2 text-foreground shadow-sm backdrop-blur transition hover:scale-110 disabled:opacity-50',
        className,
      )}
    >
      <Heart
        style={{ width: size, height: size }}
        className={cn(favorited && 'fill-destructive text-destructive')}
      />
    </button>
  );
}
