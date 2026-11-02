import type { Metadata } from "next";
import { ContinueForm } from "@/components/continue-form";
import { missions } from "@/content/missions";
import { passwords } from "@/content/passwords";
import { t } from "@/lib/i18n/en";

export const metadata: Metadata = { title: t.continuePage.title };

export default function ContinuePage() {
  // Registry is static public data; lookup runs in the browser, so it needs no server, cookies or storage.
  const registry = passwords.flatMap((p) => {
    const m = missions.find((x) => x.id === (p.supersededBy ?? p.missionId));
    return m ? [{ code: p.code, missionId: m.id, title: m.title }] : [];
  });
  return (
    <div className="max-w-xl">
      <h1 className="text-4xl">{t.continuePage.title}</h1>
      <p className="mt-2">{t.continuePage.help}</p>
      <ContinueForm registry={registry} />
    </div>
  );
}
