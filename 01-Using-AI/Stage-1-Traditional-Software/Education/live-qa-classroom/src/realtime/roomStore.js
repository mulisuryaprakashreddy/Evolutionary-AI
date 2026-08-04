// In-memory room store with a Socket.io-style event protocol.
//
// Transport: BroadcastChannel (with a localStorage fallback) so multiple
// browser tabs in the same origin stay in sync in real time. The public
// event names mirror a Socket.io server 1:1, so this module maps onto a
// real Node + Socket.io backend with no caller changes.
//
// Emitted events (the "server -> client" direction):
//   room-state       { room }
//   question-added   { roomId, question }
//   question-upvoted { roomId, questionId, voterId }
//   question-updated { roomId, question }
//   question-deleted { roomId, questionId }
//   room-closed      { roomId }
//
// Handled commands (the "client -> server" direction):
//   join-room        { roomId, role }
//   submit-question  { roomId, text, author }
//   upvote-question  { roomId, questionId, voterId }
//   mark-answered    { roomId, questionId }
//   delete-question  { roomId, questionId }
//   end-room         { roomId }

const CHANNEL_NAME = "live-qa-classroom";
const TEACHER_HEARTBEAT_MS = 10_000;
const TEACHER_TIMEOUT_MS = 3 * 60_000;
const SWEEP_INTERVAL_MS = 15_000;
const PRESENCE_PING_MS = 5_000;
const PRESENCE_TIMEOUT_MS = 15_000;

