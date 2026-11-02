import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-base font-bold mt-3 mb-1 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-bold mt-3 mb-1 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-4 mb-2 space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-4 mb-2 space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-guard-blue-300 pl-3 italic text-guard-blue-600 my-2">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return (
        <code className="block bg-guard-blue-100 rounded-md px-3 py-2 text-xs font-mono overflow-x-auto whitespace-pre">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-guard-blue-100 rounded px-1 py-0.5 text-xs font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 last:mb-0">{children}</pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-guard-accent underline hover:opacity-80"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="border-guard-blue-200 my-2" />,
  table: ({ children }) => (
    <div className="my-3 max-w-full overflow-x-auto rounded-lg border border-guard-blue-200 bg-white">
      <table className="min-w-full border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-guard-blue-100 text-guard-blue-900">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-guard-blue-200">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="align-top">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="whitespace-nowrap px-3 py-2 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="min-w-32 px-3 py-2 leading-relaxed">
      {children}
    </td>
  ),
};

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  );
}
