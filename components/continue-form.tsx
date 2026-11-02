"use client";

import { useState } from "react";
import Link from "next/link";
import { normalizePassword } from "@/lib/passwords";
import { t } from "@/lib/i18n/en";

interface Entry {
  code: string;
  missionId: string;
  title: string;
}

export function ContinueForm({ registry }: { registry: Entry[] }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Entry | "invalid" | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const key = normalizePassword(value);
    setResult(registry.find((r) => normalizePassword(r.code) === key) ?? "invalid");
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <label htmlFor="pw" className="block font-medium">{t.continuePage.field}</label>
      <input
        id="pw"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setResult(null);
        }}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        aria-describedby="pw-status"
        className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 font-mono text-lg"
      />
      <button type="submit" className="mt-3 rounded bg-accent px-4 py-2 font-medium text-accent-foreground">
        {t.continuePage.submit}
      </button>

      <div id="pw-status" role="status" className="mt-4">
        {result === "invalid" && (
          <p>
            {t.continuePage.invalid} <Link href="/map" className="underline">{t.map.title}</Link>
          </p>
        )}
        {result && result !== "invalid" && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="font-medium">{t.continuePage.found(result.title)}</p>
            <p className="mt-1 text-sm text-muted">{t.continuePage.restartNote}</p>
            <Link href={`/missions/${result.missionId}`} className="mt-3 inline-block rounded bg-accent px-4 py-2 font-medium text-accent-foreground">
              {t.continuePage.start}
            </Link>
          </div>
        )}
      </div>
    </form>
  );
}
