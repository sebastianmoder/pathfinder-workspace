'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CopyButton } from './CopyButton';
import { MarkdownContent } from './MarkdownContent';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

function ProgressiveMarkdown({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [visibleContent, setVisibleContent] = useState(content);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisibleContent((current) => {
        if (!content.startsWith(current)) {
          clearInterval(timer);
          return content;
        }
        if (current.length >= content.length) {
          clearInterval(timer);
          return current;
        }

        const pending = content.slice(current.length);
        const wordsPerTick = pending.length > 1_000 ? 4 : pending.length > 300 ? 2 : 1;
        let next = current;
        for (let i = 0; i < wordsPerTick && next.length < content.length; i += 1) {
          const remaining = content.slice(next.length);
          next += /^\s*\S+\s*/.exec(remaining)?.[0] ?? remaining[0];
        }
        if (next.length >= content.length) clearInterval(timer);
        return next;
      });
    }, 25);
    return () => clearInterval(timer);
  }, [content]);

  return (
    <>
      <MarkdownContent content={visibleContent} />
      {(isStreaming || visibleContent.length < content.length) && (
        <span className="inline-block w-1.5 h-4 bg-guard-blue-400 animate-pulse ml-0.5 align-middle" />
      )}
    </>
  );
}

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: (messageId: string) => void;
  onKeepPartial?: (messageId: string) => void;
}

export function ChatMessage({ message, onRetry, onKeepPartial }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const status = message.status ?? (message.isStreaming ? 'streaming' : 'complete');
  const isStreaming = status === 'streaming';
  const isIncomplete = status === 'incomplete';
  const animateContent = !!message.animated && !isIncomplete;
  const showSettingsLink =
    message.failure?.code === 'authentication' ||
    message.failure?.code === 'insufficient_credits';

  return (
    <div
      className={cn(
        'flex',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className="max-w-[85%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-guard-accent text-white rounded-br-md'
              : 'bg-guard-blue-50 text-guard-blue-800 rounded-bl-md'
          )}
        >
          {isUser
            ? <div className="whitespace-pre-wrap">{message.content}</div>
            : animateContent
              ? <ProgressiveMarkdown key={message.timestamp} content={message.content} isStreaming={isStreaming} />
              : <MarkdownContent content={message.content} />
          }
          {isStreaming && !animateContent && (
            <span className="inline-block w-1.5 h-4 bg-guard-blue-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
        {!isUser && !isStreaming && message.content && (
          <div className="mt-1 flex items-center gap-2">
            <CopyButton text={message.content} />
            {isIncomplete && (
              <span className="text-xs font-medium text-amber-700">Incomplete response</span>
            )}
          </div>
        )}
        {!isUser && isIncomplete && message.failure && (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
            <p className="font-semibold">Response interrupted</p>
            <p className="mt-1 leading-relaxed">{message.failure.message}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {message.failure.retryable && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message.id)}
                  className="rounded-md bg-amber-900 px-2.5 py-1.5 font-medium text-white transition-colors hover:bg-amber-800"
                >
                  Try again
                </button>
              )}
              {message.content && onKeepPartial && (
                <button
                  type="button"
                  onClick={() => onKeepPartial(message.id)}
                  className="rounded-md border border-amber-300 bg-white px-2.5 py-1.5 font-medium text-amber-950 transition-colors hover:bg-amber-100"
                >
                  Keep partial response
                </button>
              )}
              {showSettingsLink && (
                <Link
                  href="/settings"
                  className="rounded-md border border-amber-300 bg-white px-2.5 py-1.5 font-medium text-amber-950 transition-colors hover:bg-amber-100"
                >
                  Open settings
                </Link>
              )}
            </div>
            <details className="mt-2 text-amber-800">
              <summary className="cursor-pointer select-none">Technical details</summary>
              <dl className="mt-1 space-y-0.5 font-mono text-[11px]">
                <div>Type: {message.failure.code}</div>
                <div>Elapsed: {(message.failure.elapsedMs / 1000).toFixed(1)}s</div>
                <div>Request: {message.failure.requestId}</div>
                {message.failure.generationId && (
                  <div>Generation: {message.failure.generationId}</div>
                )}
              </dl>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
