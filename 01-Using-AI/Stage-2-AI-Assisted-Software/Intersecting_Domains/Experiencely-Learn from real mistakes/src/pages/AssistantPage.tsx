import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Send, AlertTriangle, KeyRound, Loader2, BadgeCheck,
  TrendingUp, Lightbulb, ShieldAlert, ListChecks, Coins, Quote,
  Eye, FileQuestion, Link2, Search, ChevronRight, Info,
} from "lucide-react";
import { semanticSearch, generateAIAnswer } from "@/lib/ai";
import { getApiKey, getLearningMode, setLearningMode } from "@/lib/storage";
import type { AIResponse, LearningMode, Post, Category } from "@/lib/types";

type Props = {
  categories: Category[];
  onSelectPost: (id: string) => void;
  onGoToSettings: () => void;
  initialQuery?: string;
};

const SAMPLE_QUESTIONS = [
  "I'm using an oven for the first time. What mistakes should I avoid?",
  "What mistakes do beginners make while learning Java?",
  "What usually goes wrong when buying a used car?",
  "What should I know before starting a small business?",
  "Common mistakes while building a gaming PC.",
  "What mistakes should I avoid while investing in stocks?",
  "First-time drone flying mistakes.",
  "What are the biggest mistakes people make during interviews?",
];

