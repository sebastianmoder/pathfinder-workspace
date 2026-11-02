import type { Metadata } from "next";
import { OrientationForm } from "@/components/orientation-form";
import { orientationQuestions } from "@/content/en/orientation";
import { t } from "@/lib/i18n/en";

export const metadata: Metadata = { title: t.orientation.title };

export default function StartPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-semibold">{t.orientation.title}</h1>
      <p className="mt-2">{t.orientation.intro}</p>
      <p className="mt-1 text-sm text-muted">{t.orientation.time}</p>
      <OrientationForm questions={orientationQuestions} firstMissionHref="/missions/m01-foundations" />
    </div>
  );
}
