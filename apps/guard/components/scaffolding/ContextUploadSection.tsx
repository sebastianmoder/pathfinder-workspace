'use client';

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import { useLabSessionStore } from '@/stores/labSessionStore';
import type { ContextDocument, LabSessionState } from '@/lib/types';

const MAX_CONTEXT_DOCUMENTS = 5;

type UploadState = 'idle' | 'loading' | 'done' | 'error';
export type ContextUploadMode = 'general' | 'assignment' | 'curriculum';

interface ContextUploadSectionProps {
  mode?: ContextUploadMode;
}

function getSessionContextDocuments(
  session: LabSessionState | null
): ContextDocument[] {
  if (!session) return [];
  if (session.additionalContextDocuments?.length) {
    return session.additionalContextDocuments;
  }
  if (!session.additionalContext) {
    return [];
  }

  return [
    {
      id: 'legacy-context-document',
      fileName: session.additionalContextFileName ?? 'Context document',
      text: session.additionalContext,
      uploadedAt: session.lastActivityAt,
    },
  ];
}

function formatDocumentCount(count: number) {
  return count === 1 ? '1 document' : `${count} documents`;
}

function formatRemainingSlots(count: number) {
  return count === 1 ? '1 slot left' : `${count} slots left`;
}

export function ContextUploadSection({ mode = 'general' }: ContextUploadSectionProps) {
  const session = useLabSessionStore((s) => s.session);
  const addAdditionalContextDocument = useLabSessionStore(
    (s) => s.addAdditionalContextDocument
  );
  const removeAdditionalContextDocument = useLabSessionStore(
    (s) => s.removeAdditionalContextDocument
  );

  const isRequiredUploadMode = mode === 'assignment' || mode === 'curriculum';
  const [isExpanded, setIsExpanded] = useState(isRequiredUploadMode);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadProgress, setUploadProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = getSessionContextDocuments(session);
  const hasContext = documents.length > 0;
  const remainingSlots = MAX_CONTEXT_DOCUMENTS - documents.length;
  const canAddMore = remainingSlots > 0;

  const uploadCopy: Record<ContextUploadMode, {
    panelTitle: string;
    collapsedLabel: string;
    helperText: string;
    removeTitle: string;
  }> = {
    general: {
      panelTitle: 'Add context documents',
      collapsedLabel: 'Add context documents',
      helperText:
        'Add up to 5 documents. Their extracted text is included as AI context.',
      removeTitle: 'Remove context document',
    },
    assignment: {
      panelTitle: 'Upload existing assignment',
      collapsedLabel: 'Upload existing assignment',
      helperText:
        'Add up to 5 assignment briefs, instructions, or related documents.',
      removeTitle: 'Remove assignment document',
    },
    curriculum: {
      panelTitle: 'Upload existing curriculum',
      collapsedLabel: 'Upload existing curriculum',
      helperText:
        'Add up to 5 syllabi, curriculum maps, unit plans, or module outlines.',
      removeTitle: 'Remove curriculum document',
    },
  };
  const copy = uploadCopy[mode];

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      if (remainingSlots <= 0) {
        setErrorMessage(
          `You can upload up to ${MAX_CONTEXT_DOCUMENTS} documents. Remove one before adding another.`
        );
        setUploadState('error');
        setIsExpanded(true);
        return;
      }

      if (files.length > remainingSlots) {
        setErrorMessage(
          `You can add ${formatRemainingSlots(remainingSlots)}. Select fewer documents or remove an existing one first.`
        );
        setUploadState('error');
        setIsExpanded(true);
        return;
      }

      setUploadState('loading');
      setErrorMessage('');

      try {
        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          setUploadProgress(
            files.length === 1
              ? 'Extracting text...'
              : `Extracting ${index + 1} of ${files.length}...`
          );

          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch('/api/parse-file', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            throw new Error(
              `${file.name}: ${data.error ?? 'Failed to parse file'}`
            );
          }

          if (typeof data.text !== 'string') {
            throw new Error(`${file.name}: Parsed text was not returned`);
          }

          addAdditionalContextDocument(data.text, file.name);
        }

        setUploadState('done');
        setUploadProgress('');
        setIsExpanded(false);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Upload failed');
        setUploadState('error');
        setUploadProgress('');
      }
    },
    [addAdditionalContextDocument, remainingSlots]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) processFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length) processFiles(files);
  };

  const handleRemove = (documentId: string) => {
    removeAdditionalContextDocument(documentId);
    setUploadState('idle');
    setErrorMessage('');
    if (documents.length <= 1) {
      setIsExpanded(isRequiredUploadMode);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleDropzoneKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFilePicker();
    }
  };

  const openUploadPanel = () => {
    setUploadState('idle');
    setErrorMessage('');
    setIsExpanded(true);
  };

  const documentSummary = hasContext ? (
    <div className="rounded-lg border border-guard-accent/40 bg-white px-2.5 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-guard-accent-light text-guard-accent">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-guard-blue-800">
          {formatDocumentCount(documents.length)} in AI context
        </p>
        {canAddMore && (
          <button
            type="button"
            onClick={openUploadPanel}
            className="shrink-0 rounded-md border border-guard-accent/40 px-2 py-1 text-xs font-medium text-guard-accent transition-colors hover:bg-guard-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guard-accent"
          >
            Add
          </button>
        )}
        <span className="shrink-0 rounded-full bg-guard-accent-light px-2 py-0.5 text-xs font-medium text-guard-accent">
          {documents.length}/{MAX_CONTEXT_DOCUMENTS}
        </span>
      </div>

      <ul className="mt-1.5 space-y-1">
        {documents.map((document) => (
          <li
            key={document.id}
            className="flex items-center gap-1.5 rounded-md border border-guard-accent/15 bg-guard-accent/5 px-2 py-1"
          >
            <span
              className="min-w-0 flex-1 truncate text-xs font-medium text-guard-blue-700"
              title={document.fileName}
            >
              {document.fileName}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(document.id)}
              className="shrink-0 rounded p-0.5 text-guard-blue-400 transition-colors hover:bg-white hover:text-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guard-accent"
              title={copy.removeTitle}
              aria-label={`${copy.removeTitle}: ${document.fileName}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  const addButton = canAddMore ? (
    <button
      type="button"
      onClick={openUploadPanel}
      className="group flex w-full items-center gap-2.5 rounded-lg border border-guard-accent/50 bg-white px-2.5 py-2 text-left shadow-sm transition-colors hover:border-guard-accent hover:bg-guard-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guard-accent"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-guard-accent text-white shadow-sm">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-guard-blue-800">
          {hasContext ? 'Add another context document' : copy.collapsedLabel}
        </span>
        <span className="mt-0.5 block text-xs text-guard-blue-500">
          PDF, DOCX, TXT, or MD - up to {MAX_CONTEXT_DOCUMENTS} documents
        </span>
      </span>
      <svg className="h-4 w-4 shrink-0 text-guard-blue-300 transition-colors group-hover:text-guard-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  ) : null;

  if (!isExpanded) {
    return (
      <div className="mx-6 mt-3 space-y-2">
        {documentSummary}
        {!hasContext && addButton}
      </div>
    );
  }

  return (
    <div className="mx-6 mt-3 space-y-2">
      {documentSummary}

      {canAddMore ? (
        <div className="rounded-lg border border-guard-blue-200 bg-guard-blue-50/50">
          <div className="flex items-center justify-between gap-3 border-b border-guard-blue-100 px-2.5 py-1.5">
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-guard-blue-800">
                {copy.panelTitle}
              </span>
              <span className="block text-xs text-guard-blue-500">
                {formatRemainingSlots(remainingSlots)}
              </span>
            </div>
            {!isRequiredUploadMode && (
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setUploadState('idle');
                  setErrorMessage('');
                }}
                className="rounded p-1 text-guard-blue-400 transition-colors hover:bg-white hover:text-guard-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guard-accent"
                aria-label="Collapse context document upload"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="p-2">
            <p className="mb-1.5 text-xs text-guard-blue-600">
              {copy.helperText}
            </p>

            {uploadState === 'loading' ? (
              <div className="flex items-center justify-center gap-2 py-2.5">
                <div className="h-4 w-4 rounded-full border-2 border-guard-accent border-t-transparent animate-spin" />
                <span className="text-xs text-guard-blue-500">
                  {uploadProgress || 'Extracting text...'}
                </span>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                className={`relative flex items-center gap-2.5 rounded-md border-2 border-dashed px-2.5 py-2 text-left transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guard-accent ${
                  isDragging
                    ? 'border-guard-accent bg-guard-accent/10'
                    : 'border-guard-blue-300 bg-white hover:border-guard-accent hover:bg-guard-accent/5'
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={openFilePicker}
                onKeyDown={handleDropzoneKeyDown}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-guard-accent-light text-guard-accent">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-guard-blue-800">
                    Choose documents or drag and drop
                  </p>
                  <p className="mt-0.5 truncate text-xs text-guard-blue-500">
                    PDF, DOCX, TXT, MD - 20MB each - {formatRemainingSlots(remainingSlots)}
                  </p>
                </div>
                <span className="hidden shrink-0 rounded-md bg-guard-accent px-2 py-1 text-xs font-medium text-white sm:inline">
                  Browse
                </span>
              </div>
            )}

            {uploadState === 'done' && (
              <p className="mt-1.5 text-xs text-guard-success">
                Document text extracted and added.
              </p>
            )}

            {uploadState === 'error' && (
              <p className="mt-1.5 text-xs text-red-600">{errorMessage}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-guard-blue-200 bg-guard-blue-50 px-2.5 py-2">
          <p className="text-xs font-medium text-guard-blue-700">
            Maximum reached: {MAX_CONTEXT_DOCUMENTS} context documents.
          </p>
          <p className="mt-0.5 text-xs text-guard-blue-500">
            Remove a document above to upload another one.
          </p>
        </div>
      )}
    </div>
  );
}
