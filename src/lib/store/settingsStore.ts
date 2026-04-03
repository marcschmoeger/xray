'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Provider } from '@/types';

interface ProviderKeys {
  anthropic: string;
  openai: string;
  mistral: string;
  groq: string;
  ollama: string;
}

interface SettingsState {
  apiKeys: ProviderKeys;
  ollamaBaseUrl: string;
  defaultProvider: Provider;
  defaultModel: string;
  globalSystemPrompt: string;
  setApiKey: (provider: Provider, key: string) => void;
  setOllamaBaseUrl: (url: string) => void;
  setDefaultProvider: (provider: Provider) => void;
  setDefaultModel: (model: string) => void;
  setGlobalSystemPrompt: (prompt: string) => void;
  getApiKey: (provider: Provider) => string;
  isProviderConfigured: (provider: Provider) => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      apiKeys: {
        anthropic: '',
        openai: '',
        mistral: '',
        groq: '',
        ollama: '',
      },
      ollamaBaseUrl: 'http://localhost:11434/v1',
      defaultProvider: 'openai',
      defaultModel: 'gpt-4o',
      globalSystemPrompt: '',

      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      setOllamaBaseUrl: (url) => set({ ollamaBaseUrl: url }),
      setDefaultProvider: (provider) => set({ defaultProvider: provider }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setGlobalSystemPrompt: (prompt) => set({ globalSystemPrompt: prompt }),

      getApiKey: (provider) => get().apiKeys[provider],

      isProviderConfigured: (provider) => {
        if (provider === 'ollama') return true;
        return get().apiKeys[provider].length > 0;
      },
    }),
    {
      name: 'xray-settings',
    }
  )
);
