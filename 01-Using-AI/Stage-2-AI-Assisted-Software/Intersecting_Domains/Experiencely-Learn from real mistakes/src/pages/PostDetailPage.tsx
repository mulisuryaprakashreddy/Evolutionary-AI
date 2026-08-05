import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft, ThumbsUp, BadgeCheck, MessageCircle, Send, Clock,
  AlertCircle, Lightbulb, Tag, Share2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryStyles";
import { getFingerprint, getVoted, setVoted } from "@/lib/storage";
import type { Post, Comment } from "@/lib/types";

type Props = {
  postId: string;
  onBack: () => void;
  onSelectPost: (id: string) => void;
};

export default function PostDetailPage({ postId, onBack }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVotedState] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fingerprint = getFingerprint();

  const loadPost = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*, category:categories(*)")
      .eq("id", postId)
      .maybeSingle();
    setPost(data as Post);

    const { data: commentsData } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("helpful_count", { ascending: false })
      .order("created_at", { ascending: false });
    setComments((commentsData as Comment[]) || []);

    setVotedState(!!getVoted()[`post_${postId}`]);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleVote = async () => {
    if (voted || !post) return;
    const { error } = await supabase.from("votes").insert({
      target_type: "post",
      target_id: post.id,
      voter_fingerprint: fingerprint,
    });
    if (!error) {
      setVoted(`post_${post.id}`);
      setVotedState(true);
      setPost({ ...post, helpful_count: post.helpful_count + 1 });
    }
  };

  const handleCommentVote = async (commentId: string) => {
    const key = `comment_${commentId}`;
    if (getVoted()[key]) return;
    const { error } = await supabase.from("votes").insert({
      target_type: "comment",
      target_id: commentId,
      voter_fingerprint: fingerprint,
    });
    if (!error) {
      setVoted(key);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, helpful_count: c.helpful_count + 1 } : c
        )
      );
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post) return;
    setSubmitting(true);
    const { data } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        author_name: commentName.trim() || "Anonymous",
        body: commentText.trim(),
      })
      .select("*")
      .single();
    if (data) {
      setComments((prev) => [data as Comment, ...prev]);
      setCommentText("");
      setCommentName("");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="card p-8 animate-pulse">
        <div className="h-4 bg-ink-100 rounded w-1/4 mb-4" />
        <div className="h-6 bg-ink-100 rounded w-3/4 mb-3" />
        <div className="h-3 bg-ink-100 rounded w-full mb-2" />
        <div className="h-3 bg-ink-100 rounded w-5/6" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="card p-8 text-center">
        <p className="text-ink-500 mb-4">This experience could not be found.</p>
        <button onClick={onBack} className="btn-primary">Back to Explore</button>
      </div>
    );
  }

  const Icon = post.category ? getCategoryIcon(post.category.icon) : null;
  const color = post.category ? getCategoryColor(post.category.color) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack} className="btn-ghost -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Post */}
      <article className="card p-6 sm:p-8">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {post.category && color && Icon && (
            <span className={`chip ${color.bg} ${color.text}`}>
              <Icon className="w-3.5 h-3.5" />
              {post.category.name}
            </span>
          )}
          {post.verified && (
            <span className="chip bg-brand-50 text-brand-700">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified Contributor
            </span>
          )}
          <span className="chip bg-ink-100 text-ink-500">
            <Clock className="w-3 h-3" />
            {new Date(post.created_at).toLocaleDateString(undefined, {
              month: "long", day: "numeric", year: "numeric",
            })}
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink-900 leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 mb-5 text-sm text-ink-500">
          <span className="font-medium text-ink-700">{post.author_name}</span>
          <span>·</span>
          <span>{post.author_role} level</span>
        </div>

        <div className="post-body text-[15px] mb-6">{post.body}</div>

        {post.mistakes.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Mistakes Made
            </h3>
            <div className="space-y-1.5">
              {post.mistakes.map((m, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-ink-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                  {m}
                </div>
              ))}
            </div>
          </div>
        )}

        {post.lessons.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-brand-500" />
              Lessons Learned
            </h3>
            <div className="space-y-1.5">
              {post.lessons.map((l, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-ink-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />
                  {l}
                </div>
              ))}
            </div>
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t, i) => (
                <span key={i} className="chip bg-ink-50 text-ink-500 border border-ink-100">
                  <Tag className="w-2.5 h-2.5" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-ink-100">
          <button
            onClick={handleVote}
            disabled={voted}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              voted
                ? "bg-brand-50 text-brand-700 cursor-default"
                : "bg-ink-100 text-ink-600 hover:bg-brand-50 hover:text-brand-700"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${voted ? "fill-brand-500 text-brand-500" : ""}`} />
            {voted ? "Helpful" : "Mark as helpful"}
            <span className="font-bold">{post.helpful_count}</span>
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="btn-ghost"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </article>

      {/* Comments */}
      <section className="card p-6">
        <h2 className="section-title mb-4">
          <MessageCircle className="w-4 h-4" />
          Discussion ({comments.length})
        </h2>

        {/* Add comment */}
        <div className="mb-5 space-y-2">
          <input
            type="text"
            value={commentName}
            onChange={(e) => setCommentName(e.target.value)}
            placeholder="Your name (optional)"
            className="input-field !py-2 text-sm"
            maxLength={50}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment or share your own experience..."
              className="input-field !py-2 text-sm flex-1"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || submitting}
              className="btn-primary !px-3"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-4">
              No comments yet. Be the first to share your thoughts.
            </p>
          ) : (
            comments.map((c) => {
              const cVoted = !!getVoted()[`comment_${c.id}`];
              return (
                <div key={c.id} className="p-4 rounded-xl bg-ink-50/50 border border-ink-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink-800">{c.author_name}</span>
                    <span className="text-xs text-ink-400">
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: "short", day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-ink-600 leading-relaxed mb-2">{c.body}</p>
                  <button
                    onClick={() => handleCommentVote(c.id)}
                    disabled={cVoted}
                    className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                      cVoted ? "text-brand-600" : "text-ink-400 hover:text-brand-600"
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${cVoted ? "fill-brand-500 text-brand-500" : ""}`} />
                    {c.helpful_count}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
