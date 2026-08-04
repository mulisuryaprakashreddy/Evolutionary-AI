import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  LogOut,
  QrCode,
  Share2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { QRCodeSVG } from "qrcode.react";
import QuestionCard, { EmptyState, Toaster } from "../components/QuestionCard.jsx";
import ShareModal from "../components/ShareModal.jsx";
import { useToast } from "../components/useToast.js";
import { useRoom } from "../realtime/useRoom.js";

function sortQuestions(qs, mode) {
  const copy = [...qs];
  if (mode === "latest") {
    return copy.sort((a, b) => b.createdAt - a.createdAt);
  }
  return copy.sort((a, b) => {
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
    return b.createdAt - a.createdAt;
  });
}

export default function TeacherDashboard() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get("role") === "teacher" ? "teacher" : "student";
  const { room, status, presence, actions } = useRoom(roomId, { role });
  const [sortMode, setSortMode] = useState("top");
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [filter, setFilter] = useState("open");
  const { toast, show } = useToast();

  const sorted = useMemo(
    () => sortQuestions(room?.questions || [], sortMode),
    [room?.questions, sortMode]
  );
  const visible = sorted.filter((q) => (filter === "open" ? !q.answered : q.answered));

  const shareUrl = useMemo(() => `${window.location.origin}/#/room/${roomId}`, [roomId]);

  function handleEnd() {
    actions.end();
    show("Session ended");
    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#34d399", "#a5b4fc"],
      });
    }, 50);
    setTimeout(() => navigate("/"), 900);
  }

  useEffect(() => {
    if (status === "closed") {
      const t = setTimeout(() => navigate("/"), 1200);
      return () => clearTimeout(t);
    }
  }, [status, navigate]);

  if (status === "connecting" || status === "closed" || !room) {
    return <RoomClosed onHome={() => navigate("/")} status={status} />;
  }

  const openCount = room.questions.filter((q) => !q.answered).length;
  const answeredCount = room.questions.length - openCount;
  const studentCount = presence.students;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="btn-ghost px-2.5 py-2 text-slate-300"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
              <span className="font-extrabold">Q</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">Teacher Dashboard</p>
              <p className="font-mono text-xs tracking-widest text-slate-400">{room.roomId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge hidden bg-white/5 text-slate-300 sm:inline-flex">
              <Users className="h-3.5 w-3.5 text-brand-300" /> {studentCount} live
            </span>
            <button onClick={() => setShareOpen(true)} className="btn-primary px-3 py-2 text-sm">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            {confirmEnd ? (
              <div className="flex items-center gap-1">
                <button onClick={handleEnd} className="btn-danger px-3 py-2 text-sm">
                  End now
                </button>
                <button onClick={() => setConfirmEnd(false)} className="btn-ghost px-2.5 py-2 text-sm">
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmEnd(true)}
                className="btn-ghost px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/15"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">End</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <ShareBanner roomCode={room.roomId} shareUrl={shareUrl} onOpenModal={() => setShareOpen(true)} />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FilterTab active={filter === "open"} onClick={() => setFilter("open")}>
              Open <span className="opacity-70">({openCount})</span>
            </FilterTab>
            <FilterTab active={filter === "answered"} onClick={() => setFilter("answered")}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Answered{" "}
              <span className="opacity-70">({answeredCount})</span>
            </FilterTab>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Sort</span>
            <div className="inline-flex rounded-lg border border-white/10 bg-ink-900/60 p-0.5">
              <SortChip active={sortMode === "top"} onClick={() => setSortMode("top")}>
                Most upvoted
              </SortChip>
              <SortChip active={sortMode === "latest"} onClick={() => setSortMode("latest")}>
                Latest
              </SortChip>
            </div>
          </div>
        </div>

        <section className="mt-5 space-y-3">
          {visible.length === 0 ? (
            <EmptyState isTeacher />
          ) : (
            <AnimatePresence initial={false}>
              {visible.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  isTeacher
                  onUpvote={() => {}}
                  onToggleAnswered={actions.toggleAnswered}
                  onDelete={(id) => {
                    actions.remove(id);
                    show("Question deleted");
                  }}
                />
              ))}
            </AnimatePresence>
          )}
        </section>
      </main>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        roomCode={room.roomId}
        shareUrl={shareUrl}
      />
      <Toaster toast={toast} />
    </div>
  );
}

function FilterTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
        active ? "bg-white/10 text-white" : "bg-transparent text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function SortChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`chip ${active ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function ShareBanner({ roomCode, shareUrl, onOpenModal }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mx-auto max-w-5xl px-4 pt-4 sm:px-6">
      <div className="card overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Invite students</p>
              <p className="text-xs text-slate-400">
                Code <span className="font-mono font-bold text-slate-200">{roomCode}</span> &middot; tap to {open ? "hide" : "show"}
              </p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center gap-4 border-t border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white p-2.5">
                    <QRCodeSVG value={shareUrl} size={84} level="M" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">Room code</p>
                    <p className="font-mono text-3xl font-extrabold tracking-[0.3em] text-white">
                      {roomCode}
                    </p>
                    <p className="mt-1 max-w-xs truncate font-mono text-xs text-slate-500">
                      {shareUrl}
                    </p>
                  </div>
                </div>
                <button onClick={onOpenModal} className="btn-ghost px-4 py-2.5 text-sm">
                  <Share2 className="h-4 w-4" /> Open share card
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function RoomClosed({ onHome, status }) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-300">
          <LogOut className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-white">
          {status === "connecting" ? "Looking for room…" : "Room closed"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {status === "connecting"
            ? "Trying to reach the room. If nothing appears, it may have ended."
            : "This room has ended or never existed. Rooms are ephemeral and disappear when the teacher ends the session."}
        </p>
        <button onClick={onHome} className="btn-primary mt-6 px-5 py-3">
          Back to home
        </button>
      </div>
    </div>
  );
}
