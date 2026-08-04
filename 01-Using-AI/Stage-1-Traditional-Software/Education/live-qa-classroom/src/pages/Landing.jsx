import { motion } from "framer-motion";
import { ArrowRight, LogIn, MessageSquareText, QrCode, Sparkles, Users, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { roomStore } from "../realtime/roomStore.js";

export default function Landing() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function createRoom() {
    const room = roomStore.createRoom("teacher");
    navigate(`/room/${room.roomId}?role=teacher`);
  }

  function joinRoom(e) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length < 4) {
      setError("Enter a valid room code.");
      return;
    }
    const existing = roomStore.getRoom(trimmed);
    if (existing) {
      navigate(`/room/${trimmed}`);
    } else {
      // Room may live in another tab; route to the room and let the view
      // resolve it via the sync-request flow (shows "Room Closed" if absent).
      navigate(`/room/${trimmed}`);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-8 sm:px-8">
      {/* Nav */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white shadow-glow">
            <span className="text-lg font-extrabold">Q</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Live Q&amp;A Board</p>
            <p className="text-xs text-slate-400">Classroom edition</p>
          </div>
        </div>
        <span className="badge bg-white/5 text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-brand-300" /> No sign-up
        </span>
      </header>

      {/* Hero */}
      <main className="mt-12 grid flex-1 items-center gap-10 lg:mt-20 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge bg-brand-500/15 text-brand-300">
            <Zap className="h-3.5 w-3.5" /> Real-time &middot; Ephemeral
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Instant Q&amp;A
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-emerald2-400 bg-clip-text text-transparent">
              for classrooms.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base text-slate-300 sm:text-lg">
            Spin up a live question board in seconds. Share a code, let students upvote what
            matters, and answer the room in real time. No accounts, no database, nothing stored.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={createRoom} className="btn-primary px-6 py-3.5 text-base">
              Create Classroom Room
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Join card */}
          <form onSubmit={joinRoom} className="mt-8 max-w-md">
            <p className="mb-2 text-sm font-semibold text-slate-300">Have a room code?</p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().slice(0, 8));
                  setError("");
                }}
                placeholder="e.g. X7K29P"
                className="input font-mono uppercase tracking-widest"
                aria-label="Room code"
              />
              <button type="submit" className="btn-ghost px-5">
                <LogIn className="h-5 w-5" />
                <span className="hidden sm:inline">Join</span>
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
          </form>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-slate-400" /> Unlimited students
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquareText className="h-4 w-4 text-slate-400" /> 280-char questions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-slate-400" /> QR share for the class
            </span>
          </div>
        </motion.div>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden lg:block"
        >
          <div className="card relative overflow-hidden p-6">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">Room</p>
                  <p className="font-mono text-2xl font-extrabold tracking-widest text-white">
                    MATH42
                  </p>
                </div>
                <span className="badge bg-emerald2-500/15 text-emerald2-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald2-400" /> 28 live
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { t: "Can you re-explain the chain rule with an example?", a: "Maya", v: 12 },
                  { t: "Is the midterm covering partial derivatives?", a: "Anonymous", v: 8 },
                  { t: "Will office hours move next week?", a: "Devon", v: 3 },
                ].map((q, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.12 }}
                    className="rounded-xl border border-white/5 bg-ink-900/60 p-3.5"
                  >
                    <p className="text-sm text-slate-100">{q.t}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{q.a}</span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-brand-500/10 px-2 py-0.5 font-semibold text-brand-300">
                        ▲ {q.v}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="mt-10 text-center text-xs text-slate-600">
        Ephemeral by design &middot; rooms vanish when the teacher ends the session
      </footer>
    </div>
  );
}
