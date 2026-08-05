import { useEffect, useState, useCallback } from "react";
import { Sparkles, Compass, Plus, Settings, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getApiKey } from "@/lib/storage";
import type { Category } from "@/lib/types";
import ExplorePage from "@/pages/ExplorePage";
import AssistantPage from "@/pages/AssistantPage";
import PostDetailPage from "@/pages/PostDetailPage";
import SharePage from "@/pages/SharePage";
import SettingsPage from "@/pages/SettingsPage";

type View =
  | { name: "explore" }
  | { name: "assistant"; initialQuery?: string }
  | { name: "post"; postId: string }
  | { name: "share"; categoryId?: string }
  | { name: "settings" };

export default function App() {
  const [view, setView] = useState<View>({ name: "explore" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  const loadCategories = useCallback(async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (data) setCategories(data as Category[]);
  }, []);

  useEffect(() => {
    loadCategories();
    setHasApiKey(!!getApiKey());
  }, [loadCategories]);

  const navigate = (v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { key: "explore", label: "Explore", icon: Compass, view: { name: "explore" } as View },
    { key: "assistant", label: "AI Assistant", icon: Sparkles, view: { name: "assistant" } as View },
    { key: "share", label: "Share", icon: Plus, view: { name: "share" } as View },
    { key: "settings", label: "Settings", icon: Settings, view: { name: "settings" } as View },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-ink-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate({ name: "explore" })}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <div className="font-bold text-ink-900 text-lg leading-none">Experiencely</div>
              <div className="text-[10px] text-ink-400 font-medium tracking-wide uppercase">Learn from real mistakes</div>
            </div>
          </button>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = view.name === item.key ||
                (item.key === "share" && view.name === "share");
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.view)}
                  className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            {!hasApiKey && (
              <button
                onClick={() => navigate({ name: "settings" })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-accent-50 text-accent-700 border border-accent-200 hover:bg-accent-100 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Add AI Key</span>
                <span className="sm:hidden">AI</span>
              </button>
            )}
          </nav>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden border-t border-ink-200/60 px-2 py-1.5 flex items-center justify-around">
          {navItems.map((item) => {
            const active = view.name === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.view)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  active ? "text-brand-700" : "text-ink-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {view.name === "explore" && (
          <ExplorePage
            categories={categories}
            onSelectPost={(id) => navigate({ name: "post", postId: id })}
            onAskAI={(q) => navigate({ name: "assistant", initialQuery: q })}
            onShare={(catId) => navigate({ name: "share", categoryId: catId })}
          />
        )}
        {view.name === "assistant" && (
          <AssistantPage
            categories={categories}
            onSelectPost={(id) => navigate({ name: "post", postId: id })}
            onGoToSettings={() => navigate({ name: "settings" })}
            initialQuery={view.initialQuery}
          />
        )}
        {view.name === "post" && (
          <PostDetailPage
            postId={view.postId}
            onBack={() => navigate({ name: "explore" })}
            onSelectPost={(id) => navigate({ name: "post", postId: id })}
          />
        )}
        {view.name === "share" && (
          <SharePage
            categories={categories}
            initialCategoryId={view.categoryId}
            onShared={() => navigate({ name: "explore" })}
          />
        )}
        {view.name === "settings" && (
          <SettingsPage onApiKeyChange={(v) => setHasApiKey(v)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ink-200/60 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-sm text-ink-400">
            Experiencely — The world's largest AI-powered repository of human experience.
            Every shared mistake helps someone else make a smarter decision.
          </p>
        </div>
      </footer>
    </div>
  );
}
