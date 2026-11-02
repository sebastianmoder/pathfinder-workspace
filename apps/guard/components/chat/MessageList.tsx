'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

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
  const bottomRef = useRef<HTMLDivElement>(null);
  const latestMessageContent = messages[messages.length - 1]?.content;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, latestMessageContent]);

  if (messages.length === 0) {
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onRetry={onRetryMessage}
          onKeepPartial={onKeepPartialMessage}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
