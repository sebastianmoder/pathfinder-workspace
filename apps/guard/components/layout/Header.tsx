import { ProjectHeader } from '@pathfinder/brand';
import Link from 'next/link';

export function Header() {
  return (
    <>
      <ProjectHeader product="guard" compact />
      <header className="guard-app-header no-print">
        <nav aria-label="GUARD" className="guard-app-nav">
          <Link href="/" className="guard-app-title">
            GUARD · Guided AI labs
          </Link>
          <div className="flex shrink-0 items-center gap-4">
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
          </div>
        </nav>
      </header>
    </>
  );
}
