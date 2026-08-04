import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { timeAgo, formatViews } from '@/lib/format';
import type { Comment as CommentType } from '@/lib/types';

interface CommentProps {
  comment: CommentType;
  onLike: (id: string) => void;
}

export default function Comment({ comment, onLike }: CommentProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      if (disliked) setDisliked(false);
      onLike(comment.id);
    } else {
      setLiked(false);
    }
  };

  return (
    <div className="flex gap-3 py-2">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-elevated">
        <img src={comment.author_avatar} alt={comment.author_name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{comment.author_name}</span>
          <span className="text-xs text-brand-subtle">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="mt-1 text-sm text-white break-words">{comment.text}</p>
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-xs text-brand-subtle transition-colors hover:text-white"
          >
            <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-white text-white' : ''}`} />
            {formatViews(comment.likes + (liked ? 1 : 0))}
          </button>
          <button
            onClick={() => { setDisliked(!disliked); if (liked) setLiked(false); }}
            className="flex items-center gap-1 text-xs text-brand-subtle transition-colors hover:text-white"
          >
            <ThumbsDown className={`h-4 w-4 ${disliked ? 'fill-white text-white' : ''}`} />
          </button>
          <button className="rounded-full px-2 py-0.5 text-xs font-medium text-brand-subtle transition-colors hover:bg-brand-hover">
            Reply
          </button>
        </div>
      </div>
    </div>
  );
}
