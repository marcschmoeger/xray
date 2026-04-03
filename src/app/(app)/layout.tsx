'use client';

import { Sidebar } from '@/components/sidebar/Sidebar';
import { useUserId } from '@/lib/hooks/useUserId';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = useUserId();

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar userId={userId} />
      <main className="flex-1 md:ml-[260px] flex flex-col h-screen">
        {children}
      </main>
    </div>
  );
}
