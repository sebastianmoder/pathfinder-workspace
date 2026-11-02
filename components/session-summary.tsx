"use client";

import { useState } from "react";
import Link from "next/link";
import type { OrientationQuestion } from "@/content/en/orientation";
import type { Mission } from "@/content/types";
import { summarizeMission, summaryToText, type MissionSummary } from "@/lib/summary";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

interface Props {
  missions: Mission[];
  questions: OrientationQuestion[];
  passwords: { title: string; code: string }[];
}

export function SessionSummary({ missions, questions, passwords }: Props) {
  const session = useSession();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const rows = missions.flatMap((m): MissionSummary[] => {
    const row = summarizeMission(m, session.progress(m.id), session.isCompleted(m.id));
    return row ? [row] : [];
  });
  const startingPoint = questions.flatMap((q) => {
    const answer = q.choices.find((c) => c.id === session.orientation[q.id])?.label;
    return answer ? [{ question: q.prompt, answer }] : [];
  });
  const confidence = (n: number | null) => (n === null ? "" : ` (${t.mission.confidence[n]})`);

  async function copy() {
    const text = summaryToText({
      heading: t.summary.title,
      note: t.summary.temporary,
      startingPoint,
      startingPointLabel: t.summary.startingPoint,
      missions: rows,
      labels: {
        takeaway: t.summary.takeaway,
        shown: t.summary.shown,
        selfAssessed: t.summary.selfAssessed,
        review: t.summary.review,
        before: t.summary.before,
        after: t.summary.after,
        notFinished: t.summary.notFinished,
        passwords: t.summary.passwords,
      },
      confidenceLabels: t.mission.confidence,
      passwords,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl">{t.summary.title}</h1>
      <p className="mt-2 text-sm">{t.summary.contains}</p>
      <p className="mt-1 text-sm text-muted">{t.summary.temporary}</p>

      <div className="no-print mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="btn btn-secondary btn-small">{t.summary.copy}</button>
        <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-small">{t.summary.print}</button>
      </div>
      <p role="status" className="no-print mt-2 min-h-5 text-sm">
        {copyStatus === "copied" && t.summary.copied}
        {copyStatus === "failed" && t.summary.copyFailed}
      </p>

      {startingPoint.length > 0 && (
        <section className="mt-4">
          <h2 className="text-2xl">{t.summary.startingPoint}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {startingPoint.map((a) => <li key={a.question}>{a.question} <strong>{a.answer}</strong></li>)}
          </ul>
        </section>
      )}

      {rows.length === 0 ? (
        <p className="mt-6">
          {t.summary.empty} <Link href="/map" className="underline">{t.summary.openMap}</Link>
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((m) => (
            <section key={m.id} className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-2xl">{m.title}</h2>
              {!m.completed && <p className="text-sm text-muted">{t.summary.notFinished}</p>}
              <dl className="mt-2 space-y-2 text-sm">
                {m.before && (
                  <div><dt className="font-semibold">{t.summary.before}</dt><dd>{m.before.label}{confidence(m.before.confidence)}</dd></div>
                )}
                {m.after && (
                  <div><dt className="font-semibold">{t.summary.after}</dt><dd>{m.after.label}{confidence(m.after.confidence)}</dd></div>
                )}
                {m.takeaway && (
                  <div><dt className="font-semibold">{t.summary.takeaway}</dt><dd>{m.takeaway}</dd></div>
                )}
                {([["shown", m.shown], ["selfAssessed", m.selfAssessed], ["review", m.review]] as const).map(([key, labels]) =>
                  labels.length > 0 ? (
                    <div key={key}>
                      <dt className="font-semibold">{t.summary[key]}</dt>
                      <dd><ul className="list-disc pl-5">{labels.map((s) => <li key={s}>{s}</li>)}</ul></dd>
                    </div>
                  ) : null,
                )}
              </dl>
            </section>
          ))}
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-2xl">{t.summary.passwords}</h2>
        <p className="mt-1 text-sm text-muted">{t.summary.passwordsHelp}</p>
        <ul className="mt-2 space-y-1">
          {passwords.map((p) => (
            <li key={p.code}>{p.title}: <span className="select-all font-mono font-semibold">{p.code}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
