'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';
import { MessageList } from './MessageList';
import { ModelBadge } from './ModelBadge';
import { ChatExportButtons } from './ChatExportButtons';
import { Button } from '@/components/ui/Button';
import type { ChatMessage } from '@/lib/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  model: string;
  isStreaming?: boolean;
  canSendFreeText?: boolean;
  onSendMessage?: (message: string) => void;
  onRetryMessage?: (messageId: string) => void;
  onKeepPartialMessage?: (messageId: string) => void;
}

export function ChatPanel({
  messages,
  model,
  isStreaming = false,
  canSendFreeText = false,
  onSendMessage,
  onRetryMessage,
  onKeepPartialMessage,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const trimmedDraft = draft.trim();
  const isInputEnabled = canSendFreeText && !!onSendMessage && !isStreaming;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isInputEnabled || !trimmedDraft) return;

    onSendMessage(trimmedDraft);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-3 border-b border-guard-border flex items-center justify-between">
        <span className="text-sm font-medium text-guard-blue-700">AI Chat</span>
        <ModelBadge model={model} />
      </div>
      <MessageList
        messages={messages}
        onRetryMessage={onRetryMessage}
        onKeepPartialMessage={onKeepPartialMessage}
      />
      <div className="p-4 border-t border-guard-border space-y-3">
        {canSendFreeText && onSendMessage ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isInputEnabled}
              placeholder={isStreaming ? 'Waiting for response...' : 'Ask a follow-up...'}
              aria-label="Chat message"
              rows={2}
              className="min-h-[48px] max-h-32 flex-1 resize-y rounded-lg border border-guard-border bg-guard-surface px-3 py-2 text-sm text-foreground placeholder:text-guard-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-guard-accent focus:border-transparent disabled:bg-guard-surface-elevated disabled:text-guard-blue-400"
            />
            <Button
              type="submit"
              disabled={!isInputEnabled || !trimmedDraft}
              className="h-10 shrink-0"
            >
              Send
            </Button>
          </form>
        ) : (
          <div className="rounded-lg border border-guard-border bg-guard-surface-elevated px-3 py-2 text-sm text-guard-blue-400">
            Send a prompt from the scaffolding panel...
          </div>
        )}
        <ChatExportButtons messages={messages} model={model} />
      </div>
    </div>
  );
}
