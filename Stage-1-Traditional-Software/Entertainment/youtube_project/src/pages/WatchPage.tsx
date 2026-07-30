import { useVideo, useVideos } from '@/lib/hooks';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfo from '@/components/VideoInfo';
import CommentSection from '@/components/CommentSection';
import VideoCard from '@/components/VideoCard';

interface WatchPageProps {
  videoId: string;
}

export default function WatchPage({ videoId }: WatchPageProps) {
  const { video, loading, error } = useVideo(videoId);
  const { videos: allVideos, loading: recLoading } = useVideos();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <div className="aspect-video w-full rounded-xl shimmer-bg" />
          <div className="h-6 w-3/4 rounded shimmer-bg" />
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full shimmer-bg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded shimmer-bg" />
              <div className="h-3 w-1/4 rounded shimmer-bg" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="aspect-video w-40 rounded-lg shimmer-bg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full rounded shimmer-bg" />
                <div className="h-3 w-1/2 rounded shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <p className="text-lg text-white">Video not found</p>
        <p className="text-sm text-brand-subtle">This video may have been removed or is unavailable.</p>
      </div>
    );
  }

  const recommendations = allVideos.filter(v => v.id !== videoId).slice(0, 12);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
      <div className="min-w-0">
        <VideoPlayer src={video.video_url} duration={video.duration} title={video.title} />
        <div className="mt-3">
          <VideoInfo video={video} />
        </div>
        <CommentSection videoId={videoId} />
      </div>

      {/* Recommendations sidebar */}
      <div className="space-y-3">
        <h3 className="text-base font-medium text-white">Up next</h3>
        {recLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="aspect-video w-40 rounded-lg shimmer-bg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full rounded shimmer-bg" />
                <div className="h-3 w-1/2 rounded shimmer-bg" />
              </div>
            </div>
          ))
        ) : (
          recommendations.map((v) => (
            <VideoCard key={v.id} video={v} variant="compact" />
          ))
        )}
      </div>
    </div>
  );
}
