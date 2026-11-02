import Link from "next/link";
import { t } from "@/lib/i18n/en";

export default function Home() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-semibold tracking-tight">{t.promise}</h1>
      <p className="mt-4 text-lg">{t.welcome.intro}</p>
      <p className="mt-3 rounded-lg border border-border bg-surface p-4">{t.welcome.example}</p>
      <p className="mt-3 text-sm text-muted">{t.welcome.time}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/start" className="rounded bg-accent px-5 py-2.5 font-medium text-accent-foreground">
          {t.welcome.start}
        </Link>
        <Link href="/continue" className="rounded border border-border px-5 py-2.5">
          {t.welcome.continue}
        </Link>
      </div>
    </div>
  );
}
