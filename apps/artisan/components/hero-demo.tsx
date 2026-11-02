"use client";

import { useState } from "react";
import { t } from "@/lib/i18n/en";

/** The welcome page's concrete example: one real judgment, made before any explanation. */
export function HeroDemo() {
  const [answer, setAnswer] = useState<"backs" | "not" | null>(null);
  const copy = t.welcome.demo;
  return (
    <div className="sheet max-w-xl p-5">
      <p className="text-sm text-muted">{copy.label}</p>
      <p className="mt-2 text-lg">
        <mark className="claim-static">{copy.claim}</mark>
      </p>
      <p className="mt-4 text-sm font-bold">{copy.sourceLabel}</p>
      <p className="mt-1 border-l-4 border-border pl-3">{copy.source}</p>
      <fieldset className="mt-4">
        <legend className="font-bold">{copy.question}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" aria-pressed={answer === "backs"} onClick={() => setAnswer("backs")} className="btn btn-secondary btn-small">{copy.backs}</button>
          <button type="button" aria-pressed={answer === "not"} onClick={() => setAnswer("not")} className="btn btn-secondary btn-small">{copy.notBacks}</button>
        </div>
      </fieldset>
      <p role="status" className="mt-3 min-h-[1.5em]">{answer && (answer === "not" ? copy.right : copy.notRight)} {answer && copy.explanation}</p>
    </div>
  );
}
