import { ProjectFooter } from '@pathfinder/brand';
import { Analytics } from '@pathfinder/analytics';
import type { Metadata } from "next";
import Link from "next/link";
import { SessionProvider } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import "./globals.css";
import '@pathfinder/brand/styles.css';

// Chosen for this brief: unambiguous letterforms suit learners, and the slab is workshop-stamped.

export const metadata: Metadata = {
  title: { default: "ARTISAN", template: "%s · ARTISAN" },
  description: t.promise,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          {t.skipToContent}
        </a>
        {/* Keep the footer just below the viewport when page content is short. */}
        <div className="flex min-h-dvh flex-col print:min-h-0">
          <header className="border-b border-border bg-surface">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="font-[family-name:var(--font-zilla)] text-xl font-semibold">
                {t.appName}
              </Link>
              <nav aria-label={t.nav.label} className="flex flex-wrap justify-end gap-x-3 text-[0.9375rem] sm:gap-x-4 sm:text-base">
                <Link href="/map" className="underline-offset-4 hover:underline">
                  {t.nav.map}
                </Link>
                <Link href="/summary" className="underline-offset-4 hover:underline">
                  {t.nav.summary}
                </Link>
              </nav>
            </div>
          </header>
          <SessionProvider>
            <main id="main" className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
              {children}
            </main>
          </SessionProvider>
        </div>
        <ProjectFooter compact />
      <Analytics product="artisan" measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} production={process.env.CONTEXT === "production"} />
      </body>
    </html>
  );
}
