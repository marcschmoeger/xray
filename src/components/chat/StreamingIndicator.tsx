'use client';

export function StreamingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-3">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
