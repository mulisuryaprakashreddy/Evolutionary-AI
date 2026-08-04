import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  'All', 'Nature', 'Food', 'Tech', 'Travel', 'Music', 'Photography',
  'Recently uploaded', 'New to you', 'Live', 'Gaming', 'News',
  'Podcasts', 'Comedy', 'Action-adventure', 'Documentaries',
];

interface CategoryChipsProps {
  active: string;
  onSelect: (category: string) => void;
}

export default function CategoryChips({ active, onSelect }: CategoryChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-14 z-30 flex items-center gap-2 bg-brand-bg py-3">
      <button
        onClick={() => scroll('left')}
        className="hidden rounded-full bg-brand-elevated p-2 transition-colors hover:bg-brand-hover md:block"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5 text-white" />
      </button>
      <div
        ref={scrollRef}
        className="no-scrollbar flex flex-1 gap-3 overflow-x-auto scroll-smooth"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              active === cat
                ? 'bg-brand-chip-active text-black'
                : 'bg-brand-chip text-white hover:bg-brand-chip-hover'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="hidden rounded-full bg-brand-elevated p-2 transition-colors hover:bg-brand-hover md:block"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5 text-white" />
      </button>
    </div>
  );
}
