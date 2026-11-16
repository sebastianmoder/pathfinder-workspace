'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

/** Within this distance of the bottom, the list keeps following new output. */
const FOLLOW_THRESHOLD_PX = 80;

// Scroll only the list itself. scrollIntoView would also scroll the page
// and pull the footer into view on every streamed update.
function scrollToEnd(container: HTMLElement | null) {
  if (container) container.scrollTop = container.scrollHeight;
}

interface MessageListProps {
  messages: ChatMessageType[];
  onRetryMessage?: (messageId: string) => void;
  onKeepPartialMessage?: (messageId: string) => void;
}

export function MessageList({
  messages,
  onRetryMessage,
  onKeepPartialMessage,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const followRef = useRef(true);
  const messageCount = messages.length;
  const hasMessages = messageCount > 0;

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    followRef.current = distanceFromBottom <= FOLLOW_THRESHOLD_PX;
  };

  // A new message (the user's prompt or a new response) always jumps to the end.
  useLayoutEffect(() => {
    followRef.current = true;
    scrollToEnd(scrollRef.current);
  }, [messageCount]);

  // Streaming and the word-by-word reveal grow the content without a new
  // message, so follow size changes while the reader is at the bottom.
  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (followRef.current) scrollToEnd(scrollRef.current);
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [hasMessages]);

  if (!hasMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-sm text-guard-blue-400 px-8">
          <p className="mb-2">No messages yet</p>
          <p>
            Complete the scaffolding questions on the left, then send your
            prompt to start a conversation with the AI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto p-4"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      <div ref={contentRef} className="space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onRetry={onRetryMessage}
            onKeepPartial={onKeepPartialMessage}
          />
        ))}
      </div>
    </div>
  );
}
