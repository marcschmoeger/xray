'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { useUserId } from '@/lib/hooks/useUserId';

export default function NewChatPage() {
  const userId = useUserId();

  if (!userId) return null;

  return <ChatInterface userId={userId} />;
}
