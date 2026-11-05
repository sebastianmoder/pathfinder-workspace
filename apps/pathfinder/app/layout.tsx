import { Analytics } from '@pathfinder/analytics';
import type { Metadata } from "next";
import "./globals.css";
import * as React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import '@pathfinder/brand/styles.css';


export const metadata: Metadata = {
  title: { default: "AI Pathfinder", template: "%s | AI Pathfinder" },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scroll-smooth">
      <head>
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
          content="AI Pathfinder"
        />
        <meta
          property="og:description"
          content="An Erasmus+ project for higher education"
        />
        <meta
          property="og:url"
          content="https://ai-pathfinder.eu"
        />
      </head>
      <body >
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Navigation />
          <main className="pf-project-main">{children}</main>
          <Footer />
        </AppRouterCacheProvider>
      <Analytics product="pathfinder" measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} production={process.env.CONTEXT === "production"} />
      </body>
    </html>
  );
}
