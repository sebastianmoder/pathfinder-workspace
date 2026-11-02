import { ProjectFooter } from '@pathfinder/brand';
import { Analytics } from '@pathfinder/analytics';
import type { Metadata } from "next";
import "./globals.css";
import '@pathfinder/brand/styles.css';



export const metadata: Metadata = {
  title: "GUARD - Generative Universal Assistant for Resourceful Development",
  description:
    "A learning environment that teaches educators to use AI tools critically and pedagogically through structured, hands-on experimentation.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body
        className="antialiased"
      >
        {children}
        <ProjectFooter compact />
      <Analytics product="guard" measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} production={process.env.CONTEXT === "production"} />
      </body>
    </html>
  );
}
