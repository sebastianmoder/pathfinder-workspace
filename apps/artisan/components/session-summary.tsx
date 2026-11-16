"use client";

import { useState } from "react";
import Link from "next/link";
import type { Mission } from "@/content/types";
import { summarizeMission, summaryToText, type MissionSummary } from "@/lib/summary";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { flags } from "@/content/story";
import { modules } from "@/content/journey";
import { moduleDone } from "@/lib/journey-nav";
import { ExportSave, LoadSave } from "./save-controls";

interface Props {
  missions: Mission[];
}

export function SessionSummary({ missions }: Props) {
  const session = useSession();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [cleared, setCleared] = useState(false);
  const cases = modules.filter((m) => m.status === "available");
  const doneOnDevice = cases.filter((m) => moduleDone(m, session.completedIds)).length;

  const rows = missions.flatMap((m): MissionSummary[] => {
    const row = summarizeMission(m, session.progress(m.id), session.isCompleted(m.id));
    return row ? [row] : [];
  });
  const decisions = flags.flatMap((f) => {
    const value = f.values.find((v) => v.value === session.flags[f.id]);
    return value ? [{ id: f.id, title: f.title, label: value.label }] : [];
  });
  const confidence = (n: number | null) => (n === null ? "" : ` (${t.mission.confidence[n]})`);

  async function copy() {
    const text = summaryToText({
      heading: t.summary.title,
      note: t.summary.temporary,
      missions: rows,
      labels: {
        takeaway: t.summary.takeaway,
        shown: t.summary.shown,
        selfAssessed: t.summary.selfAssessed,
        review: t.summary.review,
        calibration: t.summary.calibration,
        calibrationText: t.audit.calibration,
        before: t.summary.before,
        after: t.summary.after,
        notFinished: t.summary.notFinished,
      },
      confidenceLabels: t.mission.confidence,
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
                {m.calibration && (
                  <div><dt className="font-semibold">{t.summary.calibration}</dt><dd>{t.audit.calibration(m.calibration)}</dd></div>
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

      {decisions.length > 0 && (
        <section className="mt-8 border-t border-border pt-4">
          <h2 className="text-2xl">{t.notebook.decisions}</h2>
          <p className="mt-1 text-sm text-muted">{t.notebook.decisionsHelp}</p>
          <dl className="mt-3 space-y-2">
            {decisions.map((d) => (
              <div key={d.id}><dt className="font-semibold">{d.title}</dt><dd>{d.label}</dd></div>
            ))}
          </dl>
        </section>
      )}

      <section className="no-print mt-8 border-t border-border pt-4">
        <h2 className="text-2xl">{t.summary.device}</h2>
        <p className="mt-1 max-w-2xl text-sm">{t.summary.deviceHelp(doneOnDevice, cases.length)}</p>
        <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-2">
          <ExportSave />
          <LoadSave />
        </div>
        <label className="mt-2 flex items-start gap-2">
          <input type="checkbox" className="mt-1.5" checked={session.quiet} onChange={(e) => session.setQuiet(e.target.checked)} />
          <span>
            {t.notebook.quiet}
            <span className="block text-sm text-muted">{t.notebook.quietHelp}</span>
          </span>
        </label>
        <button
          type="button"
          className="btn btn-secondary btn-small mt-3"
          onClick={() => {
            if (!window.confirm(t.summary.resetConfirm)) return;
            session.resetProgress();
            setCleared(true);
          }}
        >
          {t.summary.reset}
        </button>
        <p role="status" className="mt-2 min-h-5 text-sm">{cleared && t.summary.resetDone}</p>
      </section>
    </div>
  );
}
