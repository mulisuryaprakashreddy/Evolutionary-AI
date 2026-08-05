import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, TrendingUp, Clock, ThumbsUp, Sparkles, ArrowRight, BadgeCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryStyles";
import type { Category, Post } from "@/lib/types";

type Props = {
  categories: Category[];
  onSelectPost: (id: string) => void;
  onAskAI: (query: string) => void;
  onShare: (categoryId?: string) => void;
};

type SortMode = "trending" | "newest" | "helpful";

const SUGGESTED_QUESTIONS = [
  "I'm using an oven for the first time. What mistakes should I avoid?",
  "What mistakes do beginners make while learning Java?",
  "What usually goes wrong when buying a used car?",
  "What should I know before starting a small business?",
  "What mistakes happen during international travel?",
  "Common mistakes while building a gaming PC.",
  "What mistakes should I avoid while investing in stocks?",
  "First-time drone flying mistakes.",
  "How do I avoid burning food while baking?",
  "What are the biggest mistakes people make during interviews?",
];

export default function ExplorePage({ categories, onSelectPost, onAskAI, onShare }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("trending");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("posts").select("*, category:categories(*)");
    if (activeCategory) {
      query = query.eq("category_id", activeCategory);
    }
    if (sort === "newest") query = query.order("created_at", { ascending: false });
    else if (sort === "helpful") query = query.order("helpful_count", { ascending: false });
    else query = query.order("helpful_count", { ascending: false }).order("created_at", { ascending: false });
    query = query.limit(50);
    const { data } = await query;
    setPosts((data as Post[]) || []);
    setLoading(false);
  }, [activeCategory, sort]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.mistakes.some((m) => m.toLowerCase().includes(q))
    );
  }, [posts, search]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900 text-white px-6 py-10 sm:px-10 sm:py-14">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0%, transparent 40%)"
        }} />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Learning from Real Experiences
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium leading-tight mb-3">
            Learn from the mistakes of thousands of real people.
          </h1>
          <p className="text-brand-100 text-base sm:text-lg leading-relaxed mb-6">
            Ask any question in plain language. Our AI analyzes real community experiences
            and turns them into practical guides — not generic advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onAskAI(search)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-700 font-semibold text-sm hover:bg-brand-50 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Ask the AI Assistant
            </button>
            <button
              onClick={() => onShare()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all"
            >
              Share Your Experience
            </button>
          </div>
        </div>
      </section>

      {/* Suggested questions */}
      <section>
        <h2 className="text-sm font-semibold text-ink-500 uppercase tracking-wide mb-3">
          Try asking
        </h2>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => onAskAI(q)}
              className="chip bg-white border border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* Search bar */}
      <section>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experiences, mistakes, lessons..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-ink-200 bg-white text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all"
          />
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ink-900">Browse by category</h2>
          <button
            onClick={() => setActiveCategory(null)}
            className={`text-sm font-medium transition-colors ${
              activeCategory === null ? "text-brand-700" : "text-ink-400 hover:text-ink-700"
            }`}
          >
            All
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const color = getCategoryColor(cat.color);
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(active ? null : cat.id)}
                className={`card card-hover p-4 text-left ${active ? "ring-2 ring-brand-400 border-brand-300" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.text} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-sm text-ink-900 leading-tight">{cat.name}</div>
                <div className="text-xs text-ink-400 mt-1 line-clamp-2">{cat.description || ""}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sort controls */}
      <section className="flex items-center gap-2">
        {([
          { key: "trending", label: "Trending", icon: TrendingUp },
          { key: "newest", label: "Newest", icon: Clock },
          { key: "helpful", label: "Most Helpful", icon: ThumbsUp },
        ] as { key: SortMode; label: string; icon: typeof TrendingUp }[]).map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                sort === s.key
                  ? "bg-ink-900 text-white"
                  : "bg-white border border-ink-200 text-ink-600 hover:border-ink-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          );
        })}
      </section>

      {/* Posts grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-ink-100 rounded w-1/3 mb-3" />
                <div className="h-5 bg-ink-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-ink-100 rounded w-full mb-1.5" />
                <div className="h-3 bg-ink-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-ink-500 mb-4">No experiences found. Be the first to share one.</p>
            <button onClick={() => onShare(activeCategory || undefined)} className="btn-primary">
              Share Your Experience
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} onClick={() => onSelectPost(post.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const Icon = post.category ? getCategoryIcon(post.category.icon) : null;
  const color = post.category ? getCategoryColor(post.category.color) : null;

  return (
    <button
      onClick={onClick}
      className="card card-hover p-5 text-left flex flex-col gap-3 group"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {post.category && color && Icon && (
          <span className={`chip ${color.bg} ${color.text}`}>
            <Icon className="w-3 h-3" />
            {post.category.name}
          </span>
        )}
        {post.verified && (
          <span className="chip bg-brand-50 text-brand-700">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </span>
        )}
        <span className="text-xs text-ink-400 ml-auto">
          {new Date(post.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      <h3 className="font-bold text-ink-900 text-base leading-snug group-hover:text-brand-700 transition-colors">
        {post.title}
      </h3>

      <p className="text-sm text-ink-500 line-clamp-3 leading-relaxed">{post.body}</p>

      {post.mistakes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.mistakes.slice(0, 3).map((m, i) => (
            <span key={i} className="chip bg-ink-50 text-ink-500 border border-ink-100">
              {m.length > 40 ? m.slice(0, 40) + "..." : m}
            </span>
          ))}
          {post.mistakes.length > 3 && (
            <span className="chip bg-ink-50 text-ink-400">
              +{post.mistakes.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-ink-100 mt-auto">
        <span className="text-xs text-ink-400 font-medium">
          by {post.author_name} · {post.author_role}
        </span>
        <div className="flex items-center gap-3 text-xs text-ink-400">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" />
            {post.helpful_count}
          </span>
          <ArrowRight className="w-4 h-4 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
}
