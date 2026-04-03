'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useConversationStore } from '@/lib/store/conversationStore';

interface ConversationListProps {
  userId: string;
  onSelect?: () => void;
}

function groupByDate(conversations: Array<{ id: string; title: string; updated_at: string }>) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: { label: string; items: typeof conversations }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier', items: [] },
  ];

  for (const conv of conversations) {
    const date = new Date(conv.updated_at);
    if (date >= today) {
      groups[0].items.push(conv);
    } else if (date >= yesterday) {
      groups[1].items.push(conv);
    } else {
      groups[2].items.push(conv);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

export function ConversationList({ userId, onSelect }: ConversationListProps) {
  const pathname = usePathname();
  const { conversations, searchQuery, setConversations, setSearchQuery } =
    useConversationStore();

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // Silently fail - conversations will be empty
    }
  }, [userId, setConversations]);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId, fetchConversations]);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = groupByDate(filtered);

  return (
    <div className="flex flex-col gap-1">
      <div className="px-3 pb-2">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {groups.length === 0 && (
        <p className="px-5 py-4 text-sm text-muted">No conversations yet</p>
      )}

      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-5 py-1 text-xs font-medium text-muted uppercase tracking-wide">
            {group.label}
          </p>
          {group.items.map((conv) => {
            const isActive = pathname === `/chat/${conv.id}`;
            return (
              <Link
                key={conv.id}
                href={`/chat/${conv.id}`}
                onClick={onSelect}
                className={`block mx-2 px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                  isActive
                    ? 'bg-accent/15 text-foreground'
                    : 'text-muted hover:bg-card-hover hover:text-foreground'
                }`}
              >
                {conv.title}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