function getTabId() {
  const KEY = "qa-tab-id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

function makeId(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

function freshRoom(roomId, createdBy) {
  return {
    roomId,
    createdBy,
    questions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastTeacherHeartbeat: Date.now(),
  };
}

function pubSub() {
  if (typeof BroadcastChannel !== "undefined") {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    return {
      post: (msg) => ch.postMessage(msg),
      onMessage: (cb) => {
        ch.addEventListener("message", (e) => cb(e.data));
      },
      close: () => ch.close(),
    };
  }
  // Fallback: localStorage + storage event (older browsers).
  const key = CHANNEL_NAME;
  return {
    post: (msg) => {
      try {
        localStorage.setItem(key, JSON.stringify({ v: Math.random(), msg }));
      } catch {}
    },
    onMessage: (cb) => {
      window.addEventListener("storage", (e) => {
        if (e.key !== key || !e.newValue) return;
        try {
          cb(JSON.parse(e.newValue).msg);
        } catch {}
      });
    },
    close: () => {},
  };
}

class RoomStore {
  constructor() {
    this.rooms = new Map();
    this.listeners = new Map(); // roomId -> Set<cb>
    this.globalListeners = new Set();
    this.teacherRooms = new Set(); // rooms this tab is the teacher for
    this.heartbeatTimer = null;
    this.sweepTimer = null;
    this.presenceTimer = null;
    this.bus = pubSub();
    this.tabId = getTabId();
    // roomId -> Map<tabId, { role, lastSeen }>
    this.presence = new Map();

    this.bus.onMessage((msg) => this._onBusMessage(msg));

    this.sweepTimer = setInterval(() => this._sweep(), SWEEP_INTERVAL_MS);
    window.addEventListener("beforeunload", () => this._onUnload());
  }

  // --- subscriptions ---------------------------------------------------
  subscribe(roomId, cb) {
    if (!this.listeners.has(roomId)) this.listeners.set(roomId, new Set());
    this.listeners.get(roomId).add(cb);
    return () => this.listeners.get(roomId)?.delete(cb);
  }

  onAny(cb) {
    this.globalListeners.add(cb);
    return () => this.globalListeners.delete(cb);
  }

  _emit(event) {
    const roomId = event.roomId || event.room?.roomId;
    this.listeners.get(roomId)?.forEach((cb) => cb(event));
    this.globalListeners.forEach((cb) => cb(event));
  }

  _broadcast(event) {
    this.bus.post(event);
  }

  _onBusMessage(event) {
    if (!event || !event.type) return;
    switch (event.type) {
      case "sync-request": {
        const room = this.rooms.get(event.roomId);
        if (room) this._broadcast({ type: "room-state", room });
        break;
      }
      case "room-state": {
        this._mergeRoom(event.room);
        break;
      }
      case "question-added": {
        const room = this.rooms.get(event.roomId);
        if (room && !room.questions.some((q) => q.id === event.question.id)) {
          room.questions.unshift(event.question);
          room.updatedAt = Date.now();
          this._emit({ type: "question-added", roomId: event.roomId, question: event.question });
        }
        break;
      }
      case "question-upvoted": {
        const room = this.rooms.get(event.roomId);
        const q = room?.questions.find((x) => x.id === event.questionId);
        if (q) {
          q.upvoters = new Set(q.upvoters || []);
          q.upvoters.add(event.voterId);
          q.upvotes = q.upvoters.size;
          q.updatedAt = Date.now();
          this._emit({ type: "question-upvoted", roomId: event.roomId, questionId: event.questionId, voterId: event.voterId });
        }
        break;
      }
      case "question-updated": {
        const room = this.rooms.get(event.roomId);
        const q = room?.questions.find((x) => x.id === event.question.id);
        if (q && event.question.updatedAt >= (q.updatedAt || 0)) {
          Object.assign(q, event.question);
          this._emit({ type: "question-updated", roomId: event.roomId, question: q });
        }
        break;
      }
      case "question-deleted": {
        const room = this.rooms.get(event.roomId);
        if (room) {
          room.questions = room.questions.filter((x) => x.id !== event.questionId);
          room.updatedAt = Date.now();
          this._emit({ type: "question-deleted", roomId: event.roomId, questionId: event.questionId });
        }
        break;
      }
      case "room-closed": {
        if (this.rooms.has(event.roomId)) {
          this.rooms.delete(event.roomId);
          this.teacherRooms.delete(event.roomId);
          this._emit({ type: "room-closed", roomId: event.roomId });
        }
        break;
      }
      case "teacher-heartbeat": {
        const room = this.rooms.get(event.roomId);
        if (room) room.lastTeacherHeartbeat = Date.now();
        break;
      }
      case "presence-ping": {
        this._addPresence(event.roomId, event.tabId, event.role);
        this._emit({ type: "presence", roomId: event.roomId });
        break;
      }
      case "presence-leave": {
        const map = this.presence.get(event.roomId);
        if (map) {
          map.delete(event.tabId);
          this._emit({ type: "presence", roomId: event.roomId });
        }
        break;
      }
    }
  }

  _mergeRoom(room) {
    if (!room || !room.roomId) return;
    const local = this.rooms.get(room.roomId);
    if (!local || room.updatedAt >= local.updatedAt) {
      // Normalize upvoters back into a Set.
      const normalized = {
        ...room,
        questions: (room.questions || []).map((q) => ({
          ...q,
          upvoters: new Set(q.upvoters || []),
        })),
      };
      this.rooms.set(room.roomId, normalized);
      this._emit({ type: "room-state", room: normalized });
    }
  }

  // --- commands --------------------------------------------------------
  createRoom(createdBy = "teacher") {
    let id;
    do {
      id = makeId(6);
    } while (this.rooms.has(id));
    const room = freshRoom(id, createdBy);
    this.rooms.set(id, room);
    this.teacherRooms.add(id);
    this._startHeartbeat();
    this._broadcast({ type: "room-state", room: this._serialize(room) });
    return room;
  }

  // join-room { roomId, role }
  joinRoom(roomId, role) {
    let room = this.rooms.get(roomId);
    if (!room) {
      // Ask other tabs for the room; resolve async via event.
      this._broadcast({ type: "sync-request", roomId });
    }
    if (role === "teacher") {
      this.teacherRooms.add(roomId);
      if (room) room.lastTeacherHeartbeat = Date.now();
      this._startHeartbeat();
    }
    this._addPresence(roomId, this.tabId, role);
    this._startPresencePing(roomId, role);
    this._broadcast({ type: "presence-ping", roomId, tabId: this.tabId, role });
    return room;
  }

  // submit-question { roomId, text, author }
  submitQuestion(roomId, text, author) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const question = {
      id: crypto.randomUUID(),
      roomId,
      text: String(text).slice(0, 280).trim(),
      author: author?.trim() || "Anonymous",
      upvotes: 0,
      upvoters: [],
      answered: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (!question.text) return null;
    room.questions.unshift(question);
    room.updatedAt = Date.now();
    const event = { type: "question-added", roomId, question };
    this._emit(event);
    this._broadcast({ type: "question-added", roomId, question: this._serializeQuestion(question) });
    return question;
  }

  // upvote-question { roomId, questionId, voterId }
  upvoteQuestion(roomId, questionId, voterId) {
    const room = this.rooms.get(roomId);
    const q = room?.questions.find((x) => x.id === questionId);
    if (!q || !voterId) return null;
    const set = new Set(q.upvoters || []);
    set.add(voterId);
    q.upvoters = set;
    q.upvotes = set.size;
    q.updatedAt = Date.now();
    const event = { type: "question-upvoted", roomId, questionId, voterId };
    this._emit(event);
    this._broadcast({
      type: "question-upvoted",
      roomId,
      questionId,
      voterId,
      upvoters: [...set],
      upvotes: set.size,
      updatedAt: q.updatedAt,
    });
    return q;
  }

  // mark-answered { roomId, questionId }
  markAnswered(roomId, questionId) {
    const room = this.rooms.get(roomId);
    const q = room?.questions.find((x) => x.id === questionId);
    if (!q) return null;
    q.answered = !q.answered;
    q.updatedAt = Date.now();
    const event = { type: "question-updated", roomId, question: this._serializeQuestion(q) };
    this._emit({ type: "question-updated", roomId, question: q });
    this._broadcast(event);
    return q;
  }

  // delete-question { roomId, questionId }
  deleteQuestion(roomId, questionId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.questions = room.questions.filter((x) => x.id !== questionId);
    room.updatedAt = Date.now();
    const event = { type: "question-deleted", roomId, questionId };
    this._emit(event);
    this._broadcast(event);
    return true;
  }

  // end-room { roomId }
  endRoom(roomId) {
    if (!this.rooms.has(roomId)) return false;
    this.rooms.delete(roomId);
    this.teacherRooms.delete(roomId);
    const event = { type: "room-closed", roomId };
    this._emit(event);
    this._broadcast(event);
    if (this.teacherRooms.size === 0) this._stopHeartbeat();
    return true;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId) || null;
  }

  // --- internals -------------------------------------------------------
  _serializeQuestion(q) {
    return { ...q, upvoters: [...(q.upvoters || [])] };
  }

  _serialize(room) {
    return { ...room, questions: room.questions.map(this._serializeQuestion) };
  }

  _startHeartbeat() {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(() => {
      this.teacherRooms.forEach((roomId) => {
        const room = this.rooms.get(roomId);
        if (room) {
          room.lastTeacherHeartbeat = Date.now();
          this._broadcast({ type: "teacher-heartbeat", roomId });
        }
      });
    }, TEACHER_HEARTBEAT_MS);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  _sweep() {
    const now = Date.now();
    for (const [roomId, room] of this.rooms) {
      if (this.teacherRooms.has(roomId)) continue; // this tab is the teacher, keep alive
      if (now - (room.lastTeacherHeartbeat || room.createdAt) > TEACHER_TIMEOUT_MS) {
        this.endRoom(roomId);
      }
    }
  }

  _onUnload() {
    // Teacher closing the tab ends their owned rooms after the heartbeat
    // expires (3 min). We do NOT forcibly close here so a teacher navigating
    // or refreshing doesn't instantly kill the room for joined students.
    this.presence.forEach((_map, roomId) => {
      this._broadcast({ type: "presence-leave", roomId, tabId: this.tabId });
    });
    this.bus.close();
  }

  // --- presence --------------------------------------------------------
  _addPresence(roomId, tabId, role) {
    if (!this.presence.has(roomId)) this.presence.set(roomId, new Map());
    const map = this.presence.get(roomId);
    const existing = map.get(tabId);
    map.set(tabId, { role: role || existing?.role || "student", lastSeen: Date.now() });
  }

  _startPresencePing(roomId, role) {
    if (!this.presenceTimer) {
      this.presenceTimer = setInterval(() => {
        this.presence.forEach((_map, rid) => {
          this._broadcast({ type: "presence-ping", roomId: rid, tabId: this.tabId, role });
          // Prune stale peers.
          const m = this.presence.get(rid);
          if (m) {
            const now = Date.now();
            let changed = false;
            for (const [tid, info] of m) {
              if (tid !== this.tabId && now - (info.lastSeen || 0) > PRESENCE_TIMEOUT_MS) {
                m.delete(tid);
                changed = true;
              }
            }
            if (changed) this._emit({ type: "presence", roomId: rid });
          }
        });
      }, PRESENCE_PING_MS);
    }
  }

  getPresence(roomId) {
    const map = this.presence.get(roomId);
    if (!map) return { total: 0, students: 0, teachers: 0 };
    let students = 0;
    let teachers = 0;
    for (const info of map.values()) {
      if (info.role === "teacher") teachers++;
      else students++;
    }
    return { total: map.size, students, teachers };
  }
}

export const roomStore = new RoomStore();
export { makeId };
