import { Star } from 'lucide-react';

export function StarRating({ rating, size = 14, showNumber = false }: { rating: number; size?: number; showNumber?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - (i - 1)));
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-amber-400/30" fill="currentColor" strokeWidth={0} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-amber-400" fill="currentColor" strokeWidth={0} />
              </span>
            </span>
          );
        })}
      </span>
      {showNumber && <span className="text-sm font-semibold text-app">{rating.toFixed(1)}</span>}
    </span>
  );
}
