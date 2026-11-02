import type { Metadata } from "next";
import { SessionSummary } from "@/components/session-summary";
import { orientationQuestions } from "@/content/en/orientation";
import { modules } from "@/content/journey";
import { missions } from "@/content/missions";
import { passwordForMission } from "@/lib/passwords";
import { t } from "@/lib/i18n/en";

export const metadata: Metadata = { title: t.summary.title };

export default function SummaryPage() {
  const available = modules.filter((m) => m.status === "available").flatMap((m) => m.missionIds);
  const passwords = available.flatMap((id) => {
    const title = missions.find((m) => m.id === id)?.title;
    const code = passwordForMission(id);
    return title && code ? [{ title, code }] : [];
  });
  return <SessionSummary missions={missions} questions={orientationQuestions} passwords={passwords} />;
}
