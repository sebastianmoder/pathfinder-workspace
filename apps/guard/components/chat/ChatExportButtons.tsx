'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { exportChat } from '@/lib/chatExport';
import type { ChatMessage } from '@/lib/types';

interface ChatExportButtonsProps {
  messages: ChatMessage[];
  model: string;
}

export function ChatExportButtons({ messages, model }: ChatExportButtonsProps) {
  const [error, setError] = useState<string | null>(null);
  const isDisabled = messages.length === 0;

  const handleExport = (format: 'docx' | 'pdf') => {
    try {
      setError(null);
      exportChat(messages, format, { model });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-guard-blue-400">Export entire chat</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isDisabled}
            onClick={() => handleExport('docx')}
            className="h-7 rounded-md px-2.5 text-xs"
            title="Export entire chat as a Word document"
            aria-label="Export entire chat as DOCX"
          >
            DOCX
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isDisabled}
            onClick={() => handleExport('pdf')}
            className="h-7 rounded-md px-2.5 text-xs"
            title="Export entire chat as a PDF"
            aria-label="Export entire chat as PDF"
          >
            PDF
          </Button>
        </div>
      </div>
      {error && (
        <p className="text-xs text-guard-error" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
