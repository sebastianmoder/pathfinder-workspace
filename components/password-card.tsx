"use client";

import { useState } from "react";
import { t } from "@/lib/i18n/en";

export function PasswordCard({ code, label = t.password.label }: { code: string; label?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="ticket">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 select-all break-all font-mono text-2xl font-semibold tracking-wide">{code}</p>
      <div className="no-print mt-3 flex gap-2">
        <button type="button" onClick={copy} className="btn btn-secondary btn-small">
          {t.password.copy}
        </button>
        <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-small">
          {t.password.print}
        </button>
      </div>
      <p role="status" className="mt-2 min-h-5 text-sm">
        {status === "copied" && t.password.copied}
        {status === "failed" && t.password.copyFailed}
      </p>
    </div>
  );
}
