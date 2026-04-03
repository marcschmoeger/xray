'use client';

import { useState, useEffect } from 'react';
import { getGuestId } from '@/lib/guest';

export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // For now, use guest mode. With Supabase auth, this would check the session.
    const id = getGuestId();
    setUserId(id);
  }, []);

  return userId;
}
