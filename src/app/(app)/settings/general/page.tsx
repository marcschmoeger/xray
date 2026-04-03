'use client';

import { useSettingsStore } from '@/lib/store/settingsStore';
import { PROVIDERS } from '@/lib/providers';
import Link from 'next/link';
import type { Provider } from '@/types';

export default function GeneralSettingsPage() {
  const {
    defaultProvider,
    defaultModel,
    globalSystemPrompt,
    setDefaultProvider,
    setDefaultModel,
    setGlobalSystemPrompt,
  } = useSettingsStore();

  const currentProvider = PROVIDERS.find((p) => p.id === defaultProvider);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-foreground border-b-2 border-accent pb-1">
            General
          </span>
          <Link href="/settings/providers" className="text-sm text-muted hover:text-foreground">
            Providers
          </Link>
        </div>

        <h1 className="text-xl font-semibold mb-6">General Settings</h1>

        <div className="space-y-6">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="text-sm font-medium mb-3">Default Provider & Model</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Provider</label>
                <select
                  value={defaultProvider}
                  onChange={(e) => {
                    const p = e.target.value as Provider;
                    setDefaultProvider(p);
                    const prov = PROVIDERS.find((x) => x.id === p);
                    if (prov?.models[0]) setDefaultModel(prov.models[0].id);
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
                <label className="block text-xs text-muted mb-1">Model</label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
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
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="text-sm font-medium mb-1">Global System Prompt</h3>
            <p className="text-xs text-muted mb-3">
              This system prompt will be used for all new conversations unless overridden.
            </p>
            <textarea
              value={globalSystemPrompt}
              onChange={(e) => setGlobalSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={5}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
