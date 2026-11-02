import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-guard-border bg-guard-surface">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-guard-accent flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="font-semibold text-guard-blue-900 text-lg">
            GUARD
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-guard-blue-600 hover:text-guard-blue-800 transition-colors"
          >
            Labs
          </Link>
          <Link
            href="/history"
            className="text-sm text-guard-blue-600 hover:text-guard-blue-800 transition-colors"
          >
            History
          </Link>
          <Link
            href="/settings"
            className="text-sm text-guard-blue-600 hover:text-guard-blue-800 transition-colors"
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
