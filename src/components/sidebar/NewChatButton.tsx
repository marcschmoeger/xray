'use client';

import Link from 'next/link';

interface NewChatButtonProps {
  onClick?: () => void;
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
  return (
    <Link
      href="/chat/new"
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="3" x2="8" y2="13" />
        <line x1="3" y1="8" x2="13" y2="8" />
      </svg>
      New Chat
    </Link>
  );
}
