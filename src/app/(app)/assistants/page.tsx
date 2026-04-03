'use client';

import { useState, useEffect, useCallback } from 'react';
import { AssistantCard } from '@/components/assistants/AssistantCard';
import { AssistantEditor } from '@/components/assistants/AssistantEditor';
import { useUserId } from '@/lib/hooks/useUserId';
import { useRouter } from 'next/navigation';
import type { Assistant, Provider } from '@/types';

export default function AssistantsPage() {
  const userId = useUserId();
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [editing, setEditing] = useState<Assistant | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchAssistants = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/conversations?user_id=${userId}`);
      // We'll use a dedicated assistants endpoint, but for now fetch from localStorage
      const stored = localStorage.getItem('xray-assistants');
      if (stored) {
        setAssistants(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [userId]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  function saveAssistants(updated: Assistant[]) {
    setAssistants(updated);
    localStorage.setItem('xray-assistants', JSON.stringify(updated));
  }

  function handleCreate(data: Omit<Assistant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const newAssistant: Assistant = {
      ...data,
      id: crypto.randomUUID(),
      user_id: userId || '',
    };
    saveAssistants([...assistants, newAssistant]);
    setCreating(false);
  }

  function handleUpdate(data: Omit<Assistant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!editing) return;
    const updated = assistants.map((a) =>
      a.id === editing.id ? { ...a, ...data } : a
    );
    saveAssistants(updated);
    setEditing(null);
  }

  function handleDelete(id: string) {
    saveAssistants(assistants.filter((a) => a.id !== id));
  }

  function handleStartChat(assistant: Assistant) {
    // Store the assistant config to use in the new chat
    sessionStorage.setItem(
      'xray-new-chat-assistant',
      JSON.stringify({
        provider: assistant.provider as Provider,
        model: assistant.model,
        systemPrompt: assistant.system_prompt,
      })
    );
    router.push('/chat/new');
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Assistants</h1>
            <p className="text-sm text-muted mt-1">
              Create custom assistants with specific system prompts and models.
            </p>
          </div>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              New Assistant
            </button>
          )}
        </div>

        {creating && (
          <div className="mb-6">
            <AssistantEditor
              onSave={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </div>
        )}

        {editing && (
          <div className="mb-6">
            <AssistantEditor
              assistant={editing}
              onSave={handleUpdate}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {assistants.length === 0 && !creating ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🤖</p>
            <p className="text-sm text-muted">
              No assistants yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assistants.map((assistant) => (
              <AssistantCard
                key={assistant.id}
                assistant={assistant}
                onEdit={() => setEditing(assistant)}
                onDelete={() => handleDelete(assistant.id)}
                onSelect={() => handleStartChat(assistant)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
