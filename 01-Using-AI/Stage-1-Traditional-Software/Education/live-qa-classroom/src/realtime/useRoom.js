import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { roomStore } from "./roomStore.js";

// Unique per-browser voter id (persists across reloads via localStorage).
export function getVoterId() {
  const KEY = "qa-voter-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

// Subscribe a component to a room's live state. Returns { room, status }.
//
// status: "connecting" | "live" | "closed"
//   - connecting: room not yet known locally, waiting on sync from other tabs
//   - live: room exists, events are streaming
//   - closed: room was ended or never existed (after a short timeout)
export function useRoom(roomId, { role = "student" } = {}) {
  const [room, setRoom] = useState(() => roomStore.getRoom(roomId));
  const [status, setStatus] = useState(() =>
    roomStore.getRoom(roomId) ? "live" : "connecting"
  );
  const [events, setEvents] = useState(0); // bump on any event for derived UI
  const [presence, setPresence] = useState(() => roomStore.getPresence(roomId));
  const pendingTimer = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    let mounted = true;

    const apply = () => {
      if (!mounted) return;
      const current = roomStore.getRoom(roomId);
      setRoom(current ? { ...current, questions: [...current.questions] } : null);
      setStatus(current ? "live" : "connecting");
    };

    apply();
    roomStore.joinRoom(roomId, role);

    const unsub = roomStore.subscribe(roomId, (event) => {
      if (!mounted) return;
      if (event.type === "room-closed") {
        setRoom(null);
        setStatus("closed");
        return;
      }
      apply();
      setEvents((n) => n + 1);
      setPresence(roomStore.getPresence(roomId));
    });

    // Ask other tabs for a fresh copy in case we joined before they existed.
    const resync = () => roomStore.joinRoom(roomId, role);
    const resyncTimer = setInterval(resync, 4000);

    // If the room never resolves, flip to "closed" so the UI can show a
    // "Room Closed" state instead of spinning forever.
    if (!roomStore.getRoom(roomId)) {
      pendingTimer.current = setTimeout(() => {
        if (mounted && !roomStore.getRoom(roomId)) setStatus("closed");
      }, 2500);
    }

    return () => {
      mounted = false;
      unsub();
      clearInterval(resyncTimer);
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    };
  }, [roomId, role]);

  const actions = useMemo(
    () => ({
      submit: (text, author) => roomStore.submitQuestion(roomId, text, author),
      upvote: (questionId) => roomStore.upvoteQuestion(roomId, questionId, getVoterId()),
      toggleAnswered: (questionId) => roomStore.markAnswered(roomId, questionId),
      remove: (questionId) => roomStore.deleteQuestion(roomId, questionId),
      end: () => roomStore.endRoom(roomId),
    }),
    [roomId]
  );

  return { room, status, events, presence, actions };
}

// Fire-and-forget clipboard helper with a graceful fallback.
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (text) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      return true;
    } catch {
      return false;
    }
  }, []);
  return { copied, copy };
}

export function timeAgo(ts) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
