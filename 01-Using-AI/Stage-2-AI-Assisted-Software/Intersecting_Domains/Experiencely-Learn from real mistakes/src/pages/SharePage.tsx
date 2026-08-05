import { useState } from "react";
import { Plus, Minus, Send, CheckCircle2, Lightbulb } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCategoryIcon, getCategoryColor } from "@/lib/categoryStyles";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  initialCategoryId?: string;
  onShared: () => void;
};

export default function SharePage({ categories, initialCategoryId, onShared }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categoryId, setCategoryId] = useState(initialCategoryId || "");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("Beginner");
  const [mistakes, setMistakes] = useState<string[]>([""]);
  const [lessons, setLessons] = useState<string[]>([""]);
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim() || !categoryId) {
      setError("Please fill in the title, your story, and select a category.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const cleanMistakes = mistakes.filter((m) => m.trim());
    const cleanLessons = lessons.filter((l) => l.trim());
    const cleanTags = tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const { error: insertError } = await supabase.from("posts").insert({
      title: title.trim(),
      body: body.trim(),
      category_id: categoryId,
      author_name: authorName.trim() || "Anonymous",
      author_role: authorRole,
      mistakes: cleanMistakes,
      lessons: cleanLessons,
      tags: cleanTags,
      verified: false,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Something went wrong while saving your experience. Please try again.");
      return;
    }

    setSuccess(true);
    setTimeout(() => onShared(), 2000);
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-brand-600" />
        </div>
        <h2 className="text-xl font-bold text-ink-900 mb-2">Thank you for sharing!</h2>
        <p className="text-ink-500 text-sm">
          Your experience is now part of the collective knowledge base.
          It will help others make smarter, safer decisions.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-2">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium text-ink-900 mb-2">
          Share Your Experience
        </h1>
        <p className="text-ink-500 text-sm">
          Every mistake becomes a lesson for someone else. Share honestly — your story
          could save someone time, money, or even their safety.
        </p>
      </div>

      {/* Category selection */}
      <div className="card p-5">
        <label className="text-sm font-semibold text-ink-900 mb-3 block">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const color = getCategoryColor(cat.color);
            const active = categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  active
                    ? "border-brand-400 bg-brand-50 ring-2 ring-brand-200"
                    : "border-ink-200 hover:border-ink-300"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${color.bg} ${color.text} flex items-center justify-center mb-2`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xs font-medium text-ink-700 leading-tight">{cat.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title + author */}
      <div className="card p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-ink-900 mb-2 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My First Time Using an Oven: 5 Disasters in One Week"
            className="input-field"
            maxLength={200}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-ink-900 mb-2 block">Your name (optional)</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Anonymous"
              className="input-field"
              maxLength={50}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink-900 mb-2 block">Your experience level</label>
            <select
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
              className="input-field"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="card p-5">
        <label className="text-sm font-semibold text-ink-900 mb-2 block">Your story</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Describe what happened. What mistakes did you make? What went wrong? What did you learn? Be specific — the more detail you share, the more helpful it is for others."
          className="input-field min-h-[180px] resize-y"
        />
      </div>

      {/* Mistakes */}
      <div className="card p-5">
        <label className="text-sm font-semibold text-ink-900 mb-3 block">Mistakes you made</label>
        <div className="space-y-2">
          {mistakes.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={m}
                onChange={(e) => setMistakes((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                placeholder={`Mistake ${i + 1}`}
                className="input-field !py-2 text-sm flex-1"
              />
              {mistakes.length > 1 && (
                <button
                  onClick={() => setMistakes((prev) => prev.filter((_, idx) => idx !== i))}
                  className="btn-ghost !px-3"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setMistakes((prev) => [...prev, ""])}
            className="btn-outline text-sm"
          >
            <Plus className="w-4 h-4" />
            Add another mistake
          </button>
        </div>
      </div>

      {/* Lessons */}
      <div className="card p-5">
        <label className="text-sm font-semibold text-ink-900 mb-3 block flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-brand-500" />
          Lessons you learned
        </label>
        <div className="space-y-2">
          {lessons.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={l}
                onChange={(e) => setLessons((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                placeholder={`Lesson ${i + 1}`}
                className="input-field !py-2 text-sm flex-1"
              />
              {lessons.length > 1 && (
                <button
                  onClick={() => setLessons((prev) => prev.filter((_, idx) => idx !== i))}
                  className="btn-ghost !px-3"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setLessons((prev) => [...prev, ""])}
            className="btn-outline text-sm"
          >
            <Plus className="w-4 h-4" />
            Add another lesson
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="card p-5">
        <label className="text-sm font-semibold text-ink-900 mb-2 block">
          Tags (comma-separated, helps the AI find your story)
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="e.g. oven, baking, beginner, first time, cookies"
          className="input-field"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="card p-4 border-red-200 bg-red-50 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3 pb-8">
        <button onClick={onShared} className="btn-ghost">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Share Experience
            </>
          )}
        </button>
      </div>
    </div>
  );
}
