'use client';

import { useState, useRef, useEffect } from 'react';
import { PROVIDERS } from '@/lib/providers';
import { useSettingsStore } from '@/lib/store/settingsStore';
import type { Provider } from '@/types';

interface ModelSelectorProps {
  provider: Provider;
  model: string;
  onProviderChange: (provider: Provider) => void;
  onModelChange: (model: string) => void;
}

export function ModelSelector({
  provider,
  model,
  onProviderChange,
  onModelChange,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { isProviderConfigured } = useSettingsStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentProvider = PROVIDERS.find((p) => p.id === provider);
  const currentModel = currentProvider?.models.find((m) => m.id === model);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-border hover:border-border-hover transition-colors"
      >
        <span className="text-foreground">{currentModel?.name || model}</span>
        <span className="text-muted text-xs">({currentProvider?.name})</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="3,4.5 6,7.5 9,4.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-card border border-border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          {PROVIDERS.map((p) => (
            <div key={p.id}>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted uppercase tracking-wide border-b border-border">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isProviderConfigured(p.id) ? 'bg-success' : 'bg-danger'
                  }`}
                />
                {p.name}
              </div>
              {p.models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onProviderChange(p.id);
                    onModelChange(m.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-card-hover transition-colors ${
                    m.id === model && p.id === provider
                      ? 'text-accent'
                      : 'text-foreground'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
