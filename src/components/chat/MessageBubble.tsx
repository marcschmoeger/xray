'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  onEdit?: (newContent: string) => void;
  providerName?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-border hover:bg-border-hover text-muted transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export function MessageBubble({ role, content, onEdit, providerName }: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const isUser = role === 'user';

  if (editing && isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] w-full">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 rounded-xl bg-accent/15 border border-accent/30 text-foreground text-sm resize-none focus:outline-none focus:border-accent"
            rows={4}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1 text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onEdit?.(editContent);
                setEditing(false);
              }}
              className="px-3 py-1 text-sm bg-accent rounded-lg text-white hover:bg-accent-hover"
            >
              Save & Resend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`group relative max-w-[75%] ${
          isUser
            ? 'bg-accent/15 rounded-2xl rounded-br-sm px-4 py-2.5'
            : 'rounded-2xl rounded-bl-sm px-1 py-1'
        }`}
      >
        {!isUser && providerName && (
          <p className="text-xs text-muted mb-1 px-1">{providerName}</p>
        )}

        <div className={`text-sm message-content ${isUser ? '' : 'px-1'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({ children, ...props }) => {
                  const codeText =
                    typeof children === 'string'
                      ? children
                      : '';
                  return (
                    <div className="relative">
                      <CopyButton text={codeText} />
                      <pre {...props}>{children}</pre>
                    </div>
                  );
                },
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return <code {...props}>{children}</code>;
                  }
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>

        {isUser && onEdit && (
          <button
            onClick={() => setEditing(true)}
            className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-foreground transition-opacity"
            title="Edit message"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 2l2 2-8 8H2v-2l8-8z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
