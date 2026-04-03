'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ModelSelector } from './ModelSelector';
import { StreamingIndicator } from './StreamingIndicator';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useConversationStore } from '@/lib/store/conversationStore';
import { PROVIDERS } from '@/lib/providers';
import type { Provider, Conversation, Message as DbMessage } from '@/types';

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

interface ChatInterfaceProps {
  conversationId?: string;
  userId: string;
  initialMessages?: DbMessage[];
  conversation?: Conversation;
}

export function ChatInterface({
  conversationId,
  userId,
  initialMessages,
  conversation,
}: ChatInterfaceProps) {
  const [provider, setProvider] = useState<Provider>(
    (conversation?.provider as Provider) || useSettingsStore.getState().defaultProvider
  );
  const [model, setModel] = useState(
    conversation?.model || useSettingsStore.getState().defaultModel
  );
  const [systemPrompt, setSystemPrompt] = useState(
    conversation?.system_prompt || ''
  );
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(conversationId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getApiKey, ollamaBaseUrl, globalSystemPrompt } = useSettingsStore();
  const { updateConversation, addConversation } = useConversationStore();

  const effectiveSystemPrompt = systemPrompt || globalSystemPrompt;
  const providerConfig = PROVIDERS.find((p) => p.id === provider);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          provider,
          model,
          systemPrompt: effectiveSystemPrompt || undefined,
          apiKey: getApiKey(provider),
          baseUrl: provider === 'ollama' ? ollamaBaseUrl : undefined,
        },
      }),
    [provider, model, effectiveSystemPrompt, getApiKey, ollamaBaseUrl]
  );

  const convertedInitialMessages: UIMessage[] | undefined = useMemo(
    () =>
      initialMessages?.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        parts: [{ type: 'text' as const, text: m.content }],
      })),
    [initialMessages]
  );

  const {
    messages,
    status,
    stop,
    sendMessage,
    setMessages,
    regenerate,
  } = useChat({
    transport,
    messages: convertedInitialMessages,
    onFinish: async ({ message }) => {
      if (!currentConvId) return;

      try {
        const content = getMessageText(message);
        const toSave = [{ role: 'assistant', content }];

        await fetch(`/api/messages/${currentConvId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toSave),
        });

        if (messages.length <= 2) {
          const firstUserMsg = messages.find((m) => m.role === 'user');
          if (firstUserMsg) {
            autoTitle(currentConvId, getMessageText(firstUserMsg));
          }
        }
      } catch {
        // Non-critical
      }
    },
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  const autoTitle = useCallback(
    async (convId: string, firstMessage: string) => {
      const title =
        firstMessage.length > 50
          ? firstMessage.substring(0, 47) + '...'
          : firstMessage || 'New Conversation';

      try {
        await fetch('/api/conversations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: convId, title }),
        });
        updateConversation(convId, { title });
      } catch {
        // Non-critical
      }
    },
    [updateConversation]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function createConversation(): Promise<string> {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        provider,
        model,
        system_prompt: effectiveSystemPrompt || null,
      }),
    });
    const conv = await res.json();
    setCurrentConvId(conv.id);
    addConversation(conv);
    window.history.replaceState(null, '', `/chat/${conv.id}`);
    return conv.id;
  }

  async function handleSend(content: string) {
    let convId = currentConvId;
    if (!convId) {
      convId = await createConversation();
    }

    // Save user message to DB
    try {
      await fetch(`/api/messages/${convId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content }),
      });
    } catch {
      // Non-critical
    }

    sendMessage({ text: content });
  }

  async function handleEdit(index: number, newContent: string) {
    const truncated = messages.slice(0, index);
    setMessages(truncated);

    if (currentConvId) {
      const editedMsg = messages[index];
      await fetch(`/api/messages/${currentConvId}?after=${editedMsg.id}`, {
        method: 'DELETE',
      });
    }

    sendMessage({ text: newContent });
  }

  function handleRegenerate() {
    if (messages.length >= 2) {
      regenerate();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <ModelSelector
          provider={provider}
          model={model}
          onProviderChange={(p) => {
            setProvider(p);
            if (currentConvId) {
              fetch('/api/conversations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentConvId, provider: p }),
              });
            }
          }}
          onModelChange={(m) => {
            setModel(m);
            if (currentConvId) {
              fetch('/api/conversations', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentConvId, model: m }),
              });
            }
          }}
        />

        <button
          onClick={() => setShowSystemPrompt(!showSystemPrompt)}
          className="text-xs text-muted hover:text-foreground px-2 py-1 rounded border border-border hover:border-border-hover transition-colors"
        >
          System Prompt
        </button>
      </div>

      {/* System prompt editor */}
      {showSystemPrompt && (
        <div className="px-4 py-3 border-b border-border bg-card">
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder={globalSystemPrompt || 'Enter a system prompt for this conversation...'}
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent resize-none"
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center pt-20">
              <h2 className="text-2xl font-semibold mb-2">Xray</h2>
              <p className="text-muted text-sm max-w-md">
                Start a conversation with any AI model. Select your provider and model above.
              </p>
            </div>
          )}

          {messages
            .filter((m) => m.role !== 'system')
            .map((message, idx) => (
              <MessageBubble
                key={message.id}
                role={message.role as 'user' | 'assistant'}
                content={getMessageText(message)}
                providerName={
                  message.role === 'assistant' ? providerConfig?.name : undefined
                }
                onEdit={
                  message.role === 'user'
                    ? (newContent) => handleEdit(idx, newContent)
                    : undefined
                }
              />
            ))}

          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <StreamingIndicator />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Regenerate button */}
      {messages.length >= 2 && !isStreaming && (
        <div className="flex justify-center pb-2">
          <button
            onClick={handleRegenerate}
            className="text-xs text-muted hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-border-hover transition-colors"
          >
            Regenerate response
          </button>
        </div>
      )}

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        onStop={stop}
        isStreaming={isStreaming}
      />
    </div>
  );
}
