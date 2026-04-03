'use client';

import type { Assistant } from '@/types';

interface AssistantCardProps {
  assistant: Assistant;
  onEdit: () => void;
  onDelete: () => void;
  onSelect?: () => void;
}

export function AssistantCard({ assistant, onEdit, onDelete, onSelect }: AssistantCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:border-border-hover transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{assistant.avatar_emoji}</span>
          <div>
            <h3 className="font-medium text-sm">{assistant.name}</h3>
            <p className="text-xs text-muted mt-0.5">
              {assistant.provider} / {assistant.model}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {onSelect && (
            <button
              onClick={onSelect}
              className="px-2 py-1 text-xs rounded bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
            >
              Chat
            </button>
          )}
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs rounded text-muted hover:text-foreground hover:bg-card-hover transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs rounded text-danger hover:bg-danger/15 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      {assistant.system_prompt && (
        <p className="mt-3 text-xs text-muted line-clamp-2">
          {assistant.system_prompt}
        </p>
      )}
    </div>
  );
}
