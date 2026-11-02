import "./globals.css";
import * as React from "react";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Pathfinder",
//   description: "An Erasmus+ project for higher education",
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scroll-smooth">
      <head>
        <link
          rel="icon"
          href="/icon.ico"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta
          name="description"
          content="An Erasmus+ project for higher education"
        />
        <meta
          property="og:title"
          content="Pathfinder"
        />
        <meta
          property="og:description"
          content="An Erasmus+ project for higher education"
        />
        <meta
          property="og:url"
          content="https://ai-pathfinder.eu"
        />
        <GoogleAnalytics gaId="G-CCR887R8FM" />
      </head>
      <body className={inter.className}>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Navigation />
          <main className="mx-auto py-14 sm:py-16">{children}</main>
          <Footer />
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
