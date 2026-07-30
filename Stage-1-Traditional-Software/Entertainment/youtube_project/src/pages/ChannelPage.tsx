import { useChannel, useChannelVideos } from '@/lib/hooks';
import VideoCard from '@/components/VideoCard';
import { formatSubs, formatViews } from '@/lib/format';

interface ChannelPageProps {
  channelId: string;
}

export default function ChannelPage({ channelId }: ChannelPageProps) {
  const { channel, loading } = useChannel(channelId);
  const { videos, loading: vLoading } = useChannelVideos(channelId);

  if (loading) {
    return (
      <div className="-mx-4 -mt-4 animate-pulse">
        <div className="h-32 w-full bg-brand-elevated sm:h-48" />
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex gap-6">
            <div className="h-24 w-24 rounded-full bg-brand-elevated" />
            <div className="space-y-3 pt-4">
              <div className="h-6 w-48 rounded bg-brand-elevated" />
              <div className="h-4 w-32 rounded bg-brand-elevated" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-brand-subtle">Channel not found.</p>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-4 animate-fade-in">
      {/* Banner */}
      <div className="relative h-32 w-full overflow-hidden bg-brand-elevated sm:h-48 md:h-56">
        <img src={channel.banner_url || ''} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Channel header */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-brand-elevated ring-4 ring-brand-bg sm:h-32 sm:w-32">
            <img src={channel.avatar_url} alt={channel.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{channel.name}</h1>
            <p className="mt-1 text-sm text-brand-subtle">
              @{channel.handle} · {formatSubs(channel.subscribers)} · {videos.length} videos
            </p>
            <p className="mt-2 max-w-2xl text-sm text-brand-subtle line-clamp-2">{channel.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <button className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90">
                Subscribe
              </button>
              <button className="rounded-full bg-brand-elevated px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-brand-border">
          {['Videos', 'Shorts', 'Live', 'Playlists', 'Community', 'About'].map((tab, i) => (
            <button
              key={tab}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                i === 0 ? 'border-white text-white' : 'border-transparent text-brand-subtle hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Videos grid */}
        <div className="py-6">
          {vLoading ? (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-video w-full rounded-xl shimmer-bg" />
                  <div className="h-3 w-full rounded shimmer-bg" />
                  <div className="h-3 w-2/3 rounded shimmer-bg" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <p className="py-12 text-center text-sm text-brand-subtle">No videos yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={{ ...video, channel }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats footer */}
        <div className="border-t border-brand-border py-6 text-sm text-brand-subtle">
          <p className="font-medium text-white">{formatViews(channel.subscribers)} total subscribers</p>
          <p className="mt-1">{channel.description}</p>
          <p className="mt-3 text-xs">Joined {new Date(channel.created_at).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
