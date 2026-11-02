import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "ARTISAN", template: "%s · ARTISAN" },
  description: t.promise,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          {t.skipToContent}
        </a>
        <header className="no-print border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold tracking-wide">
              {t.appName}
            </Link>
            <nav aria-label="Main" className="flex flex-wrap justify-end gap-x-4 text-sm">
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
          <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
