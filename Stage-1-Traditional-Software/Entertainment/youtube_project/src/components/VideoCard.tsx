import { useState } from 'react';
import { useRouter } from '@/lib/router';
import { formatViews, timeAgo } from '@/lib/format';
import type { VideoWithChannel } from '@/lib/types';

interface VideoCardProps {
  video: VideoWithChannel;
  variant?: 'grid' | 'list' | 'compact';
}

export default function VideoCard({ video, variant = 'grid' }: VideoCardProps) {
  const { navigate } = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);

  if (variant === 'list') {
    return (
      <div className="flex cursor-pointer gap-3" onClick={() => navigate({ name: 'watch', videoId: video.id })}>
        <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-xl bg-brand-elevated sm:w-60">
          {!imgLoaded && <div className="shimmer-bg h-full w-full" />}
          <img
            src={video.thumbnail_url}
            alt={video.title}
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 pt-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white sm:text-base">{video.title}</h3>
          <p className="text-xs text-brand-subtle">
            {video.channel.name} · {formatViews(video.views)} views · {timeAgo(video.created_at)}
          </p>
          <p className="line-clamp-2 hidden text-xs text-brand-subtle sm:block">{video.description}</p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex cursor-pointer gap-2" onClick={() => navigate({ name: 'watch', videoId: video.id })}>
        <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-brand-elevated">
          {!imgLoaded && <div className="shimmer-bg h-full w-full" />}
          <img
            src={video.thumbnail_url}
            alt={video.title}
            onLoad={() => setImgLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white">{video.title}</h3>
          <p className="text-xs text-brand-subtle">{video.channel.name}</p>
          <p className="text-xs text-brand-subtle">{formatViews(video.views)} views</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer" onClick={() => navigate({ name: 'watch', videoId: video.id })}>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-brand-elevated transition-all duration-200 group-hover:rounded-none sm:group-hover:rounded-xl">
        {!imgLoaded && <div className="shimmer-bg h-full w-full" />}
        <img
          src={video.thumbnail_url}
          alt={video.title}
          onLoad={() => setImgLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.02] ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.duration}
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate({ name: 'channel', channelId: video.channel.id });
          }}
          className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-brand-elevated transition-transform hover:scale-105"
        >
          <img src={video.channel.avatar_url} alt={video.channel.name} className="h-full w-full object-cover" />
        </button>
        <div className="flex-1 overflow-hidden">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-white">{video.title}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate({ name: 'channel', channelId: video.channel.id });
            }}
            className="mt-1 block text-xs text-brand-subtle transition-colors hover:text-white"
          >
            {video.channel.name}
          </button>
          <p className="text-xs text-brand-subtle">
            {formatViews(video.views)} views · {timeAgo(video.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
