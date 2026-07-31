import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionCard, {
  ConnectionDot,
  EmptyState,
  QuestionInput,
  Toaster,
} from "../components/QuestionCard.jsx";
import { useToast } from "../components/useToast.js";
import { useRoom } from "../realtime/useRoom.js";

export default function StudentView() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { room, status, actions } = useRoom(roomId, { role: "student" });
  const { toast, show } = useToast();

  // Student feed: show everything (open + answered), newest-driven by upvotes.
  const sorted = useMemo(() => {
    const list = [...(room?.questions || [])];
    return list.sort((a, b) => {
      if (a.answered !== b.answered) return a.answered ? 1 : -1;
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      return b.createdAt - a.createdAt;
    });
  }, [room?.questions]);

  useEffect(() => {
    if (status === "closed") {
      const t = setTimeout(() => navigate("/"), 1500);
      return () => clearTimeout(t);
    }
  }, [status, navigate]);

  if (status === "closed" || (!room && status !== "connecting")) {
    return <RoomClosed onHome={() => navigate("/")} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="btn-ghost px-2.5 py-2 text-slate-300"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-xs uppercase tracking-wider text-slate-500">Room</p>
            <p className="font-mono text-lg font-extrabold tracking-[0.3em] text-white">
              {roomId}
            </p>
          </div>
          <div className="min-w-[88px] text-right">
            <ConnectionDot status={status} />
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-5 sm:px-6">
        {status === "connecting" && !room ? (
          <div className="grid place-items-center py-20 text-slate-400">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-brand-400" />
            <p className="mt-3 text-sm">Connecting to room…</p>
          </div>
        ) : (
          <>
            <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {room.questions.length} {room.questions.length === 1 ? "question" : "questions"} in the room
            </p>
            <section className="space-y-3">
              {sorted.length === 0 ? (
                <EmptyState isTeacher={false} />
              ) : (
                <AnimatePresence initial={false}>
                  {sorted.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      isTeacher={false}
                      onUpvote={actions.upvote}
                    />
                  ))}
                </AnimatePresence>
              )}
            </section>
          </>
        )}
      </main>

      {/* Sticky input bar */}
      <div className="sticky bottom-0 z-20 border-t border-white/5 bg-ink-950/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-2xl px-4 py-3 sm:px-6">
          <QuestionInput
            onSubmit={async (text, author) => {
              const q = actions.submit(text, author);
              if (q) show("Question sent");
              else show("Could not send — room may have ended");
            }}
            disabled={status !== "live"}
          />
        </div>
      </div>

      <Toaster toast={toast} />
    </div>
  );
}

function RoomClosed({ onHome }) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
          <LogOut className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-white">Room closed</h1>
        <p className="mt-2 text-sm text-slate-400">
          The teacher ended this session or the room expired. Rooms are ephemeral and disappear
          when the session ends.
        </p>
        <button onClick={onHome} className="btn-primary mt-6 px-5 py-3">
          Back to home
        </button>
      </div>
    </div>
  );
}
