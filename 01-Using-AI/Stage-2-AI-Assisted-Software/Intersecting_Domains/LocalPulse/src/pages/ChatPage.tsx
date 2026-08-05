import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Send, Plus, MessageSquare, Trash2, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Report, ChatThread, ChatMessage } from '@/types';
import { chat, generateThreadTitle, hasApiKey } from '@/lib/ai';
import { Button, EmptyState, Spinner } from '@/components/ui';
import { navigateTo } from '@/lib/router';

interface DisplayMessage extends ChatMessage {
  pending?: boolean;
}

export function ChatPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [reportContext, setReportContext] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiReady = hasApiKey();

  // Load report context once for RAG-style grounding
  useEffect(() => {
    supabase
      .from('reports')
      .select('title, category, severity, city, country, status, description')
      .order('created_at', { ascending: false })
      .limit(60)
      .then(({ data }) => {
        if (data) {
          const ctx = (data as Partial<Report>[]).map((r, i) =>
            `[${i + 1}] ${r.title} | ${r.category} | ${r.severity} | ${r.city}, ${r.country} | status: ${r.status} | ${r.description?.slice(0, 120)}`
          ).join('\n');
          setReportContext(ctx);
        }
      });
  }, []);

  // Load threads
  useEffect(() => {
    if (!user) { setLoadingThreads(false); return; }
    supabase
      .from('chat_threads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setThreads((data as ChatThread[]) ?? []);
        setLoadingThreads(false);
        if (data && data.length > 0) setActiveThread(data[0].id);
      });
  }, [user]);

  // Load messages for active thread
  useEffect(() => {
    if (!activeThread) { setMessages([]); return; }
    supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', activeThread)
      .order('created_at', { ascending: true })
      .then(({ data }) => setMessages((data as ChatMessage[]) ?? []));
  }, [activeThread]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const newThread = useCallback(async () => {
    if (!user) { navigateTo('/auth/signin'); return; }
    const { data, error } = await supabase.from('chat_threads').insert({}).select('*').single();
    if (error) { toast('error', 'Could not create conversation.'); return; }
    const t = data as ChatThread;
    setThreads((prev) => [t, ...prev]);
    setActiveThread(t.id);
    setMessages([]);
  }, [user, toast]);

  const deleteThread = async (id: string) => {
    const { error } = await supabase.from('chat_threads').delete().eq('id', id);
    if (error) { toast('error', 'Could not delete conversation.'); return; }
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThread === id) { setActiveThread(threads.find((t) => t.id !== id)?.id ?? null); setMessages([]); }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || !activeThread) return;
    if (!aiReady) { toast('info', 'Add your AI API key in AI Settings to use the assistant.'); return; }

    const userMsg = input.trim();
    setInput('');
    const userDisplay: DisplayMessage = { id: 'tmp-' + Date.now(), thread_id: activeThread, role: 'user', content: userMsg, created_at: new Date().toISOString() };
    const pendingAssistant: DisplayMessage = { id: 'tmp-a-' + Date.now(), thread_id: activeThread, role: 'assistant', content: '', created_at: new Date().toISOString(), pending: true };
    setMessages((m) => [...m, userDisplay, pendingAssistant]);
    setSending(true);

    // Save user message to DB
    await supabase.from('chat_messages').insert({ thread_id: activeThread, role: 'user', content: userMsg });

    // Build history for AI
    const history = [...messages.filter((m) => !m.pending).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })), { role: 'user' as const, content: userMsg }];

    try {
      const reply = await chat(history, reportContext);
      await supabase.from('chat_messages').insert({ thread_id: activeThread, role: 'assistant', content: reply });
      setMessages((m) => m.map((x) => x.id === pendingAssistant.id ? { ...x, content: reply, pending: false } : x));

      // Update thread title if first message
      if (messages.length === 0) {
        const title = await generateThreadTitle(userMsg);
        await supabase.from('chat_threads').update({ title }).eq('id', activeThread);
        setThreads((prev) => prev.map((t) => t.id === activeThread ? { ...t, title } : t));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI request failed.';
      setMessages((m) => m.map((x) => x.id === pendingAssistant.id ? { ...x, content: `Error: ${msg}`, pending: false } : x));
      toast('error', msg);
    }
    setSending(false);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Bot className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Sign in to use the AI Assistant</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">The assistant saves your conversations to your account.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigateTo('/auth/signin')}>Sign In</Button>
          <Button variant="outline" onClick={() => navigateTo('/auth/signup')}>Create Account</Button>
        </div>
      </div>
    );
  }

  const active = threads.find((t) => t.id === activeThread);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <Bot className="h-6 w-6 text-teal-600 dark:text-teal-400" /> AI Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ask about community problems. Answers are grounded in real reports.</p>
        </div>
      </div>

      {!aiReady && (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Sparkles className="h-4 w-4" />
          Add your AI API key in <button onClick={() => navigateTo('/settings')} className="font-medium underline">AI Settings</button> to start chatting.
        </div>
      )}

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden md:grid-cols-[240px_1fr]">
        {/* Thread list */}
        <div className="hidden flex-col rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800 md:flex">
          <Button size="sm" onClick={newThread} className="mb-3 w-full">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
          <div className="flex-1 space-y-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="flex justify-center py-4"><Spinner className="h-5 w-5 text-slate-400" /></div>
            ) : threads.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-slate-400">No conversations yet.</p>
            ) : (
              threads.map((t) => (
                <div key={t.id} className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${activeThread === t.id ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'}`}>
                  <button onClick={() => setActiveThread(t.id)} className="flex flex-1 items-center gap-2 truncate">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t.title}</span>
                  </button>
                  <button onClick={() => deleteThread(t.id)} className="text-slate-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          {active && (
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700 md:hidden">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{active.title}</p>
            </div>
          )}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            {!activeThread ? (
              <EmptyState
                icon={<Bot className="h-10 w-10" />}
                title="Start a conversation"
                description="Ask about community problems and get AI-powered answers grounded in real reports."
                action={<Button onClick={newThread}><Plus className="h-4 w-4" /> New Chat</Button>}
              />
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <Bot className="h-12 w-12 text-teal-500" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Ask about community issues</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try one of these:</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {['What are the biggest problems in my city?', 'Which areas have water shortages?', 'Show recurring transport complaints.', 'What issues have increased this month?'].map((s) => (
                    <button key={s} onClick={() => setInput(s)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-teal-300 hover:text-teal-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-teal-500">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'}`}>
                      {m.role === 'user' ? <span className="text-xs font-bold">{user.email?.charAt(0).toUpperCase()}</span> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200'}`}>
                      {m.pending ? (
                        <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</span>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={send} className="border-t border-slate-100 p-3 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about community problems…"
                disabled={sending || !activeThread}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white disabled:opacity-50"
              />
              <Button type="submit" disabled={!input.trim() || sending || !activeThread || !aiReady}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
