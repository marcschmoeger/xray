import { ProviderConfig } from '@/types';

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-5-20250514', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
      { id: 'claude-opus-4-5-20250514', name: 'Claude Opus 4.5', provider: 'anthropic' },
    ],
    requiresKey: true,
    baseUrlConfigurable: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
    ],
    requiresKey: true,
    baseUrlConfigurable: false,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'mistral' },
      { id: 'mistral-small-latest', name: 'Mistral Nemo', provider: 'mistral' },
    ],
    requiresKey: true,
    baseUrlConfigurable: false,
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', provider: 'groq' },
    ],
    requiresKey: true,
    baseUrlConfigurable: false,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: [
      { id: 'llama3.2', name: 'Llama 3.2', provider: 'ollama' },
      { id: 'mistral', name: 'Mistral', provider: 'ollama' },
    ],
    requiresKey: false,
    baseUrlConfigurable: true,
  },
];

export function getProvider(id: string): ProviderConfig | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getAllModels() {
  return PROVIDERS.flatMap((p) => p.models);
}
