export type Provider = 'anthropic' | 'openai' | 'mistral' | 'groq' | 'ollama';

export interface ProviderConfig {
  id: Provider;
  name: string;
  models: ModelOption[];
  requiresKey: boolean;
  baseUrlConfigurable: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: Provider;
}

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  provider: Provider;
  model: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface Assistant {
  id: string;
  user_id: string;
  name: string;
  system_prompt: string;
  avatar_emoji: string;
  provider: Provider;
  model: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProviderKeyStatus {
  provider: Provider;
  configured: boolean;
  valid: boolean | null;
}

export interface ChatRequestBody {
  provider: Provider;
  model: string;
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  apiKey?: string;
  baseUrl?: string;
}
