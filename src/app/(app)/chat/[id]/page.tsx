'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useUserId } from '@/lib/hooks/useUserId';
import type { Conversation, Message } from '@/types';

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const userId = useUserId();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!params?.id) return;

      try {
        const [convRes, msgRes] = await Promise.all([
          fetch(`/api/conversations?user_id=${userId}`),
          fetch(`/api/messages/${params.id}`),
        ]);

        if (convRes.ok) {
          const convs: Conversation[] = await convRes.json();
          const conv = convs.find((c) => c.id === params.id);
          if (conv) setConversation(conv);
        }

        if (msgRes.ok) {
          const msgs: Message[] = await msgRes.json();
          setMessages(msgs);
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    }

    if (userId) load();
  }, [params?.id, userId]);

  if (!userId || loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <div className="skeleton h-8 w-48" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="skeleton h-16 w-64 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      conversationId={params?.id}
      userId={userId}
      initialMessages={messages}
      conversation={conversation || undefined}
    />
  );
}
