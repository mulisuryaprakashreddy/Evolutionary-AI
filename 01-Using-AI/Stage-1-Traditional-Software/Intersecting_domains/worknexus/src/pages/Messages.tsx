import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, Avatar, EmptyState, Spinner, Button } from '@/components/ui';
import { formatDateTime, timeAgo } from '@/lib/utils';
import type { Contract, Profile, Message, Project } from '@/lib/types';

interface ContractRow extends Contract {
  project?: Project | null;
  client?: Profile | null;
  freelancer?: Profile | null;
}

export function Messages() {
  const [searchParams] = useSearchParams();
  const { session, profile } = useAuth();
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContract = contracts.find((c) => c.id === selectedId);
  const otherParty = selectedContract
    ? profile?.id === selectedContract.client_id
      ? selectedContract.freelancer
      : selectedContract.client
    : null;

  useEffect(() => {
    if (!session?.user?.id) return;
    async function load() {
      const uid = session!.user!.id;
      const { data } = await supabase
        .from('contracts')
        .select('*, project:projects(*), client:profiles!contracts_client_id_fkey(*), freelancer:profiles!contracts_freelancer_id_fkey(*)')
        .or(`client_id.eq.${uid},freelancer_id.eq.${uid}`)
        .order('updated_at', { ascending: false });
      const rows = (data as ContractRow[]) ?? [];
      setContracts(rows);
      const queryContract = searchParams.get('contract');
      if (queryContract && rows.some((r) => r.id === queryContract)) {
        setSelectedId(queryContract);
      } else if (rows.length > 0) {
        setSelectedId(rows[0].id);
      }
      setLoading(false);
    }
    load();
  }, [session?.user?.id, searchParams]);

  useEffect(() => {
    if (!selectedId) return;
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('contract_id', selectedId)
        .order('created_at', { ascending: true });
      setMessages((data as Message[]) ?? []);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    loadMessages();

    const channel = supabase
      .channel(`messages-${selectedId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `contract_id=eq.${selectedId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedId || !session?.user?.id || !selectedContract) return;
    setSending(true);
    const receiverId = profile?.id === selectedContract.client_id ? selectedContract.freelancer_id : selectedContract.client_id;
    const { error } = await supabase.from('messages').insert({
      contract_id: selectedId,
      sender_id: session.user.id,
      receiver_id: receiverId,
      body: newMessage.trim(),
    });
    if (error) {
      console.error(error);
      setSending(false);
      return;
    }
    setNewMessage('');
    setSending(false);
  }, [newMessage, selectedId, session?.user?.id, selectedContract, profile?.id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-primary-500" /></div>;

  if (contracts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState icon={MessageSquare} title="No conversations yet" description="Start a contract with a freelancer to begin chatting." action={<Link to="/projects"><Button>Browse Projects</Button></Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold font-[var(--font-display)] mb-4">Messages</h1>
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-[280px_1fr] h-[600px]">
          {/* Conversation list */}
          <div className="border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto">
            {contracts.map((c) => {
              const other = profile?.id === c.client_id ? c.freelancer : c.client;
              const isActive = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full flex items-center gap-3 p-3 border-b border-neutral-100 dark:border-neutral-800/50 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-950/30' : ''}`}
                >
                  <Avatar name={other?.full_name ?? '?'} src={other?.avatar_url} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{other?.full_name}</p>
                    <p className="text-xs text-neutral-500 truncate">{c.project?.title}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat */}
          <div className="flex flex-col">
            {selectedContract && otherParty ? (
              <>
                <div className="border-b border-neutral-200 dark:border-neutral-800 p-3 flex items-center gap-3">
                  <Avatar name={otherParty.full_name} src={otherParty.avatar_url} size="md" />
                  <div>
                    <p className="font-semibold text-sm">{otherParty.full_name}</p>
                    <p className="text-xs text-neutral-500">{selectedContract.project?.title}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-neutral-400">
                      No messages yet. Say hello!
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_id === session?.user?.id;
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-neutral-100 dark:bg-neutral-800 rounded-bl-sm'}`}>
                            <p className="text-sm">{m.body}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-200' : 'text-neutral-400'}`}>{timeAgo(m.created_at)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                    placeholder="Type a message..."
                    className="flex-1 h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <Button onClick={sendMessage} loading={sending} size="md">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-neutral-400">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
