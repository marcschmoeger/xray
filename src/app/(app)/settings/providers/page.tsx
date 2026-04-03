'use client';

import { PROVIDERS } from '@/lib/providers';
import { ProviderKeyInput } from '@/components/settings/ProviderKeyInput';
import { useSettingsStore } from '@/lib/store/settingsStore';
import Link from 'next/link';

export default function ProvidersSettingsPage() {
  const { ollamaBaseUrl, setOllamaBaseUrl } = useSettingsStore();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/settings/general" className="text-sm text-muted hover:text-foreground">
            General
          </Link>
          <span className="text-sm font-medium text-foreground border-b-2 border-accent pb-1">
            Providers
          </span>
        </div>

        <h1 className="text-xl font-semibold mb-1">API Providers</h1>
        <p className="text-sm text-muted mb-6">
          Configure API keys for each provider. Keys are stored locally in your browser.
        </p>

        <div className="space-y-3">
          {PROVIDERS.map((provider) => (
            <ProviderKeyInput
              key={provider.id}
              provider={provider.id}
              providerName={provider.name}
              requiresKey={provider.requiresKey}
            />
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg border border-border bg-card">
          <h3 className="text-sm font-medium mb-2">Ollama Base URL</h3>
          <input
            type="text"
            value={ollamaBaseUrl}
            onChange={(e) => setOllamaBaseUrl(e.target.value)}
            placeholder="http://localhost:11434/v1"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
          />
          <p className="mt-1 text-xs text-muted">
            The base URL for your local Ollama instance
          </p>
        </div>
      </div>
    </div>
  );
}
