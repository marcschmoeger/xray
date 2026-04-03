'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/lib/store/settingsStore';
import type { Provider } from '@/types';

interface ProviderKeyInputProps {
  provider: Provider;
  providerName: string;
  requiresKey: boolean;
}

export function ProviderKeyInput({
  provider,
  providerName,
  requiresKey,
}: ProviderKeyInputProps) {
  const { getApiKey, setApiKey, isProviderConfigured } = useSettingsStore();
  const [key, setKey] = useState(getApiKey(provider));
  const [validating, setValidating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  if (!requiresKey) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-success" />
          <div>
            <p className="text-sm font-medium">{providerName}</p>
            <p className="text-xs text-muted">No API key required (local)</p>
          </div>
        </div>
      </div>
    );
  }

  async function handleSave() {
    setApiKey(provider, key);
    setValidating(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model: provider === 'anthropic' ? 'claude-sonnet-4-5-20250514' :
                 provider === 'openai' ? 'gpt-4o-mini' :
                 provider === 'mistral' ? 'mistral-small-latest' :
                 'gemma2-9b-it',
          messages: [{ role: 'user', content: 'Hi' }],
          apiKey: key,
        }),
      });

      setStatus(res.ok || res.status === 200 ? 'valid' : 'invalid');
    } catch {
      setStatus('invalid');
    } finally {
      setValidating(false);
    }
  }

  const configured = isProviderConfigured(provider);

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            status === 'valid'
              ? 'bg-success'
              : status === 'invalid'
                ? 'bg-danger'
                : configured
                  ? 'bg-success'
                  : 'bg-danger'
          }`}
        />
        <p className="text-sm font-medium">{providerName}</p>
      </div>

      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setStatus('idle');
          }}
          placeholder={`Enter ${providerName} API key...`}
          className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
        />
        <button
          onClick={handleSave}
          disabled={validating}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {validating ? 'Checking...' : 'Save'}
        </button>
      </div>

      {status === 'valid' && (
        <p className="mt-2 text-xs text-success">API key is valid</p>
      )}
      {status === 'invalid' && (
        <p className="mt-2 text-xs text-danger">
          Could not validate key — check it and try again
        </p>
      )}
    </div>
  );
}
