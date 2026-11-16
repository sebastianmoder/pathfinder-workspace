"use client";

import { useId, useRef, useState } from "react";
import { exportSave, importSave, MAX_SAVE_BYTES, type ImportResult } from "@/lib/session/stored-progress";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";

type LoadStatus = "idle" | "loaded" | Extract<ImportResult, { ok: false }>["reason"];

/** Loads a save file the player exported earlier. It replaces the game on this device, so it asks first when there is one. */
export function LoadSave({ className }: { className?: string }) {
  const session = useSession();
  const inputRef = useRef<HTMLInputElement>(null);
  const statusId = useId();
  const [status, setStatus] = useState<LoadStatus>("idle");

  async function read(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_SAVE_BYTES) return setStatus("tooLarge");
    const result = importSave(await file.text());
    if (!result.ok) return setStatus(result.reason);
    const hasGame = session.completedIds.length > 0 || Object.keys(session.snapshot().missions).length > 0;
    if (hasGame && !window.confirm(t.save.loadConfirm)) return;
    session.load(result.save);
    setStatus("loaded");
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          void read(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button type="button" className="underline underline-offset-4" aria-describedby={statusId} onClick={() => inputRef.current?.click()}>
        {t.save.load}
      </button>
      <p id={statusId} role="status" className="mt-1 min-h-5 text-sm">
        {status === "loaded" ? t.save.loaded : status === "idle" ? "" : t.save.errors[status]}
      </p>
    </div>
  );
}

/** Downloads the game as a file the player keeps. Nothing is sent anywhere: the file is made in the browser. */
export function ExportSave() {
  const session = useSession();
  const [done, setDone] = useState(false);

  function download() {
    const now = new Date();
    const url = URL.createObjectURL(new Blob([exportSave(session.snapshot(), now)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `riverside-file-${now.toISOString().slice(0, 10)}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDone(true);
  }

  return (
    <div>
      <button type="button" className="btn btn-secondary btn-small" onClick={download}>{t.save.export}</button>
      <p role="status" className="mt-1 min-h-5 text-sm">{done && t.save.exported}</p>
    </div>
  );
}
