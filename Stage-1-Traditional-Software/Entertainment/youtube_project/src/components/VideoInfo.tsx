import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Share2, Download, Scissors, MoreHorizontal } from 'lucide-react';
import { formatViews, formatViewsFull, timeAgo } from '@/lib/format';
import type { VideoWithChannel } from '@/lib/types';
import { useRouter } from '@/lib/router';

interface VideoInfoProps {
  video: VideoWithChannel;
}

export default function VideoInfo({ video }: VideoInfoProps) {
  const { navigate } = useRouter();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  const likeCount = video.likes + (liked ? 1 : 0);

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-medium leading-snug text-white sm:text-xl">{video.title}</h1>

      {/* Channel row + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ name: 'channel', channelId: video.channel.id })}
            className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-elevated transition-transform hover:scale-105"
          >
            <img src={video.channel.avatar_url} alt={video.channel.name} className="h-full w-full object-cover" />
          </button>
          <div className="flex flex-col">
            <button
              onClick={() => navigate({ name: 'channel', channelId: video.channel.id })}
              className="text-left text-sm font-medium text-white hover:text-brand-subtle"
            >
              {video.channel.name}
            </button>
            <span className="text-xs text-brand-subtle">{formatViews(video.channel.subscribers)} subscribers</span>
          </div>
          <button
            onClick={() => setSubscribed(!subscribed)}
            className={`ml-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              subscribed
                ? 'bg-brand-elevated text-white hover:bg-brand-hover'
                : 'bg-white text-black hover:bg-white/90'
            }`}
          >
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center overflow-hidden rounded-full bg-brand-elevated">
            <button
              onClick={() => { setLiked(!liked); if (disliked) setDisliked(false); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-white' : ''}`} />
              {formatViews(likeCount)}
            </button>
            <div className="h-6 w-px bg-brand-border" />
            <button
              onClick={() => { setDisliked(!disliked); if (liked) setLiked(false); }}
              className="px-4 py-2 transition-colors hover:bg-brand-hover"
              aria-label="Dislike"
            >
              <ThumbsDown className={`h-5 w-5 text-white ${disliked ? 'fill-white' : ''}`} />
            </button>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-brand-elevated px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover">
            <Share2 className="h-5 w-5" /> Share
          </button>
          <button className="flex items-center gap-2 rounded-full bg-brand-elevated px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover">
            <Download className="h-5 w-5" /> Download
          </button>
          <button className="hidden items-center gap-2 rounded-full bg-brand-elevated px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover sm:flex">
            <Scissors className="h-5 w-5" /> Clip
          </button>
          <button className="rounded-full bg-brand-elevated p-2 text-white transition-colors hover:bg-brand-hover" aria-label="More">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Description box */}
      <div
        className={`cursor-pointer rounded-xl bg-brand-elevated px-3 py-3 transition-colors hover:bg-brand-hover ${showDesc ? '' : ''}`}
        onClick={() => setShowDesc(!showDesc)}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span>{formatViewsFull(video.views)}</span>
          <span>{timeAgo(video.created_at)}</span>
          <span className="ml-1 rounded bg-brand-hover px-1.5 py-0.5 text-xs text-white">#{video.category}</span>
        </div>
        <p className={`mt-2 whitespace-pre-line text-sm text-white ${showDesc ? '' : 'line-clamp-2'}`}>
          {video.description}
          {showDesc && (
            <>
              {'\n\n'}
              Follow {video.channel.name} for more content like this.
              {'\n'}
              Category: {video.category}
              {'\n'}
              Duration: {video.duration}
            </>
          )}
        </p>
        <span className="mt-1 block text-sm font-medium text-brand-subtle">
          {showDesc ? 'Show less' : '...more'}
        </span>
      </div>
    </div>
  );
}
