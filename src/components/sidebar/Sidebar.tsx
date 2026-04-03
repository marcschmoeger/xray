'use client';

import { useState } from 'react';
import { ConversationList } from './ConversationList';
import { NewChatButton } from './NewChatButton';
import Link from 'next/link';

interface SidebarProps {
  userId: string;
}

export function Sidebar({ userId }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border md:hidden"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          {collapsed ? (
            <>
              <line x1="3" y1="5" x2="17" y2="5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="15" x2="17" y2="15" />
            </>
          ) : (
            <>
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </>
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-card border-r border-border z-40 flex flex-col transition-transform duration-200 ${
          collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
        }`}
      >
        <div className="p-3 border-b border-border">
          <Link href="/chat/new" className="flex items-center gap-2 px-2 py-1">
            <span className="text-lg font-semibold">Xray</span>
          </Link>
        </div>

        <div className="p-3">
          <NewChatButton onClick={() => setCollapsed(true)} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <ConversationList userId={userId} onSelect={() => setCollapsed(true)} />
        </div>

        <div className="p-3 border-t border-border flex flex-col gap-1">
          <Link
            href="/assistants"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:bg-card-hover hover:text-foreground transition-colors"
          >
            <span>🤖</span>
            <span>Assistants</span>
          </Link>
          <Link
            href="/settings/providers"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:bg-card-hover hover:text-foreground transition-colors"
          >
            <span>⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
