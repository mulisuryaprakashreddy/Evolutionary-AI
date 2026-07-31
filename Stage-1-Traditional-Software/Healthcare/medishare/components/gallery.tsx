'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
        No images
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div
          className="relative aspect-[4/3] cursor-zoom-in bg-muted"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={images[active]}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            priority
          />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 p-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  'relative h-16 w-20 overflow-hidden rounded-lg border-2 transition',
                  i === active ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
                )}
              >
                <Image src={img} alt={`${alt} ${i + 1}`} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute right-4 top-4 text-white/80 hover:text-white" onClick={() => setLightbox(false)}>
            <X className="h-7 w-7" />
          </button>
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + images.length) % images.length); }}
              >
                <ChevronLeft className="h-9 w-9" />
              </button>
              <button
                className="absolute right-4 text-white/80 hover:text-white"
                onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % images.length); }}
              >
                <ChevronRight className="h-9 w-9" />
              </button>
            </>
          )}
          <div className="relative aspect-[4/3] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt={alt} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
