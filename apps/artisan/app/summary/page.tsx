import type { Metadata } from "next";
import { SessionSummary } from "@/components/session-summary";
import { missions } from "@/content/missions";
import { t } from "@/lib/i18n/en";

export const metadata: Metadata = { title: t.summary.title };

export default function SummaryPage() {
  return <SessionSummary missions={missions} />;
}
