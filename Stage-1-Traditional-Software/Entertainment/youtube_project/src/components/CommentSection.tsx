import { useState } from 'react';
import { useComments } from '@/lib/hooks';
import Comment from './Comment';

interface CommentSectionProps {
  videoId: string;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const { comments, loading, addComment, likeComment } = useComments(videoId);
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment(text.trim());
    setText('');
    setFocused(false);
  };

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-medium text-white">
        {comments.length} Comments
      </h3>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-medium text-white">
          M
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Add a comment..."
            className="w-full border-b border-brand-border bg-transparent pb-1.5 text-sm text-white placeholder:text-brand-subtle focus:border-white focus:outline-none"
          />
          {focused && (
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setText(''); setFocused(false); }}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-brand-subtle transition-colors hover:bg-brand-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="rounded-full bg-blue-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-brand-elevated disabled:text-brand-subtle"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full shimmer-bg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded shimmer-bg" />
                <div className="h-3 w-full rounded shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-brand-subtle">Be the first to comment!</p>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} onLike={likeComment} />
          ))}
        </div>
      )}
    </div>
  );
}