export default function AssistantPage({ onSelectPost, onGoToSettings, initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [retrievedPosts, setRetrievedPosts] = useState<Post[]>([]);
  const [mode, setMode] = useState<LearningMode>(getLearningMode());
  const inputRef = useRef<HTMLInputElement>(null);

  const hasApiKey = !!getApiKey();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (initialQuery && hasApiKey) {
      handleAsk(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleAsk = async (q?: string) => {
    const question = (q || query).trim();
    if (!question || loading) return;

    if (!getApiKey()) {
      setError("NO_API_KEY");
      return;
    }

    setQuery(question);
    setLoading(true);
    setError(null);
    setResponse(null);
    setRetrievedPosts([]);
    setSearching(true);

    try {
      const results = await semanticSearch(question, 15);
      const posts = results.map((r) => r.post);
      setRetrievedPosts(posts);
      setSearching(false);

      const aiResponse = await generateAIAnswer(question, posts);
      setResponse(aiResponse);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleModeChange = (m: LearningMode) => {
    setMode(m);
    setLearningMode(m);
  };

  if (!hasApiKey && !response) {
    return <NoApiKeyState onGoToSettings={onGoToSettings} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          AI Learning Assistant
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink-900 mb-2">
          Ask anything. Get answers from real experiences.
        </h1>
        <p className="text-ink-500 text-sm max-w-xl mx-auto">
          The AI analyzes thousands of community stories and synthesizes them into
          a practical guide — always grounded in real posts, never generic advice.
        </p>
      </div>

      {/* Learning mode toggle */}
      <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-ink-100 w-fit mx-auto">
        {(["beginner", "intermediate", "expert"] as LearningMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              mode === m
                ? "bg-white text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Search box */}
      <div className="card p-2 sticky top-20 z-30">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-ink-400 ml-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask about any mistake, experience, or lesson..."
            className="flex-1 bg-transparent text-ink-900 placeholder-ink-400 focus:outline-none py-2.5"
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !query.trim()}
            className="btn-primary !px-4 !py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sample questions */}
      {!response && !loading && !error && (
        <div className="space-y-3">
          <p className="text-sm text-ink-400 text-center">Try one of these questions</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleAsk(q)}
                className="card card-hover p-3.5 text-left text-sm text-ink-600 hover:text-brand-700 flex items-start gap-2"
              >
                <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Searching state */}
      {searching && (
        <div className="card p-8 text-center">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-ink-600 font-medium">Searching community experiences...</p>
          <p className="text-ink-400 text-sm mt-1">Finding semantically relevant posts</p>
        </div>
      )}

      {/* Loading state */}
      {loading && !searching && (
        <div className="card p-8 text-center">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-ink-600 font-medium">Analyzing experiences and generating your guide...</p>
          <p className="text-ink-400 text-sm mt-1">The AI is reading and synthesizing real community stories</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="card p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              {error === "NO_API_KEY" && <NoApiKeyInline />}
              {error === "INVALID_API_KEY" && (
                <div>
                  <p className="font-semibold text-red-700 mb-1">Invalid API key</p>
                  <p className="text-sm text-red-600">
                    The API key you entered doesn't seem to be valid. Go to Settings to update it.
                  </p>
                </div>
              )}
              {error === "RATE_LIMITED" && (
                <div>
                  <p className="font-semibold text-red-700 mb-1">Rate limit reached</p>
                  <p className="text-sm text-red-600">
                    Too many requests. Please wait a moment and try again.
                  </p>
                </div>
              )}
              {error !== "NO_API_KEY" && error !== "INVALID_API_KEY" && error !== "RATE_LIMITED" && (
                <div>
                  <p className="font-semibold text-red-700 mb-1">Something went wrong</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Response */}
      {response && <AIResponseView response={response} onSelectPost={onSelectPost} />}

      {/* Retrieved posts preview */}
      {retrievedPosts.length > 0 && response && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-4 h-4 text-ink-400" />
            <h3 className="text-sm font-semibold text-ink-700">
              Posts the AI analyzed ({retrievedPosts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {retrievedPosts.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPost(p.id)}
                className="w-full text-left p-3 rounded-lg hover:bg-ink-50 transition-colors flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-800 truncate">{p.title}</div>
                  <div className="text-xs text-ink-400">by {p.author_name} · {p.helpful_count} helpful votes</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AIResponseView({ response, onSelectPost }: { response: AIResponse; onSelectPost: (id: string) => void }) {
  const confidenceColor =
    response.trust.confidence === "High"
      ? "bg-brand-50 text-brand-700 border-brand-200"
      : response.trust.confidence === "Medium"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Trust & transparency banner */}
      <div className="card p-4 bg-gradient-to-br from-ink-50 to-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-ink-400" />
            <span className="text-sm font-semibold text-ink-700">AI Trust Report</span>
          </div>
          <span className={`chip border ${confidenceColor}`}>
            <BadgeCheck className="w-3 h-3" />
            {response.trust.confidence} confidence
          </span>
          <span className="chip bg-ink-100 text-ink-600">
            {response.trust.postsAnalyzed} posts analyzed
          </span>
          {response.trust.categories.map((c, i) => (
            <span key={i} className="chip bg-brand-50 text-brand-700">{c}</span>
          ))}
          <span className="text-xs text-ink-400 ml-auto">
            Posts from {response.trust.oldestPost} to {response.trust.newestPost}
          </span>
        </div>
      </div>

      {/* Overview */}
      {response.overview && (
        <Section icon={<Eye className="w-4 h-4" />} title="Overview">
          <p className="text-ink-700 leading-relaxed">{response.overview}</p>
        </Section>
      )}

      {/* Common mistakes */}
      {response.commonMistakes.length > 0 && (
        <Section icon={<TrendingUp className="w-4 h-4" />} title="Most Common Mistakes">
          <Rankedlist items={response.commonMistakes} />
        </Section>
      )}

      {/* Why they happen */}
      {response.whyTheyHappen.length > 0 && (
        <Section icon={<Lightbulb className="w-4 h-4" />} title="Why These Mistakes Happen">
          <BulletList items={response.whyTheyHappen} />
        </Section>
      )}

      {/* How to avoid */}
      {response.howToAvoid.length > 0 && (
        <Section icon={<Lightbulb className="w-4 h-4" />} title="How to Avoid Them">
          <BulletList items={response.howToAvoid} />
        </Section>
      )}

      {/* Community tips */}
      {response.communityTips.length > 0 && (
        <Section icon={<Quote className="w-4 h-4" />} title="Community Tips">
          <div className="space-y-2">
            {response.communityTips.map((tip, i) => (
              <blockquote key={i} className="border-l-2 border-brand-300 pl-4 py-1 text-ink-700 italic leading-relaxed">
                "{tip}"
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* Wish I knew */}
      {response.wishIKnew.length > 0 && (
        <Section icon={<Lightbulb className="w-4 h-4" />} title="Things People Wish They Knew Earlier">
          <div className="space-y-2">
            {response.wishIKnew.map((wish, i) => (
              <blockquote key={i} className="border-l-2 border-accent-300 pl-4 py-1 text-ink-700 italic leading-relaxed">
                "{wish}"
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      {/* Beginner checklist */}
      {response.beginnerChecklist.length > 0 && (
        <Section icon={<ListChecks className="w-4 h-4" />} title="Beginner Checklist">
          <div className="grid sm:grid-cols-2 gap-2">
            {response.beginnerChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-brand-50/50">
                <span className="text-brand-600 font-bold flex-shrink-0">☑</span>
                <span className="text-sm text-ink-700">{item}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Costly mistakes */}
      {response.costlyMistakes.length > 0 && (
        <Section icon={<Coins className="w-4 h-4" />} title="Common Costly Mistakes">
          <div className="space-y-2">
            {response.costlyMistakes.map((m, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-100">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-ink-700">{m}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Safety warnings */}
      {response.safetyWarnings.length > 0 && (
        <Section icon={<ShieldAlert className="w-4 h-4" />} title="Safety Warnings">
          <div className="space-y-2">
            {response.safetyWarnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-ink-700">{w}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      {response.faq.length > 0 && (
        <Section icon={<FileQuestion className="w-4 h-4" />} title="Frequently Asked Questions">
          <div className="space-y-3">
            {response.faq.map((item, i) => (
              <div key={i} className="border border-ink-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-ink-50 font-medium text-sm text-ink-800">
                  {item.q}
                </div>
                <div className="px-4 py-3 text-sm text-ink-600 leading-relaxed">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recommended posts */}
      {response.recommendedPosts.length > 0 && (
        <Section icon={<Link2 className="w-4 h-4" />} title="Recommended Posts">
          <div className="space-y-2">
            {response.recommendedPosts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onSelectPost(p.id)}
                className="w-full text-left p-3 rounded-lg border border-ink-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all flex items-center gap-3 group"
              >
                <span className="text-brand-600 font-bold text-sm w-6 text-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink-800 group-hover:text-brand-700 truncate">{p.title}</div>
                  <div className="text-xs text-ink-400">by {p.author_name}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-brand-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Related topics + people also searched */}
      {(response.relatedTopics.length > 0 || response.peopleAlsoSearched.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {response.relatedTopics.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-ink-700 mb-3">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {response.relatedTopics.map((t, i) => (
                  <span key={i} className="chip bg-ink-100 text-ink-600">{t}</span>
                ))}
              </div>
            </div>
          )}
          {response.peopleAlsoSearched.length > 0 && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-ink-700 mb-3">People Also Searched For</h3>
              <div className="flex flex-wrap gap-2">
                {response.peopleAlsoSearched.map((s, i) => (
                  <span key={i} className="chip bg-brand-50 text-brand-700">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Learning mode indicator */}
      <div className="text-center text-xs text-ink-400">
        Generated in {response.learningMode} mode · This answer is grounded in {response.trust.postsAnalyzed} real community experiences
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 animate-fade-in">
      <h2 className="section-title mb-3">{icon} {title}</h2>
      {children}
    </div>
  );
}

function Rankedlist({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-ink-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-2" />
          <span className="text-ink-700 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NoApiKeyState({ onGoToSettings }: { onGoToSettings: () => void }) {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-4">
        <KeyRound className="w-8 h-8 text-accent-600" />
      </div>
      <h2 className="text-xl font-bold text-ink-900 mb-2">Add your AI API key to get started</h2>
      <p className="text-ink-500 text-sm mb-6">
        The AI Assistant uses your own OpenAI API key to analyze community experiences
        and generate answers. Your key is stored only in your browser and is never sent
        anywhere except OpenAI.
      </p>
      <button onClick={onGoToSettings} className="btn-primary">
        <KeyRound className="w-4 h-4" />
        Go to Settings
      </button>
    </div>
  );
}

function NoApiKeyInline() {
  return (
    <div>
      <p className="font-semibold text-red-700 mb-1">No API key configured</p>
      <p className="text-sm text-red-600">
        Add your OpenAI API key in Settings to use the AI Assistant. Your key stays in your browser.
      </p>
    </div>
  );
}
