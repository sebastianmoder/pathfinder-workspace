import type { Metadata } from "next";
import Link from "next/link";
import { Atkinson_Hyperlegible_Next, Atkinson_Hyperlegible_Mono, Zilla_Slab } from "next/font/google";
import { SessionProvider } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import "./globals.css";

// Chosen for this brief: unambiguous letterforms suit learners and passwords, and the slab is workshop-stamped.
const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"] });
const atkinsonMono = Atkinson_Hyperlegible_Mono({ variable: "--font-atkinson-mono", subsets: ["latin"] });
const zilla = Zilla_Slab({ variable: "--font-zilla", subsets: ["latin"], weight: ["600"] });

export const metadata: Metadata = {
  title: { default: "ARTISAN", template: "%s · ARTISAN" },
  description: t.promise,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} ${atkinsonMono.variable} ${zilla.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          {t.skipToContent}
        </a>
        <header className="no-print border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-[family-name:var(--font-zilla)] text-xl font-semibold">
              {t.appName}
            </Link>
            <nav aria-label={t.nav.label} className="flex flex-wrap justify-end gap-x-3 text-[0.9375rem] sm:gap-x-4 sm:text-base">
              <Link href="/map" className="underline-offset-4 hover:underline">
                {t.nav.map}
              </Link>
              <Link href="/continue" className="underline-offset-4 hover:underline">
                {t.nav.continue}
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
      </body>
    </html>
  );
}
