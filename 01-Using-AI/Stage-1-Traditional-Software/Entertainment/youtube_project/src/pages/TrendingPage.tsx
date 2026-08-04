import { useTrendingVideos } from '@/lib/hooks';
import VideoCard from '@/components/VideoCard';
import { Flame, TrendingUp } from 'lucide-react';

export default function TrendingPage() {
  const { videos, loading } = useTrendingVideos();

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-4 py-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-orange-500">
          <Flame className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Trending</h1>
          <p className="text-sm text-brand-subtle">The most-watched videos right now</p>
        </div>
      </div>

      {loading ? (
        <div className="max-w-4xl space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="aspect-video w-72 shrink-0 rounded-xl shimmer-bg" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-5 w-full rounded shimmer-bg" />
                <div className="h-4 w-1/2 rounded shimmer-bg" />
                <div className="h-3 w-1/3 rounded shimmer-bg" />
                <div className="h-3 w-2/3 rounded shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl space-y-6">
          {videos.map((video, index) => (
            <div key={video.id} className="flex gap-4">
              <span className="hidden w-8 shrink-0 text-center text-2xl font-bold text-brand-subtle-2 sm:block">
                {index + 1}
              </span>
              <div className="flex-1">
                <VideoCard video={video} variant="list" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
