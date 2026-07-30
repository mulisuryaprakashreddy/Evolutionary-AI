import { useState } from 'react';
import { useVideos } from '@/lib/hooks';
import VideoCard from '@/components/VideoCard';
import CategoryChips from '@/components/CategoryChips';

export default function HomePage() {
  const [category, setCategory] = useState('All');
  const { videos, loading, error } = useVideos(category);

  return (
    <div className="animate-fade-in">
      <CategoryChips active={category} onSelect={setCategory} />
      {error ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-brand-subtle">Couldn't load videos. Please try again.</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 px-0 py-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video w-full rounded-xl shimmer-bg" />
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full shimmer-bg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full rounded shimmer-bg" />
                  <div className="h-3 w-2/3 rounded shimmer-bg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 px-0 py-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
