'use client';

import { useState } from 'react';
import { PROVIDERS } from '@/lib/providers';
import type { Assistant, Provider } from '@/types';

interface AssistantEditorProps {
  assistant?: Assistant;
  onSave: (data: Omit<Assistant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const EMOJI_OPTIONS = ['🤖', '🧠', '💡', '🔬', '📝', '🎨', '🎯', '🦊', '🐙', '⚡', '🌟', '🔮'];

export function AssistantEditor({ assistant, onSave, onCancel }: AssistantEditorProps) {
  const [name, setName] = useState(assistant?.name || '');
  const [emoji, setEmoji] = useState(assistant?.avatar_emoji || '🤖');
  const [systemPrompt, setSystemPrompt] = useState(assistant?.system_prompt || '');
  const [provider, setProvider] = useState<Provider>(assistant?.provider || 'openai');
  const [model, setModel] = useState(assistant?.model || 'gpt-4o');

  const currentProvider = PROVIDERS.find((p) => p.id === provider);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      avatar_emoji: emoji,
      system_prompt: systemPrompt,
      provider,
      model,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg border border-border bg-card">
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Assistant name"
          required
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1">Avatar</label>
        <div className="flex gap-2 flex-wrap">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-xl p-1.5 rounded-lg border transition-colors ${
                emoji === e
                  ? 'border-accent bg-accent/15'
                  : 'border-border hover:border-border-hover'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted mb-1">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful assistant that..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Provider</label>
          <select
            value={provider}
            onChange={(e) => {
              const p = e.target.value as Provider;
              setProvider(p);
              const prov = PROVIDERS.find((x) => x.id === p);
              if (prov?.models[0]) setModel(prov.models[0].id);
            }}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted mb-1">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-accent"
          >
            {currentProvider?.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          {assistant ? 'Update' : 'Create'} Assistant
        </button>
      </div>
    </form>
  );
}
