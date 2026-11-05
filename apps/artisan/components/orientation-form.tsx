"use client";

import { useId } from "react";
import Link from "next/link";
import type { OrientationQuestion } from "@/content/en/orientation";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

export function OrientationForm({ questions, firstMissionHref }: { questions: OrientationQuestion[]; firstMissionHref: string }) {
  const { orientation, setOrientation } = useSession();
  const group = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  return (
    <div className="mt-6 space-y-6">
      {questions.map((q) => (
        <fieldset key={q.id}>
          <legend className="font-bold">{q.prompt}</legend>
          <div className="mt-2 space-y-2">
            {q.choices.map((c) => (
              <label key={c.id} className="option">
                <input
                  type="radio"
                  name={`${group}-${q.id}`}
                  checked={orientation[q.id] === c.id}
                  onChange={() => setOrientation(q.id, c.id)}
                  className="mt-1"
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        <Link href={firstMissionHref} prefetch={true} className="btn btn-primary">
          {Object.keys(orientation).length ? t.orientation.start : t.orientation.skip}
        </Link>
        <Link href="/map" className="underline">{t.orientation.map}</Link>
      </div>
    </div>
  );
}
