import { AnimatePresence, motion } from "framer-motion";
import { Check, ThumbsUp, Trash2, User } from "lucide-react";
import { useState } from "react";
import { getVoterId, timeAgo } from "../realtime/useRoom.js";

const MAX = 280;

export default function QuestionCard({
  question,
  isTeacher,
  onUpvote,
  onToggleAnswered,
  onDelete,
  // Index used to stagger entrance animation.
  index = 0,
}) {
  const voterId = getVoterId();
  const upvoted = (question.upvoters || []).includes(voterId);
  const [confirming, setConfirming] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 360, damping: 28, delay: Math.min(index * 0.02, 0.12) }}
      className={`card p-4 sm:p-5 ${question.answered ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Upvote */}
        <button
          type="button"
          onClick={() => onUpvote?.(question.id)}
          disabled={isTeacher || upvoted}
          aria-pressed={upvoted}
          aria-label={upvoted ? "Already upvoted" : "Upvote question"}
          className={`flex flex-col items-center justify-center rounded-xl border px-2.5 py-2 min-w-[52px] transition shrink-0
            ${
              upvoted
                ? "border-brand-400 bg-brand-500/15 text-brand-300"
                : "border-white/10 bg-ink-900/60 text-slate-300 hover:border-brand-400/60 hover:text-brand-300"
            }
            ${isTeacher ? "cursor-default" : "active:scale-90"}`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span className="mt-1 text-sm font-bold tabular-nums">{question.upvotes}</span>
        </button>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <p
            className={`whitespace-pre-wrap break-words text-[15px] sm:text-base leading-relaxed text-slate-100 ${
              question.answered ? "line-through decoration-slate-500/70" : ""
            }`}
          >
            {question.text}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {question.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-slate-600" />
              {timeAgo(question.createdAt)}
            </span>
            {question.answered && (
              <span className="badge bg-emerald2-500/15 text-emerald2-400">
                <Check className="h-3.5 w-3.5" /> Answered
              </span>
            )}
          </div>
        </div>

        {/* Teacher controls */}
        {isTeacher && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onToggleAnswered?.(question.id)}
              className={`btn px-2.5 py-2 text-xs ${
                question.answered
                  ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                  : "bg-emerald2-500/15 hover:bg-emerald2-500/25 text-emerald2-400 border border-emerald2-500/30"
              }`}
              aria-label={question.answered ? "Mark as unanswered" : "Mark as answered"}
              title={question.answered ? "Mark unanswered" : "Mark answered"}
            >
              <Check className="h-4 w-4" />
              <span className="hidden sm:inline">{question.answered ? "Undo" : "Answered"}</span>
            </button>

            {confirming ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onDelete?.(question.id);
                    setConfirming(false);
                  }}
                  className="btn bg-rose-500 px-2.5 py-2 text-xs text-white"
                >
                  Sure?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="btn bg-white/5 px-2 py-2 text-xs text-slate-300"
                  aria-label="Cancel delete"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="btn bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 px-2.5 py-2 text-xs text-slate-300"
                aria-label="Delete question"
                title="Delete question"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function QuestionInput({ onSubmit, disabled, autoFocus }) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState(() => localStorage.getItem("qa-name") || "");
  const [submitting, setSubmitting] = useState(false);

  const remaining = MAX - text.length;
  const tooLong = text.length > MAX;
  const canSubmit = text.trim().length > 0 && !tooLong && !disabled;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit?.(text.trim(), author.trim() || "Anonymous");
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  function persistName(v) {
    setAuthor(v);
    if (v.trim()) localStorage.setItem("qa-name", v.trim());
    else localStorage.removeItem("qa-name");
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="qa-name">
          Your name (optional)
        </label>
        <input
          id="qa-name"
          type="text"
          value={author}
          onChange={(e) => persistName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={40}
          className="input py-2.5 text-sm"
        />

        <label className="sr-only" htmlFor="qa-text">
          Ask a question
        </label>
        <textarea
          id="qa-text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder="Type your question for the class…"
          rows={3}
          autoFocus={autoFocus}
          className="input resize-none text-[15px]"
        />

        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-xs font-semibold tabular-nums ${
              tooLong ? "text-rose-400" : remaining < 40 ? "text-amber-400" : "text-slate-500"
            }`}
          >
            {text.length}/{MAX}
          </span>

          <button type="submit" disabled={!canSubmit || submitting} className="btn-primary px-5 py-2.5">
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Sending…
              </>
            ) : (
              <>Ask Question</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export function EmptyState({ isTeacher }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
    >
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-300">
        {isTeacher ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2">
            <path d="M3 11l18-7-7 18-2.5-7.5L3 11z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5A8.5 8.5 0 1 1 21 11.5z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="17" r="0.6" fill="currentColor" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-base font-semibold text-slate-200">
          {isTeacher ? "Waiting for the first question" : "No questions yet"}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {isTeacher
            ? "Share the room code or QR code with your students to get started."
            : "Be the first to ask the class a question."}
        </p>
      </div>
    </motion.div>
  );
}

export function ConnectionDot({ status }) {
  const map = {
    connecting: { c: "bg-amber-400", label: "Connecting…" },
    live: { c: "bg-emerald2-400", label: "Connected" },
    closed: { c: "bg-rose-500", label: "Disconnected" },
  };
  const s = map[status] || map.connecting;
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
      <span className={`relative flex h-2.5 w-2.5`}>
        {status === "live" && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.c} opacity-60`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${s.c}`} />
      </span>
      {s.label}
    </span>
  );
}

export function Toaster({ toast, onDone }) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink-700/95 px-4 py-2.5 text-sm font-semibold text-white shadow-card backdrop-blur"
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
